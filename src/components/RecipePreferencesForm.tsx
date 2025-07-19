import React, { useState } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

// Define RecipeRequest interface to match backend
export interface RecipeRequest {
  ingredients: { ingredients: string[] };
  allergies: string[];
  diet: "No Restrictions" | "Vegetarian" | "Vegan" | "Pescatarian" | "Keto" | "Halal" | "Kosher";
  avoid: string[];
  cuisine: "No Preference" | "Asian" | "European" | "Mediterranean" | "Middle Eastern";
  num_recipes: number;
}

interface RecipePreferencesFormProps {
  onSubmit: (request: RecipeRequest) => void;
  ingredients: string[];
}

const ALLERGY_OPTIONS = ["None", "Nuts", "Eggs", "Fish", "Soy", "Honey", "Other"] as const;
const DIET_OPTIONS = ["No Restrictions", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Halal", "Kosher"] as const;
const AVOID_OPTIONS = ["None", "Lactose", "Gluten", "Sugar", "Spicy food", "Other"] as const;
const CUISINE_OPTIONS = ["No Preference", "Asian", "European", "Mediterranean", "Middle Eastern"] as const satisfies readonly RecipeRequest["cuisine"][];

type AllergyOption = typeof ALLERGY_OPTIONS[number];
type AvoidOption = typeof AVOID_OPTIONS[number];

const isPresetAllergyOption = (value: string): value is AllergyOption => 
  ALLERGY_OPTIONS.includes(value as AllergyOption);

const isPresetAvoidOption = (value: string): value is AvoidOption => 
  AVOID_OPTIONS.includes(value as AvoidOption);

const RecipePreferencesForm: React.FC<RecipePreferencesFormProps> = ({ onSubmit, ingredients }) => {
  const [allergies, setAllergies] = useState<(AllergyOption | string)[]>(["None"]);
  const [otherAllergy, setOtherAllergy] = useState<string>("");
  const [otherAllergyError, setOtherAllergyError] = useState<string>("");
  const [otherAvoid, setOtherAvoid] = useState<string>("");
  const [otherAvoidError, setOtherAvoidError] = useState<string>("");
  const [diet, setDiet] = useState<RecipeRequest["diet"]>(DIET_OPTIONS[0] as RecipeRequest["diet"]);
  const [avoid, setAvoid] = useState<(AvoidOption | string)[]>(["None"]);
  const [cuisine, setCuisine] = useState<RecipeRequest["cuisine"]>(CUISINE_OPTIONS[0] as RecipeRequest["cuisine"]);
  const [numRecipes, setNumRecipes] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const validateOtherPreference = (
    value: string,
    existingValues: string[],
    setError: (error: string) => void
  ): boolean => {
    if (!value.trim()) {
      setError("Value cannot be empty");
      return false;
    }
    if (value.length < 2) {
      setError("Value must be at least 2 characters long");
      return false;
    }
    if (value.length > 30) {
      setError("Value must be less than 30 characters");
      return false;
    }
    if (!/^[a-zA-Z\s-]+$/.test(value)) {
      setError("Only letters, spaces, and hyphens are allowed");
      return false;
    }
    if (existingValues.includes(value.trim())) {
      setError("This item is already added");
      return false;
    }
    setError("");
    return true;
  };

  const validateOtherAllergy = (value: string): boolean => {
    return validateOtherPreference(value, allergies, setOtherAllergyError);
  };

  const validateOtherAvoid = (value: string): boolean => {
    return validateOtherPreference(value, avoid, setOtherAvoidError);
  };

  const handleAllergyChange = (option: string) => {
    if (option === "None") {
      setAllergies(["None"]);
    } else {
      setAllergies(prev =>
        prev.includes(option)
          ? prev.filter(a => a !== option)
          : [...prev.filter(a => a !== "None"), option]
      );
    }
    if (option === "Other" && allergies.includes("Other")) {
      setOtherAllergy("");
      setOtherAllergyError("");
    }
  };

  const handleAddOtherAllergy = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmedValue = otherAllergy.trim();
    
    if (validateOtherAllergy(trimmedValue)) {
      // Format the allergy to have proper capitalization
      const formattedAllergy = trimmedValue
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
      
      setAllergies(prev => [...prev.filter(a => a !== "Other"), formattedAllergy]);
      setOtherAllergy("");
      setOtherAllergyError("");
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(prev => prev.filter(a => a !== allergy));
  };

  const handleAvoidChange = (option: string) => {
    if (option === "None") {
      setAvoid(["None"]);
    } else {
      setAvoid(prev =>
        prev.includes(option)
          ? prev.filter(a => a !== option)
          : [...prev.filter(a => a !== "None"), option]
      );
    }
    if (option === "Other" && avoid.includes("Other")) {
      setOtherAvoid("");
      setOtherAvoidError("");
    }
  };

  const handleAddOtherAvoid = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmedValue = otherAvoid.trim();
    
    if (validateOtherAvoid(trimmedValue)) {
      // Format the value to have proper capitalization
      const formattedValue = trimmedValue
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
      
      setAvoid(prev => [...prev.filter(a => a !== "Other"), formattedValue]);
      setOtherAvoid("");
      setOtherAvoidError("");
    }
  };

  const handleRemoveAvoid = (item: string) => {
    setAvoid(prev => prev.filter(a => a !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Compose RecipeRequest object
    const request: RecipeRequest = {
      ingredients: { ingredients },
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
                  <div className="mt-3 flex flex-col gap-2 max-w-xs">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otherAllergy}
                        onChange={e => {
                          setOtherAllergy(e.target.value);
                          if (otherAllergyError) validateOtherAllergy(e.target.value);
                        }}
                        placeholder="Enter your allergy"
                        className={`flex-1 px-3 py-2 border ${
                          otherAllergyError ? 'border-red-400' : 'border-orange-200'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                          otherAllergyError ? 'focus:ring-red-400' : 'focus:ring-orange-400'
                        } text-base text-gray-800 bg-white/80`}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAddOtherAllergy(e);
                        }}
                        aria-invalid={!!otherAllergyError}
                        aria-describedby={otherAllergyError ? "allergy-error" : undefined}
                      />
                      <button
                        type="button"
                        className={`px-4 py-2 ${
                          otherAllergyError 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-orange-400 hover:bg-orange-500'
                        } text-white rounded-lg font-semibold transition-colors`}
                        onClick={handleAddOtherAllergy}
                        disabled={!!otherAllergyError}
                      >
                        Add
                      </button>
                    </div>
                    {otherAllergyError && (
                      <p id="allergy-error" className="text-sm text-red-500 mt-1">
                        {otherAllergyError}
                      </p>
                    )}
                  </div>
                )}
                {/* Show added allergies (except built-in options) as removable chips */}
                {allergies.filter(a => !isPresetAllergyOption(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 max-h-24 overflow-y-auto pr-2">
                    {allergies.filter(a => !isPresetAllergyOption(a)).map((a, idx) => (
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
                        onChange={() => setDiet(option as RecipeRequest["diet"])}
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
                {avoid.includes("Other") && (
                  <div className="mt-3 flex flex-col gap-2 max-w-xs">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otherAvoid}
                        onChange={e => {
                          setOtherAvoid(e.target.value);
                          if (otherAvoidError) validateOtherAvoid(e.target.value);
                        }}
                        placeholder="Enter what you want to avoid"
                        className={`flex-1 px-3 py-2 border ${
                          otherAvoidError ? 'border-red-400' : 'border-orange-200'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                          otherAvoidError ? 'focus:ring-red-400' : 'focus:ring-orange-400'
                        } text-base text-gray-800 bg-white/80`}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAddOtherAvoid(e);
                        }}
                        aria-invalid={!!otherAvoidError}
                        aria-describedby={otherAvoidError ? "avoid-error" : undefined}
                      />
                      <button
                        type="button"
                        className={`px-4 py-2 ${
                          otherAvoidError 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-orange-400 hover:bg-orange-500'
                        } text-white rounded-lg font-semibold transition-colors`}
                        onClick={handleAddOtherAvoid}
                        disabled={!!otherAvoidError}
                      >
                        Add
                      </button>
                    </div>
                    {otherAvoidError && (
                      <p id="avoid-error" className="text-sm text-red-500 mt-1">
                        {otherAvoidError}
                      </p>
                    )}
                  </div>
                )}
                {/* Show added avoid items (except built-in options) as removable chips */}
                {avoid.filter(a => !isPresetAvoidOption(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 max-h-24 overflow-y-auto pr-2">
                    {avoid.filter(a => !isPresetAvoidOption(a)).map((a, idx) => (
                      <span key={a + idx} className="flex items-center bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-sm font-medium">
                        {a}
                        <button
                          type="button"
                          className="ml-2 text-orange-600 hover:text-red-600 font-bold text-lg focus:outline-none"
                          onClick={() => handleRemoveAvoid(a)}
                          aria-label={`Remove ${a}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                        onChange={() => setCuisine(option as RecipeRequest["cuisine"])}
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
