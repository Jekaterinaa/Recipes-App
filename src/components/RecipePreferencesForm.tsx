import React, { useState } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

// Define RecipeRequest interface to match backend
export interface RecipeRequest {
  ingredients: string[];
  allergies: string[];
  diet: string;
  avoid: string[];
  cuisine: string;
  num_recipes: number;
}

interface RecipePreferencesFormProps {
  onSubmit: (request: RecipeRequest) => void;
  ingredients: string[];
}

const ALLERGY_OPTIONS = ["Nuts", "Eggs", "Fish", "Soy", "Honey", "None", "Other"];
const DIET_OPTIONS = ["No restrictions", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Halal", "Kosher"];
const AVOID_OPTIONS = ["Lactose", "Gluten", "Sugar", "Spicy food", "None"];
const CUISINE_OPTIONS = ["Asian", "European", "Mediterranean", "Middle Eastern", "No Preference"];

const RecipePreferencesForm: React.FC<RecipePreferencesFormProps> = ({ onSubmit, ingredients }) => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState<string>("");
  const [diet, setDiet] = useState<string>(DIET_OPTIONS[0]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string>(CUISINE_OPTIONS[0]);
  const [numRecipes, setNumRecipes] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleAllergyChange = (option: string) => {
    setAllergies(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
    if (option === "Other" && allergies.includes("Other")) {
      setOtherAllergy("");
    }
  };

  const handleAddOtherAllergy = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (otherAllergy.trim() && !allergies.includes(otherAllergy.trim())) {
      setAllergies(prev => [...prev.filter(a => a !== "Other"), otherAllergy.trim()]);
      setOtherAllergy("");
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(prev => prev.filter(a => a !== allergy));
  };

  const handleAvoidChange = (option: string) => {
    setAvoid(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Compose RecipeRequest object
    const request: RecipeRequest = {
      ingredients,
      allergies,
      diet,
      avoid,
      cuisine,
      num_recipes: numRecipes,
    };
    await onSubmit(request);
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[72vh] bg-[#FFF7ED] rounded-2xl border border-orange-100">
      <Card className="w-full max-w-[832px] mx-auto h-full flex flex-col">
        {/* Sticky Title */}
        <div className="sticky top-0 left-0 z-30 bg-[#FFF7ED] rounded-t-2xl shadow-sm px-6 pt-6 pb-3">
          <CardTitle className="text-2xl text-orange-800">Recipe Preferences</CardTitle>
        </div>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <form className="flex flex-col h-full min-h-0" onSubmit={handleSubmit}>
            {/* Scrollable form area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 min-h-0">
              {/* Q1: Allergies */}
              <div>
                <label className="font-semibold text-orange-700 mb-2 block">Do you have any food allergies?</label>
                <div className="flex flex-wrap gap-3">
                  {ALLERGY_OPTIONS.map(option => (
                    <label key={option} className="flex items-center gap-1 text-base">
                      <input
                        type="checkbox"
                        value={option}
                        checked={allergies.includes(option)}
                        onChange={() => handleAllergyChange(option)}
                        className="accent-orange-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {allergies.includes("Other") && (
                  <div className="mt-3 flex gap-2 max-w-xs">
                    <input
                      type="text"
                      value={otherAllergy}
                      onChange={e => setOtherAllergy(e.target.value)}
                      placeholder="Enter your allergy"
                      className="flex-1 px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-base text-gray-800 bg-white/80"
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddOtherAllergy(e);
                      }}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-orange-400 text-white rounded-lg font-semibold hover:bg-orange-500 transition-colors"
                      onClick={handleAddOtherAllergy}
                    >
                      Add
                    </button>
                  </div>
                )}
                {/* Show added allergies (except built-in options) as removable chips */}
                {allergies.filter(a => !ALLERGY_OPTIONS.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 max-h-24 overflow-y-auto pr-2">
                    {allergies.filter(a => !ALLERGY_OPTIONS.includes(a)).map((a, idx) => (
                      <span key={a + idx} className="flex items-center bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-sm font-medium">
                        {a}
                        <button
                          type="button"
                          className="ml-2 text-orange-600 hover:text-red-600 font-bold text-lg focus:outline-none"
                          onClick={() => handleRemoveAllergy(a)}
                          aria-label={`Remove ${a}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Q2: Diet */}
              <div>
                <label className="font-semibold text-orange-700 mb-2 block">Do you follow any of these diets?</label>
                <div className="flex flex-wrap gap-3">
                  {DIET_OPTIONS.map(option => (
                    <label key={option} className="flex items-center gap-1 text-base">
                      <input
                        type="radio"
                        name="diet"
                        value={option}
                        checked={diet === option}
                        onChange={() => setDiet(option)}
                        className="accent-orange-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {/* Q3: Avoid */}
              <div>
                <label className="font-semibold text-orange-700 mb-2 block">Do you need to avoid any of the following?</label>
                <div className="flex flex-wrap gap-3">
                  {AVOID_OPTIONS.map(option => (
                    <label key={option} className="flex items-center gap-1 text-base">
                      <input
                        type="checkbox"
                        value={option}
                        checked={avoid.includes(option)}
                        onChange={() => handleAvoidChange(option)}
                        className="accent-orange-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {/* Q4: Cuisine */}
              <div>
                <label className="font-semibold text-orange-700 mb-2 block">What are your cuisine preferences?</label>
                <div className="flex flex-wrap gap-3">
                  {CUISINE_OPTIONS.map(option => (
                    <label key={option} className="flex items-center gap-1 text-base">
                      <input
                        type="radio"
                        name="cuisine"
                        value={option}
                        checked={cuisine === option}
                        onChange={() => setCuisine(option)}
                        className="accent-orange-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              {/* Q5: Number of recipes */}
              <div>
                <label className="font-semibold text-orange-700 mb-2 block">How many recipes you want to be generated?</label>
                <div className="flex gap-4">
                  {[1, 2, 3].map(n => (
                    <label key={n} className="flex items-center gap-1 text-base">
                      <input
                        type="radio"
                        name="numRecipes"
                        value={n}
                        checked={numRecipes === n}
                        onChange={() => setNumRecipes(n)}
                        className="accent-orange-500"
                      />
                      {n}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Sticky submit button */}
            <div className="sticky bottom-0 left-0 w-full bg-[#FFF7ED] px-6 pb-6 pt-2 z-20 flex justify-center rounded-b-2xl">
              <button
                type="submit"
                className={
                  `bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-all duration-200 w-full max-w-xs mx-auto` +
                  (loading ? " opacity-50 cursor-not-allowed" : "")
                }
                disabled={loading}
              >
                {loading ? "Generating recipes" : "Continue"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipePreferencesForm;
