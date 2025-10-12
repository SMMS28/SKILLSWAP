#!/bin/bash

# SkillSwap Local Network Setup Script
# This script configures your app to be accessible on your local network

echo "🌐 Setting up SkillSwap for Local Network Access..."

# Get the local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not determine local IP address. Please set it manually."
    echo "   Run: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    exit 1
fi

echo "📍 Your local IP address: $LOCAL_IP"

# Create or update .env file
echo "📝 Updating .env file for local network access..."

# Backup existing .env if it exists
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "💾 Backed up existing .env to .env.backup"
fi

# Create .env file for local network
cat > .env << EOF
# Local Network Configuration
PORT=5002
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
DB_PATH=./database/skillswap.db
CORS_ORIGIN=http://$LOCAL_IP:3000
SOCKET_CORS_ORIGIN=http://$LOCAL_IP:3000
EOF

echo "✅ .env file updated with local network settings"

# Update server.js to listen on all interfaces (if not already)
if ! grep -q "server.listen(PORT, '0.0.0.0'" server.js; then
    echo "🔧 Updating server.js to listen on all interfaces..."
    sed -i.bak "s/server.listen(PORT,/server.listen(PORT, '0.0.0.0',/g" server.js
    echo "✅ Server configuration updated"
fi

echo ""
echo "🎉 Setup complete! Your SkillSwap app will be accessible at:"
echo "   On this computer: http://localhost:5002"
echo "   On other devices: http://$LOCAL_IP:5002"
echo ""
echo "📱 To access from mobile devices:"
echo "   1. Connect your phone to the same WiFi network"
echo "   2. Open browser and go to: http://$LOCAL_IP:5002"
echo ""
echo "🚀 To start the application, run:"
echo "   ./scripts/start-production.sh"
echo ""
echo "⚠️  Note: Make sure your firewall allows connections on port 5002"
