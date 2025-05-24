from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Any
from langchain.chat_models import init_chat_model
from ingredients_detection import detect_ingredients, save_uploaded_image
from recipes_generation import generate_recipes, RecipeRequest, clean_ingredients, Ingredients
from image_generation import generate_recipe_images, encode_image_to_base64
from fastapi.encoders import jsonable_encoder
import base64

load_dotenv()

user_state: dict[str, Any] = {}

app = FastAPI()

llm = init_chat_model(
    "openai:gpt-4.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

@app.post("/user-image")
def user_image_endpoint(
    img: UploadFile = File(...)
) -> dict:
    image_path = save_uploaded_image(img)
    result = detect_ingredients(image_path, llm)
    return {"ingredients": result}

@app.post("/recipes-request")
def recipes_request_endpoint(
    request: RecipeRequest
) -> dict:
    recipes = generate_recipes(request, llm)
    recipes_with_images = generate_recipe_images(recipes)
    
    minimal_recipes = []
    for r in recipes_with_images:
        image_base64 = ""
        if hasattr(r, "image_path") and r.image_path:
            image_base64 = encode_image_to_base64(r.image_path)
        minimal_recipes.append({
            "name": r.name,
            "image_base64": image_base64,
            "ingredients": r.ingredients,
            "short_description": r.short_description,
            "full_recipe": r.full_recipe,
            "cooking_time": r.cooking_time,
        })
    return {"recipes": minimal_recipes}

@app.post("/clean-ingredients")
def clean_ingredients_endpoint(
    ingredients: Ingredients = Body(...)
) -> dict:
    cleaned = clean_ingredients(ingredients, llm)
    return {"ingredients": cleaned}

@app.post("/step_1")
def step_1():
    # inputs: free text and an image uploaded by the user + session id
    # process the inputs with AI
    # outputs: five images with descriptions
    # return the images and descriptions
    return {"message": "This is step 1 of the FastAPI backend!"}

@app.post("/step_2")
def step_2():
    # inputs: index from 0 to 4 of the selected image + session id
    # outputs: a full generated recipe
    return {"message": "This is step 2 of the FastAPI backend!"}

@app.post("/step_3")
def step_3():
    # inputs: user input (what needs to be changed in the recipe) + session id
    # outputs: a revised recipe and new image
    return {"message": "This is step 3 of the FastAPI backend!"}

print("Starting FastAPI server...")