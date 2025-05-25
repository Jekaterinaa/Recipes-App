"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImageIngredientDetector({ onProceed }: { onProceed?: (ingredients: string[]) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animateProceed, setAnimateProceed] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setIngredients(null);
    setError(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    setLoading(true);
    setIngredients(null);
    setError(null);
    if (!selectedFile) {
      setError("Please select an image file.");
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("img", selectedFile);
      const res = await fetch("/api/user-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to detect ingredients");
      const data = await res.json();
      console.log("/user-image response:", data);
      if (Array.isArray(data.ingredients)) {
        setIngredients(data.ingredients);
      } else if (typeof data.ingredients === "string") {
        setIngredients([data.ingredients]);
        setError("Unexpected backend response: received a string instead of an array. Please try again or check backend logs.");
      } else {
        setIngredients([]);
        setError("Unexpected backend response format. Please try again or check backend logs.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error occurred");
      } else {
        setError("Error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const hasIngredients = Array.isArray(ingredients) && ingredients.length > 0;

  useEffect(() => {
    if (hasIngredients) {
      setAnimateProceed(true);
      const timeout = setTimeout(() => setAnimateProceed(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [hasIngredients]);

  const handleProceed = async () => {
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/clean-ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients }),
        });
        if (!res.ok) throw new Error("Failed to clean ingredients");
        const data = await res.json();
        if (onProceed && Array.isArray(data.ingredients)) {
          onProceed(data.ingredients);
        } else if (onProceed && typeof data.ingredients === "string") {
          onProceed([data.ingredients]);
        }
      } catch {
        setError("Could not clean ingredients. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;
    setIngredients(prev => prev ? [newIngredient.trim(), ...prev] : [newIngredient.trim()]);
    setNewIngredient("");
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(prev => prev ? prev.filter((_, i) => i !== idx) : prev);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl min-h-[72vh] flex items-center" style={{ background: "#FFF7ED" }}>
      {/* Decorative carrots */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute top-0 left-0 opacity-20" style={{zIndex:0}}>
          <defs>
            <linearGradient id="carrotGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFA94D"/>
              <stop offset="100%" stopColor="#FF6F00"/>
            </linearGradient>
          </defs>
          <g>
            <ellipse cx="60" cy="40" rx="18" ry="7" fill="url(#carrotGradient)" transform="rotate(-20 60 40)"/>
            <ellipse cx="220" cy="120" rx="16" ry="6" fill="url(#carrotGradient)" transform="rotate(15 220 120)"/>
            <ellipse cx="350" cy="80" rx="14" ry="5" fill="url(#carrotGradient)" transform="rotate(-10 350 80)"/>
            <ellipse cx="120" cy="200" rx="12" ry="4" fill="url(#carrotGradient)" transform="rotate(30 120 200)"/>
            <ellipse cx="280" cy="180" rx="15" ry="6" fill="url(#carrotGradient)" transform="rotate(-25 280 180)"/>
          </g>
        </svg>
      </div>
      <Card className="relative z-10 bg-transparent shadow-none border-none p-0 w-full">
        {/* Fixed header at the very top */}
        <div className="absolute left-0 top-0 w-full flex flex-col items-center pt-10" style={{ pointerEvents: 'none', zIndex: 2 }}>
          <CardHeader className="bg-transparent border-none p-0 flex flex-col items-center justify-center w-full">
            <CardTitle className="text-2xl font-bold text-orange-800 tracking-tight mb-2 text-center">Food Ingredient Detector</CardTitle>
            <p className="text-orange-700 text-base font-medium mb-2 text-center">Upload a food image to detect its ingredients</p>
          </CardHeader>
        </div>
        <CardContent className="w-full flex flex-row gap-16 items-center justify-center pt-32">
          <form className="flex flex-col gap-4 items-center w-1/2 justify-center text-center" onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors duration-200 mx-auto"
            />
            {previewUrl && (
              <div className="rounded-xl border-2 border-orange-200 bg-white/70 p-2 shadow-md mb-2 mx-auto">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={192}
                  height={192}
                  className="w-48 h-48 object-cover rounded-lg mx-auto"
                />
              </div>
            )}
            <button
              type={hasIngredients ? "button" : "submit"}
              onClick={hasIngredients ? handleProceed : undefined}
              className={
                (hasIngredients && animateProceed
                  ? "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 mb-8 mx-auto mt-4 animate-slide-right"
                  : "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 mb-8 mx-auto mt-4")
              }
              style={{ maxWidth: '100%' }}
              disabled={loading}
            >
              {hasIngredients ? "Proceed" : loading ? "Detecting..." : "Detect"}
            </button>
            {error && (
              <div className="mt-2 text-red-600 font-semibold mx-auto">{error}</div>
            )}
          </form>
          {ingredients && Array.isArray(ingredients) && ingredients.length > 0 ? (
            <div className="w-2/5 bg-white/80 rounded-lg p-4 border border-orange-200 shadow self-stretch flex flex-col justify-center ml-4 mb-12 mt-4">
              <h3 className="font-semibold text-orange-700 mb-2 text-lg">Detected Ingredients:</h3>
              <form onSubmit={handleAddIngredient} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={e => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient"
                  className="flex-1 px-3 py-1 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-base text-gray-800 bg-white/80"
                />
                <button type="submit" className="px-3 py-1 bg-orange-400 text-white rounded-lg font-semibold hover:bg-orange-500 transition-colors">Add</button>
              </form>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
                {ingredients.map((ingredient, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-orange-50 rounded px-3 py-1 text-gray-800 text-base">
                    <span>{ingredient}</span>
                    <button
                      className="ml-2 text-orange-600 hover:text-red-600 font-bold text-lg focus:outline-none"
                      onClick={() => handleRemoveIngredient(idx)}
                      aria-label={`Remove ${ingredient}`}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : ingredients && Array.isArray(ingredients) && ingredients.length === 0 ? (
            <div className="w-2/5 bg-white/80 rounded-lg p-4 border border-orange-200 shadow self-stretch flex flex-col justify-center ml-4 mb-12 mt-4 text-orange-700 font-semibold text-base text-center">
              Upload an image containing food
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
