import httpx
import json
import os
from app.core.config import settings

PROMPT_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "system_prompt.txt")

def get_system_prompt() -> str:
    """Reads the system prompt from the external text file."""
    try:
        if os.path.exists(PROMPT_FILE_PATH):
            with open(PROMPT_FILE_PATH, "r", encoding="utf-8") as f:
                return f.read()
        return "You are a helpful AI assistant."
    except Exception as e:
        print(f"Error loading system prompt: {e}")
        return "You are a helpful AI assistant."

async def get_chat_response(messages: list, system_prompt_content: str = "You are a helpful AI assistant."):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": settings.FRONTEND_URL,
        "X-Title": settings.PROJECT_NAME,
        "Content-Type": "application/json"
    }
    
    system_prompt = {
        "role": "system",
        "content": system_prompt_content
    }
    
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [system_prompt] + messages
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"OpenRouter Error: {e}")
            return "I'm having trouble connecting to my brain. Please try again later."

async def extract_lead_info(messages: list):
    """
    Speculative: Uses the LLM to check if lead info was provided in the last message.
    In a production app, you might use tool calling / function calling.
    """
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = (
        "Analyze the following conversation and extract lead information in JSON format:\n"
        '{\n'
        '  "name": string,\n'
        '  "email": string,\n'
        '  "phone": string,\n'
        '  "company": string,\n'
        '  "intent": string, (e.g., website_development, information_request, purchase, support)\n'
        '  "business_type": string, (e.g., restaurant, law_firm, ecommerce, personal)\n'
        '  "requested_service": string (e.g., custom_chatbot, crm_integration, web_design)\n'
        '}\n'
        "If a field is missing, use null. Only return the JSON object.\n\n"
        f"{json.dumps(messages)}"
    )
    
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=20.0)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            # Basic JSON extraction
            start = content.find('{')
            end = content.rfind('}') + 1
            return json.loads(content[start:end])
        except Exception as e:
            print(f"Extraction Error: {e}")
            return None
