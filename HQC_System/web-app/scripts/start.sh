#!/bin/bash
# Start script for HQC System Web App

set -e

echo "ðŸš€ Starting HQC System Web App..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ðŸ“¦ Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "âš ï¸  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "âœ… Created .env file. Please update with your configuration."
    else
        echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > .env
        echo "âœ… Created default .env file."
    fi
fi

# Start Expo
echo "ðŸŒ Starting Expo development server..."
npx expo start



