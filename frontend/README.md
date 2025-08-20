# Divasity Platform Frontend

A modern React-based crowdfunding and investment platform built with TypeScript, Tailwind CSS, and advanced AI integration.

## 🚀 Features

### Core Platform
- **Multi-role Authentication**: Support for entrepreneurs, investors, and administrators
- **Project Management**: Create, manage, and discover crowdfunding projects
- **Investment Tracking**: Portfolio management and investment analytics
- **Real-time Messaging**: Communication between users
- **News & Updates**: Platform news and industry insights
- **Responsive Design**: Mobile-first approach with modern UI/UX

### AI Integration
- **Diva AI Assistant**: Powered by GroqAI with Llama 3 8B model
- **Voice Capabilities**: Speech-to-text and text-to-speech functionality
- **Contextual Help**: Platform-specific guidance and support
- **Multi-language Support**: Optimized for Nigerian market context
- **Smart Suggestions**: Quick actions and suggested questions
- **Chat Export**: Download conversation history

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **AI Integration**: GroqAI SDK
- **Voice Features**: Web Speech API
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd divasity-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GROQ_API_KEY=your_groq_api_key_here
   NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🤖 AI Assistant Setup

### GroqAI Configuration

1. **Get API Key**
   - Visit [GroqAI Console](https://console.groq.com)
   - Create an account and generate an API key
   - Add the key to your `.env` file

2. **Voice Features**
   - Speech recognition requires HTTPS in production
   - Microphone permissions needed for voice input
   - Text-to-speech works in all modern browsers

### AI Features

- **Contextual Assistance**: Understands Divasity platform context
- **Nigerian Market Focus**: Tailored for local ecosystem
- **Multi-modal Input**: Text and voice interactions
- **Smart Responses**: Powered by Llama 3 8B model
- **Conversation Memory**: Maintains chat context
- **Export Functionality**: Download chat history

## 🏗 Project Structure

```
src/
├── components/
│   ├── ai/                 # AI Assistant components
│   │   ├── AIWidget.tsx
│   │   ├── AIChatMessage.tsx
│   │   ├── AIQuickActions.tsx
│   │   └── ...
│   ├── layouts/            # Layout components
│   ├── ui/                 # Reusable UI components
│   └── ...
├── services/
│   ├── groqService.ts      # GroqAI integration
│   ├── speechService.ts    # Voice functionality
│   ├── authService.ts      # Authentication
│   └── ...
├── hooks/
│   ├── useAIChat.ts        # AI chat hook
│   └── ...
├── pages/                  # Page components
├── store/                  # State management
└── types/                  # TypeScript definitions
```

## 🎯 Usage

### AI Assistant

The AI assistant is available site-wide via the floating button in the bottom-right corner:

1. **Text Chat**: Type questions about the platform, investments, or projects
2. **Voice Input**: Click the microphone button to speak your question
3. **Quick Actions**: Use predefined prompts for common queries
4. **Settings**: Customize voice settings and preferences

### Voice Commands

- "How do I create a project?"
- "What investment opportunities are available?"
- "Explain the platform features"
- "Help me with funding calculations"

### Platform Navigation

- **Entrepreneurs**: `/creator/dashboard` - Project management and analytics
- **Investors**: `/investor/dashboard` - Portfolio and investment tracking
- **Administrators**: `/admin/dashboard` - Platform management

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow accessibility best practices
- Use Tailwind CSS for styling
- Implement proper error boundaries

## 🌍 Localization

The platform is optimized for the Nigerian market:

- **Currency**: Nigerian Naira (₦)
- **Time Zone**: West Africa Time (WAT)
- **Language**: English with local context
- **Business Hours**: 24/7 support mentioned
- **Contact**: Lagos-based office information

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interactions
- Mobile-specific navigation patterns
- Progressive Web App (PWA) ready

## 🔒 Security

- JWT-based authentication
- Role-based access control
- API key protection
- Input validation and sanitization
- HTTPS enforcement in production

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Ensure all production environment variables are set:

- `REACT_APP_API_URL`: Production API endpoint
- `REACT_APP_GROQ_API_KEY`: GroqAI API key
- `NODE_ENV`: Set to 'production'

### Hosting Recommendations

- **Vercel**: Optimal for React applications
- **Netlify**: Good alternative with easy deployment
- **AWS S3 + CloudFront**: Enterprise-grade hosting
- **Azure Static Web Apps**: Microsoft cloud solution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

- **Email**: mgt@divasity.com
- **Phone**: 0905 141 4444
- **Address**: C Close, 21 Road 2nd Ave, Festac Town, Lagos, Nigeria
- **Hours**: 24/7 Support Available

## 🔄 Updates

### Recent Changes

- ✅ AI Assistant integration with GroqAI
- ✅ Voice input and output capabilities
- ✅ Enhanced user experience with animations
- ✅ Mobile-responsive design improvements
- ✅ Nigerian market localization

### Upcoming Features

- 🔄 Advanced analytics dashboard
- 🔄 Real-time notifications
- 🔄 Enhanced messaging system
- 🔄 Mobile app development
- 🔄 Advanced AI features

---

Built with ❤️ for the Nigerian innovation ecosystem.