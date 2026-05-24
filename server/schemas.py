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

class CVDataResponse(BaseModel):
    profile: Optional[ProfileResponse]
    experiences: List[ExperienceResponse]
    education: List[EducationResponse]
    skills: List[SkillResponse]
    business_metrics: List[BusinessMetricResponse]
    academic_researches: List[AcademicResearchResponse]
    human_values: List[HumanValueResponse]
