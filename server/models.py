from sqlalchemy import Column, Integer, String, Text, Boolean
from database import Base

class Profile(Base):
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    title = Column(String)
    location = Column(String)
    phone = Column(String)
    email = Column(String)
    linkedin = Column(String)
    facebook = Column(String)
    summary = Column(Text)
    dogma1 = Column(Text)
    dogma2 = Column(Text)
    dogma3 = Column(Text)
    
    # New fields for extensive cataloging
    hobbies = Column(Text, nullable=True)
    languages_spoken = Column(Text, nullable=True)
    availability = Column(String, nullable=True) # e.g. "Remoto, Relocation"
    target_role_types = Column(String, nullable=True)

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    date_range = Column(String)
    description = Column(Text)
    
    # New deep fields
    achievements = Column(Text, nullable=True) # markdown bullet points
    tools_used = Column(String, nullable=True) # comma separated
    team_size = Column(Integer, nullable=True)
    budget_managed = Column(String, nullable=True)
    
    order_index = Column(Integer, default=0)

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    institution = Column(String)
    date_range = Column(String)
    description = Column(Text)
    
    # New deep fields
    coursework = Column(Text, nullable=True)
    thesis = Column(String, nullable=True)
    gpa_honors = Column(String, nullable=True)
    
    order_index = Column(Integer, default=0)

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String) # 'tech', 'core', 'language', 'certification'
    level_percent = Column(Integer, nullable=True) 
    level_text = Column(String, nullable=True) 
    order_index = Column(Integer, default=0)

class BusinessMetric(Base):
    __tablename__ = "business_metrics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    value = Column(Integer)
    unit = Column(String) 
    category = Column(String) 
    is_public = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

class AcademicResearch(Base):
    __tablename__ = "academic_researches"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    publisher = Column(String) 
    doi = Column(String, index=True, nullable=True) 
    date_published = Column(String)
    abstract = Column(Text)
    url = Column(String) 
    is_public = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

class HumanValue(Base):
    __tablename__ = "human_values"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    icon = Column(String, default="bi-heart-fill") 
    order_index = Column(Integer, default=0)

# ----- NEW TABLES FOR EXHAUSTIVE HUB -----

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    short_description = Column(String)
    detailed_description = Column(Text, nullable=True)
    tech_stack = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    live_demo_url = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    proficiency = Column(String) 
    reading_level = Column(String, nullable=True)
    writing_level = Column(String, nullable=True)
    speaking_level = Column(String, nullable=True)
    order_index = Column(Integer, default=0)

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    issuer = Column(String)
    date_issued = Column(String)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    order_index = Column(Integer, default=0)

class VolunteerWork(Base):
    __tablename__ = "volunteer_work"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)
    organization = Column(String)
    date_range = Column(String)
    description = Column(Text)
    impact = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
