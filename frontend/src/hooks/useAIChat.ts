import { useState, useCallback, useRef, useEffect } from 'react';
import groqService from '../services/groqService';
import speechService from '../services/speechService';
import { ChatMessage, VoiceSettings } from '../types/ai';

interface UseAIChatOptions {
  autoSpeak?: boolean;
  voiceEnabled?: boolean;
  voiceSettings?: Partial<VoiceSettings>;
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

interface UseAIChatReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  
  // Actions
  sendMessage: (text: string, isVoice?: boolean) => Promise<ChatMessage | null>;
  startVoiceInput: () => Promise<string | null>;
  stopVoiceInput: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  clearHistory: () => void;
  exportHistory: () => string;
  
  // Utilities
  getSuggestedQuestions: () => string[];
  isVoiceSupported: boolean;
  isSpeechSupported: boolean;
}

export const useAIChat = (options: UseAIChatOptions = {}): UseAIChatReturn => {
  const {
    autoSpeak = false,
    voiceEnabled = true,
    voiceSettings: customVoiceSettings,
    onMessageSent,
    onMessageReceived,
    onError
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const voiceSettingsRef = useRef<VoiceSettings>({
    rate: 0.9,
    pitch: 1.1,
    volume: 0.8,
    voice: ''
  });

  // Initialize
  useEffect(() => {
    // Load chat history
    const history = groqService.getChatHistory();
    setMessages(history);

    // Initialize voice settings
    if (speechService.isSpeechSynthesisSupported()) {
      const recommended = speechService.getRecommendedVoiceSettings();
      voiceSettingsRef.current = { ...recommended, ...customVoiceSettings };
    }
  }, [customVoiceSettings]);

  // Send message
  const sendMessage = useCallback(async (text: string, isVoice: boolean = false): Promise<ChatMessage | null> => {
    if (!text.trim() || isLoading) return null;

    setIsLoading(true);

    try {
      const response = await groqService.sendMessage(text.trim(), isVoice);
      const updatedHistory = groqService.getChatHistory();
      setMessages(updatedHistory);

      // Callbacks
      const userMessage = updatedHistory.find(msg => msg.content === text.trim() && msg.role === 'user');
      if (userMessage) {
        onMessageSent?.(userMessage);
      }
      onMessageReceived?.(response);

      // Auto-speak response if enabled
      if (autoSpeak && voiceEnabled && speechService.isSpeechSynthesisSupported()) {
        setIsSpeaking(true);
        try {
          await speechService.textToSpeech(response.content, voiceSettingsRef.current);
        } catch (speechError) {
          console.error('Text-to-speech error:', speechError);
        } finally {
          setIsSpeaking(false);
        }
      }

      return response;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to send message');
      onError?.(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, autoSpeak, voiceEnabled, onMessageSent, onMessageReceived, onError]);

  // Start voice input
  const startVoiceInput = useCallback(async (): Promise<string | null> => {
    if (!speechService.isSpeechRecognitionSupported()) {
      const error = new Error('Voice input not supported in this browser');
      onError?.(error);
      throw error;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return null;
    }

    setIsListening(true);

    try {
      const transcript = await speechService.speechToText(10000);
      return transcript || null;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Voice input failed');
      onError?.(errorObj);
      throw errorObj;
    } finally {
      setIsListening(false);
    }
  }, [isListening, onError]);

  // Stop voice input
  const stopVoiceInput = useCallback(() => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
  }, [isListening]);

  // Speak text
  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!speechService.isSpeechSynthesisSupported()) {
      const error = new Error('Speech synthesis not supported');
      onError?.(error);
      throw error;
    }

    setIsSpeaking(true);

    try {
      await speechService.textToSpeech(text, voiceSettingsRef.current);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Speech synthesis failed');
      onError?.(errorObj);
      throw errorObj;
    } finally {
      setIsSpeaking(false);
    }
  }, [onError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    groqService.clearHistory();
    setMessages([]);
  }, []);

  // Export history
  const exportHistory = useCallback((): string => {
    return groqService.exportChatHistory();
  }, []);

  // Get suggested questions
  const getSuggestedQuestions = useCallback((): string[] => {
    return groqService.getSuggestedQuestions();
  }, []);

  // Check support
  const isVoiceSupported = speechService.isSpeechRecognitionSupported();
  const isSpeechSupported = speechService.isSpeechSynthesisSupported();

  return {
    // State
    messages,
    isLoading,
    isListening,
    isSpeaking,
    
    // Actions
    sendMessage,
    startVoiceInput,
    stopVoiceInput,
    speakText,
    stopSpeaking,
    clearHistory,
    exportHistory,
    
    // Utilities
    getSuggestedQuestions,
    isVoiceSupported,
    isSpeechSupported
  };
};

export default useAIChat;
