"use client";
import React, { useState } from "react";
import ImageIngredientDetector from "../components/ImageIngredientDetector";
import RecipePreferencesForm, { RecipeRequest } from "../components/RecipePreferencesForm";
import SelectRecipe from "../components/SelectRecipe";
import SelectedRecipe from "../components/SelectedRecipe";
import type { Recipe } from "../components/SelectRecipe";

export default function Home() {
  const [step, setStep] = useState<"landing" | "ingredients" | "preferences" | "select" | "selected">("landing");
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Handler for ImageIngredientDetector
  const handleProceedIngredients = (ingredients: string[]) => {
    setDetectedIngredients(ingredients);
    setStep("preferences");
  };

  // Handler for RecipePreferencesForm
  const handlePreferencesSubmit = async (request: RecipeRequest) => {
    // Ensure correct types for backend
    const payload = {
      ...request,
      num_recipes: Number(request.num_recipes),
      ingredients: Array.isArray(request.ingredients) ? request.ingredients : [request.ingredients],
      allergies: Array.isArray(request.allergies) ? request.allergies : [request.allergies],
      avoid: Array.isArray(request.avoid) ? request.avoid : [request.avoid],
    };
    try {
      const res = await fetch("http://localhost:8000/recipes-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to generate recipes");
      const data = await res.json();
      setRecipes(data.recipes);
      setStep("select");
    } catch {
      alert("Could not generate recipes. Please try again.");
    }
  };

  return (
    <div className="relative w-full min-h-[72vh] flex items-center justify-center overflow-hidden">
      {/* Landing Page */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out ${step === "landing" ? "translate-x-0" : "-translate-x-full"}`}
        style={{ zIndex: 10, background: "#FFF7ED" }}
      >
        <div className="flex flex-col items-center justify-center h-full px-8 py-16 max-w-2xl mx-auto rounded-2xl shadow-xl border border-orange-100">
          <h1 className="text-4xl font-extrabold text-orange-800 mb-6 text-center">AI Recipe Generator</h1>
          <p className="text-lg text-orange-900 mb-8 text-center">
            Welcome to your smart kitchen assistant! Upload a photo of your ingredients, and let our AI detect what is inside and suggest creative recipes. Discover new meals, reduce food waste, and get inspired—all powered by advanced AI.
          </p>
          <button
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-3 px-12 rounded-full shadow-lg text-xl transition-all duration-200"
            onClick={() => setStep("ingredients")}
          >
            Start
          </button>
        </div>
      </div>
      {/* ImageIngredientDetector */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out ${step === "ingredients" ? "translate-x-0" : step === "preferences" || step === "select" || step === "selected" ? "-translate-x-full" : "translate-x-full"}`}
        style={{ zIndex: 20 }}
      >
        <ImageIngredientDetector
          onProceed={handleProceedIngredients}
        />
      </div>
      {/* RecipePreferencesForm */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out ${step === "preferences" ? "translate-x-0" : step === "select" || step === "selected" ? "-translate-x-full" : "translate-x-full"}`}
        style={{ zIndex: 25 }}
      >
        <RecipePreferencesForm
          onSubmit={handlePreferencesSubmit}
          ingredients={detectedIngredients}
        />
      </div>
      {/* SelectRecipe */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out ${step === "select" ? "translate-x-0" : step === "selected" ? "-translate-x-full" : "translate-x-full"}`}
        style={{ zIndex: 40 }}
      >
        {recipes && (
          <SelectRecipe
            recipes={recipes}
            onSelect={recipe => {
              setSelectedRecipe(recipe);
              setStep("selected");
            }}
          />
        )}
      </div>
      {/* SelectedRecipe */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out ${step === "selected" ? "translate-x-0" : "translate-x-full"}`}
        style={{ zIndex: 50 }}
      >
        {selectedRecipe && (
          <SelectedRecipe
            recipe={selectedRecipe}
            onBack={() => setStep("select")}
          />
        )}
      </div>
    </div>
  );
}
