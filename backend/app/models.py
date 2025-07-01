from sqlmodel import SQLModel, Field, Column, DateTime, TEXT
from uuid import UUID, uuid4
from datetime import datetime


class Primary_Care_Giver(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    auth_user_id: str | None = Field(default=None, unique=True)  # Supabase Auth UUID
    username: str
    email: str
    contact_number: str
    password: str | None = Field(default=None)  # Optional now since we use Supabase Auth
    relationship: str


class Child(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    birth_date: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    gender: str

    carer_id: int = Field(default=None, foreign_key="primary_care_giver.id")


class Growth(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    weight: float
    height: float
    head_circumference: float
    note: str | None

    child_id: int = Field(default=None, foreign_key="child.id")


class Growth_Benchmark(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    age_month: int
    weight: float
    height: float
    head_circumference: float
    gender: str


class Sleep_Time(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    start_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    end_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    note: str | None

    child_id: int = Field(default=None, foreign_key="child.id")


class Meal(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    consumption_level: float
    others: str
    note: str | None

    meal_time_category: int = Field(default=None, foreign_key="meal_time_category.id")
    meal_category: int = Field(default=None, foreign_key="meal_category.id")
    child_id: int = Field(default=None, foreign_key="child.id")


class Meal_Time_Category(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    time_category: str


class Meal_Category(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category: str


class Poop(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    note: str

    color: int = Field(default=None, foreign_key="poop_color.id")
    consistency: int = Field(default=None, foreign_key="poop_consistency.id")
    child_id: int = Field(default=None, foreign_key="child.id")


class Poop_Color(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category: str


class Poop_Consistency(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category: str


class Symptom(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    symptom: str
    photo_url: str
    note: str | None

    child_id: int = Field(default=None, foreign_key="child.id")

class ChatbotChat(SQLModel, table=True):
    __tablename__ = "chatbot_chats"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str | None = None
    owner_id: int = Field(foreign_key="primary_care_giver.id")
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))


class ChatChild(SQLModel, table=True):
    __tablename__ = "chat_children"
    chat_id: UUID = Field(foreign_key="chatbot_chats.id", primary_key=True)
    child_id: int = Field(foreign_key="child.id", primary_key=True)


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    chat_id: UUID = Field(foreign_key="chatbot_chats.id")
    message: str = Field(sa_column=Column(TEXT))
    sender: str
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))