/**
 * ==========================================================================
 * ADMIN CONTROL LOGIC — MICHEL'S AI CONTROL DESK (COMPLETO)
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

// --- DYNAMIC API CONFIGURATION ---
/**
 * Detecta a URL base correta da API administrativa.
 * Se a página estiver hospedada no próprio servidor FastAPI (localhost:8000), usa caminhos relativos.
 * Se for aberta via file:// ou outro servidor local de desenvolvimento (ex: Live Server, Webview),
 * aponta diretamente para o servidor FastAPI em http://127.0.0.1:8000.
 */
function getApiBase() {
    const origin = window.location.origin;
    if (origin.includes('127.0.0.1:8000') || origin.includes('localhost:8000')) {
        return '/api';
    }
    return 'http://127.0.0.1:8000/api';
}

const API_BASE = getApiBase();

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
        renderValuesTable();
        renderExperiencesTable();
        renderEducationTable();
        renderVolunteerTable();
        renderSkillsTable();
        renderLanguagesTable();
        renderCertificationsTable();
        renderProjectsTable();
        
        // Renderiza gráfico de analytics
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
        document.getElementById("prof-location").value = p.location || "";
        document.getElementById("prof-availability").value = p.availability || "";
        document.getElementById("prof-target-roles").value = p.target_role_types || "";
        document.getElementById("prof-hobbies").value = p.hobbies || "";
        document.getElementById("prof-dogma1").value = p.dogma1 || "";
        document.getElementById("prof-dogma2").value = p.dogma2 || "";
        document.getElementById("prof-dogma3").value = p.dogma3 || "";
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
        location: document.getElementById("prof-location").value,
        availability: document.getElementById("prof-availability").value,
        target_role_types: document.getElementById("prof-target-roles").value,
        hobbies: document.getElementById("prof-hobbies").value,
        dogma1: document.getElementById("prof-dogma1").value,
        dogma2: document.getElementById("prof-dogma2").value,
        dogma3: document.getElementById("prof-dogma3").value,
        languages_spoken: fullCVData.profile?.languages_spoken || ""
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/profile`, {
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

// --- 1. CONTROLES DE METRICAS E ANALYTICS ---

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
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditMetricModal(${m.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteMetric(${m.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

async function toggleMetricPublic(metricId, isChecked) {
    const metric = fullCVData.business_metrics.find(m => m.id === metricId);
    if (!metric) return;
    
    const payload = { ...metric, is_public: isChecked };
    
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
    document.getElementById("metric-modal-title").innerHTML = `<i class="bi bi-plus-circle text-cyan"></i> Nova Métrica`;
    document.getElementById("metric-id-input").value = "";
    document.getElementById("metric-name").value = "";
    document.getElementById("metric-value").value = "";
    document.getElementById("metric-unit").value = "";
    document.getElementById("metric-category").value = "Travel";
    document.getElementById("metric-is-public").checked = true;
    
    new bootstrap.Modal(document.getElementById("addMetricModal")).show();
}

function showEditMetricModal(id) {
    const m = fullCVData.business_metrics.find(x => x.id === id);
    if (!m) return;
    
    document.getElementById("metric-modal-title").innerHTML = `<i class="bi bi-pencil-square text-cyan"></i> Editar Métrica`;
    document.getElementById("metric-id-input").value = m.id;
    document.getElementById("metric-name").value = m.name;
    document.getElementById("metric-value").value = m.value;
    document.getElementById("metric-unit").value = m.unit;
    document.getElementById("metric-category").value = m.category;
    document.getElementById("metric-is-public").checked = m.is_public;
    
    new bootstrap.Modal(document.getElementById("addMetricModal")).show();
}

async function submitMetricForm(event) {
    event.preventDefault();
    const id = document.getElementById("metric-id-input").value;
    const payload = {
        name: document.getElementById("metric-name").value,
        value: parseInt(document.getElementById("metric-value").value),
        unit: document.getElementById("metric-unit").value,
        category: document.getElementById("metric-category").value,
        is_public: document.getElementById("metric-is-public").checked,
        order_index: id ? fullCVData.business_metrics.find(x => x.id == id).order_index : fullCVData.business_metrics.length + 1
    };
    
    const url = id ? `${API_BASE}/admin/metric/${id}` : `${API_BASE}/admin/metric`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addMetricModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao salvar métrica:", error);
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

// --- 2. CONTROLES DE VALORES HUMANOS ---

function renderValuesTable() {
    const tbody = document.getElementById("values-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.human_values || fullCVData.human_values.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum princípio cadastrado.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.human_values.map(v => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(v.name)}</td>
            <td><i class="bi ${escapeHTML(v.icon)} text-primary"></i> <span class="small font-monospace text-muted">(${escapeHTML(v.icon)})</span></td>
            <td class="text-wrap" style="max-width: 300px;">${escapeHTML(v.description)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditValueModal(${v.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteValue(${v.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddValueModal() {
    document.getElementById("value-modal-title").innerHTML = `<i class="bi bi-plus-circle text-danger"></i> Novo Princípio`;
    document.getElementById("value-id-input").value = "";
    document.getElementById("value-name").value = "";
    document.getElementById("value-icon").value = "bi-heart-fill";
    document.getElementById("value-description").value = "";
    document.getElementById("value-order").value = "0";
    
    new bootstrap.Modal(document.getElementById("addValueModal")).show();
}

function showEditValueModal(id) {
    const v = fullCVData.human_values.find(x => x.id === id);
    if (!v) return;
    
    document.getElementById("value-modal-title").innerHTML = `<i class="bi bi-pencil-square text-danger"></i> Editar Princípio`;
    document.getElementById("value-id-input").value = v.id;
    document.getElementById("value-name").value = v.name;
    document.getElementById("value-icon").value = v.icon;
    document.getElementById("value-description").value = v.description;
    document.getElementById("value-order").value = v.order_index || 0;
    
    new bootstrap.Modal(document.getElementById("addValueModal")).show();
}

async function submitValueForm(event) {
    event.preventDefault();
    const id = document.getElementById("value-id-input").value;
    const payload = {
        name: document.getElementById("value-name").value,
        icon: document.getElementById("value-icon").value,
        description: document.getElementById("value-description").value,
        order_index: parseInt(document.getElementById("value-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/human_value/${id}` : `${API_BASE}/admin/human_value`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addValueModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar valor humano:", error);
    }
}

async function deleteValue(id) {
    if (!confirm("Deseja realmente excluir este princípio de caráter?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/human_value/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar valor humano:", error);
    }
}

// --- 3. CONTROLES DE EXPERIÊNCIA, EDUCAÇÃO & VOLUNTARIADO ---

function renderExperiencesTable() {
    const tbody = document.getElementById("experiences-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.experiences || fullCVData.experiences.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhuma experiência catalogada.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.experiences.map(exp => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(exp.title)}</td>
            <td>${escapeHTML(exp.company)}</td>
            <td class="small text-muted">${escapeHTML(exp.location)}<br>${escapeHTML(exp.date_range)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditExperienceModal(${exp.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteExperience(${exp.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddExperienceModal() {
    document.getElementById("exp-modal-title").innerHTML = `<i class="bi bi-plus-circle text-primary"></i> Nova Experiência`;
    document.getElementById("exp-id-input").value = "";
    document.getElementById("exp-title").value = "";
    document.getElementById("exp-company").value = "";
    document.getElementById("exp-location").value = "";
    document.getElementById("exp-date-range").value = "";
    document.getElementById("exp-team-size").value = "";
    document.getElementById("exp-budget").value = "";
    document.getElementById("exp-order").value = "0";
    document.getElementById("exp-tools").value = "";
    document.getElementById("exp-description").value = "";
    document.getElementById("exp-achievements").value = "";
    
    new bootstrap.Modal(document.getElementById("addExperienceModal")).show();
}

function showEditExperienceModal(id) {
    const exp = fullCVData.experiences.find(x => x.id === id);
    if (!exp) return;
    
    document.getElementById("exp-modal-title").innerHTML = `<i class="bi bi-pencil-square text-primary"></i> Editar Experiência`;
    document.getElementById("exp-id-input").value = exp.id;
    document.getElementById("exp-title").value = exp.title || "";
    document.getElementById("exp-company").value = exp.company || "";
    document.getElementById("exp-location").value = exp.location || "";
    document.getElementById("exp-date-range").value = exp.date_range || "";
    document.getElementById("exp-team-size").value = exp.team_size || "";
    document.getElementById("exp-budget").value = exp.budget_managed || "";
    document.getElementById("exp-order").value = exp.order_index || 0;
    document.getElementById("exp-tools").value = exp.tools_used || "";
    document.getElementById("exp-description").value = exp.description || "";
    document.getElementById("exp-achievements").value = exp.achievements || "";
    
    new bootstrap.Modal(document.getElementById("addExperienceModal")).show();
}

async function submitExperienceForm(event) {
    event.preventDefault();
    const id = document.getElementById("exp-id-input").value;
    const payload = {
        title: document.getElementById("exp-title").value,
        company: document.getElementById("exp-company").value,
        location: document.getElementById("exp-location").value,
        date_range: document.getElementById("exp-date-range").value,
        description: document.getElementById("exp-description").value,
        achievements: document.getElementById("exp-achievements").value || null,
        tools_used: document.getElementById("exp-tools").value || null,
        team_size: parseInt(document.getElementById("exp-team-size").value) || null,
        budget_managed: document.getElementById("exp-budget").value || null,
        order_index: parseInt(document.getElementById("exp-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/experience/${id}` : `${API_BASE}/admin/experience`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addExperienceModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar experiência:", error);
    }
}

async function deleteExperience(id) {
    if (!confirm("Deseja apagar esta experiência profissional do currículo?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/experience/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar experiência:", error);
    }
}

// --- EDUCAÇÃO ---

function renderEducationTable() {
    const tbody = document.getElementById("education-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.education || fullCVData.education.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhuma formação catalogada.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.education.map(edu => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(edu.title)}</td>
            <td>${escapeHTML(edu.institution)}</td>
            <td class="small text-muted">${escapeHTML(edu.date_range)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditEducationModal(${edu.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteEducation(${edu.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddEducationModal() {
    document.getElementById("edu-modal-title").innerHTML = `<i class="bi bi-plus-circle text-success"></i> Nova Educação`;
    document.getElementById("edu-id-input").value = "";
    document.getElementById("edu-title").value = "";
    document.getElementById("edu-institution").value = "";
    document.getElementById("edu-date").value = "";
    document.getElementById("edu-order").value = "0";
    document.getElementById("edu-gpa").value = "";
    document.getElementById("edu-thesis").value = "";
    document.getElementById("edu-coursework").value = "";
    document.getElementById("edu-description").value = "";
    
    new bootstrap.Modal(document.getElementById("addEducationModal")).show();
}

function showEditEducationModal(id) {
    const edu = fullCVData.education.find(x => x.id === id);
    if (!edu) return;
    
    document.getElementById("edu-modal-title").innerHTML = `<i class="bi bi-pencil-square text-success"></i> Editar Educação`;
    document.getElementById("edu-id-input").value = edu.id;
    document.getElementById("edu-title").value = edu.title || "";
    document.getElementById("edu-institution").value = edu.institution || "";
    document.getElementById("edu-date").value = edu.date_range || "";
    document.getElementById("edu-order").value = edu.order_index || 0;
    document.getElementById("edu-gpa").value = edu.gpa_honors || "";
    document.getElementById("edu-thesis").value = edu.thesis || "";
    document.getElementById("edu-coursework").value = edu.coursework || "";
    document.getElementById("edu-description").value = edu.description || "";
    
    new bootstrap.Modal(document.getElementById("addEducationModal")).show();
}

async function submitEducationForm(event) {
    event.preventDefault();
    const id = document.getElementById("edu-id-input").value;
    const payload = {
        title: document.getElementById("edu-title").value,
        institution: document.getElementById("edu-institution").value,
        date_range: document.getElementById("edu-date").value,
        description: document.getElementById("edu-description").value,
        coursework: document.getElementById("edu-coursework").value || null,
        thesis: document.getElementById("edu-thesis").value || null,
        gpa_honors: document.getElementById("edu-gpa").value || null,
        order_index: parseInt(document.getElementById("edu-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/education/${id}` : `${API_BASE}/admin/education`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addEducationModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar educação:", error);
    }
}

async function deleteEducation(id) {
    if (!confirm("Deseja apagar este histórico educacional?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/education/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar educação:", error);
    }
}

// --- VOLUNTARIADO ---

function renderVolunteerTable() {
    const tbody = document.getElementById("volunteer-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.volunteer_work || fullCVData.volunteer_work.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum voluntariado catalogado.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.volunteer_work.map(vol => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(vol.role)}</td>
            <td>${escapeHTML(vol.organization)}</td>
            <td class="small text-muted">${escapeHTML(vol.date_range)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditVolunteerModal(${vol.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteVolunteer(${vol.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddVolunteerModal() {
    document.getElementById("vol-modal-title").innerHTML = `<i class="bi bi-plus-circle text-info"></i> Novo Voluntariado`;
    document.getElementById("vol-id-input").value = "";
    document.getElementById("vol-role").value = "";
    document.getElementById("vol-organization").value = "";
    document.getElementById("vol-date").value = "";
    document.getElementById("vol-order").value = "0";
    document.getElementById("vol-description").value = "";
    document.getElementById("vol-impact").value = "";
    
    new bootstrap.Modal(document.getElementById("addVolunteerModal")).show();
}

function showEditVolunteerModal(id) {
    const vol = fullCVData.volunteer_work.find(x => x.id === id);
    if (!vol) return;
    
    document.getElementById("vol-modal-title").innerHTML = `<i class="bi bi-pencil-square text-info"></i> Editar Voluntariado`;
    document.getElementById("vol-id-input").value = vol.id;
    document.getElementById("vol-role").value = vol.role || "";
    document.getElementById("vol-organization").value = vol.organization || "";
    document.getElementById("vol-date").value = vol.date_range || "";
    document.getElementById("vol-order").value = vol.order_index || 0;
    document.getElementById("vol-description").value = vol.description || "";
    document.getElementById("vol-impact").value = vol.impact || "";
    
    new bootstrap.Modal(document.getElementById("addVolunteerModal")).show();
}

async function submitVolunteerForm(event) {
    event.preventDefault();
    const id = document.getElementById("vol-id-input").value;
    const payload = {
        role: document.getElementById("vol-role").value,
        organization: document.getElementById("vol-organization").value,
        date_range: document.getElementById("vol-date").value,
        description: document.getElementById("vol-description").value,
        impact: document.getElementById("vol-impact").value || null,
        order_index: parseInt(document.getElementById("vol-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/volunteer_work/${id}` : `${API_BASE}/admin/volunteer_work`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addVolunteerModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar trabalho voluntário:", error);
    }
}

async function deleteVolunteer(id) {
    if (!confirm("Deseja apagar este registro voluntário?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/volunteer_work/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar trabalho voluntário:", error);
    }
}

// --- 4. CONTROLES DE HABILIDADES, IDIOMAS & CERTIFICAÇÕES ---

function renderSkillsTable() {
    const tbody = document.getElementById("skills-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.skills || fullCVData.skills.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma competência catalogada.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.skills.map(s => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(s.name)}</td>
            <td><span class="badge bg-secondary bg-opacity-25 text-light">${escapeHTML(s.category)}</span></td>
            <td>${s.level_percent ? `${s.level_percent}%` : '<span class="text-muted">-</span>'}</td>
            <td>${escapeHTML(s.level_text || '-')}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditSkillModal(${s.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteSkill(${s.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddSkillModal() {
    document.getElementById("skill-modal-title").innerHTML = `<i class="bi bi-plus-circle text-cyan"></i> Nova Competência`;
    document.getElementById("skill-id-input").value = "";
    document.getElementById("skill-name").value = "";
    document.getElementById("skill-category").value = "tech";
    document.getElementById("skill-percent").value = "";
    document.getElementById("skill-order").value = "0";
    document.getElementById("skill-text").value = "";
    
    new bootstrap.Modal(document.getElementById("addSkillModal")).show();
}

function showEditSkillModal(id) {
    const s = fullCVData.skills.find(x => x.id === id);
    if (!s) return;
    
    document.getElementById("skill-modal-title").innerHTML = `<i class="bi bi-pencil-square text-cyan"></i> Editar Competência`;
    document.getElementById("skill-id-input").value = s.id;
    document.getElementById("skill-name").value = s.name || "";
    document.getElementById("skill-category").value = s.category || "tech";
    document.getElementById("skill-percent").value = s.level_percent || "";
    document.getElementById("skill-order").value = s.order_index || 0;
    document.getElementById("skill-text").value = s.level_text || "";
    
    new bootstrap.Modal(document.getElementById("addSkillModal")).show();
}

async function submitSkillForm(event) {
    event.preventDefault();
    const id = document.getElementById("skill-id-input").value;
    const payload = {
        name: document.getElementById("skill-name").value,
        category: document.getElementById("skill-category").value,
        level_percent: parseInt(document.getElementById("skill-percent").value) || null,
        level_text: document.getElementById("skill-text").value || null,
        order_index: parseInt(document.getElementById("skill-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/skill/${id}` : `${API_BASE}/admin/skill`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addSkillModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar competência:", error);
    }
}

async function deleteSkill(id) {
    if (!confirm("Deseja apagar esta competência do currículo?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/skill/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar habilidade:", error);
    }
}

// --- IDIOMAS ---

function renderLanguagesTable() {
    const tbody = document.getElementById("languages-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.languages || fullCVData.languages.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum idioma registrado.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.languages.map(l => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(l.name)}</td>
            <td><span class="badge bg-primary bg-opacity-25 text-cyan">${escapeHTML(l.proficiency)}</span></td>
            <td>${escapeHTML(l.reading_level || '-')}</td>
            <td>${escapeHTML(l.writing_level || '-')}</td>
            <td>${escapeHTML(l.speaking_level || '-')}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditLanguageModal(${l.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteLanguage(${l.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddLanguageModal() {
    document.getElementById("lang-modal-title").innerHTML = `<i class="bi bi-plus-circle text-warning"></i> Novo Idioma`;
    document.getElementById("lang-id-input").value = "";
    document.getElementById("lang-name").value = "";
    document.getElementById("lang-proficiency").value = "";
    document.getElementById("lang-order").value = "0";
    document.getElementById("lang-reading").value = "";
    document.getElementById("lang-writing").value = "";
    document.getElementById("lang-speaking").value = "";
    
    new bootstrap.Modal(document.getElementById("addLanguageModal")).show();
}

function showEditLanguageModal(id) {
    const l = fullCVData.languages.find(x => x.id === id);
    if (!l) return;
    
    document.getElementById("lang-modal-title").innerHTML = `<i class="bi bi-pencil-square text-warning"></i> Editar Idioma`;
    document.getElementById("lang-id-input").value = l.id;
    document.getElementById("lang-name").value = l.name || "";
    document.getElementById("lang-proficiency").value = l.proficiency || "";
    document.getElementById("lang-order").value = l.order_index || 0;
    document.getElementById("lang-reading").value = l.reading_level || "";
    document.getElementById("lang-writing").value = l.writing_level || "";
    document.getElementById("lang-speaking").value = l.speaking_level || "";
    
    new bootstrap.Modal(document.getElementById("addLanguageModal")).show();
}

async function submitLanguageForm(event) {
    event.preventDefault();
    const id = document.getElementById("lang-id-input").value;
    const payload = {
        name: document.getElementById("lang-name").value,
        proficiency: document.getElementById("lang-proficiency").value,
        reading_level: document.getElementById("lang-reading").value || null,
        writing_level: document.getElementById("lang-writing").value || null,
        speaking_level: document.getElementById("lang-speaking").value || null,
        order_index: parseInt(document.getElementById("lang-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/language/${id}` : `${API_BASE}/admin/language`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addLanguageModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar idioma:", error);
    }
}

async function deleteLanguage(id) {
    if (!confirm("Deseja apagar este idioma?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/language/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar idioma:", error);
    }
}

// --- CERTIFICAÇÕES ---

function renderCertificationsTable() {
    const tbody = document.getElementById("certifications-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.certifications || fullCVData.certifications.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma certificação registrada.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.certifications.map(c => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(c.title)}</td>
            <td>${escapeHTML(c.issuer)}</td>
            <td>${escapeHTML(c.date_issued)}</td>
            <td class="font-monospace small text-muted">${escapeHTML(c.credential_id || '-')}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditCertificationModal(${c.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteCertification(${c.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddCertificationModal() {
    document.getElementById("cert-modal-title").innerHTML = `<i class="bi bi-plus-circle text-success"></i> Nova Certificação`;
    document.getElementById("cert-id-input").value = "";
    document.getElementById("cert-title").value = "";
    document.getElementById("cert-issuer").value = "";
    document.getElementById("cert-date").value = "";
    document.getElementById("cert-order").value = "0";
    document.getElementById("cert-credential-id").value = "";
    document.getElementById("cert-credential-url").value = "";
    
    new bootstrap.Modal(document.getElementById("addCertificationModal")).show();
}

function showEditCertificationModal(id) {
    const c = fullCVData.certifications.find(x => x.id === id);
    if (!c) return;
    
    document.getElementById("cert-modal-title").innerHTML = `<i class="bi bi-pencil-square text-success"></i> Editar Certificação`;
    document.getElementById("cert-id-input").value = c.id;
    document.getElementById("cert-title").value = c.title || "";
    document.getElementById("cert-issuer").value = c.issuer || "";
    document.getElementById("cert-date").value = c.date_issued || "";
    document.getElementById("cert-order").value = c.order_index || 0;
    document.getElementById("cert-credential-id").value = c.credential_id || "";
    document.getElementById("cert-credential-url").value = c.credential_url || "";
    
    new bootstrap.Modal(document.getElementById("addCertificationModal")).show();
}

async function submitCertificationForm(event) {
    event.preventDefault();
    const id = document.getElementById("cert-id-input").value;
    const payload = {
        title: document.getElementById("cert-title").value,
        issuer: document.getElementById("cert-issuer").value,
        date_issued: document.getElementById("cert-date").value,
        credential_id: document.getElementById("cert-credential-id").value || null,
        credential_url: document.getElementById("cert-credential-url").value || null,
        order_index: parseInt(document.getElementById("cert-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/certification/${id}` : `${API_BASE}/admin/certification`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addCertificationModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar certificação:", error);
    }
}

async function deleteCertification(id) {
    if (!confirm("Deseja apagar esta certificação?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/certification/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar certificação:", error);
    }
}

// --- 5. CONTROLES DE PORTFÓLIO & PROJETOS ---

function renderProjectsTable() {
    const tbody = document.getElementById("projects-table-body");
    if (!tbody) return;
    
    if (!fullCVData || !fullCVData.projects || fullCVData.projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum projeto no portfólio.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = fullCVData.projects.map(p => `
        <tr class="border-secondary">
            <td class="fw-bold">${escapeHTML(p.title)}</td>
            <td><span class="small text-muted font-monospace">${escapeHTML(p.tech_stack || '-')}</span></td>
            <td class="text-center">
                ${p.github_url ? `<a href="${escapeHTML(p.github_url)}" target="_blank" class="text-primary me-2"><i class="bi bi-github"></i></a>` : ''}
                ${p.live_demo_url ? `<a href="${escapeHTML(p.live_demo_url)}" target="_blank" class="text-success"><i class="bi bi-link-45deg"></i></a>` : ''}
            </td>
            <td class="text-center">
                <div class="form-check form-switch form-switch-glass d-inline-block">
                    <input class="form-check-input" type="checkbox" role="switch" ${p.is_public ? 'checked' : ''} onchange="toggleProjectPublic(${p.id}, this.checked)">
                </div>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditProjectModal(${p.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteProject(${p.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

async function toggleProjectPublic(id, isChecked) {
    const proj = fullCVData.projects.find(p => p.id === id);
    if (!proj) return;
    
    const payload = { ...proj, is_public: isChecked };
    
    try {
        const response = await fetch(`${API_BASE}/admin/project/${id}`, {
            method: "PUT",
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao alternar visibilidade de projeto:", error);
    }
}

function showAddProjectModal() {
    document.getElementById("project-modal-title").innerHTML = `<i class="bi bi-plus-circle text-primary"></i> Novo Projeto`;
    document.getElementById("project-id-input").value = "";
    document.getElementById("project-title").value = "";
    document.getElementById("project-short-desc").value = "";
    document.getElementById("project-stack").value = "";
    document.getElementById("project-github").value = "";
    document.getElementById("project-live").value = "";
    document.getElementById("project-order").value = "0";
    document.getElementById("project-is-public").checked = true;
    document.getElementById("project-detailed-desc").value = "";
    
    new bootstrap.Modal(document.getElementById("addProjectModal")).show();
}

function showEditProjectModal(id) {
    const p = fullCVData.projects.find(x => x.id === id);
    if (!p) return;
    
    document.getElementById("project-modal-title").innerHTML = `<i class="bi bi-pencil-square text-primary"></i> Editar Projeto`;
    document.getElementById("project-id-input").value = p.id;
    document.getElementById("project-title").value = p.title || "";
    document.getElementById("project-short-desc").value = p.short_description || "";
    document.getElementById("project-stack").value = p.tech_stack || "";
    document.getElementById("project-github").value = p.github_url || "";
    document.getElementById("project-live").value = p.live_demo_url || "";
    document.getElementById("project-order").value = p.order_index || 0;
    document.getElementById("project-is-public").checked = p.is_public;
    document.getElementById("project-detailed-desc").value = p.detailed_description || "";
    
    new bootstrap.Modal(document.getElementById("addProjectModal")).show();
}

async function submitProjectForm(event) {
    event.preventDefault();
    const id = document.getElementById("project-id-input").value;
    const payload = {
        title: document.getElementById("project-title").value,
        short_description: document.getElementById("project-short-desc").value,
        detailed_description: document.getElementById("project-detailed-desc").value || null,
        tech_stack: document.getElementById("project-stack").value || null,
        github_url: document.getElementById("project-github").value || null,
        live_demo_url: document.getElementById("project-live").value || null,
        is_public: document.getElementById("project-is-public").checked,
        order_index: parseInt(document.getElementById("project-order").value) || 0
    };
    
    const url = id ? `${API_BASE}/admin/project/${id}` : `${API_BASE}/admin/project`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addProjectModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao salvar projeto:", error);
    }
}

async function deleteProject(id) {
    if (!confirm("Deseja apagar este projeto do portfólio?")) return;
    try {
        const response = await fetch(`${API_BASE}/admin/project/${id}`, {
            method: "DELETE",
            headers: getAdminHeaders()
        });
        if (response.ok) {
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Erro ao apagar projeto:", error);
    }
}

// --- PESQUISAS & DOIs ---

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
                <button class="btn btn-sm btn-outline-info px-2 border-0" onclick="showEditResearchModal(${r.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger px-2 border-0" onclick="deleteResearch(${r.id})"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
    `).join('');
}

async function toggleResearchPublic(researchId, isChecked) {
    const research = fullCVData.academic_researches.find(r => r.id === researchId);
    if (!research) return;
    
    const payload = { ...research, is_public: isChecked };
    
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
    document.getElementById("research-modal-title").innerHTML = `<i class="bi bi-plus-circle text-success"></i> Nova Publicação Científica`;
    document.getElementById("research-id-input").value = "";
    document.getElementById("res-title").value = "";
    document.getElementById("res-publisher").value = "";
    document.getElementById("res-doi").value = "";
    document.getElementById("res-date").value = "";
    document.getElementById("res-abstract").value = "";
    document.getElementById("res-url").value = "";
    document.getElementById("res-is-public").checked = true;
    
    new bootstrap.Modal(document.getElementById("addResearchModal")).show();
}

function showEditResearchModal(id) {
    const r = fullCVData.academic_researches.find(x => x.id === id);
    if (!r) return;
    
    document.getElementById("research-modal-title").innerHTML = `<i class="bi bi-pencil-square text-success"></i> Editar Publicação`;
    document.getElementById("research-id-input").value = r.id;
    document.getElementById("res-title").value = r.title || "";
    document.getElementById("res-publisher").value = r.publisher || "";
    document.getElementById("res-doi").value = r.doi || "";
    document.getElementById("res-date").value = r.date_published || "";
    document.getElementById("res-abstract").value = r.abstract || "";
    document.getElementById("res-url").value = r.url || "";
    document.getElementById("res-is-public").checked = r.is_public;
    
    new bootstrap.Modal(document.getElementById("addResearchModal")).show();
}

async function submitResearchForm(event) {
    event.preventDefault();
    const id = document.getElementById("research-id-input").value;
    const payload = {
        title: document.getElementById("res-title").value,
        publisher: document.getElementById("res-publisher").value,
        doi: document.getElementById("res-doi").value || null,
        date_published: document.getElementById("res-date").value,
        abstract: document.getElementById("res-abstract").value,
        url: document.getElementById("res-url").value,
        is_public: document.getElementById("res-is-public").checked,
        order_index: id ? fullCVData.academic_researches.find(x => x.id == id).order_index : fullCVData.academic_researches.length + 1
    };
    
    const url = id ? `${API_BASE}/admin/research/${id}` : `${API_BASE}/admin/research`;
    const method = id ? "PUT" : "POST";
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getAdminHeaders(),
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById("addResearchModal")).hide();
            loadAdminPanel();
        }
    } catch (error) {
        console.error("Falha ao salvar publicação acadêmica:", error);
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

// --- INTEGRAÇÃO COM CO-PILOTO GEMINI / OLLAMA AI ---

async function handleAICommand(event) {
    event.preventDefault();
    const promptInput = document.getElementById("ai-prompt-input");
    const promptText = promptInput.value.trim();
    if (!promptText) return;
    
    // Mostra input no terminal visual
    appendTerminalMsg("user", promptText);
    promptInput.value = "";
    
    // Mensagem de "carregando"
    const loadingId = appendTerminalMsg("system", "<em>Processando dados com o LLaMA 3 / Gemini Co-Piloto...</em>");
    
    try {
        const response = await fetch(`${API_BASE}/admin/ai/update`, {
            method: "POST",
            headers: getAdminHeaders(),
            body: JSON.stringify({ prompt: promptText })
        });
        
        const result = await response.json();
        removeTerminalMsg(loadingId);
        
        if (response.ok && result.status === "success") {
            if (result.category === "chat") {
                appendTerminalMsg("system", result.message);
            } else {
                appendTerminalMsg("system", `
                    <strong>Entidade reconhecida e inserida com sucesso!</strong><br>
                    Categoria: <span class="text-cyan">${result.category}</span><br>
                    Ação: <span class="text-success">${result.action}</span><br>
                    Campos catalogados: <span class="text-muted small">${JSON.stringify(result.data)}</span>
                `);
                loadAdminPanel();
            }
        } else {
            appendTerminalMsg("system", `<span class="text-danger">Erro do Co-Piloto: ${result.detail || "Falha desconhecida"}</span>`);
        }
    } catch (error) {
        removeTerminalMsg(loadingId);
        appendTerminalMsg("system", `<span class="text-danger">Erro de Conectividade: Não foi possível alcançar o co-piloto.</span>`);
    }
}

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
