# SkillSwap Setup Guide

This guide will help you set up the SkillSwap Learning Network on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation

```bash
node --version    # Should show v14 or higher
npm --version     # Should show 6 or higher
git --version     # Should show git version
```

## 🚀 Quick Setup (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillswap-learning-network.git
cd skillswap-learning-network
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup

```bash
# Copy environment template
cp config/env.example .env

# Create frontend environment file
echo "REACT_APP_SERVER_URL=http://localhost:5002" > client/.env
echo "PORT=3000" >> client/.env
```

### 4. Initialize Database

```bash
# Create and seed the database
npm run db:migrate
npm run db:seed
```

### 5. Start the Application

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run client
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002/api
- **Health Check**: http://localhost:5002/api/health

## 🎯 Test the Setup

1. **Open your browser** and go to http://localhost:3000
2. **Register a new account** or use demo credentials:
   - Email: `demo@example.com`
   - Password: `password123`
3. **Explore the features**:
   - Browse skills
   - Search for teachers
   - Create an exchange request

## 🔧 Detailed Configuration

### Backend Environment (.env)

```env
# Server Configuration
PORT=5002
NODE_ENV=development

# Database
DB_PATH=./database/skillswap.db

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# CORS Configuration (for local development)
CORS_ORIGIN=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment (client/.env)

```env
REACT_APP_SERVER_URL=http://localhost:5002
PORT=3000
```

## 🌐 Network Access Setup

To allow other devices on your network to access the application:

### 1. Find Your IP Address

**Windows:**
```cmd
ipconfig
```

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 2. Update Environment Files

**Backend (.env):**
```env
CORS_ORIGIN=http://localhost:3000,http://YOUR_IP:3000
SOCKET_CORS_ORIGIN=http://localhost:3000,http://YOUR_IP:3000
```

**Frontend (client/.env):**
```env
REACT_APP_SERVER_URL=http://YOUR_IP:5002
PORT=3000
```

### 3. Restart Servers

```bash
# Stop both servers (Ctrl+C)
# Then restart:
npm run dev
npm run client
```

### 4. Access from Other Devices

- **Your computer**: http://localhost:3000
- **Other devices**: http://YOUR_IP:3000

## 🗄️ Database Management

### Reset Database (WARNING: Deletes all data)

```bash
npm run db:reset
npm run db:seed
```

### Manual Database Access

```bash
# Open SQLite database
sqlite3 database/skillswap.db

# View tables
.tables

# View users
SELECT * FROM users;

# Exit
.quit
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:frontend
```

## 🚀 Production Setup

### 1. Build Frontend

```bash
npm run build
```

### 2. Set Production Environment

```env
NODE_ENV=production
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://yourdomain.com
```

### 3. Start Production Server

```bash
npm start
```

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Kill all Node processes
killall node

# Or find and kill specific process
lsof -ti:5002 | xargs kill
lsof -ti:3000 | xargs kill
```

### Database Issues

```bash
# Reset database
npm run db:reset
npm run db:seed

# Check database file
ls -la database/skillswap.db
```

### CORS Errors

1. Check your `.env` CORS configuration
2. Ensure frontend URL matches backend CORS settings
3. Restart both servers after changes

### Frontend Not Loading

1. Check if backend is running on port 5002
2. Verify `REACT_APP_SERVER_URL` in `client/.env`
3. Check browser console for errors

### Login Issues

1. Try demo credentials: `demo@example.com` / `password123`
2. Check backend logs for authentication errors
3. Verify JWT_SECRET is set in `.env`

## 📱 Mobile Testing

To test on mobile devices:

1. **Set up network access** (see Network Access Setup above)
2. **Connect mobile device to same WiFi network**
3. **Open browser** and go to `http://YOUR_IP:3000`
4. **Test responsive design** and touch interactions

## 🔍 Development Tips

### Hot Reloading

- Backend: Automatically restarts with nodemon
- Frontend: Automatically reloads with React hot reload

### Debugging

- **Backend**: Check terminal logs
- **Frontend**: Use browser developer tools
- **Database**: Use SQLite browser or command line

### Code Structure

- **Backend**: Express.js with SQLite
- **Frontend**: React with Material-UI
- **Real-time**: Socket.IO for messaging
- **Authentication**: JWT tokens

## 📞 Getting Help

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review the logs** in your terminal
3. **Check browser console** for frontend errors
4. **Create an issue** on GitHub with:
   - Error messages
   - Steps to reproduce
   - Your environment details

## 🎉 Success!

If everything is working correctly, you should see:

- ✅ Backend server running on port 5002
- ✅ Frontend server running on port 3000
- ✅ Database initialized with demo data
- ✅ Login working with demo credentials
- ✅ Skills page showing available skills
- ✅ Real-time messaging working

**Happy coding! 🚀**
