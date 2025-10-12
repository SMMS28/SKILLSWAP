#!/bin/bash

# SkillSwap Screenshot Capture Script
# This script helps capture screenshots of the application for documentation

echo "📸 SkillSwap Screenshot Capture Script"
echo "======================================"
echo ""

# Check if the application is running
echo "🔍 Checking if the application is running..."

# Check if backend is running on port 5002
if ! curl -s http://localhost:5002/api/health > /dev/null; then
    echo "❌ Backend server is not running on port 5002"
    echo "   Please start the backend with: npm run dev"
    exit 1
fi

# Check if frontend is running on port 3000
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend server is not running on port 3000"
    echo "   Please start the frontend with: npm run client"
    exit 1
fi

echo "✅ Both servers are running!"
echo ""

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

echo "📱 Application is ready for screenshots!"
echo ""
echo "🌐 Open your browser and navigate to: http://localhost:3000"
echo ""
echo "📋 Screenshots to capture:"
echo "   1. Home Page (/)"
echo "   2. Login Page (/login)"
echo "   3. Register Page (/register)"
echo "   4. Dashboard (/dashboard) - after login"
echo "   5. Skills Page (/skills)"
echo "   6. Profile Page (/profile)"
echo "   7. Messages Page (/messages)"
echo "   8. Transactions Page (/transactions)"
echo "   9. Exchange Details (/exchanges/:id)"
echo "   10. Mobile View (resize browser window)"
echo ""
echo "💡 Tips for taking screenshots:"
echo "   - Use browser developer tools (F12) to capture full page screenshots"
echo "   - For mobile screenshots, use device emulation in dev tools"
echo "   - Save screenshots in the 'screenshots/' directory"
echo "   - Use descriptive filenames (e.g., 'home-page.png', 'login-form.png')"
echo ""
echo "🔑 Demo credentials for testing:"
echo "   Email: demo@example.com"
echo "   Password: password123"
echo ""
echo "   Or try other demo users:"
echo "   - anna@example.com / password123 (Swedish Language Teacher)"
echo "   - erik@example.com / password123 (React Developer)"
echo "   - maria@example.com / password123 (Yoga Instructor)"
echo ""

# Optional: Open browser automatically (uncomment if desired)
# echo "🚀 Opening browser..."
# open http://localhost:3000  # macOS
# xdg-open http://localhost:3000  # Linux
# start http://localhost:3000  # Windows

echo "📸 Ready to capture screenshots!"
echo "   Press Ctrl+C when you're done taking screenshots."
echo ""

# Keep script running
while true; do
    sleep 1
done
