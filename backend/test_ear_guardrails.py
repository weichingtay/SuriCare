#!/usr/bin/env python3
"""
Quick test script to verify guardrails behavior
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.chatbot_guardrails import ChatbotGuardrails

def test_ear_infection_response():
    guardrails = ChatbotGuardrails()
    
    # Test response that mentions ear infection
    test_response = """Based on the patterns I observe - ear touching, reduced appetite over 3 days, and sleep disturbances - this may suggest an ear infection. Please discuss these observations with your child's healthcare provider for proper evaluation."""
    
    is_valid, violations = guardrails.validate_response(test_response)
    
    print(f"Test Response: {test_response}")
    print(f"Is Valid: {is_valid}")
    print(f"Violations: {len(violations)}")
    
    for violation in violations:
        print(f"  - {violation.rule_id}: {violation.description} (Severity: {violation.severity})")
    
    if violations:
        fixed_response = guardrails.fix_response(test_response, violations)
        print(f"Fixed Response: {fixed_response}")

if __name__ == "__main__":
    test_ear_infection_response()