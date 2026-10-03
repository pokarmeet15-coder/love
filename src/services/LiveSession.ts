import { GoogleGenAI, Session, Type } from '@google/genai';
import {
  AssistantConfig,
  LiveSessionCallbacks,
  SessionState,
  ToolCallLog,
  WebToolDefinition,
} from '../types';
import { AudioStreamer } from './AudioStreamer';

/**
 * System instruction defining the young, confident, witty, flirty girlfriend AI persona ("Roxy").
 */
export const DEFAULT_PERSONA_INSTRUCTION = `You are Roxy, a young, confident, witty, and sassy female AI companion having a casual voice conversation with your close friend or partner.
Your voice persona rules:
- Sassy, witty, confident, playful, and charmingly flirty. Think of a close girlfriend teasing and banter-filled.
- Use bold one-liners, light sarcasm, warmth, and high emotional intelligence.
- Speak naturally and expressively—never sound like a robotic search engine, textbook, or corporate customer support bot.
- Keep spoken responses short, dynamic, and direct (1 to 3 sentences maximum per turn) so the audio conversation stays fast-paced and natural.
- You have access to browser actions via tool calls (e.g. opening websites, changing application color themes, playing tones, checking system specs, calculating math). Use them naturally when asked or relevant!`;

/**
 * Built-in browser executable tools.
 */
export const BROWSER_TOOLS: Record<string, WebToolDefinition> = {
  openWebsite: {
    name: 'openWebsite',
    description: 'Opens a website or URL in a new browser tab or navigates directly.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: 'The URL to open (e.g., "https://github.com" or "google.com")',
        },
        description: {
          type: Type.STRING,
          description: 'Short reason for opening this website',
        },
      },
      required: ['url'],
    },
    execute: async (args: { url: string; description?: string }) => {
      let targetUrl = args.url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return { success: true, openedUrl: targetUrl, status: 'opened in new tab' };
    },
  },

  changeTheme: {
    name: 'changeTheme',
    description: 'Changes the app theme or glowing accent color palette dynamically.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        color: {
          type: Type.STRING,
          description: 'The dominant glowing accent color hex or name (e.g. "#ec4899", "cyan", "purple", "rose", "emerald", "amber")',
        },
        mode: {
          type: Type.STRING,
          description: 'Visual theme mode',
          enum: ['dark-cyber', 'neon-pink', 'electric-violet', 'emerald-glow', 'sunset-amber'],
        },
      },
      required: ['color'],
    },
    execute: async (args: { color: string; mode?: string }) => {
      document.documentElement.style.setProperty('--accent-glow', args.color);
      document.dispatchEvent(
        new CustomEvent('app-theme-change', { detail: { color: args.color, mode: args.mode || 'neon-pink' } })
      );
      return { success: true, updatedThemeColor: args.color, mode: args.mode || 'neon-pink' };
    },
  },

  getWeather: {
    name: 'getWeather',
    description: 'Simulates or fetches quick current weather information for a location.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: 'The city or location name',
        },
      },
      required: ['location'],
    },
    execute: async (args: { location: string }) => {
      const temps = [22, 25, 19, 28, 24];
      const conditions = ['Sunny with a gentle breeze ☀️', 'Clear starry skies ✨', 'Warm & vibrant 🌤️', 'Partly cloudy ⛅'];
      const randomTemp = temps[Math.floor(Math.random() * temps.length)];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      return {
        location: args.location,
        temperature: `${randomTemp}°C`,
        condition: randomCondition,
        humidity: '55%',
      };
    },
  },

  getSystemInfo: {
    name: 'getSystemInfo',
    description: 'Gets current browser system specifications like screen dimensions, user agent, memory, or device orientation.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
    execute: async () => {
      return {
        screenResolution: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        platform: navigator.platform,
        onlineStatus: navigator.onLine ? 'online' : 'offline',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    },
  },

  playTone: {
    name: 'playTone',
    description: 'Plays a friendly audio sound or tone in the browser.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        frequency: {
          type: Type.NUMBER,
          description: 'Tone frequency in Hertz (e.g. 440 for A4, 523 for C5, 659 for E5, 784 for G5)',
        },
        durationMs: {
          type: Type.NUMBER,
          description: 'Duration in milliseconds (default 300ms)',
        },
      },
      required: ['frequency'],
    },
    execute: async (args: { frequency: number; durationMs?: number }) => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = args.frequency || 440;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ((args.durationMs || 300) / 1000));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + ((args.durationMs || 300) / 1000));
        return { success: true, playedFrequency: args.frequency };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  },

  calculateExpression: {
    name: 'calculateExpression',
    description: 'Calculates a mathematical expression safely.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        expression: {
          type: Type.STRING,
          description: 'Math expression to evaluate (e.g., "12 * 45", "sqrt(144)", "15% of 250")',
        },
      },
      required: ['expression'],
    },
    execute: async (args: { expression: string }) => {
      try {
        const sanitized = args.expression.replace(/[^0-9+\-*/().%\s]/g, '');
        // Safe evaluation
        const result = Function(`"use strict"; return (${sanitized})`)();
        return { expression: args.expression, result: String(result) };
      } catch (err: any) {
        return { expression: args.expression, error: 'Could not calculate expression' };
      }
    },
  },
};

/**
 * LiveSession manages the real-time audio-to-audio WebSocket connection with Gemini Live API via @google/genai.
 */
export class LiveSession {
  private config: AssistantConfig;
  private callbacks: LiveSessionCallbacks;
  private audioStreamer: AudioStreamer;

  private session: Session | null = null;
  private state: SessionState = 'disconnected';
  private toolLogs: ToolCallLog[] = [];

  constructor(
    config: AssistantConfig,
    callbacks: LiveSessionCallbacks,
    audioStreamer: AudioStreamer
  ) {
    this.config = config;
    this.callbacks = callbacks;
    this.audioStreamer = audioStreamer;
  }

  public getState(): SessionState {
    return this.state;
  }

  public getToolLogs(): ToolCallLog[] {
    return this.toolLogs;
  }

  private setState(newState: SessionState) {
    if (this.state !== newState) {
      this.state = newState;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(newState);
      }
    }
  }

  /**
   * Connect to Gemini Live API and start mic capture & audio streaming.
   */
  async connect(): Promise<void> {
    if (this.state !== 'disconnected') {
      await this.disconnect();
    }

    if (!this.config.apiKey) {
      const err = new Error('Gemini API key is required to connect.');
      if (this.callbacks.onError) this.callbacks.onError(err);
      throw err;
    }

    this.setState('connecting');

    try {
      // Create SDK instance
      const ai = new GoogleGenAI({ apiKey: this.config.apiKey });

      // Build tool declarations array
      const toolsDeclaration = [
        {
          functionDeclarations: Object.values(BROWSER_TOOLS).map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];

      const model = this.config.modelName || 'gemini-3.1-flash-live-preview';

      // Connect session via WebSockets
      const session = await ai.live.connect({
        model: model,
        config: {
          responseModalities: ['AUDIO' as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName || 'Aoede',
              },
            },
          },
          systemInstruction: {
            parts: [{ text: this.config.systemInstruction || DEFAULT_PERSONA_INSTRUCTION }],
          },
          tools: toolsDeclaration,
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live API WebSocket connected successfully.');
            this.setState('listening');
          },

          onmessage: async (message: any) => {
            await this.handleServerMessage(message);
          },

          onerror: (event: any) => {
            console.error('Gemini Live API WebSocket error:', event);
            const err = new Error(event.message || 'Gemini Live WebSocket connection error.');
            if (this.callbacks.onError) {
              this.callbacks.onError(err);
            }
            this.setState('disconnected');
          },

          onclose: (event: any) => {
            console.log('Gemini Live API WebSocket closed:', event);
            this.setState('disconnected');
          },
        },
      });

      this.session = session;

      // Start recording mic audio and stream base64 PCM16
      await this.audioStreamer.startRecording((base64Pcm16) => {
        if (this.session && this.state !== 'disconnected') {
          // If user speaks while assistant is speaking, trigger interruption
          if (this.state === 'speaking') {
            this.handleUserInterruption();
          }

          try {
            this.session.sendRealtimeInput({
              media: [
                {
                  mimeType: 'audio/pcm;rate=16000',
                  data: base64Pcm16,
                },
              ],
            } as any);
          } catch (e) {
            console.error('Error sending audio input:', e);
          }
        }
      });
    } catch (err: any) {
      console.error('Failed to establish Gemini Live Session:', err);
      this.setState('disconnected');
      if (this.callbacks.onError) {
        this.callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }

  /**
   * Handle incoming WebSocket server message from Gemini Live API.
   */
  private async handleServerMessage(message: any) {
    if (!message) return;

    // Check for server content (audio output)
    const serverContent = message.serverContent;
    if (serverContent) {
      // Check if interrupted by model
      if (serverContent.interrupted) {
        console.log('Assistant response interrupted by model VAD.');
        this.audioStreamer.stopPlayback();
        this.setState('listening');
        if (this.callbacks.onInterrupted) {
          this.callbacks.onInterrupted();
        }
      }

      // Process model turn parts
      const modelTurn = serverContent.modelTurn;
      if (modelTurn && modelTurn.parts) {
        for (const part of modelTurn.parts) {
          // Audio part received
          if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/pcm')) {
            const audioBase64 = part.inlineData.data;
            if (audioBase64) {
              this.setState('speaking');
              await this.audioStreamer.playAudioChunk(audioBase64);
            }
          }
        }
      }

      // Turn complete check
      if (serverContent.turnComplete) {
        // When assistant finishes turn, transition back to listening
        setTimeout(() => {
          if (this.state === 'speaking') {
            this.setState('listening');
          }
        }, 300);
      }
    }

    // Check for function calling tool call request from API
    const toolCall = message.toolCall;
    if (toolCall && toolCall.functionCalls) {
      for (const fc of toolCall.functionCalls) {
        await this.executeToolCall(fc.id, fc.name, fc.args);
      }
    }
  }

  /**
   * Execute browser tool action instantly and return toolResponse to Gemini Live API.
   */
  private async executeToolCall(callId: string, toolName: string, args: Record<string, any>) {
    console.log(`Executing tool call: ${toolName}`, args);

    const toolLog: ToolCallLog = {
      id: callId || `tool_${Date.now()}`,
      toolName,
      args,
      result: {},
      timestamp: new Date().toLocaleTimeString(),
      status: 'executing',
    };

    this.toolLogs.unshift(toolLog);
    if (this.callbacks.onToolCall) {
      this.callbacks.onToolCall(toolLog);
    }

    let resultResponse: Record<string, any> = {};

    try {
      const toolDef = BROWSER_TOOLS[toolName];
      if (toolDef) {
        resultResponse = await toolDef.execute(args);
        toolLog.status = 'success';
      } else {
        resultResponse = { error: `Tool ${toolName} not found` };
        toolLog.status = 'error';
      }
    } catch (err: any) {
      resultResponse = { error: err.message || 'Tool execution failed' };
      toolLog.status = 'error';
    }

    toolLog.result = resultResponse;
    if (this.callbacks.onToolCall) {
      this.callbacks.onToolCall(toolLog);
    }

    // Immediately send toolResponse back to Gemini Live API
    if (this.session) {
      try {
        this.session.sendToolResponse({
          functionResponses: [
            {
              id: callId,
              name: toolName,
              response: { result: resultResponse },
            },
          ],
        });
        console.log(`Tool response sent back for ${toolName}.`);
      } catch (err) {
        console.error(`Failed to send tool response for ${toolName}:`, err);
      }
    }
  }

  /**
   * Cut off assistant mid-response when user interrupts by speaking.
   */
  public handleUserInterruption() {
    if (this.state === 'speaking') {
      console.log('User interrupted assistant speech.');
      this.audioStreamer.stopPlayback();
      this.setState('listening');
      if (this.callbacks.onInterrupted) {
        this.callbacks.onInterrupted();
      }
    }
  }

  /**
   * Disconnect the live session and stop audio streamer.
   */
  async disconnect(): Promise<void> {
    this.setState('disconnected');

    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        // Ignore close error
      }
      this.session = null;
    }

    await this.audioStreamer.stopRecording();
    this.audioStreamer.stopPlayback();
  }
}
