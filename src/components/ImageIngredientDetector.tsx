"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImageIngredientDetector({ onProceed }: { onProceed?: (ingredients: string[]) => void }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animateProceed, setAnimateProceed] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [newIngredientError, setNewIngredientError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalFiles = selectedFiles.length + newFiles.length;
    
    if (totalFiles > 3) {
      setError("Maximum 3 images allowed.");
      return;
    }

    // Create URLs for new files before updating state
    const newUrls = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    // Update both states together to maintain consistency
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newUrls.map(item => item.url)]);
    setIngredients(null);
    setError(null);

    // Reset the input value to allow selecting the same file again
    if (e.target instanceof HTMLInputElement) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    // Cleanup browser URL for the removed image
    URL.revokeObjectURL(previewUrls[index]);
    
    // Remove image from arrays while keeping others
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });
    
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    // Reset ingredients when removing an image
    setIngredients(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      // Cleanup all preview URLs when component unmounts
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);  // Added previewUrls as dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIngredients(null);
    setError(null);

    if (selectedFiles.length === 0) {
      setError("Please select at least one image file.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("img", file);
      });

      const res = await fetch("/api/user-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to detect ingredients");
      }

      const data = await res.json();
      
      if (!data || !Array.isArray(data.ingredients)) {
        throw new Error("Invalid response format from server");
      }

      setIngredients(data.ingredients);
      if (data.ingredients.length === 0) {
        setError("No ingredients detected. Please try with a clearer food image.");
      }
    } catch (err) {
      setIngredients([]); // Reset ingredients on error
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
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

  const validateNewIngredient = (value: string): boolean => {
    if (!value.trim()) {
      setNewIngredientError("Value cannot be empty");
      return false;
    }
    if (value.length < 2) {
      setNewIngredientError("Value must be at least 2 characters long");
      return false;
    }
    if (value.length > 30) {
      setNewIngredientError("Value must be less than 30 characters");
      return false;
    }
    if (!/^[a-zA-Z\s-]+$/.test(value)) {
      setNewIngredientError("Only letters, spaces, and hyphens are allowed");
      return false;
    }
    if (ingredients?.includes(value.trim())) {
      setNewIngredientError("This ingredient is already added");
      return false;
    }
    setNewIngredientError("");
    return true;
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = newIngredient.trim();
    
    if (validateNewIngredient(trimmedValue)) {
      setIngredients(prev => prev ? [trimmedValue, ...prev] : [trimmedValue]);
      setNewIngredient("");
      setNewIngredientError("");
    }
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(prev => prev ? prev.filter((_, i) => i !== idx) : prev);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-orange-100" style={{ background: "#FFF7ED" }}>
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
      <Card className="relative z-10 bg-transparent border-none p-0 w-full">
        {/* Fixed header at the very top */}
        <div className="absolute left-0 top-0 w-full flex flex-col items-center pt-10" style={{ pointerEvents: 'none', zIndex: 2 }}>
          <CardHeader className="bg-transparent border-none p-0 flex flex-col items-center justify-center w-full">
            <CardTitle className="text-2xl font-bold text-orange-800 tracking-tight mb-2 text-center">Food Ingredient Detector</CardTitle>
            <p className="text-orange-700 text-base font-medium mb-2 text-center">Upload up to 3 food images to detect ingredients</p>
          </CardHeader>
        </div>
        <CardContent className="w-full flex flex-row gap-16 items-start justify-center pt-32">
          <form className="flex flex-col gap-4 items-center w-1/2 justify-start text-center min-h-[400px]" onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors duration-200 mx-auto"
              multiple
            />
            <div className="flex flex-wrap gap-4 justify-center items-center min-h-[200px] w-full">
              {previewUrls.map((url, index) => (
                <div 
                  key={`${url}-${index}`}
                  className={`
                    rounded-xl border-2 border-orange-200 bg-white/70 p-2 relative group w-[176px] h-[176px]
                    ${hasIngredients 
                      ? 'absolute left-0 top-0 transition-all duration-700 ease-out transform-gpu'
                      : 'transition-all duration-500 ease-out transform-gpu hover:scale-105'
                    }
                  `}
                  style={hasIngredients ? {
                    transform: `
                      translateX(${index * 10}px) 
                      rotate(${index * 12 - 10}deg)
                    `,
                    zIndex: selectedFiles.length - index
                  } : undefined}
                >
                  {!hasIngredients && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 z-20"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  )}
                  <div className="w-40 h-40 relative">
                    {url && (
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="160px"
                        key={`${url}-${index}`}
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {selectedFiles.length === 0 && (
              <p className="text-sm text-orange-600 mt-1">
                You can upload up to 3 images
              </p>
            )}
            <button
              type={hasIngredients ? "button" : "submit"}
              onClick={hasIngredients ? handleProceed : undefined}
              className={
                (hasIngredients && animateProceed
                  ? "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 mb-4 mx-auto mt-2 animate-slide-right"
                  : "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 mb-4 mx-auto mt-2")
              }
              style={{ maxWidth: '100%' }}
              disabled={loading || selectedFiles.length === 0}
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
              <form onSubmit={handleAddIngredient} className="flex flex-col gap-2 mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={e => {
                      setNewIngredient(e.target.value);
                      if (newIngredientError) validateNewIngredient(e.target.value);
                    }}
                    placeholder="Add ingredient"
                    className={`flex-1 px-3 py-1 border ${
                      newIngredientError ? 'border-red-400' : 'border-orange-200'
                    } rounded-lg focus:outline-none focus:ring-2 ${
                      newIngredientError ? 'focus:ring-red-400' : 'focus:ring-orange-400'
                    } text-base text-gray-800 bg-white/80`}
                    aria-invalid={!!newIngredientError}
                    aria-describedby={newIngredientError ? "ingredient-error" : undefined}
                  />
                  <button 
                    type="submit" 
                    className={`px-3 py-1 ${
                      newIngredientError 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-orange-400 hover:bg-orange-500'
                    } text-white rounded-lg font-semibold transition-colors`}
                    disabled={!!newIngredientError}
                  >
                    Add
                  </button>
                </div>
                {newIngredientError && (
                  <p id="ingredient-error" className="text-sm text-red-500">
                    {newIngredientError}
                  </p>
                )}
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
