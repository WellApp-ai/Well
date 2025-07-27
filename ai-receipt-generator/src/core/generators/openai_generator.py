from openai import OpenAI
from .base import BaseGenerator
import os
from dotenv import load_dotenv

load_dotenv()

class OpenAIGenerator(BaseGenerator):
    def __init__(self, api_key: str = None, model: str = "gpt-3.5-turbo"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self.client = OpenAI(api_key=self.api_key)

    def generate(self, prompt: str) -> str:
        try:
            # === Image Generation (dall-e models) ===
            if "dall-e" in self.model.lower() or "gpt-image" in self.model.lower():
                response = self.client.images.generate(
                    model=self.model,
                    prompt=prompt,
                    n=1,
                    size="1024x1024",
                    quality="high"
                )
                return response.data[0].b64_json  # base64 image string

            # === Text Generation (structured receipt JSON) ===
            else:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a receipt generation assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=600
                )
                return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"❌ OpenAI API error: {e}")
            return ""
