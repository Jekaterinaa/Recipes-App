#!/bin/bash

# Configuration variables
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="jserge-ae-cap"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to Google Cloud Run${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  You are not authenticated with gcloud. Running auth login...${NC}"
    gcloud auth login
fi

# Load environment variables from python/.env file
if [ -f "python/.env" ]; then
    echo -e "${GREEN}📝 Loading environment variables from python/.env${NC}"
    export $(grep -v '^#' python/.env | xargs)
else
    echo -e "${RED}❌ python/.env file not found. Please create it with your OPENAI_API_KEY.${NC}"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY not found in python/.env file.${NC}"
    exit 1
fi

# Prompt for project ID if not set
if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo -e "${YELLOW}📝 Please enter your GCP Project ID:${NC}"
    read -r PROJECT_ID
    IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
fi

# Set the project
echo -e "${GREEN}🔧 Setting GCP project to: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${GREEN}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image
echo -e "${GREEN}🏗️  Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Push the image to Google Container Registry
echo -e "${GREEN}📤 Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker push failed${NC}"
    exit 1
fi

# Deploy to Cloud Run with environment variables
echo -e "${GREEN}🚀 Deploying to Cloud Run with environment variables...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,OPENAI_API_KEY=${OPENAI_API_KEY}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Your service is available at:${NC}"
    gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"