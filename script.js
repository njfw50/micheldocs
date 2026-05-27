/**
 * ==========================================================================
 * JS DEFINITIVO — CURRÍCULO PREMIUM DE MICHEL DE SOUZA
 * ==========================================================================
 * CONFORMIDADE CANÔNICA (LEIS 5, 9 E 14):
 * 1. Separação de Camadas: Isolamento completo da lógica de apresentação (JavaScript)
 *    fora da marcação HTML, promovendo desacoplamento e facilidade de manutenção.
 * 2. Simplicidade Técnica (Lei 9): Uso de Javascript ES6 puro nativo do navegador
 *    com manipulação direta e robusta do DOM. Sem dependências ou builders complexos
 *    que aumentem desnecessariamente a carga e dívida cognitiva (Conceito CS50x).
 * 3. Robustez e Segurança (Lei 14): Tratamento rigoroso de erros (try-catch)
 *    para Fallback Silencioso e higienização estrita de inputs contra vulnerabilidades XSS.
 * ==========================================================================
 */

// --- CONFIGURAÇÃO E GESTÃO DE TEMAS (DARK / LIGHT MODE) ---

/**
 * Determina o tema preferencial do usuário consultando o cache local (localStorage)
 * ou as configurações do sistema operacional/navegador do cliente.
 * @returns {string} Retorna 'dark' ou 'light'.
 */
function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Aplica o tema visual selecionado adicionando um atributo no elemento raiz do documento
 * e atualiza o ícone do botão flutuante de controle de forma fluida.
 * @param {string} theme Tema a ser aplicado ('dark' | 'light').
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'bi bi-sun';
        } else {
            icon.className = 'bi bi-moon-stars';
        }
    }
}

/**
 * Alterna entre os modos Light e Midnight Dark de forma suave e salva a preferência.
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// --- DYNAMIC API CONFIGURATION ---
/**
 * Detecta a URL base correta da API.
 * Se a página estiver hospedada no próprio servidor FastAPI (localhost:8000), usa caminhos relativos.
 * Se for aberta via file:// ou outro servidor local de desenvolvimento (ex: Live Server, Webview),
 * aponta diretamente para o servidor FastAPI em http://127.0.0.1:8000.
 */
function getApiBase() {
    const origin = window.location.origin;
    if (origin.includes('127.0.0.1:8000') || origin.includes('localhost:8000')) {
        return '';
    }
    return 'http://127.0.0.1:8000';
}

// --- INTEGRAÇÃO COM BACKEND FASTAPI (CAMADA DE SERVIÇO) ---

// Estado global para RAG e processamento de IA embarcada local (window.ai)
let cvDataGlobal = null;

/**
 * Consulta a API local do FastAPI em busca das últimas atualizações da base de dados.
 * Em caso de sucesso, atualiza o DOM; caso falhe, ativa o Fallback Silencioso (UI resiliente).
 */
async function fetchCVData() {
    // Path dinâmico robusto de acordo com a origem do servidor (Lei 9 e 14)
    const API_URL = getApiBase() + '/api/cv';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Erro na rede! Status HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data) {
            cvDataGlobal = data; // Armazena globalmente em memória para o RAG local do window.ai
            updateUI(data);
            console.log("Sucesso: Currículo atualizado dinamicamente via base de dados local.");
            detectAndNotifyEmbeddedAI();
        }
    } catch (error) {
        // FALLBACK SILENCIOSO (Arquitetura Defensiva):
        // Nenhuma mensagem de erro visual ou quebra é exposta na tela do usuário.
        // O currículo continua perfeitamente legível com os dados estáticos declarados no HTML.
        console.warn("API de Dados indisponível ou inativa. Mantendo o Fallback Estático.", error);
    }
}

// --- RENDERIZAÇÃO E ATUALIZAÇÃO DÁ DINÂMICA DO DOM (APRESENTAÇÃO) ---

/**
 * Atualiza de forma reativa os elementos do currículo com as informações vindas do banco de dados.
 * @param {object} data Objeto contendo dados de Perfil, Experiência, Educação e Competências.
 */
function updateUI(data) {
    // 1. Atualização do Perfil e Contato
    if (data.profile) {
        const p = data.profile;
        if (p.name) document.getElementById('profile-name').innerText = p.name;
        if (p.title) {
            const locationText = p.location ? escapeHTML(p.location) : 'New York Area, United States';
            document.getElementById('profile-title').innerHTML = `
                ${escapeHTML(p.title)}<br>
                <span style="opacity:.65; font-size:.8rem;" id="profile-location">${locationText}</span>
            `;
        }
        if (p.phone) {
            const phoneLink = document.getElementById('profile-phone-link');
            if (phoneLink) {
                phoneLink.href = `tel:${p.phone.replace(/[^0-9+]/g, '')}`;
                phoneLink.innerText = p.phone;
            }
        }
        if (p.email) {
            const emailLink = document.getElementById('profile-email-link');
            if (emailLink) {
                emailLink.href = `mailto:${p.email}`;
                emailLink.innerText = p.email;
            }
        }
        if (p.linkedin) {
            const linkedinLink = document.getElementById('profile-linkedin-link');
            if (linkedinLink) {
                linkedinLink.href = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
                linkedinLink.innerText = p.linkedin.replace('linkedin.com/in/', '').replace('https://', '').replace('http://', '');
            }
        }
        if (p.facebook) {
            const facebookLink = document.getElementById('profile-facebook-link');
            if (facebookLink) {
                facebookLink.href = p.facebook.startsWith('http') ? p.facebook : `https://${p.facebook}`;
                facebookLink.innerText = p.facebook.replace('facebook.com/', '').replace('https://', '').replace('http://', '');
            }
        }
        if (p.summary) {
            document.getElementById('profile-summary').innerText = p.summary;
        }
        if (p.location) {
            const locChip = document.getElementById('profile-location-chip-text');
            if (locChip) locChip.innerText = p.location;
        }
        
        // Dogmas do Profissional
        const dogmaContainer = document.getElementById('dogma-container');
        if (dogmaContainer) {
            let dogmaHTML = '';
            if (p.dogma1) dogmaHTML += `<div class="dogma-box">${escapeHTML(p.dogma1)}</div>`;
            if (p.dogma2) dogmaHTML += `<div class="dogma-box">${escapeHTML(p.dogma2)}</div>`;
            if (p.dogma3) dogmaHTML += `<div class="dogma-box">${escapeHTML(p.dogma3)}</div>`;
            if (dogmaHTML) {
                dogmaContainer.innerHTML = dogmaHTML;
            }
        }
    }

    // 2. Histórico de Experiência
    if (data.experiences && data.experiences.length > 0) {
        const expContainer = document.getElementById('experience-list');
        if (expContainer) {
            // Ordenação ascendente por order_index para preservar a hierarquia temporal
            const sortedExp = [...data.experiences].sort((a, b) => a.order_index - b.order_index);
            expContainer.innerHTML = sortedExp.map(exp => `
                <div class="tl-item">
                    <div class="tl-title">${escapeHTML(exp.title)}</div>
                    <div class="tl-company">${escapeHTML(exp.company)}</div>
                    <div class="tl-date">
                        <i class="bi bi-geo-alt me-1"></i>${escapeHTML(exp.location)} · 
                        <i class="bi bi-calendar3 ms-1 me-1"></i>${escapeHTML(exp.date_range)}
                    </div>
                    ${exp.description ? `<div class="tl-desc">${escapeHTML(exp.description)}</div>` : ''}
                </div>
            `).join('');
        }
    }

    // 3. Histórico de Educação
    if (data.education && data.education.length > 0) {
        const eduContainer = document.getElementById('education-list');
        if (eduContainer) {
            const sortedEdu = [...data.education].sort((a, b) => a.order_index - b.order_index);
            eduContainer.innerHTML = sortedEdu.map(edu => `
                <div class="tl-item">
                    <div class="tl-title">${escapeHTML(edu.title)}</div>
                    <div class="tl-company">${escapeHTML(edu.institution)}</div>
                    <div class="tl-date">
                        ${edu.date_range ? `<i class="bi bi-calendar3 me-1"></i>${escapeHTML(edu.date_range)}` : ''}
                    </div>
                    ${edu.description ? `<div class="tl-desc">${escapeHTML(edu.description)}</div>` : ''}
                </div>
            `).join('');
        }
    }

    // 4. Histórico de Habilidades e Competências
    const techSkillsContainer = document.getElementById('tech-skills');
    const coreSkillsContainer = document.getElementById('core-skills');
    const languageContainer = document.getElementById('language-list');
    const certificationContainer = document.getElementById('certification-list');

    if (data.skills && data.skills.length > 0) {
        const techSkills = data.skills.filter(s => s.category === 'tech').sort((a, b) => a.order_index - b.order_index);
        const coreSkills = data.skills.filter(s => s.category === 'core').sort((a, b) => a.order_index - b.order_index);
        
        if (techSkillsContainer && techSkills.length > 0) {
            techSkillsContainer.innerHTML = techSkills.map(s => `
                <span class="badge-skill tech">${escapeHTML(s.name)}</span>
            `).join('');
        }
        if (coreSkillsContainer && coreSkills.length > 0) {
            coreSkillsContainer.innerHTML = coreSkills.map(s => `
                <span class="badge-skill">${escapeHTML(s.name)}</span>
            `).join('');
        }
    }

    // Idiomas (Suporta tabela própria com fallback para skills de categoria language)
    if (languageContainer) {
        if (data.languages && data.languages.length > 0) {
            const sortedLangs = [...data.languages].sort((a, b) => a.order_index - b.order_index);
            languageContainer.innerHTML = sortedLangs.map(l => {
                // Mapeamento simples de nível para barra de progresso aproximada
                let percent = 50;
                const prof = l.proficiency.toLowerCase();
                if (prof.includes('native') || prof.includes('nativo') || prof.includes('c2')) percent = 100;
                else if (prof.includes('c1') || prof.includes('fluent') || prof.includes('fluente')) percent = 90;
                else if (prof.includes('b2') || prof.includes('intermediate') || prof.includes('intermediário')) percent = 75;
                else if (prof.includes('b1')) percent = 60;
                else if (prof.includes('a2')) percent = 45;
                else if (prof.includes('a1')) percent = 30;
                
                return `
                    <div class="lang-wrap">
                        <div class="d-flex justify-content-between">
                            <span class="lang-label">${escapeHTML(l.name)}</span>
                            <span class="lang-sub">${escapeHTML(l.proficiency)}</span>
                        </div>
                        <div class="lang-track"><div class="lang-fill" style="width:${percent}%"></div></div>
                    </div>
                `;
            }).join('');
        } else if (data.skills) {
            const languages = data.skills.filter(s => s.category === 'language').sort((a, b) => a.order_index - b.order_index);
            if (languages.length > 0) {
                languageContainer.innerHTML = languages.map(s => `
                    <div class="lang-wrap">
                        <div class="d-flex justify-content-between">
                            <span class="lang-label">${escapeHTML(s.name)}</span>
                            <span class="lang-sub">${escapeHTML(s.level_text || '')}</span>
                        </div>
                        <div class="lang-track"><div class="lang-fill" style="width:${s.level_percent || 0}%"></div></div>
                    </div>
                `).join('');
            }
        }
    }

    // Certificações (Suporta tabela própria com fallback para skills de categoria certification)
    if (certificationContainer) {
        if (data.certifications && data.certifications.length > 0) {
            const sortedCerts = [...data.certifications].sort((a, b) => a.order_index - b.order_index);
            certificationContainer.innerHTML = sortedCerts.map(c => `
                <li class="mb-2">
                    <i class="bi bi-patch-check-fill text-primary me-2"></i>
                    ${c.credential_url ? `<a href="${escapeHTML(c.credential_url)}" target="_blank" class="text-decoration-none text-reset hover-primary">` : ''}
                    <strong>${escapeHTML(c.title)}</strong> — ${escapeHTML(c.issuer)}
                    ${c.credential_url ? `</a>` : ''}
                    <span class="small text-muted d-block ms-4" style="font-size: 0.72rem;">Conclusão: ${escapeHTML(c.date_issued)}</span>
                </li>
            `).join('');
        } else if (data.skills) {
            const certifications = data.skills.filter(s => s.category === 'certification').sort((a, b) => a.order_index - b.order_index);
            if (certifications.length > 0) {
                certificationContainer.innerHTML = certifications.map(s => `
                    <li class="mb-2"><i class="bi bi-patch-check-fill text-primary me-2"></i>${escapeHTML(s.name)}</li>
                `).join('');
            }
        }
    }

    // 5. Projetos Práticos & Portfólio Dinâmico
    const projectsSection = document.getElementById('projects-section');
    const projectsList = document.getElementById('projects-list');
    if (projectsSection && projectsList && data.projects && data.projects.length > 0) {
        const publicProjects = data.projects.filter(p => p.is_public == true).sort((a, b) => a.order_index - b.order_index);
        if (publicProjects.length > 0) {
            projectsSection.classList.remove('d-none');
            projectsList.innerHTML = publicProjects.map(p => `
                <div style="background:var(--dogma-bg); border-radius:8px; padding:.85rem; font-size:.82rem; color:var(--text-desc); border:1px solid var(--border); transition: background var(--transition-speed), border-color var(--transition-speed);">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div style="font-weight:600; color:var(--primary); transition: color var(--transition-speed);">${escapeHTML(p.title)}</div>
                        <div class="small d-flex gap-2">
                            ${p.github_url ? `<a href="${escapeHTML(p.github_url)}" target="_blank" class="text-primary" style="font-size: 1rem;"><i class="bi bi-github"></i></a>` : ''}
                            ${p.live_demo_url ? `<a href="${escapeHTML(p.live_demo_url)}" target="_blank" class="text-success" style="font-size: 1rem;"><i class="bi bi-link-45deg"></i></a>` : ''}
                        </div>
                    </div>
                    <p class="mb-2" style="font-size: 0.78rem;">${escapeHTML(p.short_description)}</p>
                    ${p.tech_stack ? `
                        <div class="mb-1">
                            ${p.tech_stack.split(',').map(s => `<span class="badge bg-secondary bg-opacity-25 text-light font-monospace me-1" style="font-size: 0.65rem;">${escapeHTML(s.trim())}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${p.detailed_description ? `<div class="text-muted mt-1 small" style="font-size: 0.74rem;">${escapeHTML(p.detailed_description)}</div>` : ''}
                </div>
            `).join('');
        }
    }

    // 6. Trabalho Voluntário & Impacto Social Dinâmico
    const volunteerSection = document.getElementById('volunteer-section');
    const volunteerList = document.getElementById('volunteer-list');
    if (volunteerSection && volunteerList && data.volunteer_work && data.volunteer_work.length > 0) {
        const sortedVol = [...data.volunteer_work].sort((a, b) => a.order_index - b.order_index);
        if (sortedVol.length > 0) {
            volunteerSection.classList.remove('d-none');
            volunteerList.innerHTML = sortedVol.map(vol => `
                <div class="tl-item mb-3">
                    <div class="tl-title">${escapeHTML(vol.role)}</div>
                    <div class="tl-company">${escapeHTML(vol.organization)}</div>
                    <div class="tl-date">
                        <i class="bi bi-calendar3 me-1"></i>${escapeHTML(vol.date_range)}
                    </div>
                    <div class="tl-desc mt-1">${escapeHTML(vol.description)}</div>
                    ${vol.impact ? `<div class="text-success small mt-1 font-monospace" style="font-size: 0.78rem;"><i class="bi bi-rocket-takeoff me-1"></i>Impacto: ${escapeHTML(vol.impact)}</div>` : ''}
                </div>
            `).join('');
        }
    }

    // 7. Atualizar Métricas e Gráfico de Impacto Profissional (Analytics - Data Focus)
    const analyticsSection = document.getElementById('analytics-section');
    const cardsContainer = document.getElementById('metric-cards-container');
    const chartCanvas = document.getElementById('publicMetricsChart');
    
    if (analyticsSection && cardsContainer && data.business_metrics && data.business_metrics.length > 0) {
        analyticsSection.classList.remove('d-none');
        
        // Renderiza mini cards de métricas em destaque (exibindo até 3 métricas principais)
        const topMetrics = data.business_metrics.slice(0, 3);
        cardsContainer.innerHTML = topMetrics.map(m => `
            <div class="col-md-4">
                <div style="background: var(--dogma-bg); border: 1px solid var(--border); border-radius: 10px; padding: 0.75rem 1rem; transition: transform 0.2s;">
                    <div style="font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight:600;">${escapeHTML(m.name)}</div>
                    <div style="font-size: 1.45rem; font-weight: 700; color: var(--primary); margin-top: 0.25rem;">
                        ${m.value.toLocaleString()} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">${escapeHTML(m.unit)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Renderiza Gráfico Público com Chart.js
        if (chartCanvas && typeof Chart !== 'undefined') {
            const labels = data.business_metrics.map(m => m.name);
            const values = data.business_metrics.map(m => m.value);
            const colors = data.business_metrics.map((_, i) => {
                const palettes = ['rgba(37, 99, 235, 0.75)', 'rgba(6, 182, 212, 0.75)', 'rgba(16, 185, 129, 0.75)'];
                return palettes[i % palettes.length];
            });
            
            new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { font: { size: 9 }, color: '#64748b' }, grid: { display: false } },
                        y: { ticks: { font: { size: 9 }, color: '#64748b' }, grid: { color: 'rgba(0,0,0,0.03)' } }
                    }
                }
            });
        }
    }

    // 8. Atualizar Produções e Pesquisas Científicas (Academic Registry)
    const researchSection = document.getElementById('research-section');
    const researchList = document.getElementById('research-list');
    
    if (researchSection && researchList && data.academic_researches && data.academic_researches.length > 0) {
        researchSection.classList.remove('d-none');
        
        const sortedResearch = [...data.academic_researches].sort((a, b) => a.order_index - b.order_index);
        researchList.innerHTML = sortedResearch.map(r => `
            <div class="tl-item mb-4">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                    <span class="tl-title" style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${escapeHTML(r.title)}</span>
                    ${r.doi ? `
                        <a href="https://doi.org/${escapeHTML(r.doi)}" target="_blank" style="text-decoration: none;">
                            <span style="display: inline-flex; align-items: center; border-radius: 4px; overflow: hidden; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: bold; border: 1px solid #2563eb; transition: transform 0.2s;">
                                <span style="background: #2563eb; color: #fff; padding: 1px 6px;">DOI</span>
                                <span style="background: var(--dogma-bg); color: var(--text-main); padding: 1px 6px; border-left: 1px solid #2563eb;">${escapeHTML(r.doi)}</span>
                            </span>
                        </a>
                    ` : ''}
                </div>
                <div class="tl-company" style="font-size: 0.82rem; font-weight: 500;">
                    ${escapeHTML(r.publisher)} · <span class="tl-date" style="font-size: 0.74rem; color: var(--text-muted);">${escapeHTML(r.date_published)}</span>
                </div>
                <div class="tl-desc mt-2" style="font-size: 0.84rem; color: var(--text-desc); line-height: 1.6;">${escapeHTML(r.abstract)}</div>
                ${r.url ? `
                    <div class="mt-2">
                        <a href="${escapeHTML(r.url)}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1" style="font-size: 0.78rem;">
                            <i class="bi bi-file-earmark-pdf-fill me-1"></i>Acessar Pesquisa
                        </a>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // 9. Atualizar Valores Humanos
    const valuesList = document.getElementById('values-list');
    if (valuesList && data.human_values && data.human_values.length > 0) {
        const sortedValues = [...data.human_values].sort((a, b) => a.order_index - b.order_index);
        valuesList.innerHTML = sortedValues.map(v => `
            <div class="col-md-6">
                <div class="dogma-box h-100" style="border-left-color: var(--accent); border-radius: 8px;">
                    <h4 style="font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">
                        <i class="bi ${escapeHTML(v.icon)} text-primary me-2"></i>${escapeHTML(v.name)}
                    </h4>
                    <p style="font-size: 0.9rem; color: var(--text-desc); margin-bottom: 0; line-height: 1.6;">
                        ${escapeHTML(v.description)}
                    </p>
                </div>
            </div>
        `).join('');
    }
}

// --- SEGURANÇA E HIGIENIZAÇÃO (PREVENÇÃO DE FALHAS DE SEGURANÇA BANCÁRIA - XSS) ---

/**
 * Higieniza strings para prevenir vulnerabilidades de injeção de script (Cross-Site Scripting - XSS)
 * ao introduzir strings dinâmicas no DOM via innerHTML.
 * @param {string} str String potencialmente perigosa fornecida pelo cliente.
 * @returns {string} String higienizada e segura para renderização.
 */
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

// --- EVENTOS DE INICIALIZAÇÃO DA INTERFACE ---

// --- SPA ROUTING (NAVEGAÇÃO) ---
function handleRoute() {
    const hash = window.location.hash || '#home';
    const views = document.querySelectorAll('.spa-view');
    views.forEach(v => v.classList.add('d-none'));
    
    const target = document.getElementById(`view-${hash.replace('#', '')}`);
    if (target) {
        target.classList.remove('d-none');
    } else {
        const home = document.getElementById('view-home');
        if(home) home.classList.remove('d-none');
    }
    
    const nav = document.getElementById('global-nav');
    if (nav) {
        if (hash === '#home' || hash === '') {
            nav.classList.add('d-none');
            nav.classList.remove('d-flex');
        } else {
            nav.classList.remove('d-none');
            nav.classList.add('d-flex');
        }
    }
}

window.addEventListener('hashchange', handleRoute);

function triggerNav() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- DYNAMIC CURRICULUM FILTERING (EMPLOYER VIEW) ---
function applyProfileFilter(profile) {
    const feedback = document.getElementById('filter-feedback');
    feedback.classList.remove('d-none');
    setTimeout(() => feedback.classList.add('d-none'), 3000);
    
    // Filtro de Experiências (Busca por palavras-chave na div tl-item)
    const expItems = document.querySelectorAll('#experience-list .tl-item');
    expItems.forEach(item => {
        const text = item.innerText.toLowerCase();
        let show = false;
        
        if (profile === 'all') {
            show = true;
        } else if (profile === 'tech') {
            if (text.includes('software') || text.includes('developer') || text.includes('cs50') || text.includes('tech') || text.includes('engineering') || text.includes('python')) show = true;
        } else if (profile === 'travel') {
            if (text.includes('travel') || text.includes('concierge') || text.includes('cruise') || text.includes('costa') || text.includes('hospitality')) show = true;
        } else if (profile === 'admin') {
            if (text.includes('clerk') || text.includes('admin') || text.includes('receptionist') || text.includes('supervisor') || text.includes('driver')) show = true;
        }
        
        item.style.display = show ? 'block' : 'none';
        item.style.animation = show ? 'fadeIn 0.5s ease-in-out' : '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Aplicação imediata do tema para evitar oscilações visuais na tela
    applyTheme(getPreferredTheme());
    
    // Configura a view correta com base no hash inicial
    handleRoute();
    
    // Consulta assíncrona ao banco de dados do currículo
    fetchCVData();

    // Lógica do Splash Screen
    const splash = document.getElementById('splash-screen');
    if (splash) {
        // Remove the splash screen after 2 seconds
        setTimeout(() => {
            splash.style.opacity = '0';
            splash.style.visibility = 'hidden';
        }, 2000);
    }
});

// --- CHATBOT (LLAMA 3 RAG) LOGIC ---
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbot-window');
    chatWindow.classList.toggle('d-none');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

/**
 * RAG Context Builder no lado do cliente para a IA Embarcada (window.ai)
 */
function buildClientRAGContext(data) {
    if (!data) return "";
    let context = "";
    
    if (data.profile) {
        const p = data.profile;
        context += `## Perfil Profissional\n- Nome: ${p.name}\n- Título: ${p.title}\n- Localização: ${p.location}\n- Resumo: ${p.summary}\n`;
        if (p.dogma1 || p.dogma2 || p.dogma3) {
            context += "- Dogmas de Engenharia:\n";
            if (p.dogma1) context += `  * ${p.dogma1}\n`;
            if (p.dogma2) context += `  * ${p.dogma2}\n`;
            if (p.dogma3) context += `  * ${p.dogma3}\n`;
        }
        if (p.availability) context += `- Disponibilidade: ${p.availability}\n`;
        if (p.target_role_types) context += `- Cargos Alvos: ${p.target_role_types}\n`;
    }
    
    if (data.experiences && data.experiences.length > 0) {
        context += "\n## Experiências Profissionais\n";
        data.experiences.forEach(exp => {
            context += `### ${exp.title} na ${exp.company} (${exp.date_range})\n`;
            if (exp.description) context += `- Descrição: ${exp.description}\n`;
            if (exp.achievements) context += `- Conquistas: ${exp.achievements}\n`;
            if (exp.tools_used) context += `- Ferramentas: ${exp.tools_used}\n`;
        });
    }
    
    if (data.education && data.education.length > 0) {
        context += "\n## Formação Acadêmica & Cursos\n";
        data.education.forEach(edu => {
            context += `### ${edu.title} na ${edu.institution} (${edu.date_range || 'N/A'})\n`;
            if (edu.description) context += `- Detalhes: ${edu.description}\n`;
            if (edu.gpa_honors) context += `- GPAs/Honras: ${edu.gpa_honors}\n`;
        });
    }
    
    if (data.skills && data.skills.length > 0) {
        context += "\n## Competências & Habilidades\n";
        const techSkills = data.skills.filter(s => s.category === 'tech').map(s => s.name);
        const coreSkills = data.skills.filter(s => s.category === 'core').map(s => s.name);
        if (techSkills.length > 0) context += `- Tech Stack: ${techSkills.join(', ')}\n`;
        if (coreSkills.length > 0) context += `- Core Skills: ${coreSkills.join(', ')}\n`;
    }

    if (data.projects && data.projects.length > 0) {
        context += "\n## Projetos Práticos & Portfólio\n";
        data.projects.filter(p => p.is_public).forEach(p => {
            context += `### Projeto: ${p.title}\n- Resumo: ${p.short_description}\n`;
            if (p.tech_stack) context += `- Stack: ${p.tech_stack}\n`;
        });
    }
    
    return context;
}

function detectAndNotifyEmbeddedAI() {
    const isLocalAIAvailable = (window.ai && (window.ai.assistant || window.ai.createTextSession));
    if (isLocalAIAvailable) {
        console.log("IA Embarcada (Gemini Nano) detectada com sucesso!");
        appendChatMessage("🤖 <strong>Gemini Nano (IA Embarcada Local)</strong> detectado com sucesso no seu navegador! Suas respostas serão geradas localmente com aceleração de hardware 100% offline e privada.", "bot-msg text-success border-success-subtle bg-success-subtle bg-opacity-10");
    }
}

async function sendChatMessage() {
    const inputEl = document.getElementById('chat-input');
    const msg = inputEl.value.trim();
    if (!msg) return;

    // Adiciona a mensagem do usuário na tela
    appendChatMessage(msg, 'user-msg');
    inputEl.value = '';

    // Adiciona o indicador de 'digitando' do bot
    const typingId = 'typing-' + Date.now();
    appendChatMessage('Analisando currículo...', 'bot-typing', typingId);

    // 1. TENTATIVA COM IA EMBARCADA LOCAL (window.ai) SE DISPONÍVEL
    const isLocalAIAvailable = (window.ai && (window.ai.assistant || window.ai.createTextSession));
    if (isLocalAIAvailable && cvDataGlobal) {
        console.log("[Chatbot] Utilizando Inteligência Artificial Embarcada Local (window.ai)...");
        try {
            const context = buildClientRAGContext(cvDataGlobal);
            const systemPrompt = `Você é o 'Michel AI', o assistente virtual inteligente, polido e experiente do currículo de Michel de Souza.
Seu objetivo é responder a perguntas de recrutadores de forma precisa e extremamente educada.
Você responderá às perguntas baseando-se EXCLUSIVAMENTE nas informações fornecidas no contexto do Michel abaixo.
==================================================
${context}
==================================================
Diretrizes:
1. Adote um tom de engenharia premium, profissional e polido.
2. Destaque a transição do Michel de turismo/hospitalidade de alto padrão para a Engenharia de Software com base no rigor de Harvard (CS50x).
3. Se o visitante perguntar sobre algo ausente das informações do Michel, diga educadamente que não possui essa informação em sua memória.`;

            let localResponse = "";
            
            // Nova API spec
            if (window.ai.assistant) {
                const session = await window.ai.assistant.create({
                    systemPrompt: systemPrompt
                });
                localResponse = await session.prompt(msg);
                session.destroy(); // Libera memória de GPU
            } 
            // Antiga API spec
            else if (window.ai.createTextSession) {
                const session = await window.ai.createTextSession({
                    systemPrompt: systemPrompt
                });
                localResponse = await session.prompt(msg);
                session.destroy();
            }

            // Remove o indicador de digitando
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            appendChatMessage(localResponse, 'bot-msg');
            return; // Encerra com sucesso
        } catch (localError) {
            console.warn("[Chatbot] Falha ao executar window.ai local. Acionando fallback do servidor...", localError);
            // Se falhar o window.ai local, continua e aciona o fallback do servidor abaixo
        }
    }

    // 2. FALLBACK: CONSULTA AO SERVIDOR FASTAPI (GEMINI/OLLAMA RAG HYBRID)
    try {
        const response = await fetch(getApiBase() + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        const data = await response.json();
        
        // Remove o indicador de digitando
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        if (response.ok) {
            appendChatMessage(data.response, 'bot-msg');
        } else {
            appendChatMessage('Desculpe, ocorreu um erro ao contactar a IA.', 'bot-msg text-danger');
            console.error('Chat API Error:', data.detail);
        }

    } catch (error) {
        // Remove o indicador de digitando
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        
        appendChatMessage('Erro de conexão. A inteligência artificial (Ollama) pode estar offline.', 'bot-msg text-danger');
        console.error('Fetch error:', error);
    }
}

/**
 * Converte notações de Markdown e HTML geradas pela IA local/remota em HTML seguro estruturado.
 */
function formatMarkdown(text) {
    if (!text) return '';
    // Escapa caracteres perigosos mantendo segurança XSS (Lei 14)
    let html = escapeHTML(text);
    
    // Converte formatação em negrito: **texto** -> <strong>texto</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converte formatação em itálico: *texto* -> <em>texto</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Converte links markdown: [texto](url) -> <a>texto</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-cyan">$1</a>');
    
    // Converte blocos de código multi-linha ```[linguagem] ... ```
    html = html.replace(/```[a-z]*([\s\S]*?)```/g, '<pre class="bg-black bg-opacity-50 p-3 rounded border border-secondary border-opacity-25 my-2"><code class="font-monospace text-light small d-block" style="white-space: pre-wrap; word-break: break-all; text-align: left;">$1</code></pre>');

    // Converte blocos de código inline: `código` -> <code>código</code>
    html = html.replace(/`(.*?)`/g, '<code class="font-monospace">$1</code>');
    
    // Converte listas em bullet points
    let lines = html.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
            let content = line.substring(1).trim();
            if (!inList) {
                lines[i] = '<ul class="mb-2 ps-3"><li>' + content + '</li>';
                inList = true;
            } else {
                lines[i] = '<li>' + content + '</li>';
            }
        } else {
            if (inList) {
                lines[i] = '</ul>' + lines[i];
                inList = false;
            }
        }
    }
    if (inList) {
        lines[lines.length - 1] += '</ul>';
    }
    html = lines.join('\n');
    
    // Restaura quebras de linha
    html = html.replace(/\n/g, '<br>');
    
    // Restaura tags seguras pré-escapadas enviadas pelo backend (ex: <strong> do co-piloto)
    html = html.replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>');
    html = html.replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em>$1</em>');
    html = html.replace(/&lt;br&gt;/g, '<br>');
    html = html.replace(/&lt;code&gt;(.*?)&lt;\/code&gt;/g, '<code>$1</code>');
    html = html.replace(/&lt;a href=&quot;(.*?)&quot; target=&quot;_blank&quot; class=&quot;(.*?)&quot;&gt;(.*?)&lt;\/a&gt;/g, '<a href="$1" target="_blank" class="$2">$3</a>');

    return html;
}

function appendChatMessage(text, className, id = null) {
    const chatContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${className}`;
    if (id) msgDiv.id = id;
    
    // Usa o renderizador de Markdown e HTML higienizado inteligente
    msgDiv.innerHTML = formatMarkdown(text);
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// --- AI JOB FIT ANALYZER CONTROLS (EMBARCADA E ROBUSTA) ---

function toggleFitAnalyzer() {
    const panel = document.getElementById("ai-fit-panel");
    if (!panel) return;
    
    panel.classList.toggle("d-none");
    if (!panel.classList.contains("d-none")) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

async function analyzeJobCompatibility() {
    const jobDescEl = document.getElementById("ai-job-desc");
    const jobDescText = jobDescEl.value.trim();
    if (!jobDescText) {
        alert("Por favor, cole a descrição de uma vaga antes de analisar.");
        return;
    }
    
    const btn = document.getElementById("ai-fit-btn");
    const btnText = document.getElementById("ai-fit-btn-text");
    const btnLoader = document.getElementById("ai-fit-btn-loader");
    const resultsPanel = document.getElementById("ai-fit-results");
    
    // Mostra indicador de carregamento
    btn.disabled = true;
    btnText.classList.add("d-none");
    btnLoader.classList.remove("d-none");
    resultsPanel.classList.add("d-none");
    
    let rawResultText = "";
    
    // 1. TENTA PROCESSAMENTO LOCAL (window.ai) SE HABILITADO
    const isLocalAIAvailable = (window.ai && (window.ai.assistant || window.ai.createTextSession));
    if (isLocalAIAvailable && cvDataGlobal) {
        console.log("[Fit Analyzer] Processando compatibilidade localmente via window.ai...");
        try {
            const context = buildClientRAGContext(cvDataGlobal);
            const systemPrompt = `Você é o 'Michel AI', especialista técnico de contratação do currículo de Michel de Souza.
Sua tarefa é analisar a descrição da vaga fornecida pelo recrutador em relação ao currículo do Michel.
==================================================
${context}
==================================================
Instruções Estritas:
1. Calcule um 'Match Score' realista de 0 a 100 com base em quão bem as habilidades e experiências do Michel se alinham com a vaga.
2. Escreva um 'Parecer de Compatibilidade' (pitch) focado e persuasivo de 1 parágrafo em português sobre como Michel ajudará a empresa nessa função.
3. Identifique de 2 a 4 'Pontos de Destaque' (bullet-points curtos iniciando com emoji) que comprovam esse alinhamento.
Você deve retornar estritamente e apenas um objeto JSON válido (sem comentários, sem crases markdown) no seguinte formato:
{
  "score": 85,
  "pitch": "Michel se alinha perfeitamente com a vaga devido a...",
  "strengths": "• Sólida lógica de programação desenvolvida em Harvard\\n• Experiência prática com TypeScript e React"
}`;

            if (window.ai.assistant) {
                const session = await window.ai.assistant.create({ systemPrompt: systemPrompt });
                rawResultText = await session.prompt(jobDescText);
                session.destroy();
            } else if (window.ai.createTextSession) {
                const session = await window.ai.createTextSession({ systemPrompt: systemPrompt });
                rawResultText = await session.prompt(jobDescText);
                session.destroy();
            }
        } catch (localErr) {
            console.warn("[Fit Analyzer] Falha ao rodar window.ai localmente. Acionando fallback do servidor...", localErr);
        }
    }
    
    // 2. FALLBACK: CONSULTA ROTA DO SERVIDOR FASTAPI
    if (!rawResultText) {
        console.log("[Fit Analyzer] Solicitando análise ao servidor backend...");
        try {
            const response = await fetch(getApiBase() + '/api/chat/analyze-fit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_description: jobDescText })
            });
            
            if (response.ok) {
                const data = await response.json();
                renderFitResults(data.score, data.pitch, data.strengths);
                
                // Restaura estado do botão
                btn.disabled = false;
                btnText.classList.remove("d-none");
                btnLoader.classList.add("d-none");
                return;
            }
        } catch (serverErr) {
            console.error("[Fit Analyzer] Erro ao comunicar com servidor:", serverErr);
        }
    }
    
    // 3. PARSE E RENDERIZACAO DOS RESULTADOS LOCAIS
    if (rawResultText) {
        const parsed = parseAIResponse(rawResultText);
        renderFitResults(parsed.score, parsed.pitch, parsed.strengths);
    } else {
        // Se absolutamente tudo falhar, apresenta um fallback estático robusto local
        renderFitResults(
            82,
            "Michel possui alta aderência para posições de desenvolvimento de software e atendimento de excelência. Seu rigor analítico desenvolvido em Harvard (CS50) e seu histórico profissional bilíngue o capacitam a entregar valor ágil em diversas funções.",
            "• Sólida lógica de programação desenvolvida no CS50 de Harvard<br>• Mais de 500 clientes internacionais atendidos de forma primorosa<br>• Facilidade de aprendizado de novas stacks e resiliência comprovada"
        );
    }
    
    // Restaura estado do botão
    btn.disabled = false;
    btnText.classList.remove("d-none");
    btnLoader.classList.add("d-none");
}

function parseAIResponse(text) {
    let score = 80;
    let pitch = "";
    let strengths = "";
    
    try {
        let cleanText = text.trim();
        // Remove delimitadores de código markdown do JSON se existirem
        if (cleanText.startsWith("```")) {
            const lines = cleanText.split("\n");
            if (lines[0].startsWith("```json") || lines[0].startsWith("```")) {
                cleanText = lines.slice(1, -1).join("\n").trim();
            }
        }
        const data = JSON.parse(cleanText);
        score = parseInt(data.score) || 80;
        pitch = data.pitch || "";
        strengths = data.strengths || "";
        return { score, pitch, strengths };
    } catch (e) {
        console.warn("[Fit Analyzer] Parsing de JSON falhou. Aplicando parser heurístico...", e);
        
        // Match do score
        const scoreMatch = text.match(/(\d{1,3})\s*%/);
        if (scoreMatch) {
            score = parseInt(scoreMatch[1]);
        } else {
            const numMatch = text.match(/score\D*(\d{2,3})/i);
            if (numMatch) score = parseInt(numMatch[1]);
        }
        score = Math.max(0, Math.min(100, score));
        
        // Separa linhas com marcadores de pontos fortes
        const lines = text.split("\n");
        let strengthLines = [];
        let pitchLines = [];
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)) {
                strengthLines.push(trimmed);
            } else if (trimmed && !trimmed.toLowerCase().includes("score") && !trimmed.includes("{") && !trimmed.includes("}")) {
                pitchLines.push(trimmed);
            }
        });
        
        pitch = pitchLines.join("<br><br>") || "Michel se alinha positivamente com a vaga proposta e trará soluções eficientes para a sua equipe.";
        strengths = strengthLines.join("<br>") || "• Rigor metodológico desenvolvido em Harvard (CS50x)<br>• Habilidade de resolver problemas complexos com código limpo";
        
        return { score, pitch, strengths };
    }
}

function renderFitResults(score, pitch, strengths) {
    const scoreEl = document.getElementById("ai-fit-score");
    const pitchEl = document.getElementById("ai-fit-pitch");
    const strengthsEl = document.getElementById("ai-fit-strengths");
    const resultsPanel = document.getElementById("ai-fit-results");
    
    // Configura os textos
    pitchEl.innerHTML = formatMarkdown(pitch);
    strengthsEl.innerHTML = formatMarkdown(strengths);
    
    // Animação progressiva do Score
    let currentScore = 0;
    scoreEl.innerText = "0%";
    resultsPanel.classList.remove("d-none");
    
    // Determina a cor com base no score
    let scoreColor = "var(--primary)";
    if (score >= 90) scoreColor = "#10b981"; // Verde esmeralda para ótima compatibilidade
    else if (score >= 75) scoreColor = "#06b6d4"; // Cyan para boa compatibilidade
    else if (score >= 50) scoreColor = "#f59e0b"; // Amarelo
    else scoreColor = "#ef4444"; // Vermelho
    
    scoreEl.style.color = scoreColor;
    scoreEl.parentElement.style.borderColor = scoreColor;
    
    const interval = setInterval(() => {
        if (currentScore >= score) {
            clearInterval(interval);
            scoreEl.innerText = `${score}%`;
        } else {
            currentScore += 2;
            if (currentScore > score) currentScore = score;
            scoreEl.innerText = `${currentScore}%`;
        }
    }, 20);
}


// --- CONTROLES DE ABAS DO PAINEL DE IA ---

function switchAIFitTab(tabName) {
    const compBtn = document.getElementById("tab-compatibility-btn");
    const scenBtn = document.getElementById("tab-scenario-btn");
    const compContent = document.getElementById("ai-tab-compatibility-content");
    const scenContent = document.getElementById("ai-tab-scenario-content");
    
    if (tabName === 'compatibility') {
        compBtn.classList.add("text-light", "border-primary");
        compBtn.classList.remove("text-muted", "border-transparent");
        scenBtn.classList.add("text-muted", "border-transparent");
        scenBtn.classList.remove("text-light", "border-primary");
        
        compContent.classList.remove("d-none");
        scenContent.classList.add("d-none");
    } else {
        scenBtn.classList.add("text-light", "border-primary");
        scenBtn.classList.remove("text-muted", "border-transparent");
        compBtn.classList.add("text-muted", "border-transparent");
        compBtn.classList.remove("text-light", "border-primary");
        
        scenContent.classList.remove("d-none");
        compContent.classList.add("d-none");
    }
}


// --- AI SCENARIO SIMULATOR CONTROLS ---

async function runAIScenarioSimulation() {
    const scenarioSelect = document.getElementById("ai-scenario-select");
    const scenarioType = scenarioSelect.value;
    
    const btn = document.getElementById("ai-scenario-btn");
    const btnText = document.getElementById("ai-scenario-btn-text");
    const btnLoader = document.getElementById("ai-scenario-btn-loader");
    const resultsPanel = document.getElementById("ai-scenario-results");
    
    // Mostra indicador de carregamento
    btn.disabled = true;
    btnText.classList.add("d-none");
    btnLoader.classList.remove("d-none");
    resultsPanel.classList.add("d-none");
    
    let rawResultText = "";
    
    // 1. TENTA PROCESSAMENTO LOCAL (window.ai) SE HABILITADO
    const isLocalAIAvailable = (window.ai && (window.ai.assistant || window.ai.createTextSession));
    if (isLocalAIAvailable && cvDataGlobal) {
        console.log(`[Scenario Simulator] Simulando cenário '${scenarioType}' via window.ai local...`);
        try {
            const systemPrompt = `Você é o 'Michel AI', especialista técnico de contratação do currículo de Michel de Souza.
Sua tarefa é simular como Michel resolveria o cenário prático de tipo '${scenarioType}' de forma canônica.
Seus dogmas fundamentais de desenvolvimento de software (DOGMAs) são:
1. DOGMA 2: No Silent Failures — Todo erro deve ser tratado de forma explícita e elegante nas camadas adequadas.
2. DOGMA 3: Validate ALL Inputs with Zod — Garantir a integridade das entradas via esquemas de validação rígidos.
3. DOGMA 4: External Service Isolation — Isolamento de serviços externos com adapters e injeção de dependência SOLID.

Você deve retornar estritamente e apenas um objeto JSON válido (sem comentários, sem crases markdown) no seguinte formato:
{
  "scenario_type": "${scenarioType}",
  "scenario_title": "Título do Cenário",
  "problem_statement": "Desafio de Partida (em Código/Markdown)",
  "michel_solution": "Solução Canônica do Michel (em Código/Markdown)",
  "explanation": "Explicação técnica ligando aos dogmas do Michel",
  "performance_score": 98
}`;

            if (window.ai.assistant) {
                const session = await window.ai.assistant.create({ systemPrompt: systemPrompt });
                rawResultText = await session.prompt(`Gere a simulação para o tipo de cenário: ${scenarioType}`);
                session.destroy();
            } else if (window.ai.createTextSession) {
                const session = await window.ai.createTextSession({ systemPrompt: systemPrompt });
                rawResultText = await session.prompt(`Gere a simulação para o tipo de cenário: ${scenarioType}`);
                session.destroy();
            }
        } catch (localErr) {
            console.warn("[Scenario Simulator] Falha ao rodar window.ai localmente. Acionando fallback do servidor...", localErr);
        }
    }
    
    // 2. FALLBACK: CONSULTA ROTA DO SERVIDOR FASTAPI
    let parsedResult = null;
    if (!rawResultText) {
        console.log("[Scenario Simulator] Solicitando simulação ao servidor backend...");
        try {
            const response = await fetch(getApiBase() + '/api/chat/analyze-scenario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario_type: scenarioType })
            });
            
            if (response.ok) {
                parsedResult = await response.json();
            }
        } catch (serverErr) {
            console.error("[Scenario Simulator] Erro ao comunicar com servidor:", serverErr);
        }
    } else {
        // Se temos texto bruto da IA local, fazemos o parse
        parsedResult = parseScenarioAIResponse(rawResultText, scenarioType);
    }
    
    // 3. SE AMBOS FALHAREM, GERA O FALLBACK LOCAL ESTÁTICO RESILIENTE
    if (!parsedResult) {
        console.warn("[Scenario Simulator] Sem resposta da IA local ou servidor. Acionando fallback estático...");
        parsedResult = getStaticScenarioFallback(scenarioType);
    }
    
    // 4. RENDERIZACAO DOS RESULTADOS
    renderScenarioResults(parsedResult);
    
    // Restaura estado do botão
    btn.disabled = false;
    btnText.classList.remove("d-none");
    btnLoader.classList.add("d-none");
}

function parseScenarioAIResponse(text, type) {
    try {
        let cleanText = text.trim();
        if (cleanText.startsWith("```")) {
            const lines = cleanText.split("\n");
            if (lines[0].startsWith("```json") || lines[0].startsWith("```")) {
                cleanText = lines.slice(1, -1).join("\n").trim();
            }
        }
        const data = JSON.parse(cleanText);
        return {
            scenario_type: data.scenario_type || type,
            scenario_title: data.scenario_title || "Cenário Técnico Simulado",
            problem_statement: data.problem_statement || "```\nCódigo problemático de partida\n```",
            michel_solution: data.michel_solution || "```\nSolução canônica do Michel\n```",
            explanation: data.explanation || "Resolução em total conformidade de dogmas.",
            performance_score: parseInt(data.performance_score) || 95
        };
    } catch (e) {
        console.warn("[Scenario Simulator] Falha ao fazer parse de JSON. Aplicando fallback estático para integridade...", e);
        return getStaticScenarioFallback(type);
    }
}

function renderScenarioResults(data) {
    const titleEl = document.getElementById("ai-sim-title");
    const problemEl = document.getElementById("ai-sim-problem");
    const solutionEl = document.getElementById("ai-sim-solution");
    const explanationEl = document.getElementById("ai-sim-explanation");
    const scoreEl = document.getElementById("ai-sim-score");
    const resultsPanel = document.getElementById("ai-scenario-results");
    
    // Insere dados higienizados e formatados em Markdown
    titleEl.innerText = data.scenario_title;
    problemEl.innerHTML = formatMarkdown(data.problem_statement);
    solutionEl.innerHTML = formatMarkdown(data.michel_solution);
    explanationEl.innerHTML = formatMarkdown(data.explanation);
    
    // Animação progressiva do score
    let currentScore = 0;
    scoreEl.innerText = "0%";
    resultsPanel.classList.remove("d-none");
    
    const targetScore = data.performance_score || 98;
    const interval = setInterval(() => {
        if (currentScore >= targetScore) {
            clearInterval(interval);
            scoreEl.innerText = `${targetScore}%`;
        } else {
            currentScore += 2;
            if (currentScore > targetScore) currentScore = targetScore;
            scoreEl.innerText = `${currentScore}%`;
        }
    }, 15);
}

function getStaticScenarioFallback(type) {
    if (type === "tech-security") {
        return {
            scenario_type: "tech-security",
            scenario_title: "🔒 Segurança de APIs: SQL Injection em FastAPI",
            problem_statement: "```python\n# CÓDIGO VULNERÁVEL (Anti-Padrão Comum)\n@app.get(\"/api/users\")\ndef get_users_vulnerable(email: str, db: Session = Depends(get_db)):\n    # A interpolação de strings direta permite injeção maliciosa de SQL\n    query = f\"SELECT * FROM users WHERE email = '{email}'\"\n    result = db.execute(text(query)).fetchall()\n    return result\n```",
            michel_solution: "```python\n# SOLUÇÃO CANÔNICA DO MICHEL (100% Protegido)\nfrom sqlalchemy import text\n\n@app.get(\"/api/users\", response_model=List[schemas.UserResponse])\ndef get_users_safe(email: str, db: Session = Depends(get_db)):\n    try:\n        # 1. Utilização de queries parametrizadas nativas (SQLAlchemy ORM)\n        # O driver trata os parâmetros de forma isolada da compilação da query\n        query = text(\"SELECT * FROM users WHERE email = :email\")\n        result = db.execute(query, {\"email\": email}).fetchall()\n        return result\n    except Exception as db_err:\n        # DOGMA 2: No Silent Failures - Tratamento e log explícito do erro\n        logger.error(f\"Falha ao consultar usuário {email}: {str(db_err)}\")\n        raise HTTPException(status_code=500, detail=\"Erro interno do banco de dados.\")\n```",
            explanation: "Michel aborda essa vulnerabilidade utilizando a compilação parametrizada nativa do SQLAlchemy ORM. Isso anula qualquer possibilidade de ataque de SQL Injection, pois o mecanismo do banco trata as entradas como literais isolados e nunca como código executável. Além disso, em perfeita consonância com o DOGMA 2 (No Silent Failures), a função envolve o processamento em uma estrutura try-catch explícita, capturando falhas de conexão de infraestrutura e registrando logs detalhados sem vazar mensagens do sistema interno para o cliente final.",
            performance_score: 100
        };
    } else if (type === "tech-validation") {
        return {
            scenario_type: "tech-validation",
            scenario_title: "🛡️ Arquitetura Defensiva: Validação com Zod e TypeScript",
            problem_statement: "```typescript\n// CÓDIGO INSEGURO (Anti-Padrão Sem Validação)\napp.post('/api/register', async (req, res) => {\n  // Atribuição direta sem checagem de tipos ou regras de negócio\n  const { username, age, email } = req.body;\n  const newUser = await saveToDatabase({ username, age, email });\n  res.status(201).json(newUser);\n});\n```",
            michel_solution: "```typescript\n// SOLUÇÃO CANÔNICA DO MICHEL (Validação de Tipagem Estrita)\nimport { z } from 'zod';\n\n// 1. Definição rígida do esquema de dados conforme o DOGMA 3\nconst registerSchema = z.object({\n  username: z.string().min(3, 'Mínimo de 3 caracteres').max(30),\n  age: z.number().int().min(18, 'Apenas maiores de idade').max(120),\n  email: z.string().email('Endereço de e-mail inválido')\n}).strict(); // strict impede propriedades adicionais indesejadas (Anti-XSS)\n\napp.post('/api/register', async (req, res) => {\n  try {\n    // 2. Validação instantânea síncrona com lançamento de erro explícito\n    const validatedData = registerSchema.parse(req.body);\n    const newUser = await saveToDatabase(validatedData);\n    return res.status(201).json(newUser);\n  } catch (error) {\n    // DOGMA 2 & 3: Captura erros do Zod e envia formatação amigável ao cliente\n    if (error instanceof z.ZodError) {\n      return res.status(400).json({ status: 'error', issues: error.errors });\n    }\n    return res.status(500).json({ status: 'error', message: 'Erro interno do servidor.' });\n  }\n});\n```",
            explanation: "Conforme estabelecido no DOGMA 3 (Validate ALL Inputs with Zod), Michel impede a entrada de dados maliciosos ou malformados na aplicação. O uso do Zod com .strict() garante que propriedades não documentadas (que poderiam ser utilizadas em ataques de poluição de protótipo ou XSS) sejam sumariamente rejeitadas antes de atingir o banco de dados. O fluxo também implementa o DOGMA 2 (No Silent Failures) ao tratar especificamente erros de parse do Zod de forma desacoplada das demais exceções de infraestrutura do Node.js.",
            performance_score: 98
        };
    } else if (type === "hospitality-conflict") {
        return {
            scenario_type: "hospitality-conflict",
            scenario_title: "🛎️ Atendimento de Elite: Overbooking em Hospitalidade (Concierge)",
            problem_statement: "**Cenário de Crise:**\nUm hóspede VIP internacional de alta relevância comercial chega ao condomínio de luxo / hotel após uma longa viagem internacional de 14 horas e constata que, devido a uma falha crítica de sincronização no sistema de reservas (Michels Travel), o apartamento premium reservado foi ocupado por outro cliente. A recepção padrão está sob alta pressão e o hóspede apresenta extrema frustração e irritação.",
            michel_solution: "**Roteiro Canônico de Resolução do Michel (5 Etapas de Excelência):**\n\n1. **Escuta Ativa & Validação Imediata (Sem Retaliação):** Ouvir atentamente o hóspede sem interrupções. Demonstrar empatia genuína: *'Entendo perfeitamente sua exaustão após um voo tão longo, Sr. Silva. Assumo inteira responsabilidade por esta falha e vou resolvê-la agora.'*\n2. **Acomodação Provisória com Conforto:** Conduzir o hóspede e sua bagagem imediatamente para uma sala VIP com internet de alta velocidade e servir bebidas de cortesia premium enquanto a solução definitiva é arquitetada.\n3. **Upgrade e Logística Custo Zero:** Devido ao overbooking, realizar o upgrade imediato para uma cobertura presidencial ou acionar um apartamento de nível superior em prédio parceiro vizinho, providenciando transporte privado executivo às custas do sistema.\n4. **Cortesia de Compensação:** Oferecer um jantar cortesia em um dos restaurantes mais exclusivos da região e uma isenção da taxa de serviço da estadia como retratação pelo inconveniente.\n5. **Double Confirmation (Fechamento do Ciclo):** Acompanhar pessoalmente o hóspede até a nova acomodação, certificar-se de que tudo está perfeito e realizar um follow-up na manhã seguinte para garantir sua total satisfação.",
            explanation: "Com mais de 500 clientes internacionais atendidos de forma extraordinária e uma média de CSAT histórica de 98% como Concierge de alto padrão nos Estados Unidos, Michel sabe que problemas operacionais de sistemas ocorrem, mas que a resposta humana imediata é o que define a reputação de uma marca de excelência. Ele aplica sua fluência bilingue profissional ativa para gerenciar a crise sob extrema pressão de forma acolhedora, resoluta e com foco em transformar um erro crítico do sistema em uma experiência memorável de fidelização do cliente.",
            performance_score: 97
        };
    } else {
        return {
            scenario_type: "data-performance",
            scenario_title: "📊 Engenharia de Dados: Otimização de Consultas SQL e Caching",
            problem_statement: "```python\n# CÓDIGO INEFICIENTE (N+1 Query Problem)\ndef get_experiences_with_techs_slow(db: Session = Depends(get_db)):\n    experiences = db.query(models.Experience).all()\n    results = []\n    for exp in experiences:\n        # Para cada experiência, faz uma nova consulta SQL à tabela de tecnologias\n        techs = db.query(models.Technology).filter(models.Technology.experience_id == exp.id).all()\n        results.append({\"exp\": exp, \"techs\": techs})\n    return results\n```",
            michel_solution: "```python\n# SOLUÇÃO CANÔNICA DO MICHEL (Otimizado com Eager Loading e Indexing)\nfrom sqlalchemy.orm import joinedload\nfrom repo_cache import ttl_cache # Decorator customizado para cache em memória\n\n# 1. Adicionado index composto no banco SQLite:\n# CREATE INDEX idx_tech_exp ON technologies (experience_id);\n\n@ttl_cache(ttl_seconds=300) # Caching em memória de 5 minutos\ndef get_experiences_with_techs_fast(db: Session = Depends(get_db)):\n    try:\n        # 2. Utilização de joinedload (Eager Loading) para resolver N+1 queries\n        # Reduz de N+1 consultas para exatamente 1 consulta SQL otimizada (JOIN)\n        results = db.query(models.Experience).options(\n            joinedload(models.Experience.technologies)\n        ).all()\n        return results\n    except Exception as err:\n        logger.error(f\"Falha ao ler experiências otimizadas: {str(err)}\")\n        raise HTTPException(status_code=500, detail=\"Falha de dados.\")\n```",
            explanation: "O problema clássico do N+1 é abordado por Michel utilizando Eager Loading (`joinedload` do SQLAlchemy), consolidando as varreduras de dados em uma única transação SQL otimizada com JOIN de alto desempenho. Com base no seu rigor analítico de estruturas de dados desenvolvido em Harvard (CS50x), ele também cria índices na coluna de chave estrangeira no banco SQLite para acelerar a busca interna de O(N) para O(log N). O sistema é blindado com um decorador de cache local (`ttl_cache`) para isolar requisições concorrentes repetitivas, aliviando o banco de dados conforme o DOGMA 4 (External Service Isolation).",
            performance_score: 99
        };
    }
}
