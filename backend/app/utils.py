from datetime import datetime, timezone
from typing import Union
import re

def calculate_age_from_birth_date(birth_date: datetime) -> str:
    """
    Calculate age string from birth date
    Returns format like "6 months" or "2 years 3 months"
    """
    if not birth_date:
        return "0 months"
    
    # Ensure birth_date is timezone-aware
    if birth_date.tzinfo is None:
        birth_date = birth_date.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    
    # Calculate total months
    months_diff = (now.year - birth_date.year) * 12 + (now.month - birth_date.month)
    
    # Adjust if the day hasn't been reached yet this month
    if now.day < birth_date.day:
        months_diff -= 1
    
    if months_diff < 0:
        return "0 months"
    
    years = months_diff // 12
    months = months_diff % 12
    
    if years == 0:
        return f"{months} month{'s' if months != 1 else ''}"
    elif months == 0:
        return f"{years} year{'s' if years != 1 else ''}"
    else:
        return f"{years} year{'s' if years != 1 else ''} {months} month{'s' if months != 1 else ''}"

def calculate_age_in_months(age_input: Union[str, datetime]) -> int:
    """
    Calculate age in months from either:
    - A birth_date (datetime)
    - An age string like "6 months" or "2 years"
    """
    if isinstance(age_input, datetime):
        # Calculate from birth date
        if age_input.tzinfo is None:
            age_input = age_input.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        months_diff = (now.year - age_input.year) * 12 + (now.month - age_input.month)
        
        if now.day < age_input.day:
            months_diff -= 1
            
        return max(0, months_diff)
    
    elif isinstance(age_input, str):
        # Parse age string
        months_match = re.search(r'(\d+)\s*months?', age_input)
        years_match = re.search(r'(\d+)\s*years?', age_input)
        
        total_months = 0
        
        if years_match:
            total_months += int(years_match.group(1)) * 12
        
        if months_match:
            total_months += int(months_match.group(1))
        
        return total_months
    
    return 0

def get_age_string_and_months(birth_date: datetime) -> tuple[str, int]:
    """
    Get both age string and age in months from birth date
    Returns: (age_string, age_months)
    """
    age_string = calculate_age_from_birth_date(birth_date)
    age_months = calculate_age_in_months(birth_date)
    return age_string, age_months