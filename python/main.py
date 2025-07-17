from fastapi import FastAPI, UploadFile, File, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
from typing import Any, List, Union, Dict, Literal
import os
from langchain.chat_models import init_chat_model
from python.ingredients_detection import detect_ingredients, save_uploaded_image
from python.recipes_generation import generate_recipes, RecipeRequest, clean_ingredients, Ingredients
from python.image_generation import generate_recipe_images, encode_image_to_base64

load_dotenv()

user_state: dict[str, Any] = {}

app = FastAPI(redirect_slashes=False)

llm = init_chat_model(
    #"openai:gpt-4.1"
    model=os.getenv("LLM_MODEL")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "../static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.post("/api/user-image")
async def user_image_endpoint(
    files: List[UploadFile] = File([], description="Multiple images to detect ingredients from", alias="img")
) -> dict:
    if not files:
        return {"ingredients": [], "imagePaths": []}
        
    image_paths = []
    for file in files:
        image_path = save_uploaded_image(file)
        image_paths.append(image_path)
    
    result = detect_ingredients(image_paths, llm)
    if not result or not result.ingredients:
        return {"ingredients": [], "imagePaths": image_paths}
    return {"ingredients": result.ingredients, "imagePaths": image_paths}

@app.post("/api/cleanup-image")
async def cleanup_image_endpoint(request: Union[
    Dict[Literal["path"], str],
    Dict[Literal["paths"], List[str]]
]) -> dict:
    try:
        if "path" in request:
            paths = [request["path"]]
        else:
            paths = request["paths"]
            
        for path in paths:
            if os.path.exists(path):
                os.remove(path)
                
        return {"success": True}
    except Exception as e:
        print(f"Error cleaning up images: {e}")
        return {"success": False}

@app.post("/api/cleanup-session")
async def cleanup_session_endpoint() -> dict:
    try:
        for path in ["images", "generated_images"]:
            if os.path.exists(path):
                for file in os.listdir(path):
                    if not file.startswith('.'):
                        file_path = os.path.join(path, file)
                        if os.path.isfile(file_path):
                            os.remove(file_path)
                            
        return {"success": True}
    except Exception as e:
        print(f"Error cleaning up session: {e}")
        return {"success": False}


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


@app.get("/")
async def serve_frontend():
    static_dir = os.path.join(os.path.dirname(__file__), "../static")
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend not built"}


@app.get("/{path:path}")
async def serve_frontend_routes(path: str):
    static_dir = os.path.join(os.path.dirname(__file__), "../static")
    file_path = os.path.join(static_dir, path)

    if os.path.isfile(file_path):
        return FileResponse(file_path)

    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"message": "File not found"}
