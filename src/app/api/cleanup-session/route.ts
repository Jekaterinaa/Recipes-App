import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Clean up locally stored images
    const rootDir = process.cwd();
    const imageDirs = ['images', 'generated_images'];

    for (const dir of imageDirs) {
      const dirPath = path.join(rootDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          // Skip .gitkeep or other special files
          if (file.startsWith('.')) continue;
          fs.unlinkSync(path.join(dirPath, file));
        }
      }
    }

    // Clean up images on the backend
    const response = await fetch(`${BACKEND_URL}/api/cleanup-session`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in cleanup-session API route:", error);
    return NextResponse.json(
      { error: "Failed to cleanup session" },
      { status: 500 }
    );
  }
}