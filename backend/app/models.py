from sqlmodel import SQLModel, Field, Column, DateTime, TEXT, JSON
from uuid import UUID, uuid4
from datetime import datetime
from typing import Dict, Any  # Add this import


class Primary_Care_Giver(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    auth_user_id: str | None = Field(default=None, unique=True)
    username: str
    email: str
    contact_number: str
    password: str | None = Field(default=None)
    relationship: str


class Child(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    name: str
    birth_date: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    gender: str
    carer_id: int = Field(default=None, foreign_key="primary_care_giver.id")


class Growth(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    weight: float
    height: float
    head_circumference: float
    note: str | None
    child_id: int = Field(default=None, foreign_key="child.id")


class Growth_Benchmark(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)
    age_month: int
    weight: float
    height: float
    head_circumference: float
    gender: str


class Sleep_Time(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    start_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    end_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    note: str | None
    child_id: int = Field(default=None, foreign_key="child.id")


class Meal(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    consumption_level: float
    others: str | None  # This should probably be nullable
    note: str | None
    meal_time_category: int = Field(default=None, foreign_key="meal_time_category.id")
    meal_category: int = Field(default=None, foreign_key="meal_category.id")
    child_id: int = Field(default=None, foreign_key="child.id")


class Meal_Time_Category(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    time_category: str


class Meal_Category(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    category: str


# FIXED: Updated to match your schema changes
class Poop(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    note: str | None  # Fixed: Made nullable to match other models
    color: int = Field(default=None, foreign_key="poop_color.id")
    texture: int = Field(default=None, foreign_key="poop_texture.id")  # Fixed: Changed from consistency
    child_id: int = Field(default=None, foreign_key="child.id")


class Poop_Color(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    category: str


class Poop_Texture(SQLModel, table = True):
    __tablename__ = "poop_texture"
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    category: str


class Symptom(SQLModel, table = True):
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    symptom: str
    photo_url: str
    note: str | None
    child_id: int = Field(default=None, foreign_key="child.id")


class ChatbotChat(SQLModel, table = True):
    __tablename__ = "chatbot_chats"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str | None = None
    owner_id: int = Field(foreign_key="primary_care_giver.id")
    child_id: int | None = Field(foreign_key="child.id", default=None)
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))


class ChatMessage(SQLModel, table = True):
    __tablename__ = "chat_messages"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    chat_id: UUID = Field(foreign_key="chatbot_chats.id")
    message: str = Field(sa_column=Column(TEXT))
    sender: str
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))


# Lookup tables
class Gender_Options(SQLModel, table = True):
    __tablename__ = "gender_options"
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    value: str = Field(unique=True)
    label: str


class Relationship_Types(SQLModel, table = True):
    __tablename__ = "relationship_types"
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    value: str = Field(unique=True)
    label: str


class Access_Levels(SQLModel, table = True):
    __tablename__ = "access_levels"
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    value: str = Field(unique=True)
    label: str

class Symptom_Types(SQLModel, table = True):
    __tablename__ = "symptom_types"
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    value: str = Field(unique=True)
    label: str
    icon: str | None = None  # Optional icon field


class Consumption_Levels(SQLModel, table = True):
    __tablename__ = "consumption_levels"
    id: int | None = Field(default=None, primary_key=True)  # Consistent style
    value: str = Field(unique=True)
    label: str
    percentage: int    

class Saved_Articles(SQLModel, table = True):
    __tablename__ = "saved_articles"
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="primary_care_giver.id")
    article_id: str = Field(index=True)
    article_data: Dict[str, Any] = Field(sa_column=Column(JSON))
    saved_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False), default_factory=datetime.now)
    child_id: int | None = Field(default=None, foreign_key="child.id")

class Health_Alerts(SQLModel, table=True):
    __tablename__ = "health_alerts"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    child_id: int = Field(foreign_key="child.id")
    alert_type: str
    title: str
    description: str = Field(sa_column=Column(TEXT))
    severity: str = Field(regex="^(error|warning|info)$")  # Validates the severity values
    suggestions: Dict[str, Any] = Field(sa_column=Column(JSON))
    analysis_date: datetime = Field(sa_column=Column(DateTime(timezone=False), nullable=False))  # Date only
    data_period_start: datetime = Field(sa_column=Column(DateTime(timezone=False), nullable=False))
    data_period_end: datetime = Field(sa_column=Column(DateTime(timezone=False), nullable=False))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False), default_factory=datetime.now)
    is_read: bool = Field(default=False)
    read_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True)), default=None)
    is_deleted: bool = Field(default=False)
    deleted_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True)), default=None)