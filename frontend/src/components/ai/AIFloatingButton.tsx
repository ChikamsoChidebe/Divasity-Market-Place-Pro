import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mic, Volume2 } from 'lucide-react';

interface AIFloatingButtonProps {
  isOpen: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
  className?: string;
}

const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({
  isOpen,
  isListening,
  isSpeaking,
  onClick,
  className = ''
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`w-14 h-14 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative ?{className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isListening ? { scale: [1, 1.1, 1] } : {}}
      transition={isListening ? { repeat: Infinity, duration: 1 } : {}}
    >
      {/* Status indicators */}
      {(isListening || isSpeaking) && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
      
      {/* Ripple effect for listening */}
      {isListening && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full bg-orange-400 animate-pulse opacity-20" />
        </div>
      )}
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
          <Volume2 className="w-2 h-2 text-white" />
        </div>
      )}
      
      {/* Main icon */}
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <MessageCircle className="w-6 h-6" />
            {isListening && (
              <Mic className="absolute -top-1 -right-1 w-3 h-3 text-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {isOpen ? 'Close AI Assistant' : 
         isListening ? 'Listening...' : 
         isSpeaking ? 'Speaking...' : 
         'Open AI Assistant'}
      </div>
    </motion.button>
  );
};

export default AIFloatingButton;
