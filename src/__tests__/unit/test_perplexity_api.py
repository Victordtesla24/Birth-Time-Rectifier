import requests
import json

def test_perplexity_api():
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": "Bearer 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"
    }
    
    payload = {
        "model": "sonar-reasoning-pro",
        "messages": [
            {
                "role": "system",
                "content": "You are a senior software architect with 20+ years of experience in debugging and optimization. Your responses are precise, practical, and focused on best practices. You analyze issues systematically and provide proven solutions."
            },
            {
                "role": "user",
                "content": "Analyze this error:\nTypeError: Cannot read property 'value' of undefined\n\nProvide:\n1. Root cause\n2. Immediate solution\n3. Best practice recommendation"
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print("API Test Response:", json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"API Test Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_perplexity_api()
