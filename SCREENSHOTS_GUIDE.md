# 📸 Screenshots Guide for SkillSwap

This guide will help you capture high-quality screenshots of the SkillSwap Learning Network application for documentation and presentation purposes.

## 🚀 Quick Start

### 1. Start the Application
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
npm run client
```

### 2. Run Screenshot Helper Script
```bash
./scripts/take-screenshots.sh
```

### 3. Open Browser
Navigate to: http://localhost:3000

## 📱 Screenshots to Capture

### 🏠 **Home Page** (`home-page.png`)
- **URL**: http://localhost:3000
- **Description**: Landing page with hero section
- **Key Elements**:
  - Hero banner with "Connect with skilled individuals across Sweden"
  - Feature cards (Browse Skills, Create Exchanges, Earn Points)
  - Statistics section (Swedish Users, Skills Available, Exchanges Completed)
  - Call-to-action buttons

### 🔐 **Authentication Pages**

#### Login Page (`login-page.png`)
- **URL**: http://localhost:3000/login
- **Key Elements**:
  - Email and password fields
  - "Login" button
  - "Don't have an account? Register here" link
  - Demo credentials note (if added)

#### Register Page (`register-page.png`)
- **URL**: http://localhost:3000/register
- **Key Elements**:
  - Registration form with all fields
  - Swedish location placeholder
  - Terms acceptance checkbox
  - "Register" button

### 📊 **Dashboard** (`dashboard-page.png`)
- **URL**: http://localhost:3000/dashboard
- **Login Required**: Use `demo@example.com` / `password123`
- **Key Elements**:
  - Welcome message with user name
  - Recent activity section
  - Quick action buttons
  - Navigation sidebar

### 🎯 **Skills & Search**

#### Skills Page (`skills-page.png`)
- **URL**: http://localhost:3000/skills
- **Key Elements**:
  - Available skills list
  - Search bar
  - Category filters
  - Teacher cards with ratings

#### Search Results (`skill-search-results.png`)
- **URL**: http://localhost:3000/skills (after searching)
- **Action**: Search for "Swedish" or "React"
- **Key Elements**:
  - Search results
  - Teacher profiles
  - Skill levels and locations
  - "Request Exchange" buttons

### 👤 **User Profiles**

#### Own Profile (`profile-page-own.png`)
- **URL**: http://localhost:3000/profile
- **Key Elements**:
  - Personal information
  - Offered skills
  - Points balance (visible to owner)
  - Edit profile button

#### Other User Profile (`profile-page-other.png`)
- **URL**: http://localhost:3000/profile/[user-id]
- **Key Elements**:
  - User information
  - Offered skills
  - Ratings and reviews
  - Points balance hidden

### 💬 **Exchange Management**

#### Exchange Details (`exchange-details.png`)
- **URL**: http://localhost:3000/exchanges/[exchange-id]
- **Prerequisites**: Create an exchange first
- **Key Elements**:
  - Exchange information
  - Real-time chat panel
  - Status indicators
  - Rating section (if completed)

#### Create Exchange (`exchange-creation.png`)
- **URL**: http://localhost:3000/skills (click "Request Exchange")
- **Key Elements**:
  - Skill selection
  - Scheduling options
  - Description field
  - Points calculation
  - Submit button

### 💰 **Transaction History** (`transactions-page.png`)
- **URL**: http://localhost:3000/transactions
- **Key Elements**:
  - Transaction list with pagination
  - Summary cards (Total Earned, Total Spent, Total Transactions)
  - Transaction details (amount, type, description)
  - Date formatting

### 📨 **Messages** (`messages-page.png`)
- **URL**: http://localhost:3000/messages
- **Key Elements**:
  - Conversation list
  - Unread message indicators
  - Last message previews
  - User avatars

### 🔔 **Notifications** (`notifications-center.png`)
- **URL**: Click notification bell in navbar
- **Key Elements**:
  - Notification list
  - Read/unread status
  - Action buttons
  - Timestamps

### 🧭 **Navigation**

#### Desktop Navbar (`navbar-desktop.png`)
- **Key Elements**:
  - Logo and brand name
  - Navigation links
  - User avatar and menu
  - Points balance chip

#### Mobile Navigation (`navbar-mobile.png`)
- **Action**: Resize browser to mobile width or use dev tools
- **Key Elements**:
  - Hamburger menu
  - Drawer navigation
  - Mobile-optimized layout

## 📱 Mobile Screenshots

### Responsive Design
1. **Open Developer Tools** (F12)
2. **Toggle Device Toolbar** (Ctrl+Shift+M)
3. **Select Device**: iPhone 12 Pro or similar
4. **Capture screenshots** of key pages

### Mobile Pages to Capture:
- `home-page-mobile.png`
- `login-page-mobile.png`
- `dashboard-mobile.png`
- `skills-page-mobile.png`
- `profile-page-mobile.png`

## 🎨 Screenshot Best Practices

### Browser Settings
- **Use Chrome or Firefox** for best results
- **Full-screen mode** (F11) for desktop screenshots
- **High DPI/Retina display** for crisp images
- **Clear browser cache** before taking screenshots

### Image Quality
- **Resolution**: Minimum 1920x1080 for desktop
- **Format**: PNG for best quality
- **File size**: Optimize for web (under 1MB per image)
- **Naming**: Use descriptive, lowercase filenames

### Content Guidelines
- **Use demo data** for consistent results
- **Login with demo@example.com** for standard user experience
- **Create sample exchanges** to show full functionality
- **Include error states** if relevant

## 🛠️ Tools for Screenshots

### Browser Extensions
- **Full Page Screen Capture** (Chrome)
- **FireShot** (Firefox/Chrome)
- **Awesome Screenshot** (Cross-browser)

### Built-in Tools
- **Chrome DevTools**: Device emulation + screenshot
- **Firefox DevTools**: Responsive design mode
- **Safari**: Develop menu > Responsive Design Mode

### Command Line (Optional)
```bash
# Using Puppeteer (if installed)
npx puppeteer screenshot --url http://localhost:3000 --output screenshots/home-page.png

# Using Playwright (if installed)
npx playwright screenshot --url http://localhost:3000 --output screenshots/home-page.png
```

## 📁 File Organization

```
screenshots/
├── README.md
├── home-page.png
├── login-page.png
├── register-page.png
├── dashboard-page.png
├── skills-page.png
├── skill-search-results.png
├── profile-page-own.png
├── profile-page-other.png
├── exchange-details.png
├── exchange-creation.png
├── transactions-page.png
├── messages-page.png
├── notifications-center.png
├── navbar-desktop.png
├── navbar-mobile.png
├── home-page-mobile.png
├── login-page-mobile.png
├── dashboard-mobile.png
├── skills-page-mobile.png
└── profile-page-mobile.png
```

## 🎯 Demo Scenarios

### Scenario 1: New User Journey
1. **Home page** → **Register** → **Dashboard** → **Browse Skills** → **Create Exchange**

### Scenario 2: Teacher Experience
1. **Login as Anna** (anna@example.com) → **Profile** → **View Exchange Requests** → **Accept Exchange**

### Scenario 3: Exchange Completion
1. **Create exchange** → **Accept exchange** → **Complete exchange** → **Rate exchange** → **View transaction**

## 🔧 Troubleshooting

### Application Not Loading
- Check if both servers are running
- Verify ports 3000 and 5002 are available
- Check browser console for errors

### Screenshots Not Clear
- Increase browser zoom to 100%
- Use high-resolution display
- Clear browser cache
- Disable browser extensions temporarily

### Missing Demo Data
- Run `npm run db:seed` to populate demo data
- Check database connection
- Verify demo users exist

## 📤 Adding to Repository

After capturing screenshots:

```bash
# Add screenshots to git
git add screenshots/

# Commit with descriptive message
git commit -m "Add application screenshots for documentation"

# Push to repository
git push origin main
```

## 🎉 Final Checklist

- [ ] All major pages captured
- [ ] Mobile responsive screenshots included
- [ ] Demo data properly displayed
- [ ] Images optimized for web
- [ ] Descriptive filenames used
- [ ] Screenshots added to repository
- [ ] README.md updated with image descriptions

---

**Happy Screenshotting! 📸✨**
