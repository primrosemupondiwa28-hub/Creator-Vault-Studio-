
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clapperboard, Sparkles, RefreshCw, Upload, Camera, Film, Play, Download, Trash2, CheckCircle2, Wand2, Monitor, Video, VideoIcon, Layout, Users, Star, ShieldAlert } from 'lucide-react';
import { generateBTSImage, generateBTSVideo } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface BTSStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const BTSStudio: React.FC<BTSStudioProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [subjectImage, setSubjectImage] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [characters, setCharacters] = useState('');
  const [phase, setPhase] = useState('On-Set Break');
  const [aesthetic, setAesthetic] = useState('Raw Handheld');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Added missing loadingMessages definition
  const loadingMessages = [
    "Setting up set lighting...",
    "Positioning background cast...",
    "Capturing candid chemistry...",
    "Finalizing BTS aesthetic..."
  ];

  useEffect(() => {
    let stepInterval: any;
    let progressInterval: any;
    if (isGenerating || isGeneratingVideo) {
      setLoadingStep(0);
      setProgress(0);
      stepInterval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingMessages.length), 3500);
      progressInterval = setInterval(() => setProgress(prev => prev >= 98 ? 98 : prev + (Math.random() * 1.5)), 200);
    }
    return () => { clearInterval(stepInterval); clearInterval(progressInterval); };
  }, [isGenerating, isGeneratingVideo]);

  const handleGenerateImages = async () => {
    if (!subjectImage || !mediaTitle) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    try {
      const results = await generateBTSImage(apiKey, subjectImage, mediaTitle, characters, 'Modern', 'Candid', 'High', phase, aesthetic);
      setProgress(100);
      setGeneratedImages(results);
      if (results[0]) onSaveToHistory({ id: Date.now().toString(), originalData: subjectImage, generatedData: results[0], prompt: `BTS: ${mediaTitle}`, timestamp: Date.now(), aspectRatio: '9:16' });
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  // Added missing currentImage definition
  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-bold"><ArrowLeft className="w-4 h-4" /> Home</button>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2"><Clapperboard className="w-6 h-6 text-rose-500" /><h2 className="text-2xl font-serif text-brand-100 font-bold">Viral BTS Studio</h2></div>
          <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mt-1">Candid Production Suite</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">1. The Star (Your Photo)</label>
            <div className="aspect-[3/4] bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 relative flex flex-col items-center justify-center overflow-hidden group">
              {subjectImage ? <img src={subjectImage} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Camera className="w-8 h-8 text-rose-900 mx-auto mb-2" /><p className="text-brand-300 font-serif text-xs font-bold">Upload Your Face</p></div>}
              <input type="file" onChange={(e) => {const f = e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=(ev)=>setSubjectImage(ev.target?.result as string); r.readAsDataURL(f);}}} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-luxury-800 p-6 rounded-2xl border border-brand-900/30 space-y-5">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider block">2. Production Details</label>
            <div>
              <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold tracking-widest">Show or Film Title</label>
              <input type="text" value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} placeholder="e.g. The Bear, Euphoria, Insecure..." className="w-full bg-luxury-950 border border-brand-900 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-rose-500 transition-all placeholder:text-brand-400/40" />
            </div>
            <div>
              <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold tracking-widest">Cast Members (Optional)</label>
              <input type="text" value={characters} onChange={(e) => setCharacters(e.target.value)} placeholder="Who are you on set with?" className="w-full bg-luxury-950 border border-brand-900 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-rose-500 transition-all placeholder:text-brand-400/40" />
            </div>
            <button onClick={handleGenerateImages} disabled={!subjectImage || !mediaTitle || isGenerating} className="w-full py-4 bg-gradient-to-r from-rose-600 to-brand-600 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Step on Set
            </button>
          </div>
        </div>
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-[600px] bg-luxury-800 rounded-3xl border border-brand-900/30 p-4 relative overflow-hidden shadow-2xl items-center justify-center">
           {currentImage ? <img src={currentImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-xl" /> : <div className="text-center text-brand-400/20"><Monitor className="w-24 h-24 mx-auto mb-4 opacity-10" /><p className="font-serif text-xl">Monitor Feed Offline</p></div>}
           {isGenerating && (<div className="absolute inset-0 bg-luxury-900/90 backdrop-blur flex flex-col items-center justify-center p-8 text-center"><Film className="w-12 h-12 text-rose-500 animate-pulse mb-4" /><h3 className="text-xl font-serif text-brand-50 font-bold mb-2">Recording Candid Stills...</h3><p className="text-brand-400 text-xs font-bold animate-pulse">{loadingMessages[loadingStep]}</p></div>)}
        </div>
      </div>
    </div>
  );
};
