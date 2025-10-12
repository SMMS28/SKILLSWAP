# SkillSwap Learning Network

A peer-to-peer skill exchange platform built with React and Node.js, designed for Swedish learners to connect and share knowledge.

## 🌟 Features

- **User Authentication**: Secure registration and login system
- **Skill Discovery**: Browse and search for available skills and teachers
- **Exchange Management**: Create, accept, and manage learning exchanges
- **Real-time Messaging**: Chat with teachers/students during exchanges
- **Points System**: Earn and spend points for learning sessions
- **Transaction History**: Track all your points transactions
- **Notifications**: Real-time notifications for exchange updates
- **Rating System**: Rate completed exchanges (students rate teachers)
- **Swedish Localization**: Optimized for Swedish users and locations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillswap-learning-network.git
   cd skillswap-learning-network
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp config/env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Initialize the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   # Start backend server (Terminal 1)
   npm run dev
   
   # Start frontend server (Terminal 2)
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5002/api

## 🎯 Demo Credentials

The application comes with demo data. You can login with:

| Email | Password | Role |
|-------|----------|------|
| `demo@example.com` | `password123` | Demo User |
| `test@test.com` | `123456` | Test User |
| `anna@example.com` | `password123` | Swedish Language Teacher |
| `erik@example.com` | `password123` | React/Node.js Developer |
| `maria@example.com` | `password123` | Yoga Instructor |
| `lars@example.com` | `password123` | Photographer |
| `sofia@example.com` | `password123` | Chef |

## 🛠️ Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:reset` - Reset database (WARNING: Deletes all data)

### Frontend Scripts
- `npm run client` - Start React development server
- `npm run build` - Build for production

### Testing Scripts
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:frontend` - Run frontend tests

## 📁 Project Structure

```
skillswap-learning-network/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── config/        # Configuration files
│   └── package.json       # Frontend dependencies
├── config/                # Configuration files
│   ├── .env.example       # Environment variables template
│   └── jest.config.js     # Jest testing configuration
├── database/              # Database files
│   ├── schema.sql         # Database schema
│   ├── migrations.js      # Migration scripts
│   └── skillswap.db       # SQLite database
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── skills.js         # Skills management routes
│   ├── exchanges.js      # Exchange management routes
│   └── notifications.js  # Notification routes
├── services/              # Business logic services
├── tests/                 # Test files
├── server.js             # Main server file
└── package.json          # Backend dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5002
NODE_ENV=production

# Database
DB_PATH=./database/skillswap.db

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://192.168.0.103:3000
SOCKET_CORS_ORIGIN=http://localhost:3000,http://192.168.0.103:3000
```

### Frontend Configuration

Create a `client/.env` file:

```env
REACT_APP_SERVER_URL=http://localhost:5002
PORT=3000
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/my-transactions` - Get user's transaction history

### Skills
- `GET /api/skills/available` - Get available skills
- `GET /api/skills/search` - Search skills
- `POST /api/skills` - Add new skill

### Exchanges
- `POST /api/exchanges/create` - Create new exchange
- `GET /api/exchanges/my-exchanges` - Get user's exchanges
- `PUT /api/exchanges/:id/accept` - Accept exchange
- `PUT /api/exchanges/:id/status` - Update exchange status
- `POST /api/exchanges/:id/rate` - Rate completed exchange

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## 🧪 Testing

The project includes comprehensive testing:

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

## 🚀 Deployment

### Local Network Access

To allow other devices on your network to access the application:

1. Update `.env` with your local IP:
   ```env
   CORS_ORIGIN=http://localhost:3000,http://YOUR_IP:3000
   SOCKET_CORS_ORIGIN=http://localhost:3000,http://YOUR_IP:3000
   ```

2. Update `client/.env`:
   ```env
   REACT_APP_SERVER_URL=http://YOUR_IP:5002
   ```

3. Start the servers:
   ```bash
   npm run dev
   npm run client
   ```

### Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**: Kill existing Node processes with `killall node`
2. **CORS errors**: Check your `.env` CORS configuration
3. **Database errors**: Reset the database with `npm run db:reset`
4. **Frontend not connecting**: Verify `REACT_APP_SERVER_URL` in `client/.env`

### Getting Help

- Check the [Issues](https://github.com/yourusername/skillswap-learning-network/issues) page
- Create a new issue with detailed description
- Include error logs and environment details

## 🎉 Acknowledgments

- Built with React and Node.js
- Uses Material-UI for components
- SQLite for data persistence
- Socket.IO for real-time communication
- Designed for the Swedish learning community

---

**Happy Learning! 🎓**