from fastapi import UploadFile
import os
from dotenv import load_dotenv
from PIL import Image
import base64
import io
import uuid
from python.prompts import ingredients_detection_system_prompt, ingredients_detection_user_prompt
from pydantic import BaseModel, Field

load_dotenv()

class Ingredients(BaseModel):
    ingredients: list[str] = Field(description="List of ingredients detected in the image")

def save_uploaded_image(img: UploadFile) -> str:
    image_bytes = img.file.read()
    image = Image.open(io.BytesIO(image_bytes))
    unique_id = str(uuid.uuid4())
    images_dir = os.path.join(os.path.dirname(__file__), "../images")
    os.makedirs(images_dir, exist_ok=True)
    image_path = os.path.abspath(os.path.join(images_dir, f"{unique_id}.png"))
    image.save(image_path)
    return image_path

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def detect_ingredients(
    img_path: str,
    llm
) -> Ingredients:

    image = encode_image(img_path)

    system_message = {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": ingredients_detection_system_prompt,
            },
        ],
    }
    user_message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": ingredients_detection_user_prompt,
            },
            {
                "type": "image",
                "source_type": "base64",
                "data": image,
                "mime_type": "image/jpeg",
            },
        ],
    }
    messages = [
        system_message,
        user_message
    ]
    response: Ingredients = llm.with_structured_output(schema=Ingredients).invoke(messages)

    return response.ingredients
