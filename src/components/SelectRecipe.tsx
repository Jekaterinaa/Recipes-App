import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export interface Recipe {
  name: string;
  image_base64: string;
  image_path?: string;
  cooking_time?: string;
  ingredients?: string[];
  short_description?: string;
  full_recipe?: string;
}

interface SelectRecipeProps {
  recipes: Recipe[];
  onSelect?: (recipe: Recipe) => void;
  onGoToStart?: () => void;
}

const SelectRecipe: React.FC<SelectRecipeProps> = ({ recipes: initialRecipes, onSelect, onGoToStart }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    // Map backend fields to frontend fields if needed
    if (Array.isArray(initialRecipes) && initialRecipes.length > 0) {
      const mapped = initialRecipes.map((r: Recipe) => ({
        name: r.name,
        image_base64: r.image_base64 ? r.image_base64 : '',
        image_path: r.image_path,
        cooking_time: r.cooking_time,
        ingredients: r.ingredients,
        short_description: r.short_description,
        full_recipe: r.full_recipe,
      }));
      setRecipes(mapped);
    } else {
      setRecipes([]);
    }
  }, [initialRecipes]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[72vh] bg-[#FFF7ED] rounded-2xl border border-orange-100">
      {/* Go to Start button in upper right */}
      {onGoToStart && (
        <button
          className="absolute top-4 right-4 text-orange-700 hover:underline font-semibold text-base z-10"
          onClick={onGoToStart}
        >
          Go to Start
        </button>
      )}
      <h2 className="text-3xl font-bold text-orange-800 mb-6 text-center">Generated Recipes</h2>
      <div className="w-full flex justify-center">
        <div className={`flex gap-8 justify-center w-full max-w-[832px]`}>
          {recipes.map((recipe, idx) => (
            <div key={idx} className="flex-shrink-0 w-80 flex flex-col items-center">
              <Card className="hover:bg-orange-50 transition-all duration-200 cursor-pointer h-[408px] flex flex-col justify-between items-center" onClick={() => onSelect && onSelect(recipe)}>
                <CardHeader className="flex justify-center items-center w-full">
                  <CardTitle className="text-center w-full text-orange-800">{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center w-full">
                  <Image
                    src={`data:image/png;base64,${recipe.image_base64}`}
                    alt={recipe.name}
                    width={256}
                    height={256}
                    className="w-48 h-48 object-cover aspect-square rounded mb-2 border border-orange-200 mx-auto"
                    unoptimized
                  />
                  {recipe.cooking_time && (
                    <div className="text-orange-700 font-medium mt-2 text-sm text-center">
                      Cooking time: {recipe.cooking_time}
                    </div>
                  )}
                  {recipe.short_description && (
                    <div className="text-gray-700 text-xs mt-1 text-center">
                      {recipe.short_description}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectRecipe;
