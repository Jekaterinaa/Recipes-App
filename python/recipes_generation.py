from pydantic import BaseModel, Field
from python.prompts import recipes_generation_system_prompt, recipes_generation_user_prompt, ingredients_checks_system_prompt, ingredients_checks_user_prompt
from python.ingredients_detection import Ingredients


class Recipe(BaseModel):
    name: str = Field(description="Name of the recipe")
    ingredients: list[str] = Field(description="List of ingredients for the recipe")
    short_description: str = Field(description="Short description of the recipe")
    full_recipe: str = Field(description="Full recipe instructions")
    cooking_time: str = Field(description="Cooking time for the recipe")

class RecipeWithImage(Recipe):
    image_path: str = Field(description="Path to the generated image of the recipe")

class RecipeResponse(BaseModel):
    recipes: list[Recipe] = Field(description="List of recipes returned by the assistant")

class RecipeRequest(BaseModel):
    ingredients: list[str] = Field(description="List of ingredients provided by the user")
    num_recipes: int = Field(description="Number of recipes to generate")
    allergies: list[str] = Field(default_factory=list, description="Food allergies (multiple choice)")
    diet: str = Field(default="No restrictions", description="Diet (single choice)")
    avoid: list[str] = Field(default_factory=list, description="Ingredients to avoid (multiple choice)")
    cuisine: str = Field(default="No Preference", description="Cuisine preference (single choice)")

def clean_ingredients(
    ingredients: Ingredients,
    llm
) -> Ingredients:
    
    system_message = {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": ingredients_checks_system_prompt,
            },
        ],
    }
    user_message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": ingredients_checks_user_prompt.format(ingredients=ingredients),
            },
        ],
    }

    messages = [
        system_message,
        user_message,
    ]

    response: Ingredients = llm.with_structured_output(schema=Ingredients).invoke(messages)

    print("Cleaned ingredients:", response.ingredients)

    return response.ingredients
    

def generate_recipes(
    request: RecipeRequest,
    llm
) -> dict:
    
    system_message = {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": recipes_generation_system_prompt,
            },
        ],
    }
    user_message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": recipes_generation_user_prompt.format(
                    ingredients=request.ingredients,
                    num_recipes=request.num_recipes,
                    allergies=", ".join(request.allergies),
                    diet=request.diet,
                    avoid=", ".join(request.avoid),
                    cuisine=request.cuisine
                ),
            },
        ],
    }

    messages = [
        system_message,
        user_message,
    ]

    response: RecipeResponse = llm.with_structured_output(schema=RecipeResponse).invoke(messages)

    return response.recipes