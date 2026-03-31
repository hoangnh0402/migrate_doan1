#!/bin/bash
# Build script for HQC System Web App

set -e

echo "ðŸš€ Building HQC System Web App..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ðŸ“¦ Installing dependencies..."
    npm install
fi

# Build for web
echo "ðŸŒ Building for web..."
npx expo export:web

echo "âœ… Build completed! Output in 'web-build/' directory"



