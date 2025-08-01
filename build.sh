#!/bin/bash

# Alternative build script with memory optimization
# Use this if you encounter segmentation faults during build

echo "🔨 Building Tzikbal API with memory optimization..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build with memory optimization
echo "🏗️ Building with increased memory allocation..."
NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size" pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build artifacts are in the 'dist' directory"
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Try with TypeScript compiler directly
    echo "🔄 Trying direct TypeScript compilation..."
    NODE_OPTIONS="--max-old-space-size=4096" npx tsc -p tsconfig.build.json
    
    if [ $? -eq 0 ]; then
        echo "✅ Direct TypeScript compilation successful!"
    else
        echo "❌ All build attempts failed. Please check your system resources and Node.js version."
        exit 1
    fi
fi
