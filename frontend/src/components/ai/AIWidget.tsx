import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Minimize2,
  Maximize2,
  Settings,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import speechService from '../../services/speechService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
}

interface AIWidgetProps {
  className?: string;
}

interface WidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  showSettings: boolean;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const AIWidget: React.FC<AIWidgetProps> = ({ className = '' }) => {
  // State management
  const [state, setState] = useState<WidgetState>({
    isOpen: false,
    isMinimized: false,
    isLoading: false,
    isListening: false,
    isSpeaking: false,
    voiceEnabled: true,
    autoSpeak: true,
    showSettings: false
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1.1,
    volume: 0.8,
    voice: ''
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize voice settings
  useEffect(() => {
    if (speechService.isSpeechSynthesisSupported()) {
      const recommended = speechService.getRecommendedVoiceSettings();
      setVoiceSettings(recommended);
    }
  }, []);

  // Load chat history on mount
  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Diva, your AI assistant. How can I help you with Divasity today?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show notification
  const showNotification = useCallback((message: string, type: NotificationState['type'] = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Update state helper
  const updateState = useCallback((updates: Partial<WidgetState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle sending message
  const handleSendMessage = useCallback(async (text: string, isVoice: boolean = false) => {
    if (!text.trim()) return;

    updateState({ isLoading: true });
    setInputText('');

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Thank you for your message. The AI service is currently being configured. Please contact support for assistance.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
        updateState({ isLoading: false });

        // Auto-speak response if enabled
        if (state.voiceEnabled && state.autoSpeak && speechService.isSpeechSynthesisSupported()) {
          updateState({ isSpeaking: true });
          speechService.textToSpeech(aiResponse.content, voiceSettings)
            .catch(error => console.error('Text-to-speech error:', error))
            .finally(() => updateState({ isSpeaking: false }));
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message. Please try again.', 'error');
      updateState({ isLoading: false });
    }
  }, [state.voiceEnabled, state.autoSpeak, voiceSettings, showNotification, updateState]);

  // Handle voice input
  const handleVoiceInput = useCallback(async () => {
    if (!speechService.isSpeechRecognitionSupported()) {
      showNotification('Voice input not supported in this browser', 'error');
      return;
    }

    if (state.isListening) {
      speechService.stopListening();
      updateState({ isListening: false });
      return;
    }

    updateState({ isListening: true });
    showNotification('Listening... Speak now', 'info');

    try {
      const transcript = await speechService.speechToText(10000);
      if (transcript.trim()) {
        await handleSendMessage(transcript, true);
        showNotification('Voice message processed!', 'success');
      }
    } catch (error) {
      console.error('Voice input error:', error);
      showNotification('Voice input failed. Please try again.', 'error');
    } finally {
      updateState({ isListening: false });
    }
  }, [state.isListening, handleSendMessage, showNotification, updateState]);

  // Handle text input submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  }, [inputText, handleSendMessage]);

  // Handle suggested question click
  const handleSuggestedQuestion = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  // Clear chat history
  const handleClearHistory = useCallback(() => {
    setMessages([]);
    showNotification('Chat history cleared', 'success');
  }, [showNotification]);

  // Export chat history
  const handleExportHistory = useCallback(() => {
    try {
      const exportText = messages.map(msg => 
        `[${msg.timestamp.toLocaleString()}] ${msg.role}: ${msg.content}`
      ).join('\n');
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `divasity-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Chat history exported!', 'success');
    } catch (error) {
      showNotification('Failed to export chat history', 'error');
    }
  }, [messages, showNotification]);

  // Stop speaking
  const handleStopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    updateState({ isSpeaking: false });
  }, [updateState]);

  // Toggle widget open/close
  const toggleWidget = useCallback(() => {
    updateState({ isOpen: !state.isOpen, isMinimized: false });
  }, [state.isOpen, updateState]);

  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    updateState({ isMinimized: !state.isMinimized });
  }, [state.isMinimized, updateState]);

  // Render message
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const isVoice = message.isVoice;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className={`flex items-start space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-purple-500' : 'bg-gradient-to-r from-purple-500 to-orange-500'
          }`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          
          <div className={`rounded-xl px-3 py-2 relative ${
            isUser 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              {isVoice && <Mic className="w-3 h-3 opacity-60" />}
              <span className="text-xs opacity-60">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            
            {/* Message status for user messages */}
            {isUser && (
              <div className="absolute bottom-1 right-2 flex space-x-0.5">
                <div className="w-3 h-3 text-purple-200">
                  <svg viewBox="0 0 16 15" className="fill-current">
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L3.724 9.587a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Render floating suggested questions
  const renderSuggestedQuestions = () => {
    if (messages.length > 0) return null;

    const questions = [
      "How do I create a project?",
      "Investment opportunities?",
      "Platform features?",
      "Contact support?"
    ];

    return (
      <div className="absolute bottom-16 left-3 right-3 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg p-3">
          <div className="flex items-center mb-2">
            <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
            <span className="text-xs font-medium text-gray-600">Quick questions</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-2 rounded transition-colors duration-200 border border-gray-100 hover:border-purple-200"
                disabled={false}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render settings panel
  const renderSettings = () => {
    if (!state.showSettings) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            AI Assistant Settings
          </h3>
          <button
            onClick={() => updateState({ showSettings: false })}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Voice Responses</label>
            <button
              onClick={() => updateState({ autoSpeak: !state.autoSpeak })}
              className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                state.autoSpeak ? 'bg-gradient-to-r from-purple-500 to-orange-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                state.autoSpeak ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Voice Input</label>
            <button
              onClick={() => updateState({ voiceEnabled: !state.voiceEnabled })}
              className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                state.voiceEnabled ? 'bg-gradient-to-r from-purple-500 to-orange-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                state.voiceEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-2">Speech Rate</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{voiceSettings.rate}x</span>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-2">Speech Pitch</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{voiceSettings.pitch}</span>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleClearHistory}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear History</span>
            </button>
            <button
              onClick={handleExportHistory}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex items-center space-x-2 max-w-sm"
          >
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-orange-500" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            {notification.type === 'info' && <AlertCircle className="w-4 h-4 text-purple-500" />}
            <span className="text-sm text-gray-700">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Widget */}
      <div ref={widgetRef} className={`fixed bottom-20 right-4 z-40 ${className}`}>
        {/* Settings Panel */}
        <AnimatePresence>
          {renderSettings()}
        </AnimatePresence>

        {/* Main Widget */}
        <AnimatePresence>
          {state.isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className={`mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${
                state.isMinimized ? 'w-72 h-14' : 'w-72 h-[380px]'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Diva AI Assistant</h3>
                      <p className="text-xs opacity-80">
                        {state.isLoading ? 'Thinking...' : 
                         state.isListening ? 'Listening...' : 
                         state.isSpeaking ? 'Speaking...' : 'Online'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {state.isSpeaking && (
                      <button
                        onClick={handleStopSpeaking}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <VolumeX className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => updateState({ showSettings: !state.showSettings })}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={toggleMinimize}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                      {state.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={toggleWidget}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {!state.isMinimized && (
                <div className="relative">
                  {/* Floating Suggested Questions */}
                  {renderSuggestedQuestions()}
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 h-60">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">Hi! I'm Diva, your AI assistant.</p>
                        <p className="text-xs mt-1">How can I help you with Divasity today?</p>
                      </div>
                    ) : (
                      messages.map(renderMessage)
                    )}
                    
                    {state.isLoading && (
                      <div className="flex justify-start mb-2">
                        <div className="flex items-start space-x-2 max-w-[85%]">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-orange-500">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-gray-100 rounded-xl px-3 py-2 border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-4" />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Ask me anything about Divasity..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          disabled={state.isListening}
                        />
                        
                        {state.isListening && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      
                      {state.voiceEnabled && speechService.isSpeechRecognitionSupported() && (
                        <button
                          type="button"
                          onClick={handleVoiceInput}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            state.isListening 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          disabled={false}
                        >
                          {state.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        className="p-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-full hover:from-purple-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!inputText.trim() || state.isListening}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={toggleWidget}
          className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={state.isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={state.isListening ? { repeat: Infinity, duration: 1 } : {}}
        >
          <AnimatePresence mode="wait">
            {state.isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
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
                <MessageCircle className="w-5 h-5" />
                {(state.isListening || state.isSpeaking) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default AIWidget;
