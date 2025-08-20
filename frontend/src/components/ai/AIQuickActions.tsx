import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  HelpCircle, 
  Calculator, 
  FileText,
  MessageSquare,
  Zap
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'investment' | 'project' | 'platform' | 'general';
  color: string;
}

interface AIQuickActionsProps {
  onActionClick: (prompt: string) => void;
  isLoading?: boolean;
  className?: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-project',
    label: 'Create Project',
    icon: <Lightbulb className="w-4 h-4" />,
    prompt: 'How do I create a successful crowdfunding project on Divasity? What are the key elements I need to include?',
    category: 'project',
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
  },
  {
    id: 'investment-tips',
    label: 'Investment Tips',
    icon: <TrendingUp className="w-4 h-4" />,
    prompt: 'What should I look for when evaluating investment opportunities on Divasity? Give me some tips for smart investing.',
    category: 'investment',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    id: 'platform-features',
    label: 'Platform Guide',
    icon: <Users className="w-4 h-4" />,
    prompt: 'Can you explain the main features of the Divasity platform and how to navigate them effectively?',
    category: 'platform',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    id: 'funding-calculator',
    label: 'Funding Help',
    icon: <Calculator className="w-4 h-4" />,
    prompt: 'Help me understand how to set realistic funding goals and calculate the amount I need for my project.',
    category: 'project',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    id: 'market-insights',
    label: 'Market Insights',
    icon: <FileText className="w-4 h-4" />,
    prompt: 'What are the current trends in the Nigerian startup and investment ecosystem? What opportunities should I know about?',
    category: 'general',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    id: 'networking',
    label: 'Networking',
    icon: <MessageSquare className="w-4 h-4" />,
    prompt: 'How can I effectively network with other entrepreneurs and investors on the Divasity platform?',
    category: 'platform',
    color: 'bg-pink-100 text-pink-700 hover:bg-pink-200'
  },
  {
    id: 'quick-start',
    label: 'Quick Start',
    icon: <Zap className="w-4 h-4" />,
    prompt: 'I\'m new to Divasity. Can you give me a quick overview of how to get started as an entrepreneur/investor?',
    category: 'general',
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
  },
  {
    id: 'help',
    label: 'Get Help',
    icon: <HelpCircle className="w-4 h-4" />,
    prompt: 'I need help with using the platform. Can you guide me through the most common questions and issues?',
    category: 'platform',
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }
];

const AIQuickActions: React.FC<AIQuickActionsProps> = ({
  onActionClick,
  isLoading = false,
  className = ''
}) => {
  const handleActionClick = (action: QuickAction) => {
    if (!isLoading) {
      onActionClick(action.prompt);
    }
  };

  return (
    <div className={`p-4 border-b border-gray-200 ?{className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-purple-500" />
        <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`p-3 rounded-lg text-left transition-all duration-200 ?{action.color} ?{
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
            disabled={isLoading}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center space-x-2 mb-1">
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </div>
            <p className="text-xs opacity-80 line-clamp-2">
              {action.prompt.split('?')[0]}?
            </p>
          </motion.button>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Click any action above or type your own question
        </p>
      </div>
    </div>
  );
};

export default AIQuickActions;
