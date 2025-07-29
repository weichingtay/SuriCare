#!/usr/bin/env python3
"""
Test script for the chatbot guardrails system.
This script tests various scenarios to ensure the guardrails are working correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.chatbot_guardrails import ChatbotGuardrails


def test_guardrails():
    """Test the chatbot guardrails with various test cases"""
    guardrails = ChatbotGuardrails()
    
    test_cases = [
        {
            "name": "Reassurance phrases",
            "response": "Your child is fine and everything is normal. Don't worry about it.",
            "query": "Is my child healthy?",
            "should_fail": True
        },
        {
            "name": "Diagnostic terms",
            "response": "Your child has a fever and might have an infection.",
            "query": "My child has a high temperature",
            "should_fail": True
        },
        {
            "name": "Emergency response missing",
            "response": "High temperatures can be concerning. You should monitor it.",
            "query": "My child is having seizures",
            "should_fail": True
        },
        {
            "name": "Safe response with disclaimer",
            "response": "I observe that your child's temperature readings have been elevated for 2 days based on the data. If you're unsure or concerned, it's always best to speak with a healthcare provider.",
            "query": "My child's temperature has been high",
            "should_fail": False
        },
        {
            "name": "Proper emergency response",
            "response": "I'm an AI assistant and cannot assess medical emergencies. Please seek immediate care from a healthcare provider.",
            "query": "My child is having breathing difficulties",
            "should_fail": False
        },
        {
            "name": "Data observation without diagnosis",
            "response": "Based on the sleep data, I notice your child's sleep duration has been averaging 6 hours over the past week, which is below typical ranges for their age. Consider discussing this with your pediatrician for personalized guidance.",
            "query": "Is my child getting enough sleep?",
            "should_fail": False
        }
    ]
    
    print("Testing Chatbot Guardrails")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['name']}")
        print(f"Query: {test_case['query']}")
        print(f"Response: {test_case['response']}")
        
        result = guardrails.apply_guardrails(test_case['response'], test_case['query'])
        
        print(f"Valid: {result['is_valid']}")
        print(f"Violations: {result['violation_count']}")
        print(f"High severity: {result['high_severity_violations']}")
        
        if result['violations']:
            print("Violation details:")
            for violation in result['violations']:
                print(f"  - {violation['rule_id']} ({violation['severity']}): {violation['description']}")
        
        if result['response_modified']:
            print(f"Fixed response: {result['fixed_response']}")
        
        # Check if test result matches expectation
        test_passed = (not result['is_valid']) == test_case['should_fail']
        print(f"Test Result: {'PASS' if test_passed else 'FAIL'}")
        
        print("-" * 50)
    
    print("\nTesting System Prompt:")
    print("=" * 50)
    system_prompt = guardrails.get_system_prompt()
    print(f"System prompt length: {len(system_prompt)} characters")
    print("System prompt preview:")
    print(system_prompt[:200] + "..." if len(system_prompt) > 200 else system_prompt)


if __name__ == "__main__":
    test_guardrails()