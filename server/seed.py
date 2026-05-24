from database import SessionLocal, engine
import models

def seed_db():
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if profile already exists
    if db.query(models.Profile).first():
        print("Database already seeded")
        return
        
    profile = models.Profile(
        name="Michel de Souza",
        title="Software Engineer in Transition · CS50x Harvard · Full-Stack Developer",
        location="New York Area, United States",
        phone="+1 (862) 350-1161",
        email="michelstravelus@gmail.com",
        linkedin="linkedin.com/in/njfw23",
        facebook="facebook.com/njfw23",
        summary="Software Engineer in career transition, guided by the technical rigor of Harvard's CS50 and a development philosophy based on high-quality processes and defensive architecture. After a solid trajectory in real-time service management and logistics (Concierge and Travel Agent), I decided to transfer my expertise in solving complex problems into Software Engineering. My technical foundation was forged in CS50x, mastering from low-level fundamentals and memory management in C, to algorithm development in Python and modern applications with TypeScript, Node.js and SQL.",
        dogma1="DOGMA 2: No Silent Failures — Explicit error handling in all layers.",
        dogma2="DOGMA 3: Validate ALL Inputs with Zod — Data integrity via strict schema validation.",
        dogma3="DOGMA 4: External Service Isolation — Adapters & SOLID (Dependency Inversion) for maintainability."
    )
    db.add(profile)
    
    # Add an experience
    exp1 = models.Experience(
        title="Administrative Clerk",
        company="Liberty Mechanical Contractors LLC",
        location="Newark, New Jersey",
        date_range="Mar 2025 – Present",
        description="Office administration, document management and operational support for a mechanical contracting company.",
        order_index=1
    )
    db.add(exp1)

    # Add education
    edu1 = models.Education(
        title="CS50x — Introduction to Computer Science",
        institution="Harvard University",
        date_range="Jul 2024 – Dec 2024",
        description="C, Python, SQL, TypeScript, data structures, algorithms, memory management, web development with Flask and JavaScript.",
        order_index=1
    )
    db.add(edu1)
    
    # Add skills
    skill1 = models.Skill(name="TypeScript", category="tech", order_index=1)
    skill2 = models.Skill(name="Python", category="tech", order_index=2)
    skill3 = models.Skill(name="Clean Code", category="core", order_index=3)
    skill4 = models.Skill(name="English", category="language", level_percent=72, level_text="Intermediate B2", order_index=4)
    
    db.add_all([skill1, skill2, skill3, skill4])
    db.commit()
    
    # Check if human values already exist
    if not db.query(models.HumanValue).first():
        val1 = models.HumanValue(name="Transparência", description="Comunicação clara e honesta em todas as interações e processos.", icon="bi-eye", order_index=1)
        val2 = models.HumanValue(name="Resiliência", description="Capacidade de adaptação a mudanças rápidas e superação de desafios técnicos ou operacionais.", icon="bi-shield-check", order_index=2)
        val3 = models.HumanValue(name="Foco no Cliente", description="Garantir a melhor experiência, com empatia e dedicação à resolução de problemas.", icon="bi-people", order_index=3)
        val4 = models.HumanValue(name="Excelência Técnica", description="Busca constante por código limpo, arquitetura robusta e melhores práticas.", icon="bi-star", order_index=4)
        db.add_all([val1, val2, val3, val4])
        db.commit()
        print("Human values seeded.")
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
