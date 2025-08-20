# Divasity Platform - Production Ready Frontend

This is the production-ready frontend for the Divasity Platform, fully integrated with the backend API.

## 🚀 Production Features

- **Complete API Integration**: All endpoints from the production API are integrated
- **Dynamic Data**: All data is fetched from the backend API
- **User Authentication**: Full login/register/OTP verification flow
- **Role-based Dashboards**: Separate interfaces for creators and investors
- **Real-time Updates**: Live data from the API
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Toast Notifications**: User-friendly feedback system

## 📋 API Endpoints Used

### Authentication
- `POST /users/register` - User registration
- `POST /users/verifyotp` - OTP verification
- `POST /users/resendOtp` - Resend OTP
- `POST /users/login` - User login
- `POST /users/forgot-password` - Password reset request
- `POST /users/verify-otp` - Password reset verification

### User Management
- `GET /users/getuser` - Get all users
- `GET /users/getuser/{id}` - Get user by ID
- `PATCH /users/update/{id}` - Update user profile (username & telephone only)
- `POST /users/topup` - Top up user balance

### Projects
- `GET /projects` - Get all projects
- `GET /projects/{id}` - Get project by ID
- `POST /projects` - Create new project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Investments
- `POST /investments` - Create investment
- `GET /investments/my-investments` - Get user investments
- `GET /investments/stats` - Get investment statistics

### News
- `GET /news/getnews` - Get all news articles
- `POST /news/createNews` - Create news article (admin only)

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build:prod

# Or use the batch file (Windows)
build-production.bat
```

### Environment Variables
Create a `.env` file:
```
VITE_API_URL=http://52.91.158.172:3000/api
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── creator/        # Creator-specific pages
│   └── investor/       # Investor-specific pages
├── services/           # API services
│   ├── api.ts          # Main API service
│   └── dashboardService.ts # Dashboard data service
├── store/              # State management
├── utils/              # Utility functions
└── types/              # TypeScript types
```

## 🎯 Key Features Implemented

### Authentication System
- ✅ User registration with OTP verification
- ✅ Login with JWT token management
- ✅ Password reset with OTP
- ✅ Role-based access control

### Creator Dashboard
- ✅ Project management (create, update, delete)
- ✅ Real-time project statistics
- ✅ Wallet integration
- ✅ Settings (username & telephone editing only)

### Investor Dashboard
- ✅ Investment portfolio tracking
- ✅ Project discovery and investment
- ✅ Investment statistics
- ✅ Wallet management

### Data Management
- ✅ All data fetched from production API
- ✅ Real-time calculations (progress, days remaining, etc.)
- ✅ Dynamic content rendering
- ✅ Error handling and loading states

## 🚫 Removed Features (As Requested)

- ❌ Analytics pages (removed completely)
- ❌ Static/mock data (replaced with API data)
- ❌ Non-API endpoints
- ❌ Editable fields beyond username/telephone

## 🔧 API Integration Details

### Authentication Flow
1. User registers → API creates user and sends OTP
2. User verifies OTP → Account activated
3. User logs in → JWT token received and stored
4. Token used for all authenticated requests

### Data Flow
- **Projects**: Fetched from `/projects` endpoint
- **User Profile**: Retrieved from `/users/getuser/{id}`
- **Investments**: Loaded from `/investments/my-investments`
- **News**: Pulled from `/news/getnews`

### Error Handling
- Network errors handled gracefully
- User-friendly error messages
- Fallback states for failed requests
- Toast notifications for all actions

## 📱 Mobile Responsiveness

- Touch-friendly interface
- Mobile-first design approach
- Responsive navigation
- Optimized for all screen sizes

## 🔒 Security Features

- JWT token management
- Secure API communication
- Input validation
- XSS protection
- CSRF protection

## 🚀 Deployment

### Build Process
```bash
npm run build:prod
```

### Deployment Options
1. **Static Hosting**: Deploy `dist` folder to any static host
2. **CDN**: Upload to CDN for global distribution
3. **Docker**: Use provided Dockerfile for containerization

### Environment Configuration
- Development: `npm run dev`
- Production: `npm run build:prod`
- Preview: `npm run preview:prod`

## 📊 Performance Optimizations

- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📞 Support

For any issues or questions regarding the production deployment, please contact the development team.

## 🔄 Updates

This frontend is designed to work seamlessly with the production API. Any API changes should be reflected in the corresponding service files.

---

**Ready for Production Deployment** ✅