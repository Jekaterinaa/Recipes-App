from fastapi import UploadFile
import os
from dotenv import load_dotenv
from PIL import Image
import base64
import io
import uuid
from python.prompts import ingredients_detection_system_prompt, ingredients_detection_user_prompt
from pydantic import BaseModel, Field, field_validator
from concurrent.futures import ThreadPoolExecutor
from typing import List
from itertools import chain

load_dotenv()

class Ingredients(BaseModel):
    ingredients: list[str] = Field(description="List of ingredients detected in the image or manually entered by the user")

    @field_validator("ingredients", mode="before")
    def validate_ingredients(cls, v):

        if isinstance(v, str):
            v = [v]
        elif not isinstance(v, list):
            raise TypeError("ingredients must be a string or a list of strings")

        return [str(item) for item in v]

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

def detect_ingredients_single(
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

def detect_ingredients(
    img_paths: List[str],
    llm
) -> Ingredients:
    
    with ThreadPoolExecutor() as executor:
        all_ingredients_lists = list(executor.map(
            lambda path: detect_ingredients_single(path, llm),
            img_paths
        ))
    
    unique_ingredients = list(set(chain.from_iterable(all_ingredients_lists)))

    return Ingredients(ingredients=unique_ingredients)
