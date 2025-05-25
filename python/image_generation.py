from python.recipes_generation import Recipe, RecipeWithImage
from python.prompts import recipe_image_generation_prompt
from openai import OpenAI
import base64
import uuid
import os
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY"),
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GENERATED_IMAGES_DIR = os.path.join(BASE_DIR, "generated_images")


def ensure_generated_images_dir():
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)


def encode_image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")


def generate_image(
    image_prompt: str,
    openai_client: OpenAI,
) -> str:
    
    ensure_generated_images_dir()
    image_path = ""

    result = openai_client.images.generate(
        model="gpt-image-1",
        prompt=image_prompt,
        size="1024x1024",
        quality="low"
    )

    image_base64 = result.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    image_id = str(uuid.uuid4())
    image_path = os.path.join(GENERATED_IMAGES_DIR, f"{image_id}.png")

    with open(image_path, "wb") as f:
        f.write(image_bytes)

    return image_path


def generate_image_for_recipe(recipe):
    ingredients_str = ', '.join(recipe.ingredients)
    prompt = recipe_image_generation_prompt.format(
        recipe_description=f"{recipe.name}. {recipe.short_description} Ingredients: {ingredients_str}"
    )
    image_path = generate_image(prompt, client)
    return RecipeWithImage(**recipe.model_dump(), image_path=image_path)


def generate_recipe_images(
    recipes: list[Recipe],
) -> list[RecipeWithImage]:

    with ThreadPoolExecutor() as executor:
        results = list(executor.map(generate_image_for_recipe, recipes))

    return results