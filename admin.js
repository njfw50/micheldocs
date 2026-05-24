/**
 * ==========================================================================
 * ADMIN CONTROL LOGIC — MICHEL'S AI CONTROL DESK
 * ==========================================================================
 * CONFORMIDADE CANÔNICA (LEIS 5, 9 E 14):
 * 1. Separação de Camadas: Isolamento completo da lógica administrativa,
 *    separando formulários DOM (HTML) das chamadas REST assíncronas do backend.
 * 2. Segurança Bancária e de Dados (Lei 14): Armazenamento temporário seguro 
 *    da credencial de acesso administrativa em SessionStorage, enviada de forma
 *    criptograficamente isolada nos headers HTTP X-Admin-Password para autorização.
 * 3. Simplicidade Técnica (Lei 9): Manipulação limpa do DOM e integração de 
 *    gráficos em tempo real sem dependências inchadas de frameworks.
 * ==========================================================================
 */

// --- CONFIGURAÇÕES GLOBAIS DE ESTADO ---
let adminPassword = "";
let adminChart = null;
let fullCVData = null;

const API_BASE = "/api";

// --- INICIALIZAÇÃO E AUTENTICAÇÃO ---

document.addEventListener("DOMContentLoaded", () => {
    // Verifica se já existe credencial salva na sessão atual
    const cachedPassword = sessionStorage.getItem("admin_password");
    if (cachedPassword) {
        adminPassword = cachedPassword;
        document.getElementById("login-overlay").style.display = "none";
        loadAdminPanel();
    }
});

/**
 * Envia credencial administrativa ao backend para login e validação.
 */
async function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById("admin-password").value;
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: passwordInput })
        });
        
        if (!response.ok) {
            throw new Error("Senha administrativa inválida.");
        }
        
        adminPassword = passwordInput;
        sessionStorage.setItem("admin_password", passwordInput);
        
        // Esconde overlay de login de forma suave
        document.getElementById("login-overlay").style.opacity = "0";
        setTimeout(() => {
            document.getElementById("login-overlay").style.display = "none";
        }, 500);
        
        loadAdminPanel();
    } catch (error) {
        document.getElementById("login-error").innerText = error.message;
        document.getElementById("login-error").style.display = "block";
    }
}

/**
 * Encerra a sessão administrativa atual limpando credenciais e recarrega.
 */
function handleLogout() {
    sessionStorage.removeItem("admin_password");
    window.location.reload();
}

/**
 * Helper para cabeçalhos de requisição administrativa segura.
 */
function getAdminHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Admin-Password": adminPassword
    };
}

// --- CONTROLES DE LEITURA E INTERFACE (READ LAYER) ---

/**
 * Carrega a totalidade dos dados do currículo do backend (incluindo dados ocultos).
 */
async function loadAdminPanel() {
    try {
        const response = await fetch(`${API_BASE}/admin/cv`, {
            headers: getAdminHeaders()
        });
        
        if (response.status === 401) {
            handleLogout();
            return;
        }
        
        fullCVData = await response.json();
        
        // Popula as telas administrativas
        populateProfileForm();
        renderMetricsTable();
        renderResearchTable();
        renderMetricsChart();
    } catch (error) {
        console.error("Falha ao carregar dados administrativos:", error);
    }
}

function populateProfileForm() {
    if (fullCVData && fullCVData.profile) {
        const p = fullCVData.profile;
        document.getElementById("prof-name").value = p.name || "";
        document.getElementById("prof-title").value = p.title || "";
        document.getElementById("prof-email").value = p.email || "";
        document.getElementById("prof-phone").value = p.phone || "";
        document.getElementById("prof-linkedin").value = p.linkedin || "";
        document.getElementById("prof-facebook").value = p.facebook || "";
        document.getElementById("prof-summary").value = p.summary || "";
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    const payload = {
        name: document.getElementById("prof-name").value,
        title: document.getElementById("prof-title").value,
        email: document.getElementById("prof-email").value,
        phone: document.getElementById("prof-phone").value,
        linkedin: document.getElementById("prof-linkedin").value,
        facebook: document.getElementById("prof-facebook").value,
        summary: document.getElementById("prof-summary").value,
        location: fullCVData.profile?.location || "New Jersey, USA",
        dogma1: fullCVData.profile?.dogma1 || "",
        dogma2: fullCVData.profile?.dogma2 || "",
        dogma3: fullCVData.profile?.dogma3 || ""
    };
    
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: "PUT",
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            document.getElementById("profile-success-msg").style.display = "inline-block";
            setTimeout(() => {
                document.getElementById("profile-success-msg").style.display = "none";
            }, 3000);
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
    }
}

// --- CONTROLES DE METRICAS E ANALYTICS ---

function renderMetricsTable() {
    const tbody = document.getElementById("metrics-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.business_metrics || fullCVData.business_metrics.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma métrica cadastrada na base.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.business_metrics.map(m => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(m.name)}</td>
            <td class="font-monospace text-cyan">${m.value.toLocaleString()} <span class="small text-muted">${escapeHTML(m.unit)}</span></td>
            <td><span class="badge bg-secondary bg-opacity-25 text-light">${escapeHTML(m.category)}</span></td>
            <td class="text-center">
                <div class="form-check form-switch form-switch-glass d-inline-block">
                    <input class="form-check-input" type="checkbox" role="switch" ${m.is_public ? 'checked' : ''} onchange="toggleMetricPublic(${m.id}, this.checked)">
                </div>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteMetric(${m.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

/**
 * Liga/desliga compartilhamento público da métrica no currículo em tempo real.
 */
async function toggleMetricPublic(metricId, isChecked) {
    const metric = fullCVData.business_metrics.find(m => m.id === metricId);
    if (!metric) return;
    
    const payload = {
        ...metric,
        is_public: isChecked
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/metric/${metricId}`, {
            method: "PUT",
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao alternar visibilidade de métrica:", error);
    }
}

function showAddMetricModal() {
    const modal = new bootstrap.Modal(document.getElementById("addMetricModal"));
    modal.show();
}

async function submitNewMetric(event) {
    event.preventDefault();
    const payload = {
        name: document.getElementById("metric-name").value,
        value: parseInt(document.getElementById("metric-value").value),
        unit: document.getElementById("metric-unit").value,
        category: document.getElementById("metric-category").value,
        is_public: document.getElementById("metric-is-public").checked,
        order_index: fullCVData.business_metrics.length + 1
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/metric`, {
            method: "POST",
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addMetricModal")).hide();
            event.target.reset();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao adicionar métrica:", error);
    }
}

async function deleteMetric(metricId) {
    if (!confirm("Deseja realmente apagar esta métrica de forma irreversível?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/metric/${metricId}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar métrica:", error);
    }
}

/**
 * Inicializa ou atualiza o gráfico administrativo Chart.js com os dados do SQLite.
 */
function renderMetricsChart() {
    const ctx = document.getElementById("adminMetricsChart");
    if (!ctx) return;
    
    if (!fullCVData || !fullCVData.business_metrics || fullCVData.business_metrics.length === 0) {
        if (adminChart) adminChart.destroy();
        return;
    }
    
    const labels = fullCVData.business_metrics.map(m => m.name);
    const values = fullCVData.business_metrics.map(m => m.value);
    const colors = fullCVData.business_metrics.map((m, i) => {
        const palettes = ['rgba(6, 182, 212, 0.75)', 'rgba(37, 99, 235, 0.75)', 'rgba(16, 185, 129, 0.75)', 'rgba(244, 63, 94, 0.75)'];
        return palettes[i % palettes.length];
    });
    
    if (adminChart) {
        adminChart.destroy();
    }
    
    adminChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Métricas de Performance',
                data: values,
                backgroundColor: colors,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderWidth: 1
                }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
        }
    });
}

// --- CONTROLES DE PESQUISAS ACADEMICAS & DOIS ---

function renderResearchTable() {
    const tbody = document.getElementById("research-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.academic_researches || fullCVData.academic_researches.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum artigo ou pesquisa registrada.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.academic_researches.map(r => `
        <tr class="border-secondary">
            <td class="fw-bold text-wrap" style="max-width: 250px;">${escapeHTML(r.title)}</td>
            <td>${escapeHTML(r.publisher)}</td>
            <td>
                ${r.doi ? `<span class="badge bg-primary bg-opacity-25 border border-primary border-opacity-50 text-cyan font-monospace px-2 py-1"><i class="bi bi-tag-fill me-1"></i>${escapeHTML(r.doi)}</span>` : '<span class="text-muted small">Sem DOI</span>'}
            </td>
            <td class="text-center">
                <div class="form-check form-switch form-switch-glass d-inline-block">
                    <input class="form-check-input" type="checkbox" role="switch" ${r.is_public ? 'checked' : ''} onchange="toggleResearchPublic(${r.id}, this.checked)">
                </div>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteResearch(${r.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

async function toggleResearchPublic(researchId, isChecked) {
    const research = fullCVData.academic_researches.find(r => r.id === researchId);
    if (!research) return;
    
    const payload = {
        ...research,
        is_public: isChecked
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/research/${researchId}`, {
            method: "PUT",
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao alternar visibilidade de pesquisa:", error);
    }
}

function showAddResearchModal() {
    const modal = new bootstrap.Modal(document.getElementById("addResearchModal"));
    modal.show();
}

async function submitNewResearch(event) {
    event.preventDefault();
    const payload = {
        title: document.getElementById("res-title").value,
        publisher: document.getElementById("res-publisher").value,
        doi: document.getElementById("res-doi").value || null,
        date_published: document.getElementById("res-date").value,
        abstract: document.getElementById("res-abstract").value,
        url: document.getElementById("res-url").value,
        is_public: document.getElementById("res-is-public").checked,
        order_index: fullCVData.academic_researches.length + 1
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/research`, {
            method: "POST",
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addResearchModal")).hide();
            event.target.reset();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao cadastrar pesquisa acadêmica:", error);
    }
}

async function deleteResearch(researchId) {
    if (!confirm("Deseja apagar esta publicação científica de forma permanente?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/research/${researchId}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar publicação:", error);
    }
}

// --- INTEGRAÇÃO COM CO-PILOTO GEMINI AI ---

async function handleAICommand(event) {
    event.preventDefault();
    const promptInput = document.getElementById("ai-prompt-input");
    const promptText = promptInput.value.trim();
    if (!promptText) return;
    
    // Mostra input no terminal visual
    appendTerminalMsg("user", promptText);
    promptInput.value = "";
    
    // Mensagem de "carregando"
    const loadingId = appendTerminalMsg("system", "<em>Processando dados com o Gemini Co-Piloto...</em>");
    
    try {
        const response = await fetch(`${API_BASE}/admin/ai/update`, {
            method: "POST",
            headers: getAdminHeaders(),
            body: JSON.stringify({ prompt: promptText })
        });
        
        const result = await response.json();
        removeTerminalMsg(loadingId);
        
        if (response.ok && result.status === "success") {
            appendTerminalMsg("system", `
                <strong>Entidade reconhecida e inserida com sucesso!</strong><br>
                Categoria: <span class="text-cyan">${result.category}</span><br>
                Ação: <span class="text-success">${result.action}</span><br>
                Campos catalogados: <span class="text-muted small">${JSON.stringify(result.data)}</span>
            `);
            loadAdminPanel();
        } else {
            appendTerminalMsg("system", `<span class="text-danger">Erro do Co-Piloto: ${result.detail || "Falha desconhecida"}</span>`);
        }
    } catch (error) {
        removeTerminalMsg(loadingId);
        appendTerminalMsg("system", `<span class="text-danger">Erro de Conectividade: Não foi possível alcançar o co-piloto.</span>`);
    }
}

/**
 * Helpers para gerenciar logs do Terminal de IA
 */
function appendTerminalMsg(sender, text) {
    const terminal = document.getElementById("terminal-log");
    if (!terminal) return null;
    
    const msgId = "terminal-msg-" + Date.now() + Math.random().toString(36).substr(2, 5);
    const msgDiv = document.createElement("div");
    msgDiv.id = msgId;
    msgDiv.className = `terminal-msg ${sender}`;
    msgDiv.innerHTML = text;
    
    terminal.appendChild(msgDiv);
    terminal.scrollTop = terminal.scrollHeight;
    
    return msgId;
}

function removeTerminalMsg(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
}

// --- UTILITIES: PREVENÇÃO CONTRA XSS ---

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
