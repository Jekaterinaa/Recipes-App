from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from typing import Any
import os
from langchain.chat_models import init_chat_model
from python.ingredients_detection import detect_ingredients, save_uploaded_image
from python.recipes_generation import generate_recipes, RecipeRequest, clean_ingredients, Ingredients
from python.image_generation import generate_recipe_images, encode_image_to_base64

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

# Mount static files for the frontend
static_dir = os.path.join(os.path.dirname(__file__), "../static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# API routes
@app.post("/api/user-image")
def user_image_endpoint(
    img: UploadFile = File(...)
) -> dict:
    image_path = save_uploaded_image(img)
    result = detect_ingredients(image_path, llm)
    return {"ingredients": result}


@app.post("/api/clean-ingredients")
def clean_ingredients_endpoint(
    ingredients: Ingredients = Body(...)
) -> dict:
    cleaned = clean_ingredients(ingredients, llm)
    return {"ingredients": cleaned}


@app.post("/api/recipes-request")
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

# Serve the frontend
@app.get("/")
async def serve_frontend():
    static_dir = os.path.join(os.path.dirname(__file__), "../static")
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend not built"}

# Catch-all route for frontend routing
@app.get("/{path:path}")
async def serve_frontend_routes(path: str):
    static_dir = os.path.join(os.path.dirname(__file__), "../static")
    file_path = os.path.join(static_dir, path)
    
    # If it's a file that exists, serve it
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise, serve index.html for client-side routing
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"message": "File not found"}
