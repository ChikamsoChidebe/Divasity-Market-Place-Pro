# Divasity Platform API Documentation

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://api.divasity.com`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "error": false,
  "message": "Success message",
  "data": { ... }
}
```

---

## 🔐 User Routes (`/api/users`)

### Public Routes

#### Register User
- **POST** `/api/users/register`
- **Body**:
```json
{
  "firstName": "string",
  "lastName": "string", 
  "userName": "string",
  "email": "string",
  "telephone": "string",
  "address": "string",
  "password": "string",
  "role": "user|investor|admin"
}
```

#### Verify OTP
- **POST** `/api/users/verifyotp`
- **Body**:
```json
{
  "email": "string",
  "otp": "string"
}
```

#### Resend OTP
- **POST** `/api/users/resendOtp`
- **Body**:
```json
{
  "email": "string"
}
```

#### Login User
- **POST** `/api/users/login`
- **Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

#### Forgot Password
- **POST** `/api/users/forgot-password`
- **Body**:
```json
{
  "email": "string"
}
```

#### Verify OTP & Reset Password
- **POST** `/api/users/verify-otp`
- **Body**:
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

### Protected Routes

#### Get All Users (Admin Only)
- **GET** `/api/users/getuser`
- **Auth**: Required (Admin)

#### Get User by ID
- **GET** `/api/users/getuser/:id`
- **Auth**: Required
- **Params**: `id` (UUID)

#### Update User Profile
- **PATCH** `/api/users/update/:id`
- **Auth**: Required (User or Admin)
- **Params**: `id` (UUID)
- **Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "telephone": "string",
  "address": "string"
}
```

---

## 🚀 Project Routes (`/api/projects`)

### Public Routes

#### Get All Projects
- **GET** `/api/projects/`
- **Query Params**: `page`, `limit`, `category`, `status`

#### Get Project Statistics
- **GET** `/api/projects/statistics`

#### Get Project by ID
- **GET** `/api/projects/single/:id`
- **Params**: `id` (UUID)

#### Get Projects by User ID
- **GET** `/api/projects/:id`
- **Params**: `id` (User UUID)

### Protected Routes

#### Create Project
- **POST** `/api/projects/`
- **Auth**: Required
- **Body**:
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "fundingGoal": "number",
  "deadline": "date",
  "images": ["string"],
  "rewards": [
    {
      "title": "string",
      "description": "string",
      "amount": "number"
    }
  ]
}
```

#### Update Project
- **PUT** `/api/projects/:id`
- **Auth**: Required (Project Owner)
- **Params**: `id` (UUID)

#### Delete Project
- **DELETE** `/api/projects/:id`
- **Auth**: Required (Project Owner)
- **Params**: `id` (UUID)

### Admin Routes

#### Update Project Status
- **PATCH** `/api/projects/:id/status`
- **Auth**: Required (Admin)
- **Params**: `id` (UUID)
- **Body**:
```json
{
  "status": "OPEN|FUNDED|CANCELLED|COMPLETED"
}
```

---

## 💰 Investment Routes (`/api/investments`)

All investment routes require authentication.

### User Routes

#### Create Investment
- **POST** `/api/investments/`
- **Auth**: Required
- **Body**:
```json
{
  "projectId": "string",
  "amount": "number",
  "expectedReturn": "number",
  "riskLevel": "LOW|MEDIUM|HIGH"
}
```

#### Get User Investments
- **GET** `/api/investments/my-investments`
- **Auth**: Required
- **Query Params**: `page`, `limit`

#### Get User Investment Stats
- **GET** `/api/investments/stats`
- **Auth**: Required

#### Get Investment by ID
- **GET** `/api/investments/:id`
- **Auth**: Required
- **Params**: `id` (UUID)

### Admin Routes

#### Get All Investments
- **GET** `/api/investments/`
- **Auth**: Required (Admin)
- **Query Params**: `page`, `limit`

#### Update Investment Outcome
- **PUT** `/api/investments/:investmentId/outcome`
- **Auth**: Required (Admin)
- **Params**: `investmentId` (UUID)
- **Body**:
```json
{
  "outcome": "SUCCESS|FAILURE",
  "actualReturn": "number",
  "notes": "string"
}
```

#### Get Investment Analytics
- **GET** `/api/investments/analytics/overview`
- **Auth**: Required (Admin)

---

## 📰 News Routes (`/api/news`)

### Public Routes

#### Get All News
- **GET** `/api/news/getnews`
- **Query Params**: `page`, `limit`

#### Get News Categories
- **GET** `/api/news/categories`

#### Get News by Category
- **GET** `/api/news/category/:category`
- **Params**: `category` (string)
- **Query Params**: `page`, `limit`

#### Get News by User ID
- **GET** `/api/news/user/:userId`
- **Params**: `userId` (UUID)
- **Query Params**: `page`, `limit`

#### Get News by ID
- **GET** `/api/news/:id`
- **Params**: `id` (UUID)

### Admin Routes

#### Create News
- **POST** `/api/news/createNews`
- **Auth**: Required (Admin)
- **Body**:
```json
{
  "Newstitle": "string",
  "Newscontent": "string",
  "Newsimage": "string",
  "links": "string",
  "categories": ["string"]
}
```

#### Update News
- **PUT** `/api/news/:id`
- **Auth**: Required
- **Params**: `id` (UUID)

#### Delete News
- **DELETE** `/api/news/:id`
- **Auth**: Required
- **Params**: `id` (UUID)

#### Get News Statistics
- **GET** `/api/news/statistics/overview`
- **Auth**: Required (Admin)

---

## 📊 Analytics Routes (`/api/analytics`)

All analytics routes require authentication.

### User/Admin Routes

#### Get Dashboard Analytics
- **GET** `/api/analytics/dashboard`
- **Auth**: Required
- **Description**: Returns different data based on user role (admin vs regular user)

### Admin Only Routes

#### Get Platform Overview
- **GET** `/api/analytics/platform-overview`
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "totals": {
    "users": "number",
    "projects": "number", 
    "investments": "number",
    "newsArticles": "number",
    "totalFunding": "number"
  },
  "growth": {
    "newUsersLast30Days": "number",
    "newProjectsLast30Days": "number",
    "newInvestmentsLast30Days": "number",
    "fundingLast30Days": "number"
  },
  "categories": {},
  "monthlyTrends": {}
}
```

#### Get Investment Performance
- **GET** `/api/analytics/investment-performance`
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "overview": {
    "totalInvestments": "number",
    "totalAmount": "number",
    "averageInvestment": "number",
    "averageSuccessRate": "number"
  },
  "byCategory": {},
  "topProjects": [],
  "topInvestors": []
}
```

#### Get User Engagement
- **GET** `/api/analytics/user-engagement`
- **Auth**: Required (Admin)
- **Response**:
```json
{
  "userStats": {
    "total": "number",
    "verified": "number",
    "active": "number"
  },
  "engagement": {
    "usersWithProjects": "number",
    "usersWithInvestments": "number",
    "averageProjectsPerUser": "number",
    "averageInvestmentsPerUser": "number"
  },
  "registrationTrends": {}
}
```

---

## 🔧 Utility Routes

### Health Check
- **GET** `/health`
- **Description**: Check API health status
- **Response**:
```json
{
  "status": "OK",
  "timestamp": "ISO date",
  "uptime": "number",
  "environment": "string",
  "version": "string"
}
```

### API Info
- **GET** `/api`
- **Description**: Get API information and available endpoints

---

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for development and production origins
- **Helmet**: Security headers
- **Input Validation**: All inputs validated and sanitized
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, User, and Investor roles

---

## 📝 Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

## 🔄 Pagination

For endpoints that support pagination:
- **Query Params**: `page` (default: 1), `limit` (default: 10, max: 100)
- **Response includes**: `totalItems`, `totalPages`, `currentPage`, `hasNextPage`, `hasPrevPage`

---

## 📋 Data Models

### User
```json
{
  "id": "UUID",
  "firstName": "string",
  "lastName": "string",
  "userName": "string",
  "email": "string",
  "telephone": "string",
  "address": "string",
  "role": "user|investor|admin",
  "IsVerified": "boolean",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### Project
```json
{
  "id": "UUID",
  "userId": "UUID",
  "name": "string",
  "description": "string",
  "category": "string",
  "fundingGoal": "number",
  "currentFunding": "number",
  "deadline": "ISO date",
  "status": "OPEN|FUNDED|CANCELLED|COMPLETED",
  "images": ["string"],
  "rewards": [{}],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### Investment
```json
{
  "id": "UUID",
  "userId": "UUID",
  "projectId": "UUID",
  "amount": "number",
  "expectedReturn": "number",
  "actualReturn": "number",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "status": "PENDING|ACTIVE|COMPLETED|FAILED",
  "successRate": "number",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### News
```json
{
  "Newsid": "UUID",
  "UserId": "UUID",
  "Newstitle": "string",
  "Newscontent": "string",
  "Newsimage": "string",
  "links": "string",
  "categories": ["string"],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```