#!/bin/bash

# Deployment script for Smart DevCopilot
# Supports local, development, and production deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Smart DevCopilot Deployment Script${NC}"
echo "===================================="

# Check environment
if [ -z "$1" ]; then
    echo -e "${RED}Error: Environment not specified${NC}"
    echo "Usage: ./deploy.sh [local|dev|prod]"
    exit 1
fi

ENV=$1

echo -e "${YELLOW}Deploying to: $ENV${NC}"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker is running${NC}"
}

# Function to check environment variables
check_env_vars() {
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}Warning: .env file not found${NC}"
        echo "Creating from .env.example..."
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}Please update backend/.env with your values${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Environment variables configured${NC}"
}

# Local deployment
deploy_local() {
    echo -e "${YELLOW}Starting local deployment...${NC}"
    
    # Build and start containers
    docker-compose up -d --build
    
    # Wait for services to be healthy
    echo "Waiting for services to start..."
    sleep 10
    
    # Initialize database
    echo "Initializing database..."
    docker-compose exec backend python database.py
    
    echo -e "${GREEN}✓ Local deployment complete${NC}"
    echo "Backend API: http://localhost:8000"
    echo "API Docs: http://localhost:8000/docs"
}

# Development deployment
deploy_dev() {
    echo -e "${YELLOW}Starting development deployment...${NC}"
    
    # Build images
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
    
    # Deploy to development server
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    echo -e "${GREEN}✓ Development deployment complete${NC}"
}

# Production deployment (Kubernetes)
deploy_prod() {
    echo -e "${YELLOW}Starting production deployment...${NC}"
    
    # Build and push Docker images
    echo "Building production images..."
    docker build -t devcopilot-backend:latest ./backend
    
    # Tag for registry
    REGISTRY="your-registry.azurecr.io"
    docker tag devcopilot-backend:latest $REGISTRY/devcopilot-backend:latest
    
    # Push to registry
    echo "Pushing to container registry..."
    docker push $REGISTRY/devcopilot-backend:latest
    
    # Apply Kubernetes manifests
    echo "Deploying to Kubernetes..."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/ingress.yaml
    
    # Wait for rollout
    kubectl rollout status deployment/devcopilot-backend -n devcopilot
    
    echo -e "${GREEN}✓ Production deployment complete${NC}"
}

# Main deployment flow
check_docker
check_env_vars

case $ENV in
    local)
        deploy_local
        ;;
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    *)
        echo -e "${RED}Error: Invalid environment${NC}"
        echo "Valid options: local, dev, prod"
        exit 1
        ;;
esac

echo -e "${GREEN}Deployment successful!${NC}"
