import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import groqService from '../../services/groqService';
import speechService from '../../services/speechService';
import { ChatMessage, VoiceSettings } from '../../types/ai';

interface AIWidgetContextType {
  // Widget state
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  
  // Settings
  voiceEnabled: boolean;
  autoSpeak: boolean;
  voiceSettings: VoiceSettings;
  
  // Messages
  messages: ChatMessage[];
  
  // Actions
  toggleWidget: () => void;
  toggleMinimize: () => void;
  sendMessage: (text: string, isVoice?: boolean) => Promise<void>;
  startVoiceInput: () => Promise<void>;
  stopVoiceInput: () => void;
  stopSpeaking: () => void;
  clearHistory: () => void;
  exportHistory: () => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  toggleVoiceEnabled: () => void;
  toggleAutoSpeak: () => void;
}

const AIWidgetContext = createContext<AIWidgetContextType | undefined>(undefined);

interface AIWidgetProviderProps {
  children: ReactNode;
}

export const AIWidgetProvider: React.FC<AIWidgetProviderProps> = ({ children }) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1.1,
    volume: 0.8,
    voice: ''
  });

  // Initialize voice settings and load chat history
  React.useEffect(() => {
    if (speechService.isSpeechSynthesisSupported()) {
      const recommended = speechService.getRecommendedVoiceSettings();
      setVoiceSettings(recommended);
    }
    
    const history = groqService.getChatHistory();
    setMessages(history);
  }, []);

  // Actions
  const toggleWidget = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isMinimized) {
      setIsMinimized(false);
    }
  }, [isMinimized]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const sendMessage = useCallback(async (text: string, isVoice: boolean = false) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await groqService.sendMessage(text.trim(), isVoice);
      const updatedHistory = groqService.getChatHistory();
      setMessages(updatedHistory);

      // Auto-speak response if enabled
      if (voiceEnabled && autoSpeak && speechService.isSpeechSynthesisSupported()) {
        setIsSpeaking(true);
        try {
          await speechService.textToSpeech(response.content, voiceSettings);
        } catch (error) {
          console.error('Text-to-speech error:', error);
        } finally {
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, voiceEnabled, autoSpeak, voiceSettings]);

  const startVoiceInput = useCallback(async () => {
    if (!speechService.isSpeechRecognitionSupported()) {
      throw new Error('Voice input not supported in this browser');
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);

    try {
      const transcript = await speechService.speechToText(10000);
      if (transcript.trim()) {
        await sendMessage(transcript, true);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      throw error;
    } finally {
      setIsListening(false);
    }
  }, [isListening, sendMessage]);

  const stopVoiceInput = useCallback(() => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
  }, [isListening]);

  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const clearHistory = useCallback(() => {
    groqService.clearHistory();
    setMessages([]);
  }, []);

  const exportHistory = useCallback(() => {
    const exportText = groqService.exportChatHistory();
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divasity-ai-chat-?{new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const updateVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const toggleVoiceEnabled = useCallback(() => {
    setVoiceEnabled(prev => !prev);
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak(prev => !prev);
  }, []);

  const contextValue: AIWidgetContextType = {
    // State
    isOpen,
    isMinimized,
    isLoading,
    isListening,
    isSpeaking,
    voiceEnabled,
    autoSpeak,
    voiceSettings,
    messages,
    
    // Actions
    toggleWidget,
    toggleMinimize,
    sendMessage,
    startVoiceInput,
    stopVoiceInput,
    stopSpeaking,
    clearHistory,
    exportHistory,
    updateVoiceSettings,
    toggleVoiceEnabled,
    toggleAutoSpeak
  };

  return (
    <AIWidgetContext.Provider value={contextValue}>
      {children}
    </AIWidgetContext.Provider>
  );
};

export const useAIWidget = (): AIWidgetContextType => {
  const context = useContext(AIWidgetContext);
  if (context === undefined) {
    throw new Error('useAIWidget must be used within an AIWidgetProvider');
  }
  return context;
};

export default AIWidgetProvider;
