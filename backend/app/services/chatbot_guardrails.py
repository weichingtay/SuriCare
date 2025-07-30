"""
Chatbot Guardrails Service for SuriCare AI Assistant

This service implements strict medical safety guardrails for the AI chatbot to ensure
it operates within safe boundaries for child health monitoring.
"""

import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class GuardrailViolation:
    """Represents a guardrail violation found in a response"""
    rule_id: str
    severity: str  # 'high', 'medium', 'low'
    description: str
    suggested_replacement: Optional[str] = None


class ChatbotGuardrails:
    """
    Implements medical safety guardrails for the SuriCare AI chatbot.
    
    Ensures responses comply with safety requirements:
    - No medical diagnosis or triage
    - No medical device claims
    - Proper disclaimers and limitations
    - Emergency protocol compliance
    """
    
    def __init__(self):
        self.system_prompt = self._create_system_prompt()
        self.prohibited_phrases = self._init_prohibited_phrases()
        self.diagnostic_terms = self._init_diagnostic_terms()
        self.emergency_keywords = self._init_emergency_keywords()
        self.required_disclaimers = self._init_required_disclaimers()
    
    def _create_system_prompt(self) -> str:
        """Create the system prompt that defines the AI's role and limitations"""
        return """You are SuriAI, an AI assistant in a child tracking app that monitors meals, stool, sleep, symptoms, and growth patterns. You are not a doctor, not a medical device, and do not replace professional healthcare advice.

You must follow these guidelines:

Role and Capabilities:
1. You are an AI assistant that can identify patterns and suggest potential causes based on tracked data.
2. You can observe concerning trends and inform parents about patterns that may indicate health issues.
3. You must always clarify that you are an AI and cannot replace professional medical consultation.

Pattern Recognition:
4. You can identify and describe concerning patterns such as:
   • "The combination of ear touching, reduced appetite, and sleep disturbances over 3 days may suggest an ear infection."
   • "Head touching with temperature elevation could indicate discomfort or pain."
   • "Declining appetite with behavioral changes may signal illness."
5. You can mention common childhood conditions when patterns suggest them (e.g., ear infections, teething, growth spurts).
6. You can use descriptive medical terms when they help explain patterns (e.g., elevated temperature, reduced consumption, restless sleep).

Data Presentation Format:
7. Present child tracking data in clear, structured point form with highlighted main categories:
   • **Sleep Patterns:** List sleep duration, quality, and any disturbances
   • **Eating/Meals:** Show appetite levels, consumption percentages, and feeding patterns
   • **Symptoms:** Detail any observed symptoms, behaviors, or physical signs
   • **Stool/Bowel:** Report consistency, color, frequency, and any concerns
8. Use bullet points and clear formatting to make information easy to scan and understand.
9. Focus on data trends and pattern recognition over time.
10. You may provide educational information about common childhood conditions when relevant to observed patterns.

Example Response Format:
Based on the data from the past 3 days, here's what I observe:

**Sleep Patterns:**
• Day 1: 9.5 hours, slightly restless
• Day 2: 8.5 hours, more restless sleep
• Day 3: 8 hours, very restless sleep

**Eating/Meals:**
• Day 1: 75-100% consumption, good appetite
• Day 2: 50-75% consumption, reduced appetite  
• Day 3: 25-75% consumption, poor appetite

**Symptoms:**
• Day 1: Occasional head touching
• Day 2: Frequent ear touching, low temperature (37.2°C)
• Day 3: Fussiness, higher temperature (37.5°C)

These patterns may suggest an ear infection developing over time.

Prohibited Actions:
11. Do not provide definitive diagnoses - use phrases like "may suggest", "could indicate", "patterns consistent with".
12. Do not give specific medical treatment advice or medication recommendations.
13. Do not dismiss concerns or say symptoms are "nothing to worry about".

Emergency Protocol:
14. If users describe urgent symptoms (seizures, breathing issues, severe pain, etc.), respond with:
    "These symptoms require immediate medical attention. Please seek emergency care right away."

Required Disclaimers:
Always end responses with appropriate healthcare consultation reminders:
• "Please discuss these observations with your child's healthcare provider for proper evaluation."
• "I recommend consulting your pediatrician about these patterns for professional assessment."
• "These observations should be reviewed by a healthcare professional for proper diagnosis and treatment."
"""
    
    def _init_prohibited_phrases(self) -> List[Dict[str, str]]:
        """Initialize phrases that should not appear in responses"""
        return [
            # Strong reassurance phrases (still prohibited)
            {"phrase": r"nothing to worry about", "category": "reassurance", "severity": "high"},
            {"phrase": r"don't worry", "category": "reassurance", "severity": "high"},
            {"phrase": r"everything is fine", "category": "reassurance", "severity": "high"},
            {"phrase": r"perfectly normal", "category": "reassurance", "severity": "high"},
            
            # Definitive diagnostic phrases (but allow suggestions)
            {"phrase": r"your child definitely has|your child has been diagnosed with", "category": "diagnosis", "severity": "high"},
            {"phrase": r"this is definitely|that is certainly", "category": "diagnosis", "severity": "high"},
            
            # Specific medical advice phrases (treatment/medication)
            {"phrase": r"you should give|you need to give", "category": "medical_advice", "severity": "high"},
            {"phrase": r"take this medication|give this medicine", "category": "medical_advice", "severity": "high"},
            {"phrase": r"treatment|cure|specific medication", "category": "medical_advice", "severity": "high"},
        ]
    
    def _init_diagnostic_terms(self) -> List[str]:
        """Initialize medical terms that imply definitive diagnosis (now more permissive)"""
        return [
            # Only block serious diagnostic terms that require professional diagnosis
            "pneumonia", "bronchitis", "gastroenteritis", "dehydration", "anemia", 
            "asthma", "meningitis", "sepsis", "food poisoning"
            # Allow common terms like: infection, fever, cold, flu, ear infection, etc.
        ]
    
    def _init_emergency_keywords(self) -> List[str]:
        """Initialize keywords that indicate emergency situations"""
        return [
            "seizure", "convulsion", "breathing", "breathe", "choking", "blue",
            "unconscious", "unresponsive", "blood", "bleeding", "vomiting blood",
            "severe pain", "broken bone", "head injury", "poisoning", "burn",
            "allergic reaction", "swelling", "rash spreading", "high fever",
            "difficulty breathing", "chest pain", "severe dehydration"
        ]
    
    def _init_required_disclaimers(self) -> List[str]:
        """Initialize required disclaimer endings"""
        return [
            "Please discuss these observations with your child's healthcare provider for proper evaluation.",
            "I recommend consulting your pediatrician about these patterns for professional assessment.",
            "These observations should be reviewed by a healthcare professional for proper diagnosis and treatment.",
            "Consider discussing these patterns with your child's doctor for confirmation and guidance.",
            "Please consult with your healthcare provider to confirm these observations and get appropriate care."
        ]
    
    def validate_response(self, response: str, query: str = "") -> Tuple[bool, List[GuardrailViolation]]:
        """
        Validate a response against all guardrails.
        
        Args:
            response: The AI response to validate
            query: The original user query (for context)
            
        Returns:
            Tuple of (is_valid, list_of_violations)
        """
        violations = []
        
        # Check for prohibited phrases
        violations.extend(self._check_prohibited_phrases(response))
        
        # Check for diagnostic terms
        violations.extend(self._check_diagnostic_terms(response))
        
        # Check for emergency situations
        violations.extend(self._check_emergency_response(response, query))
        
        # Check for required disclaimers
        violations.extend(self._check_disclaimers(response))
        
        # Check AI identity declaration
        violations.extend(self._check_ai_identity(response))
        
        # Determine if response is valid (no high-severity violations)
        high_severity_violations = [v for v in violations if v.severity == "high"]
        is_valid = len(high_severity_violations) == 0
        
        return is_valid, violations
    
    def _check_prohibited_phrases(self, response: str) -> List[GuardrailViolation]:
        """Check for prohibited phrases in the response"""
        violations = []
        response_lower = response.lower()
        
        for phrase_data in self.prohibited_phrases:
            pattern = phrase_data["phrase"]
            if re.search(pattern, response_lower, re.IGNORECASE):
                violations.append(GuardrailViolation(
                    rule_id=f"prohibited_{phrase_data['category']}",
                    severity=phrase_data["severity"],
                    description=f"Contains prohibited {phrase_data['category']} phrase: {pattern}",
                    suggested_replacement="Remove reassuring language and focus on data observation"
                ))
        
        return violations
    
    def _check_diagnostic_terms(self, response: str) -> List[GuardrailViolation]:
        """Check for diagnostic medical terms"""
        violations = []
        response_lower = response.lower()
        
        for term in self.diagnostic_terms:
            if term.lower() in response_lower:
                violations.append(GuardrailViolation(
                    rule_id="diagnostic_term",
                    severity="high",
                    description=f"Contains diagnostic term: {term}",
                    suggested_replacement=f"Replace '{term}' with descriptive observation"
                ))
        
        return violations
    
    def _check_emergency_response(self, response: str, query: str) -> List[GuardrailViolation]:
        """Check if emergency keywords require emergency protocol response"""
        violations = []
        query_lower = query.lower()
        response_lower = response.lower()
        
        # Check if query contains emergency keywords
        emergency_detected = any(keyword in query_lower for keyword in self.emergency_keywords)
        
        if emergency_detected:
            # Response should contain emergency protocol
            emergency_response = "I'm an AI assistant and cannot assess medical emergencies. Please seek immediate care from a healthcare provider."
            if emergency_response.lower() not in response_lower:
                violations.append(GuardrailViolation(
                    rule_id="emergency_protocol",
                    severity="high",
                    description="Emergency keywords detected but proper emergency protocol not followed",
                    suggested_replacement=emergency_response
                ))
        
        return violations
    
    def _check_disclaimers(self, response: str) -> List[GuardrailViolation]:
        """Check if response contains required disclaimers"""
        violations = []
        response_lower = response.lower()
        
        # Check if any disclaimer is present
        has_disclaimer = any(
            disclaimer.lower() in response_lower 
            for disclaimer in self.required_disclaimers
        )
        
        # Also check for variations
        disclaimer_keywords = [
            "healthcare provider", "doctor", "pediatrician", "medical professional",
            "consult", "speak with", "discuss with", "professional assessment", 
            "proper evaluation", "confirm", "medical attention"
        ]
        
        has_disclaimer_variation = any(
            keyword in response_lower 
            for keyword in disclaimer_keywords
        )
        
        if not (has_disclaimer or has_disclaimer_variation):
            violations.append(GuardrailViolation(
                rule_id="missing_disclaimer",
                severity="medium",
                description="Response lacks required healthcare disclaimer",
                suggested_replacement="Add healthcare provider consultation disclaimer"
            ))
        
        return violations
    
    def _check_ai_identity(self, response: str) -> List[GuardrailViolation]:
        """Check if AI properly identifies itself when giving advice"""
        violations = []
        response_lower = response.lower()
        
        # Check for AI identity markers
        ai_identity_markers = [
            "ai assistant", "ai chatbot", "artificial intelligence",
            "i'm an ai", "as an ai", "i am an ai"
        ]
        
        # If response is giving any kind of advice or interpretation,
        # it should identify as AI (for longer responses)
        if len(response) > 200:  # Only for substantial responses
            has_ai_identity = any(
                marker in response_lower 
                for marker in ai_identity_markers
            )
            
            if not has_ai_identity:
                violations.append(GuardrailViolation(
                    rule_id="ai_identity",
                    severity="low",
                    description="Long response should include AI identity declaration",
                    suggested_replacement="Include 'I'm an AI assistant' in the response"
                ))
        
        return violations
    
    def fix_response(self, response: str, violations: List[GuardrailViolation]) -> str:
        """
        Attempt to fix a response based on detected violations.
        
        Args:
            response: The original response
            violations: List of violations to fix
            
        Returns:
            Fixed response string
        """
        fixed_response = response
        
        # Handle high-severity violations first
        high_severity = [v for v in violations if v.severity == "high"]
        
        if high_severity:
            # For high-severity violations, replace with safe response
            return self._generate_safe_fallback_response()
        
        # Handle medium and low severity violations
        for violation in violations:
            if violation.rule_id == "missing_disclaimer":
                # Add disclaimer at the end
                if not fixed_response.endswith('.'):
                    fixed_response += '.'
                fixed_response += f"\n\n{self.required_disclaimers[0]}"
            
            elif violation.rule_id == "ai_identity":
                # Add AI identity at the beginning
                fixed_response = "As an AI assistant, " + fixed_response.lower()[0] + fixed_response[1:]
        
        return fixed_response
    
    def _generate_safe_fallback_response(self) -> str:
        """Generate a safe fallback response for high-severity violations"""
        return (
            "I'm an AI assistant and cannot provide medical assessments or diagnoses. "
            "I can help you track and observe patterns in your child's data, but any "
            "health concerns should be discussed with a healthcare provider. "
            "If you're unsure or concerned, it's always best to speak with a healthcare provider."
        )
    
    def apply_guardrails(self, response: str, query: str = "") -> Dict[str, any]:
        """
        Apply all guardrails to a response and return results.
        
        Args:
            response: The AI response to check
            query: The original user query
            
        Returns:
            Dictionary with validation results and potentially fixed response
        """
        is_valid, violations = self.validate_response(response, query)
        
        result = {
            "original_response": response,
            "is_valid": is_valid,
            "violations": [
                {
                    "rule_id": v.rule_id,
                    "severity": v.severity,
                    "description": v.description,
                    "suggested_replacement": v.suggested_replacement
                }
                for v in violations
            ],
            "violation_count": len(violations),
            "high_severity_violations": len([v for v in violations if v.severity == "high"])
        }
        
        # If there are violations, attempt to fix
        if violations:
            result["fixed_response"] = self.fix_response(response, violations)
            result["response_modified"] = result["fixed_response"] != response
        else:
            result["fixed_response"] = response
            result["response_modified"] = False
        
        return result
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for the AI model"""
        return self.system_prompt