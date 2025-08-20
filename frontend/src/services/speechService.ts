// Speech Recognition and Synthesis Service
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
}

class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.loadVoices();
  }

  // Initialize speech recognition with optimal settings
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Optimal settings for better detection
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 3;
      
      // Additional settings for better performance
      if (this.recognition.serviceURI) {
        this.recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up';
      }
    }
  }

  // Load available voices
  private loadVoices(): void {
    const updateVoices = () => {
      this.voices = this.synthesis.getVoices();
    };

    updateVoices();
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = updateVoices;
    }

    // Force load voices after delay
    setTimeout(updateVoices, 1000);
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  // Check if speech synthesis is supported
  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Start listening for speech with enhanced detection
  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        this.stopListening();
        setTimeout(() => this.startListening(onResult, onError, onEnd), 300);
        return;
      }

      this.isListening = true;
      let hasReceivedResults = false;
      let silenceTimer: NodeJS.Timeout;

      // Enhanced recognition settings
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        try {
          hasReceivedResults = true;
          clearTimeout(silenceTimer);
          
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result.transcript || '';
            
            if (result.isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          const fullTranscript = (finalTranscript + interimTranscript).trim();
          
          if (fullTranscript) {
            onResult({
              transcript: fullTranscript,
              confidence: event.results[event.results.length - 1]?.confidence || 0.8,
              isFinal: !!finalTranscript
            });
            
            // Auto-stop after getting final result
            if (finalTranscript) {
              setTimeout(() => {
                if (this.isListening) {
                  this.stopListening();
                }
              }, 500);
            }
          }
          
          // Reset silence timer
          silenceTimer = setTimeout(() => {
            if (this.isListening && !finalTranscript) {
              this.stopListening();
            }
          }, 3000);
          
        } catch (error) {
          console.error('Speech recognition result error:', error);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('🚫 Speech recognition error:', event.error);
        this.isListening = false;
        clearTimeout(silenceTimer);
        
        // Only report actual errors, not normal stops
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          onError(`Speech recognition error: ?{event.error}`);
        }
      };

      this.recognition.onend = () => {
        console.log('🔇 Speech recognition ended');
        this.isListening = false;
        clearTimeout(silenceTimer);
        
        // Only call onEnd if we haven't received any results
        if (!hasReceivedResults) {
          onEnd();
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        clearTimeout(silenceTimer);
        reject(error);
      }
    });
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Speak text using Web Speech API
  speak(
    text: string,
    settings: Partial<VoiceSettings> = {},
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.stopSpeaking();

      // Phonetic replacements for better pronunciation
      const phoneticText = text
        .replace(/Divasity/gi, 'Deeverseatee')
        .replace(/\bAPI\b/gi, 'A P I')
        .replace(/\bUI\b/gi, 'U I')
        .replace(/\bURL\b/gi, 'U R L');

      const utterance = new SpeechSynthesisUtterance(phoneticText);
      this.currentUtterance = utterance;

      // Apply settings
      utterance.rate = settings.rate || 0.8;
      utterance.pitch = settings.pitch || 1.0;
      utterance.volume = settings.volume || 0.9;
      utterance.lang = 'en-US';

      // Select best voice
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang === 'en-US' && v.name.includes('Google')
      ) || voices.find(v => v.lang === 'en-US') || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
        resolve();
      };
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        if (event.error !== 'interrupted') {
          onError?.(`Speech error: ?{event.error}`);
          reject(new Error(event.error));
        } else {
          resolve();
        }
      };

      this.synthesis.speak(utterance);
    });
  }

  // Alternative TTS using ResponsiveVoice (fallback)
  speakWithResponsiveVoice(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load ResponsiveVoice if not already loaded
      if (!(window as any).responsiveVoice) {
        const script = document.createElement('script');
        script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=FREE';
        script.onload = () => {
          this.executeResponsiveVoice(text, resolve, reject);
        };
        script.onerror = () => reject(new Error('Failed to load ResponsiveVoice'));
        document.head.appendChild(script);
      } else {
        this.executeResponsiveVoice(text, resolve, reject);
      }
    });
  }

  private executeResponsiveVoice(text: string, resolve: () => void, reject: (error: Error) => void): void {
    const phoneticText = text.replace(/Divasity/gi, 'Dee-vas-i-tee');
    
    (window as any).responsiveVoice.speak(phoneticText, 'US English Female', {
      rate: 0.8,
      pitch: 1,
      volume: 0.9,
      onend: resolve,
      onerror: () => reject(new Error('ResponsiveVoice error'))
    });
  }

  // Stop current speech
  stopSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    if ((window as any).responsiveVoice) {
      (window as any).responsiveVoice.cancel();
    }
    this.currentUtterance = null;
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.synthesis.speaking || ((window as any).responsiveVoice?.isPlaying() || false);
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Get English voices only
  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  // Get recommended voice settings
  getRecommendedVoiceSettings(): VoiceSettings {
    const englishVoices = this.getEnglishVoices();
    const preferredVoice = englishVoices.find(v => 
      v.lang === 'en-US' && v.name.includes('Google')
    ) || englishVoices[0];

    return {
      rate: 0.8,
      pitch: 1.0,
      volume: 0.9,
      voice: preferredVoice?.name || ''
    };
  }

  // Convert speech to text with enhanced detection
  speechToText(timeoutMs: number = 15000): Promise<string> {
    return new Promise((resolve, reject) => {
      let bestTranscript = '';
      let timeoutId: NodeJS.Timeout;
      let hasResolved = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        this.stopListening();
      };

      const resolveWithResult = (transcript: string) => {
        if (!hasResolved && transcript.trim()) {
          hasResolved = true;
          cleanup();
          resolve(transcript.trim());
        }
      };

      // Extended timeout for better detection
      timeoutId = setTimeout(() => {
        if (!hasResolved) {
          cleanup();
          if (bestTranscript.trim()) {
            resolve(bestTranscript.trim());
          } else {
            reject(new Error('Please speak clearly into your microphone'));
          }
        }
      }, timeoutMs);

      this.startListening(
        (result) => {
          // Keep track of best transcript
          if (result.transcript && result.transcript.length > bestTranscript.length) {
            bestTranscript = result.transcript;
          }
          
          // Resolve immediately on final result
          if (result.isFinal && result.transcript.trim()) {
            resolveWithResult(result.transcript);
          }
          // Also resolve on confident interim results after delay
          else if (result.confidence > 0.7 && result.transcript.trim().length > 3) {
            setTimeout(() => {
              if (!hasResolved) {
                resolveWithResult(result.transcript);
              }
            }, 1500);
          }
        },
        (error) => {
          if (!hasResolved) {
            cleanup();
            // Try to return best transcript even on error
            if (bestTranscript.trim()) {
              resolve(bestTranscript.trim());
            } else {
              reject(new Error('Microphone access required. Please allow microphone permissions.'));
            }
          }
        },
        () => {
          if (!hasResolved) {
            cleanup();
            if (bestTranscript.trim()) {
              resolve(bestTranscript.trim());
            } else {
              reject(new Error('No speech detected. Please try speaking louder.'));
            }
          }
        }
      ).catch((err) => {
        if (!hasResolved) {
          cleanup();
          reject(new Error('Speech recognition failed. Please check microphone permissions.'));
        }
      });
    });
  }

  // Enhanced text to speech with fallback
  async textToSpeech(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    try {
      await this.speak(text, settings);
    } catch (error) {
      console.warn('Web Speech API failed, trying ResponsiveVoice:', error);
      try {
        await this.speakWithResponsiveVoice(text);
      } catch (fallbackError) {
        console.error('All TTS methods failed:', fallbackError);
        throw new Error('Text-to-speech unavailable');
      }
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
export type { SpeechRecognitionResult, VoiceSettings };
