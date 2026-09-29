/**
 * Speech Recognition and Speech Synthesis Utilities for OptiCart
 * Using browser native Web Speech API
 */

// Extend Window interface for WebkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

/**
 * Check if Speech Recognition (STT) is supported in current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Check if Speech Synthesis (TTS) is supported in current browser
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Clean markdown symbols, bullets, asterisks, and code blocks for clear voice reading
 */
export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold **text**
    .replace(/\*([^*]+)\*/g, '$1') // Italic *text*
    .replace(/__([^_]+)__/g, '$1') // Bold __text__
    .replace(/_([^_]+)_/g, '$1') // Italic _text_
    .replace(/#+\s+(.*)/g, '$1.') // Headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links [text](url)
    .replace(/^[•\-\*]\s+/gm, '') // Bullet points
    .replace(/\d+\.\s+/g, '') // Numbered lists (1. 2.)
    .replace(/[🔍📊⚠️💡🛒]/g, '') // Common emojis
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speech Recognition Session Wrapper
 */
export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
  onEnd?: () => void;
}

export function startSpeechRecognition(handlers: SpeechRecognitionHandlers): {
  stop: () => void;
  abort: () => void;
} | null {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    handlers.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const text = result[0].transcript;
      if (result.isFinal) {
        finalTranscript += text;
      } else {
        interimTranscript += text;
      }
    }

    const combined = (finalTranscript || interimTranscript).trim();
    if (combined) {
      handlers.onResult(combined, finalTranscript.length > 0);
    }
  };

  recognition.onerror = (event: any) => {
    let errorText = 'Speech recognition error.';
    switch (event.error) {
      case 'not-allowed':
      case 'service-not-allowed':
        errorText = 'Microphone access was denied. Please allow microphone permission in your browser settings.';
        break;
      case 'no-speech':
        errorText = 'No speech was detected. Please try speaking again.';
        break;
      case 'audio-capture':
        errorText = 'No microphone was found on your device.';
        break;
      case 'network':
        errorText = 'Speech service network error occurred.';
        break;
      default:
        errorText = `Speech recognition error: ${event.error}`;
        break;
    }
    handlers.onError(errorText);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  try {
    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Could not start microphone.';
    handlers.onError(msg);
    return null;
  }
}

/**
 * Global Speech Synthesis Controller
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: string) => void
): boolean {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Text-to-speech is not supported on this browser.');
    return false;
  }

  // Stop any ongoing speech first
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    onEnd?.();
    return true;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Prefer natural English voices if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))) ||
      v.lang === 'en-US'
  );
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      onError?.(`Speech playback error: ${e.error}`);
    } else {
      onEnd?.();
    }
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
