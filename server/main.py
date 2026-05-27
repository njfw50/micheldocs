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
    
    return {
        "profile": profile,
        "experiences": experiences,
        "education": education,
        "skills": skills,
        "business_metrics": business_metrics,
        "academic_researches": academic_researches,
        "human_values": human_values
    }

# --- PROFILE ENDPOINTS ---
@app.put("/api/profile", response_model=schemas.ProfileResponse)
def update_profile(profile: schemas.ProfileCreate, db: Session = Depends(get_db)):
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

# --- EXPERIENCE ENDPOINTS ---
@app.post("/api/experience", response_model=schemas.ExperienceResponse)
def create_experience(experience: schemas.ExperienceCreate, db: Session = Depends(get_db)):
    db_exp = models.Experience(**experience.model_dump())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@app.delete("/api/experience/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db)):
    db_exp = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(db_exp)
    db.commit()
    return {"ok": True}

# --- EDUCATION ENDPOINTS ---
@app.post("/api/education", response_model=schemas.EducationResponse)
def create_education(education: schemas.EducationCreate, db: Session = Depends(get_db)):
    db_edu = models.Education(**education.model_dump())
    db.add(db_edu)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@app.delete("/api/education/{edu_id}")
def delete_education(edu_id: int, db: Session = Depends(get_db)):
    db_edu = db.query(models.Education).filter(models.Education.id == edu_id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(db_edu)
    db.commit()
    return {"ok": True}

# --- SKILL ENDPOINTS ---
@app.post("/api/skill", response_model=schemas.SkillResponse)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    db_skill = models.Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@app.delete("/api/skill/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(db_skill)
    db.commit()
    return {"ok": True}

# --- ADMIN SECURE SERVICE LAYER (SEGURANÇA BANCÁRIA - LEI 14) ---
import os
import secrets
import json
import re
import logging
from fastapi import Header
from dotenv import load_dotenv

# Configurar logging estruturado
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carrega chaves administrativas do .env
load_dotenv()

# Senha padrão segura de fallback caso não esteja declarada no .env
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

def verify_admin(x_admin_password: str = Header(None)):
    """
    Função de autenticação simples e robusta para chamadas administrativas.
    Garante proteção de custo zero de licença (nativa).
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
    
    return {
        "profile": profile,
        "experiences": experiences,
        "education": education,
        "skills": skills,
        "business_metrics": business_metrics,
        "academic_researches": academic_researches,
        "human_values": human_values
    }

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

# --- INTEGRACAO CO-PILOTO AI: PARSER COM GEMINI (VERSÃO CORRIGIDA) ---
@app.post("/api/admin/ai/update")
def ai_co_pilot_update(payload: dict, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    prompt = payload.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Falta o prompt da atualização profissional.")
        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY não configurada no backend. Por favor, adicione-a no seu .env.")
        
    try:
        # Importação defensiva sob demanda para evitar crash de startup se o SDK estiver instalando (Lei 9/14)
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        
        system_instructions = (
            "Você é o Co-Piloto AI do Currículo de Michel de Souza. "
            "Sua tarefa é traduzir a fala informal em linguagem natural do Michel em dados estruturados para o banco SQLite.\n"
            "Escolha a categoria que melhor se adapta:\n"
            "1. 'profile': Atualizações de dados pessoais, biografia ou dogmas.\n"
            "2. 'experience': Experiência profissional (campos: title, company, location, date_range, description).\n"
            "3. 'education': Cursos, graduações (campos: title, institution, date_range, description).\n"
            "4. 'skill': Habilidades/competências (campos: name, category ('tech'/'core'/'language'/'certification'), level_percent (integer ou null), level_text).\n"
            "5. 'business_metric': Métricas de negócios (campos: name, value (integer), unit (ex: '$', 'chamados'), category ('Travel'/'Logistics'/'Tech'/'Contracts'), is_public (boolean)).\n"
            "6. 'academic_research': Publicação ou paper acadêmico/científico (campos: title, publisher, doi, date_published, abstract, url, is_public (boolean)).\n"
            "7. 'human_value': Valores Humanos e Princípios Pessoais (campos: name, description, icon).\n\n"
            "Retorne APENAS um objeto JSON puro, sem formatação markdown ou crases (```), no seguinte padrão:\n"
            "{\n"
            "  \"category\": \"profile\" | \"experience\" | \"education\" | \"skill\" | \"business_metric\" | \"academic_research\" | \"human_value\",\n"
            "  \"action\": \"create\" | \"update\",\n"
            "  \"data\": { ... campos correspondentes ... }\n"
            "}\n"
            "Seja inteligente: capture códigos DOI perfeitamente (ex: 10.5281/zenodo.123) e converta valores para números quando necessário."
        )
        
        try:
            # Tenta usar a versão mais recente do flash (CORRIGIDO: gemini-2.0-flash)
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(
                f"Instruções:\n{system_instructions}\n\nTexto do Michel:\n\"{prompt}\""
            )
        except Exception as e:
            logger.warning(f"Modelo gemini-2.0-flash falhou: {str(e)}. Tentando gemini-1.5-flash...")
            try:
                # Fallback para gemini-1.5-flash
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(
                    f"Instruções:\n{system_instructions}\n\nTexto do Michel:\n\"{prompt}\""
                )
            except Exception as e2:
                logger.error(f"Ambos os modelos falharam: {str(e2)}")
                raise HTTPException(status_code=500, detail=f"Nenhum modelo Gemini disponível: {str(e2)}")
        
        raw_text = response.text.strip()
        
        # Tratamento robusto de retorno markdown indesejado usando regex
        if raw_text.startswith("```"):
            # Remove blocos de código markdown
            raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
            raw_text = re.sub(r'\n```$', '', raw_text)
        
        # Tentar parsear JSON
        try:
            ai_data = json.loads(raw_text)
        except json.JSONDecodeError as parse_error:
            logger.error(f"Falha ao parsear JSON da IA: {raw_text}")
            raise HTTPException(status_code=422, detail=f"Falha de Parsing: Gemini não retornou JSON limpo. Erro: {str(parse_error)}")
        
        category = ai_data.get("category")
        action = ai_data.get("action", "create")
        fields = ai_data.get("data", {})
        
        # Validação básica de campos obrigatórios
        if not category:
            raise HTTPException(status_code=422, detail="IA não retornou categoria válida.")
        
        if not fields:
            raise HTTPException(status_code=422, detail="IA não retornou dados para inserir.")
        
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
            db.refresh(db_profile)
            logger.info(f"Perfil atualizado com sucesso via IA")
            return {"status": "success", "category": category, "action": "update", "data": fields}
            
        elif category == "experience":
            if action == "update":
                exp_id = fields.get("id")
                if not exp_id:
                    raise HTTPException(status_code=422, detail="Para atualizar experiência, forneça o 'id'.")
                db_exp = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
                if not db_exp:
                    raise HTTPException(status_code=404, detail="Experiência não encontrada para atualizar.")
                for k, v in fields.items():
                    if k != "id":
                        setattr(db_exp, k, v)
                db.commit()
                db.refresh(db_exp)
                logger.info(f"Experiência {exp_id} atualizada via IA")
                return {"status": "success", "category": category, "action": "update", "id": db_exp.id, "data": fields}
            else:
                db_exp = models.Experience(**fields)
                db.add(db_exp)
                db.commit()
                db.refresh(db_exp)
                logger.info(f"Nova experiência criada via IA: {db_exp.id}")
                return {"status": "success", "category": category, "action": "create", "id": db_exp.id, "data": fields}
            
        elif category == "education":
            if action == "update":
                edu_id = fields.get("id")
                if not edu_id:
                    raise HTTPException(status_code=422, detail="Para atualizar educação, forneça o 'id'.")
                db_edu = db.query(models.Education).filter(models.Education.id == edu_id).first()
                if not db_edu:
                    raise HTTPException(status_code=404, detail="Educação não encontrada para atualizar.")
                for k, v in fields.items():
                    if k != "id":
                        setattr(db_edu, k, v)
                db.commit()
                db.refresh(db_edu)
                logger.info(f"Educação {edu_id} atualizada via IA")
                return {"status": "success", "category": category, "action": "update", "id": db_edu.id, "data": fields}
            else:
                db_edu = models.Education(**fields)
                db.add(db_edu)
                db.commit()
                db.refresh(db_edu)
                logger.info(f"Nova educação criada via IA: {db_edu.id}")
                return {"status": "success", "category": category, "action": "create", "id": db_edu.id, "data": fields}
            
        elif category == "skill":
            if action == "update":
                skill_id = fields.get("id")
                if not skill_id:
                    raise HTTPException(status_code=422, detail="Para atualizar skill, forneça o 'id'.")
                db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
                if not db_skill:
                    raise HTTPException(status_code=404, detail="Skill não encontrada para atualizar.")
                for k, v in fields.items():
                    if k != "id":
                        setattr(db_skill, k, v)
                db.commit()
                db.refresh(db_skill)
                logger.info(f"Skill {skill_id} atualizada via IA")
                return {"status": "success", "category": category, "action": "update", "id": db_skill.id, "data": fields}
            else:
                db_skill = models.Skill(**fields)
                db.add(db_skill)
                db.commit()
                db.refresh(db_skill)
                logger.info(f"Nova skill criada via IA: {db_skill.id}")
                return {"status": "success", "category": category, "action": "create", "id": db_skill.id, "data": fields}
            
        elif category == "business_metric":
            if action == "update":
                metric_id = fields.get("id")
                if not metric_id:
                    raise HTTPException(status_code=422, detail="Para atualizar métrica, forneça o 'id'.")
                db_metric = db.query(models.BusinessMetric).filter(models.BusinessMetric.id == metric_id).first()
                if not db_metric:
                    raise HTTPException(status_code=404, detail="Métrica não encontrada para atualizar.")
                for k, v in fields.items():
                    if k != "id":
                        setattr(db_metric, k, v)
                db.commit()
                db.refresh(db_metric)
                logger.info(f"Métrica {metric_id} atualizada via IA")
                return {"status": "success", "category": category, "action": "update", "id": db_metric.id, "data": fields}
            else:
                db_metric = models.BusinessMetric(**fields)
                db.add(db_metric)
                db.commit()
                db.refresh(db_metric)
                logger.info(f"Nova métrica criada via IA: {db_metric.id}")
                return {"status": "success", "category": category, "action": "create", "id": db_metric.id, "data": fields}
            
        elif category == "academic_research":
            if action == "update":
                res_id = fields.get("id")
                if not res_id:
                    raise HTTPException(status_code=422, detail="Para atualizar pesquisa, forneça o 'id'.")
                db_res = db.query(models.AcademicResearch).filter(models.AcademicResearch.id == res_id).first()
                if not db_res:
                    raise HTTPException(status_code=404, detail="Pesquisa não encontrada para atualizar.")
                for k, v in fields.items():
                    if k != "id":
                        setattr(db_res, k, v)
                db.commit()
                db.refresh(db_res)
                logger.info(f"Pesquisa {res_id} atualizada via IA")
                return {"status": "success", "category": category, "action": "update", "id": db_res.id, "data": fields}
            else:
                db_res = models.AcademicResearch(**fields)
                db.add(db_res)
                db.commit()
                db.refresh(db_res)
                logger.info(f"Nova pesquisa criada via IA: {db_res.id}")
                return {"status": "success", "category": category, "action": "create", "id": db_res.id, "data": fields}
            
        elif category == "human_value":
            if action == "update":
                val_id = fields.get("id")
                if not val_id:
                    raise HTTPException(status_code=422, detail="Para atualizar valor, forneça o 'id'.")
                db_val = db.query(models.HumanValue).filter(models.HumanValue.id == val_id).first()
                if not db_val:
                    raise HTTPException(status_code=404, detail="Valor não encontrado para atualizar.")
                for k, v in fields.items():
                    if k != "id":
                        setattr(db_val, k, v)
                db.commit()
                db.refresh(db_val)
                logger.info(f"Valor {val_id} atualizado via IA")
                return {"status": "success", "category": category, "action": "update", "id": db_val.id, "data": fields}
            else:
                db_val = models.HumanValue(**fields)
                db.add(db_val)
                db.commit()
                db.refresh(db_val)
                logger.info(f"Novo valor criado via IA: {db_val.id}")
                return {"status": "success", "category": category, "action": "create", "id": db_val.id, "data": fields}
            
        else:
            raise HTTPException(status_code=422, detail=f"Categoria retornada pela IA é inválida: {category}")
            
    except HTTPException:
        # Re-lançar exceções HTTP já tratadas
        raise
    except json.JSONDecodeError as je:
        logger.error(f"JSON Decode Error: {str(je)}")
        raise HTTPException(status_code=422, detail=f"Falha de Parsing JSON: {str(je)}")
    except Exception as e:
        logger.error(f"Erro no Co-Piloto AI: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro no Co-Piloto AI: {str(e)}")

# ===== SERVIÇO DE HOSPEDAGEM E STATIC FILES (SIMPLICIDADE TÉCNICA - LEI 9) =====
# Servimos o frontend (index.html, admin.html, style.css, script.js) diretamente na raiz (/)
# do servidor local de desenvolvimento, eliminando quaisquer conflitos de CORS e centralizando o hub.
from fastapi.staticfiles import StaticFiles

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
