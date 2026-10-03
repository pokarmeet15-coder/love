import { Type } from '@google/genai';

/**
 * Types and interfaces for the Real-Time Voice AI Assistant Application (Roxy).
 */

export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export type VoiceName = 'Aoede' | 'Kore' | 'Puck' | 'Fenrir' | 'Charon';

export type ModelName = 'gemini-3.1-flash-live-preview' | 'gemini-2.0-flash-exp';

export interface AssistantConfig {
  apiKey: string;
  voiceName: VoiceName;
  modelName: string;
  systemInstruction: string;
  temperature?: number;
}

export interface ToolCallLog {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
  status: 'executing' | 'success' | 'error';
}

export interface AudioVisualizerData {
  inputLevel: number;   // 0 to 1
  outputLevel: number;  // 0 to 1
  inputFrequencies: Uint8Array;
  outputFrequencies: Uint8Array;
}

export interface LiveSessionCallbacks {
  onStateChange?: (state: SessionState) => void;
  onAudioData?: (base64Pcm16: string) => void;
  onToolCall?: (toolLog: ToolCallLog) => void;
  onError?: (error: Error) => void;
  onInterrupted?: () => void;
  onVolumeChange?: (inputLevel: number, outputLevel: number) => void;
}

export interface WebToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: Type;
    properties: Record<string, {
      type: Type;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  execute: (args: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>;
}
