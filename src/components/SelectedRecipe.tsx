import React from "react";
import Image from "next/image";

export interface Recipe {
  name: string;
  image_base64: string;
  image_path?: string;
  cooking_time?: string;
  ingredients?: string[];
  short_description?: string;
  full_recipe?: string;
}

interface SelectedRecipeProps {
  recipe: Recipe;
  onBack?: () => void;
}

const SelectedRecipe: React.FC<SelectedRecipeProps> = ({ recipe, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[72vh] bg-[#FFF7ED] rounded-2xl border border-orange-100 overflow-y-hidden max-h-[90vh] p-4 relative">
      {/* Pin Back button to upper left */}
      <button
        className="absolute top-4 left-4 text-orange-700 hover:underline font-semibold text-base z-10"
        onClick={onBack}
      >
        ← Back
      </button>
      <div className="w-full max-w-4xl mx-auto flex flex-row h-full gap-8">
        {/* Left section: 1/3 width, match right height */}
        <div className="flex flex-col items-center w-[312px] min-w-[260px] bg-white/80 rounded-lg p-4 self-stretch mt-0 justify-center">
          <div className="text-xl font-bold text-orange-800 mb-2 text-center break-words w-full">{recipe.name}</div>
          {recipe.image_base64 && (
            <div className="flex justify-center w-full mb-2">
              <Image
                src={`data:image/png;base64,${recipe.image_base64}`}
                alt={recipe.name}
                width={224}
                height={224}
                className="w-56 h-56 object-contain rounded border border-orange-200 bg-white"
                unoptimized
              />
            </div>
          )}
          {recipe.cooking_time && (
            <div className="text-orange-700 font-medium mt-2 text-base text-center w-full">
              Cooking time: {recipe.cooking_time}
            </div>
          )}
        </div>
        {/* Right section: 2/3 width */}
        <div className="flex-1 flex flex-col bg-white/80 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-4 w-full">
              <h3 className="font-semibold text-orange-700 mb-1 text-lg">Ingredients:</h3>
              <ul className="list-disc list-inside text-gray-800 text-base font-sans">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
          {recipe.short_description && (
            <div className="mb-4 w-full">
              <h3 className="font-semibold text-orange-700 mb-1 text-lg">Description:</h3>
              <p className="text-gray-800 text-base font-sans">
                {recipe.short_description}
              </p>
            </div>
          )}
          {recipe.full_recipe && (
            <div className="mb-2 w-full">
              <h3 className="font-semibold text-orange-700 mb-1 text-lg">Full Recipe:</h3>
              <div className="whitespace-pre-wrap text-gray-800 text-base font-sans bg-orange-50 rounded p-2 overflow-x-auto">
                {recipe.full_recipe}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedRecipe;
