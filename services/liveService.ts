import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { SOCRATIC_INSTRUCTION, STORYTELLING_INSTRUCTION } from "./geminiService";

const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

export class LiveSession {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: AudioNode | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private sessionPromise: Promise<any> | null = null;
  private onDisconnectCallback: () => void;
  private stream: MediaStream | null = null;
  private isStoryMode: boolean;

  constructor(onDisconnect: () => void, isStoryMode: boolean = false) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.onDisconnectCallback = onDisconnect;
    this.isStoryMode = isStoryMode;
  }

  async connect() {
    // Initialize Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Setup Audio Output
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    // Get Microphone Stream
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Connect to Live API
    this.sessionPromise = this.ai.live.connect({
      model: LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: this.isStoryMode ? STORYTELLING_INSTRUCTION : SOCRATIC_INSTRUCTION,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }, // Friendly voice
        },
      },
      callbacks: {
        onopen: () => {
          console.log("Live session opened");
          this.startAudioInput();
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleMessage(message);
        },
        onclose: () => {
          console.log("Live session closed");
          this.onDisconnectCallback();
        },
        onerror: (err) => {
          console.error("Live session error", err);
          this.onDisconnectCallback();
        }
      }
    });
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.stream || !this.sessionPromise) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    // Handle Audio Output
    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext && this.outputNode) {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        
        const audioBuffer = await this.decodeAudioData(
            this.base64ToBytes(base64Audio),
            this.outputAudioContext
        );

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        
        source.addEventListener('ended', () => {
            this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
    }

    // Handle Interruption
    if (serverContent?.interrupted) {
        this.sources.forEach(source => source.stop());
        this.sources.clear();
        this.nextStartTime = 0;
    }
  }

  async disconnect() {
    if (this.sessionPromise) {
        const session = await this.sessionPromise;
        session.close();
    }
    
    // Stop Microphone
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
    }

    // Close Audio Contexts
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    
    this.sources.forEach(source => source.stop());
    this.sources.clear();
  }

  // --- Helpers ---

  private createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const sampleRate = 24000;
    const numChannels = 1;
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
  }
}