from pydantic import BaseModel
from typing import List, Optional

class ProfileBase(BaseModel):
    name: str
    title: str
    location: str
    phone: str
    email: str
    linkedin: str
    facebook: str
    summary: str
    dogma1: str
    dogma2: str
    dogma3: str
    hobbies: Optional[str] = None
    languages_spoken: Optional[str] = None
    availability: Optional[str] = None
    target_role_types: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    class Config:
        from_attributes = True

class ExperienceBase(BaseModel):
    title: str
    company: str
    location: str
    date_range: str
    description: Optional[str] = None
    achievements: Optional[str] = None
    tools_used: Optional[str] = None
    team_size: Optional[int] = None
    budget_managed: Optional[str] = None
    order_index: int = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: int
    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    title: str
    institution: str
    date_range: Optional[str] = None
    description: Optional[str] = None
    coursework: Optional[str] = None
    thesis: Optional[str] = None
    gpa_honors: Optional[str] = None
    order_index: int = 0

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: int
    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: str
    level_percent: Optional[int] = None
    level_text: Optional[str] = None
    order_index: int = 0

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

class BusinessMetricBase(BaseModel):
    name: str
    value: int
    unit: str
    category: str
    is_public: bool = False
    order_index: int = 0

class BusinessMetricCreate(BusinessMetricBase):
    pass

class BusinessMetricResponse(BusinessMetricBase):
    id: int
    class Config:
        from_attributes = True

class AcademicResearchBase(BaseModel):
    title: str
    publisher: str
    doi: Optional[str] = None
    date_published: str
    abstract: str
    url: str
    is_public: bool = False
    order_index: int = 0

class AcademicResearchCreate(AcademicResearchBase):
    pass

class AcademicResearchResponse(AcademicResearchBase):
    id: int
    class Config:
        from_attributes = True

class HumanValueBase(BaseModel):
    name: str
    description: str
    icon: Optional[str] = "bi-heart-fill"
    order_index: int = 0

class HumanValueCreate(HumanValueBase):
    pass

class HumanValueResponse(HumanValueBase):
    id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    short_description: str
    detailed_description: Optional[str] = None
    tech_stack: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    is_public: bool = False
    order_index: int = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    class Config:
        from_attributes = True

class LanguageBase(BaseModel):
    name: str
    proficiency: str
    reading_level: Optional[str] = None
    writing_level: Optional[str] = None
    speaking_level: Optional[str] = None
    order_index: int = 0

class LanguageCreate(LanguageBase):
    pass

class LanguageResponse(LanguageBase):
    id: int
    class Config:
        from_attributes = True

class CertificationBase(BaseModel):
    title: str
    issuer: str
    date_issued: str
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    order_index: int = 0

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: int
    class Config:
        from_attributes = True

class VolunteerWorkBase(BaseModel):
    role: str
    organization: str
    date_range: str
    description: str
    impact: Optional[str] = None
    order_index: int = 0

class VolunteerWorkCreate(VolunteerWorkBase):
    pass

class VolunteerWorkResponse(VolunteerWorkBase):
    id: int
    class Config:
        from_attributes = True

class CVDataResponse(BaseModel):
    profile: Optional[ProfileResponse]
    experiences: List[ExperienceResponse]
    education: List[EducationResponse]
    skills: List[SkillResponse]
    business_metrics: List[BusinessMetricResponse]
    academic_researches: List[AcademicResearchResponse]
    human_values: List[HumanValueResponse]
    projects: List[ProjectResponse]
    languages: List[LanguageResponse]
    certifications: List[CertificationResponse]
    volunteer_work: List[VolunteerWorkResponse]
