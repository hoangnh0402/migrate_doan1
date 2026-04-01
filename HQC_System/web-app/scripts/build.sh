#!/bin/bash
# Build script for HQC System Web App

set -e

echo "🚀 Building HQC System Web App..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for web
echo "🌐 Building for web..."
npx expo export:web

echo "✅ Build completed! Output in 'web-build/' directory"


