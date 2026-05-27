import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Erro: GEMINI_API_KEY não encontrada.")
    exit(1)

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = model.generate_content("Diga 'Olá Mundo' em uma frase curta.")
    print(f"Resposta da IA: {response.text.strip()}")
except Exception as e:
    print(f"Erro ao conectar com Gemini: {e}")
