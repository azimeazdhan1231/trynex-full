#!/bin/bash

# TryneX Lifestyle - Netlify Build Script
echo "🚀 Starting TryneX Lifestyle build process..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

# Ensure we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in current directory"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking required files..."
required_files=("index.html" "netlify.toml" "netlify/functions/sendEmail.js")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file not found"
        exit 1
    fi
done

# Check if environment variables are set for production
if [ "$NODE_ENV" = "production" ]; then
    echo "🔧 Production build - checking environment variables..."
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        echo "⚠️  Warning: Supabase environment variables not set"
        echo "   The database functionality may not work properly"
    fi
    
    if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
        echo "⚠️  Warning: Email SMTP credentials not set"
        echo "   Order notification emails will not work"
    fi
fi

# Check static assets
echo "🖼️  Verifying static assets..."
if [ ! -d "assets" ]; then
    echo "⚠️  Warning: assets directory not found"
fi

# Validate basic structure
echo "🔍 Validating project structure..."
if [ ! -d "netlify/functions" ]; then
    echo "❌ Error: netlify/functions directory not found"
    exit 1
fi

# Check for admin directory
if [ ! -d "admin" ]; then
    echo "⚠️  Warning: admin directory not found"
fi

# Verify HTML files are valid
echo "📝 Basic HTML validation..."
for html_file in *.html; do
    if [ -f "$html_file" ]; then
        if ! grep -q "<html" "$html_file"; then
            echo "⚠️  Warning: $html_file may not be a valid HTML file"
        fi
    fi
done

echo "✅ Build completed successfully!"
echo "📄 Files ready for Netlify deployment"
echo ""
echo "📋 Deployment checklist:"
echo "   ✓ Static files validated"
echo "   ✓ Netlify functions verified"
echo "   ✓ Configuration files present" 
echo ""
echo "⚠️  Remember to set environment variables in Netlify dashboard!"
echo "   See .env.example for required variables"