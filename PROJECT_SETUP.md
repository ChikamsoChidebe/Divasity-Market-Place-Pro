# Divasity Platform - Complete Setup Guide

A modern, professional investment platform with React frontend and Node.js backend.

## 🏗️ Project Structure

```
Divasity_Platform_Pro/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── start.bat           # Windows startup script
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── services/       # Business logic
│   ├── data/              # Database files (auto-created)
│   ├── logs/              # Log files (auto-created)
│   ├── uploads/           # File uploads (auto-created)
│   ├── package.json
│   ├── server.js          # Main server file
│   └── start.bat          # Windows startup script
└── PROJECT_SETUP.md       # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Modern web browser

### 1. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm run dev

# Or use the Windows batch file
start.bat
```

The backend will be available at: http://localhost:5000

### 2. Start the Frontend

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev

# Or use the Windows batch file
start.bat
```

The frontend will be available at: http://localhost:5173

## 🔐 Default Login Credentials

### Admin Account
- **Email:** admin@divasity.com
- **Password:** Admin@123456

### Sample User Accounts
- **Email:** john.creator@example.com | **Password:** Password123!
- **Email:** jane.investor@example.com | **Password:** Password123!
- **Email:** mike.entrepreneur@example.com | **Password:** Password123!
- **Email:** sarah.innovator@example.com | **Password:** Password123!

## 🌟 Key Features

### Frontend Features
- **Modern React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Responsive Design** - Mobile-first approach
- **Role-based UI** - Different interfaces for users/admins

### Backend Features
- **RESTful API** - Complete CRUD operations
- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Admin/User permissions
- **Email Services** - OTP verification, notifications
- **File Upload Support** - Image and document handling
- **Input Validation** - Comprehensive validation rules
- **Rate Limiting** - API abuse protection
- **Professional Logging** - Winston-based logging
- **CORS Support** - Cross-origin resource sharing
- **Security Headers** - Helmet.js protection

## 📊 Sample Data

The backend automatically creates realistic sample data including:

### Projects
- Revolutionary Solar Panel Technology (Energy)
- AI-Powered Healthcare Diagnostics (Healthcare)
- Sustainable Urban Farming Platform (Agriculture)
- Blockchain-Based Supply Chain Tracker (Technology)
- Smart Water Management System (Environment) - FUNDED

### Investments
- Multiple investments across different projects
- Realistic return rates and success percentages
- Investment history and analytics

### News Articles
- Platform milestones and announcements
- Investment trends and analysis
- Success stories and updates

## 🔧 Configuration

### Backend Configuration (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=divasity_super_secure_jwt_secret_key_2024
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Configuration
- Automatically detects backend URL based on environment
- Development: http://localhost:5000/api
- Production: https://divasitybackendtest.onrender.com/api

## 📱 User Flows

### New User Registration
1. Register with email and personal details
2. Receive OTP via email
3. Verify OTP to activate account
4. Login and access dashboard

### Creating a Project
1. Login as a user
2. Navigate to Projects → Create Project
3. Fill in project details (name, category, funding goal, etc.)
4. Submit for review
5. Project appears in public listings

### Making an Investment
1. Browse available projects
2. Click on a project to view details
3. Enter investment amount
4. Confirm investment
5. Receive email confirmation
6. Track investment in dashboard

### Admin Functions
1. Login as admin
2. Access admin dashboard with platform analytics
3. Manage users, projects, and investments
4. Create news articles
5. Update investment outcomes

## 🛠️ Development

### Adding New Features

#### Frontend
1. Create components in `frontend/src/components/`
2. Add pages in `frontend/src/pages/`
3. Update types in `frontend/src/types/`
4. Add API calls in `frontend/src/services/`

#### Backend
1. Create controllers in `backend/src/controllers/`
2. Add routes in `backend/src/routes/`
3. Update validation in `backend/src/utils/validators.js`
4. Add middleware if needed in `backend/src/middleware/`

### Database Schema

The in-memory database uses the following collections:
- **users** - User accounts and profiles
- **projects** - Investment projects
- **investments** - User investments in projects
- **news** - News articles and announcements
- **otps** - Temporary OTP storage

## 🔍 API Endpoints

### Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - User login
- POST `/api/users/verifyotp` - Verify OTP
- POST `/api/users/forgot-password` - Password reset

### Projects
- GET `/api/projects` - List all projects
- POST `/api/projects` - Create new project
- GET `/api/projects/:id` - Get project details
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Investments
- POST `/api/investments` - Create investment
- GET `/api/investments/my-investments` - User's investments
- GET `/api/investments/stats` - Investment statistics

### News
- GET `/api/news/getnews` - List news articles
- POST `/api/news/createNews` - Create news (admin)
- GET `/api/news/:id` - Get news article

### Analytics
- GET `/api/analytics/dashboard` - Dashboard data
- GET `/api/analytics/platform-overview` - Platform stats (admin)

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up email service credentials
4. Deploy to cloud provider (AWS, Heroku, etc.)

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Update API base URL for production

## 🔒 Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (12 rounds)
- Rate limiting prevents API abuse
- Input validation and sanitization
- CORS protection
- Security headers with Helmet.js

## 📞 Support

### Common Issues
1. **Port already in use**: Change PORT in backend .env file
2. **Email not working**: Update EMAIL_USER and EMAIL_PASS in .env
3. **CORS errors**: Check frontend API base URL configuration
4. **Database not persisting**: Ensure backend/data directory exists

### Logs and Debugging
- Backend logs: `backend/logs/combined.log`
- Browser console for frontend errors
- Network tab for API request debugging

## 🎯 Next Steps

1. **Database Integration**: Replace in-memory DB with PostgreSQL/MongoDB
2. **File Storage**: Implement cloud storage for uploads
3. **Payment Integration**: Add Stripe/PayPal for real payments
4. **Real-time Updates**: WebSocket integration for live updates
5. **Mobile App**: React Native mobile application
6. **Advanced Analytics**: More detailed reporting and charts

---

**🎉 Your Divasity Platform is ready to go! Start both servers and begin exploring the features.**