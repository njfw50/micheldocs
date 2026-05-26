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
            updateUI(data);
            console.log("Sucesso: Currículo atualizado dinamicamente via base de dados local.");
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

function appendChatMessage(text, className, id = null) {
    const chatContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${className}`;
    if (id) msgDiv.id = id;
    
    // Tratamento de conversão de quebras de linha para HTML (Mantendo a segurança)
    msgDiv.innerHTML = escapeHTML(text).replace(/\n/g, '<br>');
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
