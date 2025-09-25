#!/bin/bash

# Birthday Manager Deployment Script
# Usage: ./deploy.sh [platform]

set -e

echo "🎂 Birthday Manager Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}❌ Yarn ist nicht installiert. Bitte installieren Sie Yarn zuerst.${NC}"
    exit 1
fi

# Function to build the project
build_project() {
    echo -e "${YELLOW}📦 Building project...${NC}"
    yarn install --frozen-lockfile
    yarn build
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        yarn global add vercel
    fi
    
    build_project
    vercel --prod
    echo -e "${GREEN}✅ Deployed to Vercel successfully!${NC}"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo -e "${YELLOW}🚀 Deploying to Netlify...${NC}"
    
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}Installing Netlify CLI...${NC}"
        yarn global add netlify-cli
    fi
    
    build_project
    netlify deploy --prod --dir=dist
    echo -e "${GREEN}✅ Deployed to Netlify successfully!${NC}"
}

# Function to deploy with Docker
deploy_docker() {
    echo -e "${YELLOW}🐳 Building Docker image...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker ist nicht installiert.${NC}"
        exit 1
    fi
    
    docker build -t birthday-manager .
    
    echo -e "${YELLOW}Starting Docker container...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}✅ Docker container is running on port 3001!${NC}"
    echo -e "${GREEN}Access the app at: http://localhost:3001${NC}"
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo -e "${YELLOW}🚀 Deploying to GitHub Pages...${NC}"
    
    # Check if gh-pages is installed
    if ! yarn list gh-pages &> /dev/null; then
        echo -e "${YELLOW}Installing gh-pages...${NC}"
        yarn add --dev gh-pages
    fi
    
    build_project
    
    # Add base path for GitHub Pages if needed
    echo -e "${YELLOW}Configuring for GitHub Pages...${NC}"
    
    # Deploy
    npx gh-pages -d dist
    
    echo -e "${GREEN}✅ Deployed to GitHub Pages successfully!${NC}"
}

# Function to create production bundle
create_bundle() {
    echo -e "${YELLOW}📦 Creating production bundle...${NC}"
    
    build_project
    
    # Create deployment package
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BUNDLE_NAME="birthday-manager-${TIMESTAMP}.tar.gz"
    
    tar -czf ${BUNDLE_NAME} dist/
    
    echo -e "${GREEN}✅ Production bundle created: ${BUNDLE_NAME}${NC}"
    echo -e "${GREEN}You can upload this to any web server.${NC}"
}

# Function to run development server
run_dev() {
    echo -e "${YELLOW}🔧 Starting development server...${NC}"
    yarn dev
}

# Function to preview production build
preview_build() {
    echo -e "${YELLOW}👁️  Previewing production build...${NC}"
    build_project
    yarn preview
}

# Main script logic
case "$1" in
    vercel)
        deploy_vercel
        ;;
    netlify)
        deploy_netlify
        ;;
    docker)
        deploy_docker
        ;;
    github-pages|gh-pages)
        deploy_github_pages
        ;;
    bundle)
        create_bundle
        ;;
    dev)
        run_dev
        ;;
    preview)
        preview_build
        ;;
    build)
        build_project
        ;;
    *)
        echo "Birthday Manager Deployment Options:"
        echo ""
        echo "Usage: ./deploy.sh [platform]"
        echo ""
        echo "Available platforms:"
        echo "  vercel       - Deploy to Vercel"
        echo "  netlify      - Deploy to Netlify"
        echo "  docker       - Deploy with Docker"
        echo "  gh-pages     - Deploy to GitHub Pages"
        echo "  bundle       - Create deployment bundle (.tar.gz)"
        echo ""
        echo "Other commands:"
        echo "  dev          - Start development server"
        echo "  preview      - Preview production build"
        echo "  build        - Build project only"
        echo ""
        echo "Example:"
        echo "  ./deploy.sh vercel"
        echo ""
        exit 1
        ;;
esac
