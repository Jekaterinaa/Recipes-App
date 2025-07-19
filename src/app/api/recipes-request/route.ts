import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Convert the request body to match the backend's expected format
    const convertedBody = {
      ...body,
      diet: body.diet || "No restrictions",  // Ensure diet is provided
      ingredients: {
        ingredients: Array.isArray(body.ingredients) ? body.ingredients : 
          (body.ingredients?.ingredients || [])
      },
      allergies: Array.isArray(body.allergies) ? body.allergies : [],
      avoid: Array.isArray(body.avoid) ? body.avoid : [],
      num_recipes: Number(body.num_recipes) || 1
    };
    console.log('Converted body:', convertedBody);
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/recipes-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(convertedBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      throw new Error(error.detail || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in recipes-request API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate recipes" },
      { status: 500 }
    );
  }
}