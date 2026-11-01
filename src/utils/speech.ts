// Voice Synthesis & Web Speech API Utilities for Jarvis AI

// Augment window object for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface SpeechRecognitionListener {
  onResult: (transcript: string, isFinal: boolean) => void;
  onWakeWordDetected?: () => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class JarvisSpeechController {
  private recognition: any = null;
  private isListening: boolean = false;
  private wakeWords = ['hey jarvis', 'okay jarvis', 'ok jarvis', 'jarvis'];

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(listener: SpeechRecognitionListener, wakeWordCheck: boolean = false) {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const activeText = (finalTranscript || interimTranscript).toLowerCase().trim();

      if (wakeWordCheck) {
        const foundWake = this.wakeWords.some(w => activeText.includes(w));
        if (foundWake) {
          if (listener.onWakeWordDetected) listener.onWakeWordDetected();
          // Strip wake word from active command
          let command = activeText;
          for (const w of this.wakeWords) {
            command = command.replace(w, '').trim();
          }
          if (command.length > 0) {
            listener.onResult(command, true);
          }
          return;
        }
      }

      listener.onResult(finalTranscript || interimTranscript, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (listener.onError) listener.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (listener.onEnd) listener.onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
      this.isListening = false;
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export function playJarvisSpeech(
  text: string,
  profile: 'classic-jarvis' | 'warm-companion' | 'concise-analyst' | 'playful-bot' = 'classic-jarvis',
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // cancel any active utterance

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  // Try to find natural English British voice for classic Jarvis
  let selectedVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('British') || v.name.includes('Daniel') || v.name.includes('George'));

  if (profile === 'warm-companion') {
    selectedVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Karen'))) || selectedVoice;
    utterance.pitch = 1.05;
    utterance.rate = 1.0;
  } else if (profile === 'concise-analyst') {
    utterance.pitch = 0.95;
    utterance.rate = 1.15;
  } else if (profile === 'playful-bot') {
    utterance.pitch = 1.25;
    utterance.rate = 1.1;
  } else {
    // Classic Jarvis
    utterance.pitch = 0.92;
    utterance.rate = 1.02;
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopJarvisSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Audio sound effects using Web Audio API for futuristic Jarvis soundscapes
export function playChime(type: 'wake' | 'affirm' | 'alert' | 'shutdown') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'wake') {
      // Futuristic double-pip upward chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'affirm') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}
