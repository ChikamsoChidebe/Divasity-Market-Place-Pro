import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Mic, Volume2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ChatMessage } from '../../types/ai';

interface AIChatMessageProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
  onCopy?: (text: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  isSpeaking?: boolean;
  className?: string;
}

const AIChatMessage: React.FC<AIChatMessageProps> = ({
  message,
  onSpeak,
  onCopy,
  onFeedback,
  isSpeaking = false,
  className = ''
}) => {
  const isUser = message.role === 'user';
  const isVoice = message.isVoice;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message.content);
  };

  const handleSpeak = () => {
    onSpeak?.(message.content);
  };

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    onFeedback?.(message.id, feedback);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ?{isUser ? 'justify-end' : 'justify-start'} mb-4 group ?{className}`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ?{isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ?{
          isUser ? 'bg-purple-500' : 'bg-orange-500'
        }`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
        
        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 relative ?{
          isUser 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {/* Message header */}
          <div className="flex items-center space-x-2 mb-1">
            {isVoice && <Mic className="w-3 h-3 opacity-60" />}
            {isSpeaking && !isUser && <Volume2 className="w-3 h-3 opacity-60 animate-pulse" />}
            <span className="text-xs opacity-60">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          {/* Message content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {/* Action buttons for assistant messages */}
          {!isUser && (
            <div className={`flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                title="Copy message"
              >
                <Copy className="w-3 h-3 text-gray-500" />
              </button>
              
              {onSpeak && (
                <button
                  onClick={handleSpeak}
                  className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                  title="Read aloud"
                  disabled={isSpeaking}
                >
                  <Volume2 className={`w-3 h-3 ?{isSpeaking ? 'text-purple-500 animate-pulse' : 'text-gray-500'}`} />
                </button>
              )}
              
              {onFeedback && (
                <>
                  <button
                    onClick={() => handleFeedback('positive')}
                    className="p-1 hover:bg-orange-100 hover:text-orange-600 rounded transition-colors duration-200"
                    title="Good response"
                  >
                    <ThumbsUp className="w-3 h-3 text-gray-500" />
                  </button>
                  
                  <button
                    onClick={() => handleFeedback('negative')}
                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors duration-200"
                    title="Poor response"
                  >
                    <ThumbsDown className="w-3 h-3 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIChatMessage;
