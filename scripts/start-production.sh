#!/bin/bash

# SkillSwap Production Startup Script
# This script helps you start your SkillSwap application in production mode

echo "🚀 Starting SkillSwap in Production Mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install client dependencies if needed
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Build the React application
echo "🔨 Building React application..."
npm run build

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f "config/.env.example" ]; then
        cp config/.env.example .env
        echo "📝 Please edit .env file with your production settings before starting."
        echo "   Important: Change JWT_SECRET and CORS_ORIGIN values!"
        exit 1
    else
        echo "❌ No .env.example file found. Please create .env file manually."
        exit 1
    fi
fi

# Create database directory if it doesn't exist
mkdir -p database

# Start the application
echo "🌟 Starting SkillSwap server..."
echo "   Frontend: http://localhost:5002"
echo "   API: http://localhost:5002/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
