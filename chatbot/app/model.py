import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.0-flash"

llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    api_key=GEMINI_API_KEY
)

def generate_reply(prompt: str) -> str:
    """Return the Gemini model's reply for a given prompt."""
    if not prompt:
        return "error"
    response = llm.invoke(prompt)
    # AIMessage has a `.content` attribute with the text.
    return response.content if hasattr(response, "content") else str(response)


