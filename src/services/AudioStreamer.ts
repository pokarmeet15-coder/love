/**
 * AudioStreamer module: Handles microphone capture at PCM16 16kHz and audio playback at PCM16 24kHz using Web Audio API.
 * Provides real-time volume / frequency visualizer analysis and graceful interruption.
 */

export class AudioStreamer {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private inputSourceNode: MediaStreamAudioSourceNode | null = null;

  // Analyser nodes for UI visualization
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  // Playback queue & scheduled source nodes
  private scheduledAudioSources: AudioBufferSourceNode[] = [];
  private nextStartTime: number = 0;
  private isPlaying: boolean = false;

  // Callbacks
  private onAudioChunkCaptured?: (base64Pcm16: string) => void;
  private onPlaybackStateChange?: (isPlaying: boolean) => void;

  constructor(options?: {
    onAudioChunkCaptured?: (base64Pcm16: string) => void;
    onPlaybackStateChange?: (isPlaying: boolean) => void;
  }) {
    if (options) {
      this.onAudioChunkCaptured = options.onAudioChunkCaptured;
      this.onPlaybackStateChange = options.onPlaybackStateChange;
    }
  }

  /**
   * Start recording microphone input at 16kHz PCM16.
   */
  async startRecording(onChunk?: (base64Pcm16: string) => void): Promise<void> {
    if (onChunk) {
      this.onAudioChunkCaptured = onChunk;
    }

    // Stop existing recording if any
    await this.stopRecording();

    try {
      // Get microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Target 16kHz input context if supported, else fallback and resample
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioContext = new AudioCtx({ sampleRate: 16000 });

      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }

      const nativeSampleRate = this.inputAudioContext.sampleRate;

      this.inputSourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.inputAnalyser = this.inputAudioContext.createAnalyser();
      this.inputAnalyser.fftSize = 256;
      this.inputSourceNode.connect(this.inputAnalyser);

      // Buffer size of 2048 (~128ms at 16kHz)
      const bufferSize = 2048;
      this.scriptNode = this.inputAudioContext.createScriptProcessor(bufferSize, 1, 1);

      this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

        // Convert to 16kHz PCM16
        const pcm16Data = this.resampleAndConvertToPCM16(inputData, nativeSampleRate, 16000);
        if (pcm16Data.length === 0) return;

        const base64 = this.arrayBufferToBase64(pcm16Data.buffer as ArrayBuffer);
        if (this.onAudioChunkCaptured) {
          this.onAudioChunkCaptured(base64);
        }
      };

      this.inputAnalyser.connect(this.scriptNode);
      this.scriptNode.connect(this.inputAudioContext.destination);
    } catch (err) {
      console.error('Failed to start microphone recording:', err);
      throw err;
    }
  }

  /**
   * Stop recording microphone input.
   */
  async stopRecording(): Promise<void> {
    if (this.scriptNode) {
      this.scriptNode.onaudioprocess = null;
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }

    if (this.inputSourceNode) {
      this.inputSourceNode.disconnect();
      this.inputSourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.inputAudioContext) {
      await this.inputAudioContext.close();
      this.inputAudioContext = null;
    }

    this.inputAnalyser = null;
  }

  /**
   * Initialize output audio context for 24kHz playback.
   */
  private initOutputAudioContext(): AudioContext {
    if (!this.outputAudioContext || this.outputAudioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      this.outputAnalyser = this.outputAudioContext.createAnalyser();
      this.outputAnalyser.fftSize = 256;
      this.outputAnalyser.connect(this.outputAudioContext.destination);
      this.nextStartTime = 0;
    }
    if (this.outputAudioContext.state === 'suspended') {
      this.outputAudioContext.resume();
    }
    return this.outputAudioContext;
  }

  /**
   * Queue and play raw 24kHz PCM16 base64 audio chunk received from Gemini Live API.
   */
  async playAudioChunk(base64Pcm16: string): Promise<void> {
    const ctx = this.initOutputAudioContext();

    const pcm16Bytes = this.base64ToArrayBuffer(base64Pcm16);
    const int16Array = new Int16Array(pcm16Bytes);

    // Convert Int16 (-32768..32767) to Float32 (-1.0..1.0)
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    if (float32Array.length === 0) return;

    // Create AudioBuffer at 24000 Hz
    const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    if (this.outputAnalyser) {
      source.connect(this.outputAnalyser);
    } else {
      source.connect(ctx.destination);
    }

    // Schedule seamlessly
    const currentTime = ctx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;

    this.scheduledAudioSources.push(source);
    this.setPlayingState(true);

    source.onended = () => {
      const idx = this.scheduledAudioSources.indexOf(source);
      if (idx !== -1) {
        this.scheduledAudioSources.splice(idx, 1);
      }
      if (this.scheduledAudioSources.length === 0) {
        this.setPlayingState(false);
      }
    };
  }

  /**
   * Immediately stop playback and clear scheduled audio buffer queue (e.g., when interrupted).
   */
  stopPlayback(): void {
    for (const source of this.scheduledAudioSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source may already have ended
      }
    }
    this.scheduledAudioSources = [];
    if (this.outputAudioContext) {
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
    this.setPlayingState(false);
  }

  /**
   * Helper to notify playback state.
   */
  private setPlayingState(playing: boolean): void {
    if (this.isPlaying !== playing) {
      this.isPlaying = playing;
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(playing);
      }
    }
  }

  /**
   * Get current volume amplitude (0 to 1) and frequency data for UI visualizers.
   */
  getAudioLevels(): { inputLevel: number; outputLevel: number; inputFrequencies: Uint8Array; outputFrequencies: Uint8Array } {
    let inputLevel = 0;
    let outputLevel = 0;
    const inputFrequencies = new Uint8Array(128);
    const outputFrequencies = new Uint8Array(128);

    if (this.inputAnalyser) {
      const inputData = new Uint8Array(this.inputAnalyser.frequencyBinCount);
      this.inputAnalyser.getByteFrequencyData(inputData);
      inputFrequencies.set(inputData.subarray(0, 128));
      const sum = inputData.reduce((acc, val) => acc + val, 0);
      inputLevel = sum / (inputData.length * 255);
    }

    if (this.outputAnalyser && this.isPlaying) {
      const outputData = new Uint8Array(this.outputAnalyser.frequencyBinCount);
      this.outputAnalyser.getByteFrequencyData(outputData);
      outputFrequencies.set(outputData.subarray(0, 128));
      const sum = outputData.reduce((acc, val) => acc + val, 0);
      outputLevel = sum / (outputData.length * 255);
    }

    return { inputLevel, outputLevel, inputFrequencies, outputFrequencies };
  }

  /**
   * Resample Float32 audio data to target rate (16kHz) and encode to Int16 PCM.
   */
  private resampleAndConvertToPCM16(
    audioData: Float32Array,
    sampleRate: number,
    targetSampleRate: number
  ): Int16Array {
    if (sampleRate === targetSampleRate) {
      const pcm16 = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        const s = Math.max(-1, Math.min(1, audioData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return pcm16;
    }

    const ratio = sampleRate / targetSampleRate;
    const newLength = Math.floor(audioData.length / ratio);
    const pcm16 = new Int16Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const originIndex = i * ratio;
      const indexFloor = Math.floor(originIndex);
      const indexCeil = Math.min(audioData.length - 1, Math.ceil(originIndex));
      const weight = originIndex - indexFloor;

      const interpolatedSample = audioData[indexFloor] * (1 - weight) + audioData[indexCeil] * weight;
      const s = Math.max(-1, Math.min(1, interpolatedSample));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return pcm16;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Clean up all audio nodes and contexts.
   */
  async close(): Promise<void> {
    this.stopPlayback();
    await this.stopRecording();
    if (this.outputAudioContext) {
      await this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
  }
}
