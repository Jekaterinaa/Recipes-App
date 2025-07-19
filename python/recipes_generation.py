from pydantic import BaseModel, Field, field_validator
from python.prompts import recipes_generation_system_prompt, recipes_generation_user_prompt, ingredients_checks_system_prompt, ingredients_checks_user_prompt
from python.ingredients_detection import Ingredients
from enum import Enum


class Recipe(BaseModel):
    name: str = Field(description="Name of the recipe")
    ingredients: Ingredients = Field(description="List of ingredients for the recipe")
    short_description: str = Field(description="Short description of the recipe")
    full_recipe: str = Field(description="Full recipe instructions")
    cooking_time: str = Field(description="Cooking time for the recipe")

class RecipeWithImage(Recipe):
    image_path: str = Field(description="Path to the generated image of the recipe")

class RecipeResponse(BaseModel):
    recipes: list[Recipe] = Field(description="List of recipes returned by the assistant")

class Diet(str, Enum):
    NO_RESTRICTIONS = "No Restrictions"
    VEGETARIAN = "Vegetarian"
    VEGAN = "Vegan"
    PESCATARIAN = "Pescatarian"
    KETO = "Keto"
    HALAL = "Halal"
    KOSHER = "Kosher"

class Cuisine(str, Enum):
    ASIAN = "Asian"
    EUROPEAN = "European"
    MEDITERRANEAN = "Mediterranean"
    MIDDLE_EASTERN = "Middle Eastern"
    NO_PREFERENCE = "No Preference"

class RecipeRequest(BaseModel):
    ingredients: Ingredients = Field(description="List of ingredients provided by the user")
    num_recipes: int = Field(description="Number of recipes to generate")
    allergies: list[str] = Field(default_factory=list, description="Food allergies (multiple choice)")
    diet: Diet = Field(default="No restrictions", description="Diet (single choice)")
    avoid: list[str] = Field(default_factory=list, description="Ingredients to avoid (multiple choice)")
    cuisine: Cuisine = Field(default="No Preference", description="Cuisine preference (single choice)")

    @field_validator("allergies", "avoid", mode="before")
    def validate_fields(cls, v):

        if isinstance(v, str):
            v = [v]
        elif not isinstance(v, list):
            raise TypeError("Field must be a string or a list of strings")
        
        return [str(item) for item in v]

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
                    ingredients=request.ingredients.ingredients,  # Extract the actual list
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