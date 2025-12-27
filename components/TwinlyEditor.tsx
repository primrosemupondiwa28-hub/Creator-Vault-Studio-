import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Download, RefreshCw, ArrowLeft, SplitSquareHorizontal, Maximize2, ShieldCheck, Lock, Sparkles, Smile, Palette, Image as ImageIcon, Upload, X, Layout, Hand, Droplets, Scissors, Users, User, Check, Feather, MoveHorizontal, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { generateEditedImage, CosmeticEnhancements, enhancePrompt } from '../services/geminiService';
import { GeneratedImage, AspectRatio, SkinFinish, NailStyle, HairStyle, HairTarget, HairColor, FacialHair, HairTexture } from '../types';

interface TwinlyEditorProps {
  apiKey: string;
  originalImage: string;
  mimeType: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const TwinlyEditor: React.FC<TwinlyEditorProps> = ({ apiKey, originalImage, mimeType, onBack, onSaveToHistory }) => {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'split' | 'single' | 'compare'>('split');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const loadingMessages = [
    "Locking facial features...",
    "Preserving identity geometry...",
    "Applying style variations...",
    "Finalizing TrueTone™ render..."
  ];

  useEffect(() => {
    let stepInterval: any;
    let progressInterval: any;
    if (isGenerating) {
      setLoadingStep(0);
      setProgress(0);
      stepInterval = setInterval(() => setLoadingStep((prev) => (prev + 1) % 4), 3000);
      progressInterval = setInterval(() => setProgress(prev => prev >= 95 ? 95 : prev + Math.random() * 2 + 0.5), 200);
    }
    return () => { clearInterval(stepInterval); clearInterval(progressInterval); };
  }, [isGenerating]);
  
  const [enhancements, setEnhancements] = useState<CosmeticEnhancements>({
    teethWhitening: false,
    eyeBrightening: false,
    makeupMode: false,
    skinFinish: 'default',
    nailStyle: 'default',
    hairStyle: 'default',
    hairTexture: 'default',
    hairTarget: 'everyone',
    hairColor: 'default',
    facialHair: 'default'
  });
  
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = prompt.trim().length > 0 || enhancements.hairStyle !== 'default' || enhancements.hairColor !== 'default' || enhancements.facialHair !== 'default' || enhancements.hairTexture !== 'default';

  const handleGenerate = async () => {
    if (!canGenerate && enhancements.hairStyle === 'default') return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    try {
      const results = await generateEditedImage(apiKey, originalImage, mimeType, prompt || "Enhanced portrait.", true, enhancements, aspectRatio, customBackground);
      if (results.length === 0) throw new Error("No images generated.");
      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      if (results[0]) onSaveToHistory({ id: Date.now().toString(), originalData: originalImage, generatedData: results[0], prompt: prompt || `Hair: ${enhancements.hairStyle}`, timestamp: Date.now(), aspectRatio });
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const improved = await enhancePrompt(apiKey, prompt);
      setPrompt(improved);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const currentGeneratedImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  const hairOptions: {value: HairStyle, label: string}[] = [
    { value: 'default', label: 'Current Hair' }, { value: 'voluminous_blowout', label: 'Blowout' }, { value: 'straight_sleek', label: 'Sleek Straight' }, { value: 'wavy_beachy', label: 'Beachy Waves' }, { value: 'curly_coily', label: 'Coily Curls' }, { value: 'braids', label: 'Braids' }, { value: 'afro_natural', label: 'Natural Afro' }, { value: 'updo_bun', label: 'Elegant Updo' }, { value: 'short_pixie', label: 'Short Pixie' }, { value: 'bob_cut', label: 'Chic Bob' }, { value: 'long_layers', label: 'Long Layers' }, { value: 'curtain_bangs', label: 'Curtain Bangs' }, { value: 'side_part', label: 'Side Part' }, { value: 'buzz_cut', label: 'Buzz Cut' }, { value: 'bald', label: 'Bald' }, { value: 'mohawk', label: 'Mohawk' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-luxury-900 text-brand-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-900/30 bg-luxury-800">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Exit Studio
        </button>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 bg-luxury-700 p-1 rounded-lg mr-2">
              <button onClick={() => setViewMode('split')} className={`p-2 rounded-md transition-all ${viewMode === 'split' ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-300 hover:text-white'}`}><SplitSquareHorizontal className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('single')} className={`p-2 rounded-md transition-all ${viewMode === 'single' ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-300 hover:text-white'}`}><Maximize2 className="w-4 h-4" /></button>
           </div>
           <div className="hidden md:flex items-center gap-2 bg-luxury-700 p-1 rounded-lg">
              {(['1:1', '3:4', '4:3', '16:9'] as AspectRatio[]).map((ratio) => (
                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-3 py-1 text-xs font-bold rounded ${aspectRatio === ratio ? 'bg-brand-600 text-white shadow-md' : 'text-brand-300 hover:text-white'}`}>{ratio}</button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 bg-luxury-900 relative flex flex-col items-center justify-center p-8">
          <div className="absolute top-4 z-20 flex items-center gap-2 px-4 py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-full backdrop-blur-md shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-100">Identity & Skin Tone Locked</span>
          </div>
          <div className="relative w-full h-full max-w-5xl flex gap-4 mt-8 items-center justify-center">
            {viewMode === 'split' && (
              <>
                 <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-brand-900/30 bg-luxury-800 flex items-center justify-center h-full"><img src={originalImage} className="max-w-full max-h-full object-contain" /></div>
                 {currentGeneratedImage && (<div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-emerald-500/30 bg-luxury-800 flex items-center justify-center h-full"><img src={currentGeneratedImage} className="max-w-full max-h-full object-contain" /><div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/30 z-10"><ShieldCheck className="w-3.5 h-3.5" /> <span>TrueTone™</span></div></div>)}
              </>
            )}
            {viewMode === 'single' && currentGeneratedImage && (<div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-emerald-500/30 bg-luxury-800 flex items-center justify-center h-full w-full"><img src={currentGeneratedImage} className="max-w-full max-h-full object-contain" /></div>)}
            {isGenerating && (<div className="absolute inset-0 bg-luxury-900/90 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8"><div className="relative mb-6"><div className="w-20 h-20 rounded-full border-4 border-brand-900 border-t-brand-500 animate-spin" /><Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-400" /></div><h3 className="text-2xl font-serif text-brand-100 mb-2 font-bold">Designing Twin...</h3><p className="text-brand-400 font-bold animate-pulse mb-6">{loadingMessages[loadingStep]}</p><div className="w-64 h-2 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-6 shadow-inner"><div className="h-full bg-brand-500 transition-all duration-200" style={{ width: `${progress}%` }} /></div><div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold bg-emerald-950/40 px-4 py-2 rounded-full border border-emerald-500/20"><Lock className="w-3.5 h-3.5" /> IDENTITY PRESERVATION ACTIVE</div></div>)}
          </div>
        </div>

        <div className="w-full lg:w-96 bg-luxury-800 border-l border-brand-900/30 p-6 flex flex-col gap-8 overflow-y-auto">
           <div className="space-y-4">
             <div className="flex items-center justify-between text-brand-200">
               <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-500" /><h3 className="font-serif font-bold text-lg">Your Vision</h3></div>
               <button onClick={handleEnhancePrompt} disabled={!prompt.trim() || isEnhancing} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50"><Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} /> {isEnhancing ? 'Refining...' : 'Magic Wand'}</button>
             </div>
             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Describe outfit/scene changes clearly..."
               className="w-full h-36 bg-brand-50 border border-brand-500 rounded-xl p-4 text-sm text-black font-bold placeholder:text-gray-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-inner"
             />
           </div>

           <div className="space-y-4">
             <h3 className="font-serif font-bold text-brand-200 flex items-center gap-2 uppercase tracking-wide text-xs"><Scissors className="w-4 h-4" /> Hair Studio</h3>
             <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-brand-900">
               {hairOptions.map(opt => (
                 <button key={opt.value} onClick={() => setEnhancements({...enhancements, hairStyle: opt.value})} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${enhancements.hairStyle === opt.value ? 'bg-brand-600 border-brand-500 text-white shadow-lg' : 'bg-luxury-900 border-brand-900/30 text-brand-300 hover:border-brand-500/50'}`}>
                   {opt.label}
                   {enhancements.hairStyle === opt.value && <Check className="w-3 h-3" />}
                 </button>
               ))}
             </div>
           </div>

           <button
             onClick={handleGenerate}
             disabled={!canGenerate || isGenerating}
             className="mt-auto w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-brand-900/30 disabled:opacity-50 transition-all hover:scale-[1.02]"
           >
             {isGenerating ? 'Forging Twins...' : 'Generate 4 Twins'}
           </button>
        </div>
      </div>
    </div>
  );
};