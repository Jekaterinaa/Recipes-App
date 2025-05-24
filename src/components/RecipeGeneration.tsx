import React from "react";
import type { RecipePreferences } from "./RecipePreferencesForm";

interface RecipeGenerationProps {
  ingredients: string[];
  preferences?: RecipePreferences;
  onRecipesGenerated?: (recipes: Recipe[]) => void;
}

const BACKEND_URL = "http://localhost:8000";

const RecipeGeneration: React.FC<RecipeGenerationProps> = ({ ingredients, preferences, onRecipesGenerated }) => {
  const [numRecipes, setNumRecipes] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cleanedIngredients, setCleanedIngredients] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    // Accept Ingredients class response (object with 'ingredients' array)
    async function cleanIngredientsIfNeeded() {
      if (!ingredients || ingredients.length === 0) {
        setCleanedIngredients([]);
        return;
      }
      setCleanedIngredients(null); // Indicate loading
      try {
        const res = await fetch(`${BACKEND_URL}/clean-ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients }),
        });
        if (!res.ok) throw new Error("Failed to clean ingredients");
        const data = await res.json();
        if (Array.isArray(data.ingredients)) {
          setCleanedIngredients(data.ingredients);
        } else if (typeof data.ingredients === "string") {
          setCleanedIngredients([data.ingredients]);
        } else {
          setCleanedIngredients([]);
        }
      } catch {
        setCleanedIngredients(ingredients);
      }
    }
    cleanIngredientsIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ingredients)]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/recipes-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: cleanedIngredients,
          num_recipes: numRecipes,
          preferences: preferences || {},
        }),
      });
      if (!res.ok) throw new Error("Failed to generate recipes");
      const data = await res.json();
      if (onRecipesGenerated) {
        onRecipesGenerated(data.recipes || []);
      }
    } catch {
      setError("Could not generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[72vh] bg-[#FFF7ED] rounded-2xl shadow-xl">
      <h2 className="text-4xl font-bold text-orange-800 mb-6 text-center">Recipe Generation</h2>
      {cleanedIngredients === null ? (
        <div className="bg-white/80 rounded-lg p-6 border border-orange-200 shadow w-full max-w-xl mb-6 flex items-center justify-center min-h-[80px]">
          <span className="text-orange-700 text-base font-medium">Cleaning ingredients...</span>
        </div>
      ) : (
        <div className="bg-white/80 rounded-lg p-6 border border-orange-200 shadow w-full max-w-xl mb-6">
          <h3 className="text-lg font-semibold text-orange-700 mb-2">Ingredients:</h3>
          <div className="mb-4 text-gray-800 text-base">
            {cleanedIngredients.length > 0 ? cleanedIngredients.join(", ") : "No ingredients provided."}
          </div>
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <label className="text-base text-orange-800 font-medium">
          Number of recipes:
          <select
            className="ml-2 px-2 py-1 rounded border border-orange-200 bg-white text-gray-800"
            value={numRecipes}
            onChange={e => setNumRecipes(Number(e.target.value))}
            disabled={loading}
          >
            {[1,2,3].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <button
          className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-all duration-200 disabled:opacity-60"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating Recipes" : "Generate Recipes"}
        </button>
      </div>
      {error && (
        <div className="text-red-600 font-medium mt-4">{error}</div>
      )}
    </div>
  );
};

export default RecipeGeneration;