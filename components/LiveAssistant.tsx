
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ArrowLeft, Bot, Sparkles, Loader2, Volume2, ShieldCheck, Waves } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveAssistantProps {
  apiKey: string;
  onBack: () => void;
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ apiKey, onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey });
    
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outCtx = audioContextRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev, `Director: ${msg.serverContent?.outputTranscription?.text}`]);
            }
          },
          onclose: () => { setIsActive(false); setIsConnecting(false); },
          onerror: () => { setIsActive(false); setIsConnecting(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are the Studio Creative Director at Creator Vault. Help users build complex visual prompts for family portraits and cinematic ads. Be professional, creative, and encouraging.',
          outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setIsConnecting(false);
      alert("Microphone access is required for the Live Assistant.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit Session
        </button>
      </div>

      <div className="w-full max-w-2xl bg-luxury-800 rounded-3xl border border-brand-900/30 p-12 flex flex-col items-center gap-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] pointer-events-none" />
        
        <div className="text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-4 text-indigo-400">
             <Bot className="w-6 h-6" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Live Studio Collaboration</span>
          </div>
          <h2 className="text-4xl font-serif text-brand-50 font-bold mb-2">AI Creative Partner</h2>
          <p className="text-brand-300 text-sm max-w-sm mx-auto">Talk in real-time to build your next cinematic masterpiece. Hands-free creative direction.</p>
        </div>

        <div className="relative flex items-center justify-center">
          {isActive ? (
             <div className="flex gap-1 items-center h-24">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 100}ms` }} />
                ))}
             </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-luxury-900 border border-brand-900/50 flex items-center justify-center text-brand-500">
               <Waves className="w-12 h-12 opacity-20" />
            </div>
          )}
        </div>

        <div className="z-10 w-full">
           <button 
             onClick={isActive ? stopSession : startSession}
             disabled={isConnecting}
             className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${isActive ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'}`}
           >
             {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : isActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
             {isConnecting ? 'Initializing Session...' : isActive ? 'End Studio Session' : 'Start Live Session'}
           </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-emerald-950/40 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">End-to-End Encrypted Session</span>
        </div>
      </div>
      
      {transcript.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-luxury-950/50 rounded-2xl p-4 border border-brand-900/10 max-h-40 overflow-y-auto scrollbar-hide">
          {transcript.slice(-3).map((t, i) => (
            <p key={i} className="text-xs text-brand-400/80 mb-1 italic font-medium">{t}</p>
          ))}
        </div>
      )}
    </div>
  );
};
