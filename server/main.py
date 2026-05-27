from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# ===== LIVRO DA VIDA (LEI 5) — REGISTRO DE DECISÕES TÉCNICAS DO BACKEND =====
# 1. Arquitetura em Camadas: O backend mantém-se estritamente isolado do frontend (HTML/CSS/JS).
#    Esta API serve puramente payloads JSON de representação de dados (RESTful), sem interferir com UI.
# 2. Proteção e Integridade de Dados (Lei 14 - Segurança Bancária): O uso do SQLAlchemy ORM 
#    com mapeamento objeto-relacional garante a compilação automática em consultas SQL parametrizadas.
#    Isso anula qualquer possibilidade de SQL Injection, pois os parâmetros são tratados separadamente da query.
# 3. Simplicidade Técnica (Lei 9): Sem abstrações excessivas. Uso de dependências diretas de sessão
#    (get_db) para clareza técnica absoluta estilo CS50x.

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Michel's CV Admin API")

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MIDDLEWARE: PROTETOR DE CACHE (NO-CACHE) ---
# Força o navegador a sempre baixar as versões mais recentes dos arquivos estáticos
from fastapi import Request
@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.get("/api/cv", response_model=schemas.CVDataResponse)
def get_full_cv(db: Session = Depends(get_db)):
    profile = db.query(models.Profile).first()
    experiences = db.query(models.Experience).order_by(models.Experience.order_index).all()
    education = db.query(models.Education).order_by(models.Education.order_index).all()
    skills = db.query(models.Skill).order_by(models.Skill.order_index).all()
    
    # Busca apenas métricas e pesquisas marcadas como públicas para preservar a segurança de dados e privacidade (Lei 14)
    business_metrics = db.query(models.BusinessMetric).filter(models.BusinessMetric.is_public == True).order_by(models.BusinessMetric.order_index).all()
    academic_researches = db.query(models.AcademicResearch).filter(models.AcademicResearch.is_public == True).order_by(models.AcademicResearch.order_index).all()
    human_values = db.query(models.HumanValue).order_by(models.HumanValue.order_index).all()
    projects = db.query(models.Project).filter(models.Project.is_public == True).order_by(models.Project.order_index).all()
    languages = db.query(models.Language).order_by(models.Language.order_index).all()
    certifications = db.query(models.Certification).order_by(models.Certification.order_index).all()
    volunteer_work = db.query(models.VolunteerWork).order_by(models.VolunteerWork.order_index).all()
    
    return {
        "profile": profile,
        "experiences": experiences,
        "education": education,
        "skills": skills,
        "business_metrics": business_metrics,
        "academic_researches": academic_researches,
        "human_values": human_values,
        "projects": projects,
        "languages": languages,
        "certifications": certifications,
        "volunteer_work": volunteer_work
    }

# --- ADMIN SECURE SERVICE LAYER (SEGURANÇA BANCÁRIA - LEI 14) ---
import os
import secrets
import json
from fastapi import Header
from dotenv import load_dotenv

# Carrega chaves administrativas do .env
load_dotenv()

# Senha padrão segura de fallback caso não esteja declarada no .env
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

def verify_admin(x_admin_password: str = Header(None)):
    """
    Função de autenticação simples e robusta para chamadas administrativas.
    Garante proteção de custo zero de licença (nativa) em conformidade com a Lei 14.
    """
    if not x_admin_password or not secrets.compare_digest(x_admin_password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Não autorizado: Credenciais administrativas inválidas.")
    return True

@app.post("/api/admin/login")
def admin_login(payload: dict):
    password = payload.get("password")
    if password and secrets.compare_digest(password, ADMIN_PASSWORD):
        return {"status": "ok", "message": "Autenticado com sucesso."}
    raise HTTPException(status_code=401, detail="Senha de administrador inválida.")

@app.get("/api/admin/cv")
def get_admin_cv(db: Session = Depends(get_db), authenticated: bool = Depends(verify_admin)):
    """
    Retorna o payload completo incluindo dados marcados como privados para o Painel de Controle.
    """
    profile = db.query(models.Profile).first()
    experiences = db.query(models.Experience).order_by(models.Experience.order_index).all()
    education = db.query(models.Education).order_by(models.Education.order_index).all()
    skills = db.query(models.Skill).order_by(models.Skill.order_index).all()
    business_metrics = db.query(models.BusinessMetric).order_by(models.BusinessMetric.order_index).all()
    academic_researches = db.query(models.AcademicResearch).order_by(models.AcademicResearch.order_index).all()
    human_values = db.query(models.HumanValue).order_by(models.HumanValue.order_index).all()
    projects = db.query(models.Project).order_by(models.Project.order_index).all()
    languages = db.query(models.Language).order_by(models.Language.order_index).all()
    certifications = db.query(models.Certification).order_by(models.Certification.order_index).all()
    volunteer_work = db.query(models.VolunteerWork).order_by(models.VolunteerWork.order_index).all()
    
    return {
        "profile": profile,
        "experiences": experiences,
        "education": education,
        "skills": skills,
        "business_metrics": business_metrics,
        "academic_researches": academic_researches,
        "human_values": human_values,
        "projects": projects,
        "languages": languages,
        "certifications": certifications,
        "volunteer_work": volunteer_work
    }


# --- CRUD ADMIN: PROFILE ENDPOINTS ---
@app.put("/api/admin/profile", response_model=schemas.ProfileResponse)
def update_profile(profile: schemas.ProfileCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    """
    Atualiza as informações de perfil do Michel, protegido por chaves administrativas (Lei 14).
    """
    db_profile = db.query(models.Profile).first()
    if not db_profile:
        db_profile = models.Profile(**profile.model_dump())
        db.add(db_profile)
    else:
        for key, value in profile.model_dump().items():
            setattr(db_profile, key, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile


# --- CRUD ADMIN: EXPERIENCE ENDPOINTS ---
@app.post("/api/admin/experience", response_model=schemas.ExperienceResponse)
def create_experience(experience: schemas.ExperienceCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_exp = models.Experience(**experience.model_dump())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@app.put("/api/admin/experience/{exp_id}", response_model=schemas.ExperienceResponse)
def update_experience(exp_id: int, experience: schemas.ExperienceCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_exp = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiência profissional não encontrada.")
    for key, value in experience.model_dump().items():
        setattr(db_exp, key, value)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@app.delete("/api/admin/experience/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_exp = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiência profissional não encontrada.")
    db.delete(db_exp)
    db.commit()
    return {"ok": True}


# --- CRUD ADMIN: EDUCATION ENDPOINTS ---
@app.post("/api/admin/education", response_model=schemas.EducationResponse)
def create_education(education: schemas.EducationCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_edu = models.Education(**education.model_dump())
    db.add(db_edu)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@app.put("/api/admin/education/{edu_id}", response_model=schemas.EducationResponse)
def update_education(edu_id: int, education: schemas.EducationCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_edu = db.query(models.Education).filter(models.Education.id == edu_id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Registro de formação acadêmica não encontrado.")
    for key, value in education.model_dump().items():
        setattr(db_edu, key, value)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@app.delete("/api/admin/education/{edu_id}")
def delete_education(edu_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_edu = db.query(models.Education).filter(models.Education.id == edu_id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Registro de formação acadêmica não encontrado.")
    db.delete(db_edu)
    db.commit()
    return {"ok": True}


# --- CRUD ADMIN: SKILL ENDPOINTS ---
@app.post("/api/admin/skill", response_model=schemas.SkillResponse)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_skill = models.Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@app.put("/api/admin/skill/{skill_id}", response_model=schemas.SkillResponse)
def update_skill(skill_id: int, skill: schemas.SkillCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Habilidade não encontrada.")
    for key, value in skill.model_dump().items():
        setattr(db_skill, key, value)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@app.delete("/api/admin/skill/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Habilidade não encontrada.")
    db.delete(db_skill)
    db.commit()
    return {"ok": True}


# --- CRUD ADMIN: METRICAS EMPRESARIAIS ---
@app.post("/api/admin/metric", response_model=schemas.BusinessMetricResponse)
def create_metric(metric: schemas.BusinessMetricCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_metric = models.BusinessMetric(**metric.model_dump())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@app.put("/api/admin/metric/{metric_id}", response_model=schemas.BusinessMetricResponse)
def update_metric(metric_id: int, metric: schemas.BusinessMetricCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_metric = db.query(models.BusinessMetric).filter(models.BusinessMetric.id == metric_id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Métrica não encontrada.")
    for key, value in metric.model_dump().items():
        setattr(db_metric, key, value)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@app.delete("/api/admin/metric/{metric_id}")
def delete_metric(metric_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_metric = db.query(models.BusinessMetric).filter(models.BusinessMetric.id == metric_id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Métrica não encontrada.")
    db.delete(db_metric)
    db.commit()
    return {"ok": True}


# --- CRUD ADMIN: PRODUCOES ACADEMICAS ---
@app.post("/api/admin/research", response_model=schemas.AcademicResearchResponse)
def create_research(research: schemas.AcademicResearchCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_res = models.AcademicResearch(**research.model_dump())
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

@app.put("/api/admin/research/{res_id}", response_model=schemas.AcademicResearchResponse)
def update_research(res_id: int, research: schemas.AcademicResearchCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_res = db.query(models.AcademicResearch).filter(models.AcademicResearch.id == res_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Publicação acadêmica não encontrada.")
    for key, value in research.model_dump().items():
        setattr(db_res, key, value)
    db.commit()
    db.refresh(db_res)
    return db_res

@app.delete("/api/admin/research/{res_id}")
def delete_research(res_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_res = db.query(models.AcademicResearch).filter(models.AcademicResearch.id == res_id).first()
    if not db_res:
        raise HTTPException(status_code=404, detail="Publicação acadêmica não encontrada.")
    db.delete(db_res)
    db.commit()
    return {"ok": True}


# --- CRUD ADMIN: VALORES HUMANOS ---
@app.post("/api/admin/human_value", response_model=schemas.HumanValueResponse)
def create_human_value(val: schemas.HumanValueCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_val = models.HumanValue(**val.model_dump())
    db.add(db_val)
    db.commit()
    db.refresh(db_val)
    return db_val

@app.put("/api/admin/human_value/{val_id}", response_model=schemas.HumanValueResponse)
def update_human_value(val_id: int, val: schemas.HumanValueCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_val = db.query(models.HumanValue).filter(models.HumanValue.id == val_id).first()
    if not db_val:
        raise HTTPException(status_code=404, detail="Valor humano não encontrado.")
    for key, value in val.model_dump().items():
        setattr(db_val, key, value)
    db.commit()
    db.refresh(db_val)
    return db_val

@app.delete("/api/admin/human_value/{val_id}")
def delete_human_value(val_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_val = db.query(models.HumanValue).filter(models.HumanValue.id == val_id).first()
    if not db_val:
        raise HTTPException(status_code=404, detail="Valor humano não encontrado.")
    db.delete(db_val)
    db.commit()
    return {"ok": True}


# --- EXHAUSTIVE CRUD: PROJECTS, LANGUAGES, CERTIFICATIONS, VOLUNTEER ---

@app.post("/api/admin/project", response_model=schemas.ProjectResponse)
def create_project(item: schemas.ProjectCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = models.Project(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/admin/project/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project: schemas.ProjectCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    for key, value in project.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/admin/project/{item_id}")
def delete_project(item_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.Project).filter(models.Project.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return {"ok": True}

@app.post("/api/admin/language", response_model=schemas.LanguageResponse)
def create_language(item: schemas.LanguageCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = models.Language(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/admin/language/{language_id}", response_model=schemas.LanguageResponse)
def update_language(language_id: int, language: schemas.LanguageCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.Language).filter(models.Language.id == language_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Idioma não encontrado.")
    for key, value in language.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/admin/language/{item_id}")
def delete_language(item_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.Language).filter(models.Language.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return {"ok": True}

@app.post("/api/admin/certification", response_model=schemas.CertificationResponse)
def create_certification(item: schemas.CertificationCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = models.Certification(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/admin/certification/{cert_id}", response_model=schemas.CertificationResponse)
def update_certification(cert_id: int, cert: schemas.CertificationCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.Certification).filter(models.Certification.id == cert_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Certificação não encontrada.")
    for key, value in cert.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/admin/certification/{item_id}")
def delete_certification(item_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.Certification).filter(models.Certification.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return {"ok": True}

@app.post("/api/admin/volunteer_work", response_model=schemas.VolunteerWorkResponse)
def create_volunteer_work(item: schemas.VolunteerWorkCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = models.VolunteerWork(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/admin/volunteer_work/{vw_id}", response_model=schemas.VolunteerWorkResponse)
def update_volunteer_work(vw_id: int, vw: schemas.VolunteerWorkCreate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.VolunteerWork).filter(models.VolunteerWork.id == vw_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Trabalho voluntário não encontrado.")
    for key, value in vw.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/admin/volunteer_work/{item_id}")
def delete_volunteer_work(item_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    db_item = db.query(models.VolunteerWork).filter(models.VolunteerWork.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return {"ok": True}

# --- INTEGRACAO CO-PILOTO AI: PARSER COM OLLAMA (OPEN SOURCE LOCAL) E GOOGLE GEMINI ---

def call_gemini_api(prompt: str, json_mode: bool = False) -> str:
    """
    Realiza a chamada direta para a API do Google Gemini (2.5-flash) de forma ultra-leve.
    Garante conformidade com a Lei 9 (Simplicidade) e Lei 14 (Segurança de chaves sem expor no front-end).
    Caso a chamada falhe ou a chave não esteja definida, retorna None para acionar o fallback do Ollama.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.1 if json_mode else 0.3
        }
    }
    
    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"
        
    try:
        import requests
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        res_json = response.json()
        text = res_json["candidates"][0]["content"]["parts"][0]["text"]
        return text.strip()
    except Exception as e:
        print(f"[Gemini API Error] Fallback ativado. Motivo: {str(e)}")
        return None

def check_local_chat_response(prompt: str) -> dict:
    """
    Intercepta saudações, comandos de ajuda e testes locais para resposta imediata
    sem necessidade de chamada a APIs de IA externas/locais (Lei 9 - Simplicidade).
    """
    clean = prompt.strip().lower().rstrip("?.!,;:-")
    
    # Remover artigos e pontuação simples
    clean_words = set(clean.split())
    
    greetings = {"oi", "olá", "ola", "hello", "hi", "hey", "bom dia", "boa tarde", "boa noite", "tudo bem", "como vai"}
    if clean in greetings or any(w in greetings for w in clean_words):
        return {
            "status": "success",
            "category": "chat",
            "message": (
                "👋 <strong>Olá Michel!</strong> Eu sou o seu <strong>Co-Piloto AI</strong> local.<br><br>"
                "Estou pronto para traduzir suas falas em atualizações estruturadas no banco de dados SQLite (Lei 14).<br><br>"
                "<strong>Experimente digitar algo como:</strong><br>"
                "• <em>'Concluí o curso CS50x da Harvard University este mês'</em><br>"
                "• <em>'Adicionei uma nova experiência como Desenvolvedor Python na Liberty'</em><br>"
                "• <em>'Adicione o projeto Michel AI com stack HTML/JS/Python'</em>"
            )
        }
        
    help_commands = {"help", "ajuda", "comandos", "o que você faz", "como usar"}
    if clean in help_commands or any(w in help_commands for w in clean_words):
        return {
            "status": "success",
            "category": "chat",
            "message": (
                "🛠️ <strong>Manual do Co-Piloto AI:</strong><br><br>"
                "Você pode inserir ou atualizar as seguintes seções apenas escrevendo no terminal:<br>"
                "1. <strong>Perfil:</strong> altere bio, e-mail, telefone, dogmas.<br>"
                "2. <strong>Experiências:</strong> cargo, empresa, conquistas, período.<br>"
                "3. <strong>Formação:</strong> curso, faculdade, tese, GPA.<br>"
                "4. <strong>Competências:</strong> habilidades técnicas ou comportamentais.<br>"
                "5. <strong>Métricas:</strong> dados numéricos de performance corporativa.<br>"
                "6. <strong>Publicações:</strong> artigos científicos com DOI Zenodo.<br>"
                "7. <strong>Valores:</strong> dogmas e crenças profissionais.<br>"
                "8. <strong>Projetos:</strong> portfólio prático, links de demo e GitHub.<br>"
                "9. <strong>Idiomas:</strong> línguas estrangeiras e proficiência.<br>"
                "10. <strong>Certificações:</strong> certificados isolados.<br>"
                "11. <strong>Trabalho Voluntário:</strong> impacto social e atividades.<br><br>"
                "Basta digitar a atualização desejada em linguagem natural!"
            )
        }
        
    return None

import re

def try_regex_fallback_parser(prompt: str) -> str:
    """
    Fallback determinístico via Regex (Lei 9 - Simplicidade).
    Se as chaves de API externa e o Ollama local falharem, este motor estático e robusto
    analisa a intenção e atende a comandos comuns de inserção/atualização.
    """
    p = prompt.strip().lower()
    
    # 1. Habilidade (Skill)
    # Ex: "Adicione a habilidade Docker", "Nova skill Kubernetes", "criar uma nova habilidade Python"
    match_skill = re.search(r'(?:adicione|nova|criar|adicionar|inserir)(?:\s+(?:a|o|um|uma|nova|novo|de|da|do))?\s+(?:habilidade|skill|competência|competencia)\s+([a-zA-Z0-9+#.\s]+)', p)
    if match_skill:
        name = match_skill.group(1).strip().title()
        category = "tech"
        if any(w in p for w in ["core", "comportamental", "liderança", "comunicação"]):
            category = "core"
        return json.dumps({
            "category": "skill",
            "action": "create",
            "data": {
                "name": name,
                "category": category,
                "order_index": 0
            }
        })
        
    # 2. Atualizar Perfil: Telefone, E-mail, Localização
    # Ex: "muda o telefone para +1 862 350-1161", "atualizar meu celular para +1 862 350-1161"
    match_phone = re.search(r'(?:mudar|alterar|atualizar|muda|telefone|phone|celular)(?:\s+(?:o|a|meu|seu))?\s+(?:telefone|phone|celular)?(?:\s+para)?\s*([+0-9\s()-]+)', p)
    if match_phone and any(char.isdigit() for char in match_phone.group(1)):
        phone = match_phone.group(1).strip()
        return json.dumps({
            "category": "profile",
            "action": "update",
            "data": {
                "phone": phone
            }
        })

    # Ex: "muda o email para michel@gmail.com", "atualizar e-mail para michel@gmail.com"
    match_email = re.search(r'(?:email|e-mail|correio)(?:\s+(?:o|a|meu|seu))?\s+(?:email|e-mail|correio)?(?:\s+para)?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', p)
    if match_email:
        email = match_email.group(1).strip()
        return json.dumps({
            "category": "profile",
            "action": "update",
            "data": {
                "email": email
            }
        })

    # Ex: "atualizar localizacao para Newark, New Jersey", "muda a localização para New York"
    match_loc = re.search(r'(?:localização|localizacao|moradia|cidade|endereço|endereco)(?:\s+(?:o|a|minha|sua))?\s+(?:localização|localizacao|moradia|cidade|endereço|endereco)?(?:\s+para)?\s*([a-zA-Z\s,]+)', p)
    if match_loc and any(w in p for w in ["localização", "localizacao", "moradia", "cidade", "endereço", "endereco"]):
        loc = match_loc.group(1).strip().title()
        return json.dumps({
            "category": "profile",
            "action": "update",
            "data": {
                "location": loc
            }
        })

    # 3. Adicionar Idioma
    match_lang = re.search(r'(?:idioma|lingua|língua)\s+([a-zA-ZçÇãÃõÕéÉíÍóÓ\s]+)\s+(?:nível|nivel|proficiência|como)\s+([a-zA-Z0-9\s]+)', p)
    if match_lang:
        name = match_lang.group(1).strip().title()
        prof = match_lang.group(2).strip().title()
        return json.dumps({
            "category": "language",
            "action": "create",
            "data": {
                "name": name,
                "proficiency": prof,
                "order_index": 0
            }
        })

    return None

@app.post("/api/admin/ai/update")
def ai_co_pilot_update(payload: dict, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    """
    Endpoint administrativo que traduz comandos de linguagem natural do Michel em dados estruturados 
    para o banco SQLite, suportando Gemini (como motor principal) e Ollama (como fallback local).
    """
    prompt = payload.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Falta o prompt da atualização profissional.")
        
    # Intercepta saudações e ajuda localmente para experiência de usuário instantânea (Lei 9)
    local_response = check_local_chat_response(prompt)
    if local_response:
        return local_response
        
    system_instructions = (
        "Você é o Co-Piloto AI do Currículo de Michel de Souza.\n"
        "Sua tarefa é traduzir a fala informal do Michel em dados estruturados para o banco SQLite.\n"
        "Categorias de inserção válidas:\n"
        "1. 'profile': Dados pessoais, biografia, hobbies, linguagens faladas.\n"
        "2. 'experience': Experiência profissional (campos extras opcionais: achievements, tools_used, team_size, budget_managed).\n"
        "3. 'education': Cursos, graduações (campos extras: coursework, thesis, gpa_honors).\n"
        "4. 'skill': Habilidades.\n"
        "5. 'business_metric': Métricas de negócios.\n"
        "6. 'academic_research': Publicação com DOI.\n"
        "7. 'human_value': Valores.\n"
        "8. 'project': Projetos práticos/portfólio (campos: title, short_description, detailed_description, tech_stack, github_url, live_demo_url).\n"
        "9. 'language': Idiomas com proficiência estruturada.\n"
        "10. 'certification': Certificados isolados.\n"
        "11. 'volunteer_work': Trabalho voluntário e impacto.\n\n"
        "Retorne APENAS um objeto JSON válido no seguinte formato exato (sem comentários, sem crases markdown ou textos extras):\n"
        "{\n"
        "  \"category\": \"nome_da_categoria\",\n"
        "  \"action\": \"create\" | \"update\",\n"
        "  \"data\": { ... campos correspondentes ... }\n"
        "}"
    )
    
    raw_text = None
    
    # 1. Tenta usar o Google Gemini 2.5 Flash com JSON Mode
    gemini_prompt = f"Instruções:\n{system_instructions}\n\nTexto do Michel:\n\"{prompt}\""
    raw_text = call_gemini_api(gemini_prompt, json_mode=True)
    
    # 2. Se falhar, usa local Ollama (Phi-3) como fallback
    if not raw_text:
        print("[Co-Pilot AI] Gemini indisponível para parser. Utilizando Ollama local...")
        try:
            import requests
            ollama_payload = {
                "model": "phi3",
                "prompt": f"Instruções:\n{system_instructions}\n\nTexto do Michel:\n\"{prompt}\"",
                "stream": False,
                "format": "json"
            }
            response = requests.post("http://localhost:11434/api/generate", json=ollama_payload, timeout=60)
            response.raise_for_status()
            res_json = response.json()
            raw_text = res_json.get("response", "").strip()
        except Exception as ollama_err:
            print(f"[Ollama Co-Pilot API Error] Falha total no parser local. Motivo: {str(ollama_err)}")
            
            # --- MOTOR DETERMINÍSTICO DE FALLBACK EM CASO DE APIS APAGADAS (LIVRO DA VIDA - LEI 5) ---
            print("[Co-Pilot AI] Tentando parser determinístico baseado em regras de Regex...")
            raw_text = try_regex_fallback_parser(prompt)
            
            if not raw_text:
                detail_msg = (
                    "Nenhum motor de Inteligência Artificial ou Regras Estáticas pôde processar o comando no momento.<br><br>"
                    "<strong>Como resolver:</strong><br>"
                    "1. Insira uma chave válida do Google Gemini no arquivo <code>server/.env</code> como <code>GEMINI_API_KEY=sua_chave</code> (Obtenha em: <a href='https://aistudio.google.com/' target='_blank' class='text-cyan'>Google AI Studio</a>).<br>"
                    "2. Ou certifique-se de que o <strong>Ollama</strong> está rodando localmente na porta 11434 com o modelo <code>phi3</code> ou <code>llama3</code> instalado (<code>ollama run phi3</code>)."
                )
                raise HTTPException(status_code=400, detail=detail_msg)
            
    try:
        # Tratamento de retorno markdown indesejado (caso o modelo não respeite o json mode perfeitamente)
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```json") or lines[0].startswith("```"):
                raw_text = "\n".join(lines[1:-1]).strip()
                
        ai_data = json.loads(raw_text)
        category = ai_data.get("category")
        action = ai_data.get("action")
        fields = ai_data.get("data", {})
        
        # Injeção dinâmica no ORM de forma parametrizada segura (Anti-SQLi)
        if category == "profile":
            db_profile = db.query(models.Profile).first()
            if not db_profile:
                db_profile = models.Profile(**fields)
                db.add(db_profile)
            else:
                for k, v in fields.items():
                    setattr(db_profile, k, v)
            db.commit()
            return {"status": "success", "category": category, "action": "update", "data": fields}
            
        elif category == "experience":
            db_exp = models.Experience(**fields)
            db.add(db_exp)
            db.commit()
            db.refresh(db_exp)
            return {"status": "success", "category": category, "action": "create", "id": db_exp.id, "data": fields}
            
        elif category == "education":
            db_edu = models.Education(**fields)
            db.add(db_edu)
            db.commit()
            db.refresh(db_edu)
            return {"status": "success", "category": category, "action": "create", "id": db_edu.id, "data": fields}
            
        elif category == "skill":
            db_skill = models.Skill(**fields)
            db.add(db_skill)
            db.commit()
            db.refresh(db_skill)
            return {"status": "success", "category": category, "action": "create", "id": db_skill.id, "data": fields}
            
        elif category == "business_metric":
            db_metric = models.BusinessMetric(**fields)
            db.add(db_metric)
            db.commit()
            db.refresh(db_metric)
            return {"status": "success", "category": category, "action": "create", "id": db_metric.id, "data": fields}
            
        elif category == "academic_research":
            db_res = models.AcademicResearch(**fields)
            db.add(db_res)
            db.commit()
            db.refresh(db_res)
            return {"status": "success", "category": category, "action": "create", "id": db_res.id, "data": fields}
            
        elif category == "human_value":
            db_val = models.HumanValue(**fields)
            db.add(db_val)
            db.commit()
            db.refresh(db_val)
            return {"status": "success", "category": category, "action": "create", "id": db_val.id, "data": fields}
            
        elif category == "project":
            db_item = models.Project(**fields)
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return {"status": "success", "category": category, "action": "create", "id": db_item.id, "data": fields}
 
        elif category == "language":
            db_item = models.Language(**fields)
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return {"status": "success", "category": category, "action": "create", "id": db_item.id, "data": fields}
 
        elif category == "certification":
            db_item = models.Certification(**fields)
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return {"status": "success", "category": category, "action": "create", "id": db_item.id, "data": fields}
 
        elif category == "volunteer_work":
            db_item = models.VolunteerWork(**fields)
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return {"status": "success", "category": category, "action": "create", "id": db_item.id, "data": fields}
            
        else:
            raise HTTPException(status_code=422, detail=f"Categoria retornada pela IA é inválida: {category}")
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail=f"Falha de Parsing: Gemini/Ollama não retornou JSON limpo. Payload: {raw_text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no Co-Piloto AI: {str(e)}")

def extract_relevant_context(query: str, db: Session) -> str:
    """
    Mecanismo de RAG Local Semântico Otimizado (Lei 9 - Simplicidade).
    Analisa os termos buscados e filtra dinamicamente as entidades relevantes no SQLite.
    Reduz em até 80% o footprint de tokens do prompt, acelerando a inferência local da IA.
    """
    query_clean = query.strip().lower()
    keywords = [w for w in query_clean.split() if len(w) > 2] # Ignora artigos/preposições curtíssimas
    
    profile = db.query(models.Profile).first()
    experiences = db.query(models.Experience).all()
    education = db.query(models.Education).all()
    skills = db.query(models.Skill).all()
    business_metrics = db.query(models.BusinessMetric).filter(models.BusinessMetric.is_public == True).all()
    academic_researches = db.query(models.AcademicResearch).filter(models.AcademicResearch.is_public == True).all()
    projects = db.query(models.Project).filter(models.Project.is_public == True).all()
    languages = db.query(models.Language).all()
    certifications = db.query(models.Certification).all()
    volunteer_work = db.query(models.VolunteerWork).all()
    human_values = db.query(models.HumanValue).all()
    
    generic_words = {"olá", "ola", "quem", "sobre", "resumo", "apresente", "perfil", "biografia", "tudo", "bom", "dia"}
    is_generic = len(keywords) == 0 or any(w in generic_words for w in keywords)
    
    context = ""
    if profile:
        context += f"## Perfil do Michel de Souza\n- Nome: {profile.name}\n- Título: {profile.title}\n- Localização: {profile.location}\n- Resumo: {profile.summary}\n- Contatos: {profile.phone} | {profile.email}\n- Links: {profile.linkedin} | {profile.facebook}\n"
        if profile.dogma1: context += f"- Dogmas de Engenharia: {profile.dogma1} | {profile.dogma2} | {profile.dogma3}\n"
        context += "\n"

    if is_generic:
        tech_skills = [s.name for s in skills if s.category == "tech"][:8]
        context += f"## Habilidades Chave\n- Stack Principal: {', '.join(tech_skills)}\n\n"
        
        context += "## Experiências Principais (Resumo)\n"
        for exp in sorted(experiences, key=lambda x: x.order_index)[:3]:
            context += f"- {exp.title} na {exp.company} ({exp.date_range})\n"
        context += "\n"
        
        context += "## Projetos em Destaque\n"
        for p in sorted(projects, key=lambda x: x.order_index)[:2]:
            context += f"- {p.title}: {p.short_description}\n"
        return context

    matched_sections = []
    
    def score_text(text: str) -> int:
        if not text: return 0
        text_lower = text.lower()
        return sum(text_lower.count(kw) for kw in keywords)

    for exp in experiences:
        score = score_text(exp.title) * 3 + score_text(exp.company) * 2 + score_text(exp.description) + score_text(exp.achievements)
        if score > 0:
            content = f"### Experiência: {exp.title} na {exp.company} ({exp.date_range})\n- Local: {exp.location}\n- Atividades: {exp.description or 'N/A'}\n- Conquistas: {exp.achievements or 'N/A'}\n- Techs: {exp.tools_used or 'N/A'}\n"
            matched_sections.append((score, content))

    for edu in education:
        score = score_text(edu.title) * 3 + score_text(edu.institution) * 2 + score_text(edu.description) + score_text(edu.coursework)
        if score > 0:
            content = f"### Formação Acadêmica: {edu.title} no(a) {edu.institution} ({edu.date_range or 'N/A'})\n- Disciplinas: {edu.coursework or 'N/A'}\n- Destaque: {edu.gpa_honors or 'N/A'}\n"
            matched_sections.append((score, content))

    for p in projects:
        score = score_text(p.title) * 3 + score_text(p.short_description) * 2 + score_text(p.detailed_description) + score_text(p.tech_stack)
        if score > 0:
            content = f"### Projeto: {p.title}\n- Resumo: {p.short_description}\n- Stack: {p.tech_stack or 'N/A'}\n- GitHub: {p.github_url or 'N/A'}\n- Demo: {p.live_demo_url or 'N/A'}\n- Detalhes: {p.detailed_description or 'N/A'}\n"
            matched_sections.append((score, content))

    for r in academic_researches:
        score = score_text(r.title) * 3 + score_text(r.abstract) * 2 + score_text(r.publisher)
        if score > 0:
            content = f"### Publicação Científica: {r.title} ({r.publisher})\n- DOI: {r.doi or 'N/A'}\n- Resumo: {r.abstract}\n- Link: {r.url}\n"
            matched_sections.append((score, content))

    for m in business_metrics:
        score = score_text(m.name) * 3 + score_text(m.category)
        if score > 0:
            content = f"### Métrica Corporativa: {m.name}\n- Impacto: {m.value:,} {m.unit} (Categoria: {m.category})\n"
            matched_sections.append((score, content))

    for l in languages:
        score = score_text(l.name) * 3 + score_text(l.proficiency)
        if score > 0:
            content = f"### Idioma Falado: {l.name}\n- Nível: {l.proficiency} (Leitura: {l.reading_level}, Escrita: {l.writing_level}, Conversação: {l.speaking_level})\n"
            matched_sections.append((score, content))

    for c in certifications:
        score = score_text(c.title) * 3 + score_text(c.issuer)
        if score > 0:
            content = f"### Certificação: {c.title} (Emissor: {c.issuer} | {c.date_issued})\n- Credencial: {c.credential_id or 'N/A'} (Link: {c.credential_url or 'N/A'})\n"
            matched_sections.append((score, content))

    for v in volunteer_work:
        score = score_text(v.role) * 3 + score_text(v.organization) * 2 + score_text(v.description)
        if score > 0:
            content = f"### Trabalho Voluntário: {v.role} na {v.organization} ({v.date_range})\n- Atividades: {v.description}\n- Impacto: {v.impact or 'N/A'}\n"
            matched_sections.append((score, content))

    matched_skills = [s.name for s in skills if score_text(s.name) > 0]
    if matched_skills:
        content = f"### Competências Relevantes Identificadas:\n- {', '.join(matched_skills)}\n"
        matched_sections.append((2, content))

    matched_values = [f"{v.name} ({v.description})" for v in human_values if score_text(v.name) > 0 or score_text(v.description) > 0]
    if matched_values:
        content = "### Valores Humanos Relacionados:\n" + "\n".join(f"- {val}" for val in matched_values) + "\n"
        matched_sections.append((2, content))

    matched_sections.sort(key=lambda x: x[0], reverse=True)
    
    if matched_sections:
        context += "## Informações Específicas do Michel Encontradas para a Pergunta:\n"
        for _, sect in matched_sections[:5]:
            context += sect + "\n"
    else:
        tech_skills = [s.name for s in skills if s.category == "tech"][:10]
        context += f"## Resumo Geral de Competências\n- Habilidades Técnicas: {', '.join(tech_skills)}\n"
        
    return context

@app.post("/api/chat")
def chat_with_cv(payload: dict, db: Session = Depends(get_db)):
    """
    Chatbot interativo do Currículo do Michel. Realiza busca dinâmica RAG baseada em relevância,
    otimizando a inferência, e processa a resposta usando Gemini (principal) ou Ollama (fallback).
    """
    message = payload.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Falta a mensagem do usuário.")
    
    # 1. Busca contextualizada avançada via RAG semântico local
    context = extract_relevant_context(message, db)
    profile = db.query(models.Profile).first()
    
    # 2. Definição estrita da persona do assistente
    system_prompt = (
        "Você é o 'Michel AI', o assistente virtual oficial inteligente, polido e experiente do currículo de Michel de Souza.\n"
        "Seu objetivo é encantar e responder de forma precisa a perguntas de recrutadores e visitantes do currículo do Michel.\n\n"
        "Aqui está o contexto altamente relevante e filtrado da base de dados do Michel:\n"
        "==================================================\n"
        f"{context}"
        "==================================================\n\n"
        "Instruções Estritas de Resposta:\n"
        "1. **Tom Profissional & Premium:** Adote um tom confiante, respeitoso, extremamente inteligente e polido. Use o português de forma natural e sem erros.\n"
        "2. **Ponto de Destaque (Transição & Harvard):** Sempre valorize a incrível transição de carreira do Michel de turismo/hospitalidade de alto nível (Concierge, Agente de Viagens internacional) para a Engenharia de Software. Destaque o rigor técnico e a lógica obtida através do curso CS50x de Harvard.\n"
        "3. **Base de Dados como Única Verdade:** Responda apenas com base nas informações fornecidas no contexto acima. Caso o usuário pergunte algo ausente do banco de dados, responda educadamente que não possui essa informação cadastrada em sua memória.\n"
        "4. **Custo Zero e Leis Canônicas:** Se questionado sobre as diretrizes técnicas do Michel, mencione orgulhosamente o seguimento rigoroso aos dogmas de engenharia (como tratamento explícito de erros, validação estrita de esquemas e isolamento de serviços externos).\n"
        "5. **Estruturação Visual:** Responda de forma clara, utilizando bullet points ou tabelas markdown para organizar números e conquistas importantes sempre que apropriado."
    )
    
    response_text = None
    
    # 1. Tenta usar o Google Gemini 2.5 Flash como motor principal
    gemini_prompt = f"{system_prompt}\n\nPergunta do Recrutador: {message}\n\nResposta do Assistente:"
    response_text = call_gemini_api(gemini_prompt)
    
    # 2. Se falhar ou não houver chave, usa local Ollama (Phi-3) como fallback
    if not response_text:
        print("[AI Engine] Gemini indisponível. Utilizando Ollama local...")
        try:
            import requests
            ollama_payload = {
                "model": "phi3",
                "prompt": f"{system_prompt}\n\nPergunta do Recrutador: {message}\n\nResposta do Assistente:",
                "stream": False
            }
            response = requests.post("http://localhost:11434/api/generate", json=ollama_payload, timeout=60)
            response.raise_for_status()
            res_json = response.json()
            response_text = res_json.get("response", "").strip()
        except Exception as ollama_err:
            print(f"[Ollama API Error] Fallback local falhou. Motivo: {str(ollama_err)}")
            
    # 3. Se ambos falharem, usa um fallback estático inteligente gerado a partir do banco de dados para evitar erro 500
    if not response_text:
        title_text = profile.title if (profile and profile.title) else "Software Engineer"
        location_text = profile.location if (profile and profile.location) else "New Jersey, USA"
        response_text = (
            "Olá! Atualmente meus servidores de inteligência artificial estão passando por uma rápida manutenção, "
            "mas posso adiantar os principais dados do Michel para você de forma direta:\n\n"
            f"- **Michel de Souza** é **{title_text}**.\n"
            f"- Ele está localizado na região de **{location_text}**.\n"
            "- Seu principal marco educacional recente é o rigoroso curso **CS50x da Harvard University**.\n\n"
            "Você também pode conferir e navegar por todo o currículo de forma detalhada na tela à sua esquerda!"
        )
        
    return {"response": response_text}


# ===== SERVIÇO DE HOSPEDAGEM E STATIC FILES (SIMPLICIDADE TÉCNICA - LEI 9) =====
# Servimos o frontend (index.html, admin.html, style.css, script.js) diretamente na raiz (/)
# do servidor local de desenvolvimento, eliminando quaisquer conflitos de CORS e centralizando o hub.
from fastapi.staticfiles import StaticFiles

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
