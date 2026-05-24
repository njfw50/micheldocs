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

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    date_range = Column(String)
    description = Column(Text)
    order_index = Column(Integer, default=0)

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    institution = Column(String)
    date_range = Column(String)
    description = Column(Text)
    order_index = Column(Integer, default=0)

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String) # 'tech', 'core', 'language', 'certification'
    level_percent = Column(Integer, nullable=True) # Used for languages
    level_text = Column(String, nullable=True) # Used for languages
    order_index = Column(Integer, default=0)

class BusinessMetric(Base):
    __tablename__ = "business_metrics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    value = Column(Integer)
    unit = Column(String) # ex: "$", "voos", "chamados"
    category = Column(String) # ex: "Travel", "Logistics"
    is_public = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

class AcademicResearch(Base):
    __tablename__ = "academic_researches"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    publisher = Column(String) # ex: "Zenodo", "Harvard"
    doi = Column(String, index=True, nullable=True) # ex: "10.5281/zenodo.12345"
    date_published = Column(String)
    abstract = Column(Text)
    url = Column(String) # ex: Zenodo PDF url
    is_public = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

class HumanValue(Base):
    __tablename__ = "human_values"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    icon = Column(String, default="bi-heart-fill") # Bootstrap icon class
    order_index = Column(Integer, default=0)
