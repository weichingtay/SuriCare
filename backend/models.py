from sqlmodel import SQLModel, Field, Column, DateTime
import sqlmodel
from datetime import datetime


class PrimaryCareGiver(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str
    email: str
    contact_number: str
    password: str
    relationship: str


class Child(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    birth_date: datetime
    gender: str

    carer_id: int = Field(default=None, foreign_key="primarycaregiver.id")


class Growth(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime
    weight: float
    height: float
    head_circumference: float
    note: str | None

    child_id: int | None = Field(default=None, foreign_key="child.id")


class GrowthBenchmark(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    age_month: int
    weight: float
    height: float
    head_circumference: float
    gender: str


class SleepTime(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    start_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    end_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    note: str | None

    child_id: int = Field(default=None, foreign_key="child.id")


class Meal(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime
    consumption_level: float
    others: str
    note: str | None

    meal_time_category: int = Field(default=None, foreign_key="mealtimecategory.id")
    meal_category: int = Field(default=None, foreign_key="mealcategory.id")
    child_id: int = Field(default=None, foreign_key="child.id")


class MealTimeCategory(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    time_category: str


class MealCategory(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category: str


class Poop(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime
    note: str

    color: int = Field(default=None, foreign_key="poopcolor.id")
    consistency: int = Field(default=None, foreign_key="poopconsistency.id")
    child_id: int | None = Field(default=None, foreign_key="child.id")


class PoopColor(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category: str


class PoopConsistency(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    category: str


class Symptom(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    check_in: datetime
    symptom: str
    photo_url: str
    note: str | None

    child_id: int = Field(default=None, foreign_key="child.id")
