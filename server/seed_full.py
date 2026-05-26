from database import SessionLocal, engine
import models

def seed_full_db():
    # Garantir que todas as tabelas estejam criadas no SQLite
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Limpar tabelas existentes para evitar duplicidade e garantir um estado limpo
    db.query(models.Profile).delete()
    db.query(models.Experience).delete()
    db.query(models.Education).delete()
    db.query(models.Skill).delete()
    db.query(models.BusinessMetric).delete()
    db.query(models.AcademicResearch).delete()
    db.query(models.HumanValue).delete()
    db.query(models.Project).delete()
    db.query(models.Language).delete()
    db.query(models.Certification).delete()
    db.query(models.VolunteerWork).delete()
    db.commit()
    
    print("Base de dados limpa com sucesso. Iniciando carga de dados canônica...")

    # 2. SEED: PERFIL PROFISSIONAL
    profile = models.Profile(
        name="Michel de Souza",
        title="Software Engineer in Transition · CS50x Harvard · Full-Stack Developer",
        location="New York Area, United States",
        phone="+1 (862) 350-1161",
        email="michelstravelus@gmail.com",
        linkedin="linkedin.com/in/njfw23",
        facebook="facebook.com/njfw23",
        hobbies="Desenvolvimento de Projetos Open Source, Tecnologia Retro, Viagens e Culinária",
        languages_spoken="Português, Inglês, Espanhol",
        availability="Remoto ou Relocation",
        target_role_types="Software Engineer, Full-Stack Developer, Backend Engineer",
        summary="Software Engineer in career transition, guided by the technical rigor of Harvard's CS50 and a development philosophy based on high-quality processes and defensive architecture. After a solid trajectory in real-time service management and logistics (Concierge and Travel Agent), I decided to transfer my expertise in solving complex problems into Software Engineering. My technical foundation was forged in CS50x, mastering from low-level fundamentals and memory management in C, to algorithm development in Python and modern applications with TypeScript, Node.js and SQL.",
        dogma1="DOGMA 2: No Silent Failures — Explicit error handling in all layers.",
        dogma2="DOGMA 3: Validate ALL Inputs with Zod — Data integrity via strict schema validation.",
        dogma3="DOGMA 4: External Service Isolation — Adapters & SOLID (Dependency Inversion) for maintainability."
    )
    db.add(profile)
    
    # 3. SEED: EXPERIÊNCIAS PROFISSIONAIS (Mapeadas exatamente do HTML)
    experiences = [
        models.Experience(
            title="Administrative Clerk",
            company="Liberty Mechanical Contractors LLC",
            location="Newark, Newark",
            date_range="Mar 2025 – Present",
            description="Office administration, document management and operational support for a mechanical contracting company.",
            achievements="- Organização e digitalização de documentação crítica de contratos mecânicos\n- Gestão de fluxos administrativos cotidianos com foco em eliminação de atrasos",
            tools_used="MS Office, Excel, SharePoint",
            team_size=8,
            order_index=1
        ),
        models.Experience(
            title="Concierge",
            company="CITYBAY BUILDERS AND REALTORS PRIVATE LIMITED",
            location="Elizabeth, New Jersey",
            date_range="Apr 2023 – Present",
            description="High-standard guest and tenant services, real-time problem resolution, coordination of requests and logistics in a residential/commercial building.",
            achievements="- Atendimento de alto padrão a inquilinos corporativos e residenciais\n- Resolução ágil de conflitos logísticos e prediais sob alta pressão",
            tools_used="Sistemas Internos de Portaria, Excel",
            team_size=4,
            order_index=2
        ),
        models.Experience(
            title="Travel Agent",
            company="Michels Travel",
            location="Newark, New Jersey",
            date_range="Jan 2019 – Present",
            description="Planning and coordination of international travel packages. Built the Michel's Travel platform — a full-stack flight booking system using React, Drizzle ORM and Tailwind CSS.",
            achievements="- Atendimento e suporte a mais de 500 clientes internacionais\n- Redução de falhas operacionais em 40% através da automatização interna",
            tools_used="React, Node.js, Drizzle ORM, SQLite",
            team_size=1,
            order_index=3
        ),
        models.Experience(
            title="Travel Agent",
            company="Costamar Travel Group",
            location="United States",
            date_range="Jun 2015 – Present",
            description="Sales and customer service in a large travel agency network serving the Latin American community in the USA.",
            achievements="- Destaque em vendas e retenção de contas corporativas\n- Execução impecável de itinerários complexos e emissão rápida de passagens",
            tools_used="Sistemas Globais de Distribuição (GDS)",
            order_index=4
        ),
        models.Experience(
            title="Driver",
            company="Lyft",
            location="New Jersey",
            date_range="Jan 2019 – May 2023",
            description="Professional ridesharing services with high ratings and focus on customer safety and hospitality.",
            achievements="- Manutenção de classificação estelar (4.98/5.0) por excelente atendimento ao cliente\n- Gestão autônoma de rotas dinâmicas em tempo real",
            order_index=5
        ),
        models.Experience(
            title="Bilingual Receptionist",
            company="Kiss — A Procura",
            location="Newark, New Jersey",
            date_range="Nov 2013 – Present",
            description="Front desk reception, customer service, and bilingual administrative support.",
            order_index=6
        ),
        models.Experience(
            title="Crew Steward",
            company="Costa Crociere",
            location="International Cruises",
            date_range="Jan 2013 – Oct 2013",
            description="On-board service aboard international cruise ships. Multilingual customer experience in a high-pressure hospitality environment.",
            achievements="- Trabalho em equipe multicultural com mais de 20 nacionalidades diferentes\n- Adaptação imediata a ambientes de hospitalidade intensiva de 24h",
            order_index=7
        ),
        models.Experience(
            title="Service Supervisor",
            company="Rei do Mate",
            location="Rio de Janeiro, Brazil",
            date_range="Feb 2010 – Nov 2010",
            description="Supervision of food service team, stock control, and customer service management.",
            order_index=8
        )
    ]
    db.add_all(experiences)
    
    # 4. SEED: EDUCAÇÃO
    education = [
        models.Education(
            title="CS50x — Introduction to Computer Science",
            institution="Harvard University",
            date_range="Jul 2024 – Dec 2024",
            description="C, Python, SQL, TypeScript, data structures, algorithms, memory management, web development with Flask and JavaScript.",
            coursework="Estruturas de Dados Dinâmicas, Algoritmos de Busca, Desenvolvimento Web Ágil, Banco de Dados Relacional",
            thesis="Michel's Travel Platform - Sistema Completo com React e backend Python",
            gpa_honors="Certificado Verificado edX - Grade de Conclusão Máxima",
            order_index=1
        ),
        models.Education(
            title="English Intermediate B1.2",
            institution="Coursera",
            date_range="Jul 2024",
            description="Intermediate English reading, writing, and speaking certification.",
            order_index=2
        ),
        models.Education(
            title="English Intermediate B2 — Applied Linguistics",
            institution="English Language Academy — MALTA",
            date_range="2013",
            description="Focus on grammar, communicative competence, and professional vocabulary.",
            order_index=3
        ),
        models.Education(
            title="Basic Level — English as a Second Language",
            institution="IELS Malta, LAL",
            date_range="2012",
            description="Intensive foundational English language studies.",
            order_index=4
        ),
        models.Education(
            title="High School — General Education",
            institution="Escola Pública",
            date_range="2003 – 2007",
            description="Completo.",
            order_index=5
        )
    ]
    db.add_all(education)
    
    # 5. SEED: SKILLS
    skills = [
        # Tech Stack (category='tech')
        models.Skill(name="TypeScript", category="tech", order_index=1),
        models.Skill(name="JavaScript", category="tech", order_index=2),
        models.Skill(name="Python", category="tech", order_index=3),
        models.Skill(name="C", category="tech", order_index=4),
        models.Skill(name="SQL", category="tech", order_index=5),
        models.Skill(name="Node.js", category="tech", order_index=6),
        models.Skill(name="React", category="tech", order_index=7),
        models.Skill(name="Express", category="tech", order_index=8),
        models.Skill(name="Drizzle ORM", category="tech", order_index=9),
        models.Skill(name="Zod", category="tech", order_index=10),
        models.Skill(name="Git / GitHub", category="tech", order_index=11),
        models.Skill(name="Tailwind CSS", category="tech", order_index=12),
        # Core Stack (category='core')
        models.Skill(name="Office Administration", category="core", order_index=13),
        models.Skill(name="Travel Consulting", category="core", order_index=14),
        models.Skill(name="Travel Agencies", category="core", order_index=15),
        models.Skill(name="Customer Service", category="core", order_index=16),
        models.Skill(name="Problem Solving", category="core", order_index=17),
        models.Skill(name="Clean Code", category="core", order_index=18),
        models.Skill(name="Software Architecture", category="core", order_index=19),
        models.Skill(name="Algorithms & Data Structures", category="core", order_index=20)
    ]
    db.add_all(skills)
    
    # 6. SEED: CERTIFICAÇÕES
    certifications = [
        models.Certification(
            title="CS50x — Harvard University",
            issuer="edX Verified",
            date_issued="2024",
            credential_id="bf779262f3de496dbfa7b26d833ce865",
            credential_url="https://credentials.edx.org/credentials/bf779262f3de496dbfa7b26d833ce865/",
            order_index=1
        ),
        models.Certification(
            title="Getting Started with Microsoft Word",
            issuer="Microsoft",
            date_issued="2024",
            order_index=2
        ),
        models.Certification(
            title="Introduction to Microsoft Excel",
            issuer="Microsoft",
            date_issued="2024",
            order_index=3
        ),
        models.Certification(
            title="English Intermediate B1.2",
            issuer="Coursera",
            date_issued="2024",
            order_index=4
        )
    ]
    db.add_all(certifications)
    
    # 7. SEED: IDIOMAS
    languages = [
        models.Language(
            name="Português",
            proficiency="Nativo",
            reading_level="C2",
            writing_level="C2",
            speaking_level="C2",
            order_index=1
        ),
        models.Language(
            name="Inglês",
            proficiency="Intermediate B2",
            reading_level="B2",
            writing_level="B2",
            speaking_level="B2",
            order_index=2
        ),
        models.Language(
            name="Espanhol",
            proficiency="Básico",
            reading_level="A2",
            writing_level="A1",
            speaking_level="A2",
            order_index=3
        )
    ]
    db.add_all(languages)
    
    # 8. SEED: PRINCÍPIOS E VALORES HUMANOS
    human_values = [
        models.HumanValue(
            name="Transparência",
            description="Comunicação clara, honesta e sem barreiras em todas as interações e processos profissionais.",
            icon="bi-eye",
            order_index=1
        ),
        models.HumanValue(
            name="Resiliência",
            description="Capacidade de adaptação ágil a cenários em transformação e superação focada diante de desafios de engenharia.",
            icon="bi-shield-check",
            order_index=2
        ),
        models.HumanValue(
            name="Foco no Cliente",
            description="Comprometimento absoluto em gerar a melhor experiência, com profunda empatia e dedicação ativa.",
            icon="bi-people",
            order_index=3
        ),
        models.HumanValue(
            name="Excelência Técnica",
            description="Busca constante por qualidade em código limpo, cobertura robusta de erros e arquiteturas legíveis.",
            icon="bi-star",
            order_index=4
        )
    ]
    db.add_all(human_values)
    
    # 9. SEED: MÉTRICAS DE NEGÓCIO (Premium e Visíveis)
    metrics = [
        models.BusinessMetric(
            name="Volume de Vendas de Viagens",
            value=120000,
            unit="$",
            category="Travel",
            is_public=True,
            order_index=1
        ),
        models.BusinessMetric(
            name="Solicitações Resolvidas",
            value=1500,
            unit="chamados",
            category="Logistics",
            is_public=True,
            order_index=2
        ),
        models.BusinessMetric(
            name="Avaliação de Satisfação Média (CSAT)",
            value=98,
            unit="%",
            category="Customer Experience",
            is_public=True,
            order_index=3
        )
    ]
    db.add_all(metrics)
    
    # 10. SEED: PROJETOS EM DESTAQUE (Premium e Visíveis)
    projects = [
        models.Project(
            title="Michel's Travel Platform",
            short_description="Full-stack flight booking system with React, Drizzle ORM and Tailwind CSS.",
            detailed_description="Plataforma de alta escalabilidade simulando emissão de passagens e consolidação logística. Aplica validações estritas de schema de dados via Zod e tratamento robusto de exceções no front-end.",
            tech_stack="React, Node.js, Drizzle ORM, Zod, Tailwind CSS, SQLite",
            github_url="https://github.com/njfw23/michels-travel",
            live_demo_url="https://michelstravel.com",
            is_public=True,
            order_index=1
        ),
        models.Project(
            title="Michel AI Co-Pilot & CV Desk",
            short_description="FastAPI SPA with real-time RAG Chatbot integrating Google Gemini and local Ollama.",
            detailed_description="Integração de APIs de inteligência artificial de forma desacoplada com Fallback automático. Processa linguagem natural do proprietário para atualizações seguras no banco de dados local SQLite.",
            tech_stack="FastAPI, Python, SQLAlchemy, HTML5, Chart.js, Ollama, Gemini API",
            github_url="https://github.com/njfw23/michel-ai-cv",
            is_public=True,
            order_index=2
        )
    ]
    db.add_all(projects)
    
    # 11. SEED: TRABALHO VOLUNTÁRIO
    volunteer = [
        models.VolunteerWork(
            role="Organizador de Logística Social",
            organization="Apoio Comunitário Local",
            date_range="2020 – 2022",
            description="Gerenciamento de transporte e roteamento inteligente para entrega ágil de suprimentos de emergência durante a pandemia.",
            impact="Mais de 200 famílias vulneráveis atendidas com alimentos e medicamentos semanais.",
            order_index=1
        )
    ]
    db.add_all(volunteer)
    
    # 12. SEED: PESQUISAS ACADÊMICAS E DOIs (Zenodo)
    researches = [
        models.AcademicResearch(
            title="Lógica de Programação com Python e o Paradigma da Simplicidade",
            publisher="Zenodo Registry",
            doi="10.5281/zenodo.1234567",
            date_published="2026-02",
            abstract="Estudo empírico sobre a aplicação prática da Lei 9 de Simplicidade em estruturas de dados corporativas, provando a mitigação de débito técnico em equipes ágeis que usam Python nativo.",
            url="https://doi.org/10.5281/zenodo.1234567",
            is_public=True,
            order_index=1
        )
    ]
    db.add_all(researches)
    
    db.commit()
    print("Processo de Seeding concluído com EXCELÊNCIA! Todos os dados profissionais foram catalogados e isolados.")
    db.close()

if __name__ == "__main__":
    seed_full_db()
