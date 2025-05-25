# AI Recipe Generator

An intelligent recipe generation application that uses AI to detect ingredients from user uploaded photos and create personalized recipes based on user preferences. This project combines computer vision, natural language processing, and image generation to provide a complete cooking assistant experience.

## Access to the Project

This project can be accessed and tested via following link: https://jserge-ae-cap-u5ywkuu7fq-ez.a.run.app

## Project Overview

The AI Recipe Generator is a full-stack web application that helps users discover new recipes by simply uploading a photo of their available ingredients. The application leverages AI technologies to provide an intuitive and personalized cooking experience.

## Application Flow

1. **Landing Page** - Welcome screen with project introduction
2. **Image Upload** - Users upload photos of their ingredients/fridge
3. **Ingredient Detection** - AI analyzes the image and extracts ingredient list, user can adjust the list by adding/removing ingredients
4. **Preference Form** - Users specify dietary restrictions and preferences and number of recipes to generate
5. **Recipe Generation** - AI creates personalized recipes
6. **Image Generation** - AI generates images for each recipe
7. **Recipe Selection** - Generated recipe options displayed to users
8. **Recipe Details** - Full recipe view with ingredients and detailed instructions

## Core Features

### 🔍 **Intelligent Ingredient Detection**
- Upload photos of ingredients from your kitchen/fridge
- AI-powered computer vision automatically identifies and lists ingredients
- Manual editing capabilities to add, or remove detected ingredients
- Smart ingredient cleaning and validation

### 🍳 **Personalized Recipe Generation**
- Generate 1-3 custom recipes based on detected ingredients
- Comprehensive preference customization including:
  - Food allergies (Nuts, Eggs, Fish, Soy, Honey, etc.)
  - Dietary restrictions (Vegetarian, Vegan, Keto, Halal, Kosher, etc.)
  - Ingredients to avoid (Lactose, Gluten, Sugar, Spicy food)
  - Cuisine preferences (Asian, European, Mediterranean, Middle Eastern)

### 🎨 **AI-Generated Recipe Images**
- Automatically generated images for each recipe
- Visual recipe representation to help with meal selection
- Base64-encoded images for fast loading and display

### 📖 **Detailed Recipe Information**
- Complete ingredient list
- Short recipe description
- Step-by-step cooking instructions
- Estimated cooking time

### 🎯 **Interactive User Experience**
- Modern, responsive web interface with smooth animations
- Multi-step workflow with intuitive navigation
- Real-time feedback and loading states

## AI Integration

The application uses OpenAI's GPT-4 model with structured outputs to ensure reliable and consistent responses. The AI pipeline includes:

- **Image Analysis** - Vision-language model processes ingredient photos
- **Ingredient Validation** - Cleans and standardizes detected ingredients
- **Recipe Creation** - Generates creative, culturally-appropriate recipes
- **Image Generation** - Creates appealing visual representations

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Custom animations** - Smooth transitions and micro-interactions

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - AI/LLM integration and orchestration
- **OpenAI GPT-4** - Advanced language model for ingredient detection and recipe generation
- **Pydantic** - Data validation and serialization
- **PIL (Python Imaging Library)** - Image processing and manipulation

### AI Capabilities
- **Computer Vision** - Ingredient detection from uploaded images
- **Natural Language Processing** - Recipe generation and content creation
- **Image Generation** - AI-created recipe images
- **Structured Output** - Type-safe AI responses with validation

## Deployment

The application is containerized using Docker and can be deployed on various platforms including Vercel, supporting both the Next.js frontend and Python FastAPI backend in a unified deployment strategy.

### Infrastructure
- **Docker** - Containerized deployment
- **GCP Cloud Run** - Container service
