import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shirt, Sparkles, RefreshCw, Ruler, User, Users, CheckCircle2, ShieldCheck, AlertCircle, RefreshCcw, Scissors, Check, Zap, Hand, Smile, Camera, Map, Sliders, Palette } from 'lucide-react';
import { generateCompositeImage } from '../services/geminiService';
import { GeneratedImage, HairStyle, NailStyle } from '../types';

interface VirtualTryOnProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [selectedHair, setSelectedHair] = useState<HairStyle>('default');
  const [selectedNail, setSelectedNail] = useState<NailStyle>('default');
  const [selectedNailColor, setSelectedNailColor] = useState('default');
  
  const [selectedEmotion, setSelectedEmotion] = useState('Confident');
  const [selectedPose, setSelectedPose] = useState('Standing');
  const [selectedBackground, setSelectedBackground] = useState('Luxury Interior');
  const [stylingNotes, setStylingNotes] = useState('');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Locking facial features for consistency...",
    "Analyzing body pose for natural fit...",
    "Stripping original jewelry for fresh look...",
    "Applying target accessories & shoes...",
    "Finalizing TrueTone™ identity render..."
  ];

  const emotionOptions = ['Confident', 'Friendly Smile', 'Serious Editorial', 'Candid Laugh', 'Soft Pout'];
  const poseOptions = ['Standing', 'Walking Forward', 'Seated Relaxed', 'Side Fashion Pose', 'High-Angle Selfie'];
  const backgroundOptions = ['Luxury Interior', 'Urban Street', 'Minimal Studio', 'Nature Garden', 'Evening Gala'];

  const hairOptions: {value: HairStyle, label: string}[] = [
    { value: 'default', label: 'Original' },
    { value: 'voluminous_blowout', label: 'Blowout' },
    { value: 'straight_sleek', label: 'Silk Press' },
    { value: 'wavy_beachy', label: 'Wolf Cut' },
    { value: 'curly_coily', label: 'Coily Curls' },
    { value: 'updo_bun', label: 'Sleek Bun' },
    { value: 'bob_cut', label: 'Chin Bob' },
    { value: 'braids', label: 'Box Braids' },
    { value: 'curtain_bangs', label: 'Curtain Bangs' },
    { value: 'buzz_cut', label: 'Buzz Cut' },
  ];

  const nailShapeOptions: {value: NailStyle, label: string}[] = [
    { value: 'default', label: 'Original' },
    { value: 'almond', label: 'Almond' },
    { value: 'stiletto', label: 'Stiletto' },
    { value: 'square', label: 'Square' },
    { value: 'french', label: 'V-Tip French' },
  ];

  const nailColorOptions = [
    { value: 'default', label: 'Natural', hex: 'transparent' },
    { value: 'classic red', label: 'Red', hex: '#b91c1c' },
    { value: 'chrome silver', label: 'Chrome', hex: '#e5e7eb' },
    { value: 'jelly pink', label: 'Jelly Pink', hex: '#ff69b4' },
    { value: 'aura blue', label: 'Aura Blue', hex: '#00ffff' },
    { value: 'deep black', label: 'Matte Black', hex: '#000000' },
    { value: '3d charms', label: '3D Jewels', hex: '#fbbf24' },
    { value: 'cat eye green', label: 'Cat Eye', hex: '#22c55e' },
  ];

  useEffect(() => {
    let stepInterval: any;
    let progressInterval: any;
    if (isGenerating) {
      setLoadingStep(0);
      setProgress(0);
      stepInterval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingMessages.length), 2500);
      progressInterval = setInterval(() => setProgress(prev => prev >= 98 ? 98 : prev + Math.random() * 1.5 + 0.2), 200);
    }
    return () => { clearInterval(stepInterval); clearInterval(progressInterval); };
  }, [isGenerating]);

  const handleUpload = (setter: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setter(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!personImage || !outfitImage) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    try {
      const combinedPrompt = `VIBE: ${selectedEmotion}, POSE: ${selectedPose}, BACKGROUND: ${selectedBackground}. ${stylingNotes}`;
      const results = await generateCompositeImage(apiKey, personImage, outfitImage, 'TRYON', combinedPrompt, '9:16', selectedHair, selectedNail, selectedNailColor);
      if (results.length === 0) throw new Error("No images were generated.");
      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      onSaveToHistory({ id: Date.now().toString(), originalData: personImage, generatedData: results[0], prompt: `Wardrobe: ${selectedEmotion}`, timestamp: Date.now(), aspectRatio: '9:16' });
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-bold">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Shirt className="w-6 h-6 text-brand-500" />
              <h2 className="text-2xl font-serif text-brand-100 font-bold">Virtual Wardrobe</h2>
            </div>
            <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">Expanded Style Catalog</p>
          </div>
          <div className="w-20" />
       </div>

       <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
          <div className="w-full lg:w-96 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide pr-2">
             <div className="bg-luxury-800 p-4 rounded-3xl border border-brand-900/30 flex flex-col items-center gap-4 shadow-xl">
                <div className="grid grid-cols-2 gap-3 w-full">
                   <div className="aspect-[3/4] bg-luxury-950 rounded-xl relative overflow-hidden border border-brand-900">
                      {personImage ? <img src={personImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 text-[10px] uppercase font-bold text-center p-2">1. Upload Subject</div>}
                      <input type="file" onChange={handleUpload(setPersonImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <div className="aspect-[3/4] bg-luxury-950 rounded-xl relative overflow-hidden border border-brand-900">
                      {outfitImage ? <img src={outfitImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 text-[10px] uppercase font-bold text-center p-2">2. Upload Outfit</div>}
                      <input type="file" onChange={handleUpload(setOutfitImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>
             </div>

             <div className="bg-luxury-800 p-5 rounded-3xl border border-brand-900/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-brand-500" />
                    <h3 className="text-brand-100 font-serif font-bold">Hair & Style</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {hairOptions.map(opt => (
                      <button key={opt.value} onClick={() => setSelectedHair(opt.value)} className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all ${selectedHair === opt.value ? 'bg-brand-600 border-brand-500 text-white' : 'bg-luxury-900 border-brand-900/30 text-brand-400 hover:border-brand-500/50'}`}>{opt.label}</button>
                   ))}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-brand-500 uppercase mb-2 tracking-widest">Nail Catalog</p>
                   <div className="flex flex-wrap gap-2">
                      {nailColorOptions.map(opt => (
                         <button key={opt.value} onClick={() => setSelectedNailColor(opt.value)} className={`w-7 h-7 rounded-full border-2 transition-all relative ${selectedNailColor === opt.value ? 'border-brand-500 scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`} style={{ backgroundColor: opt.value === 'default' ? 'transparent' : opt.hex }} title={opt.label}>
                            {opt.value === 'default' && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-400 font-bold">X</div>}
                         </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-luxury-800 p-5 rounded-3xl border border-brand-900/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-500" />
                    <h3 className="text-brand-100 font-serif font-bold text-sm">Style Parameters</h3>
                </div>
                <div className="space-y-3">
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Emotion</label>
                      <select value={selectedEmotion} onChange={(e) => setSelectedEmotion(e.target.value)} className="w-full bg-brand-50 border border-brand-500 rounded-xl p-3 text-xs text-black font-bold appearance-none outline-none focus:ring-2 focus:ring-brand-500">{emotionOptions.map(e => <option key={e} value={e}>{e}</option>)}</select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Environment</label>
                      <select value={selectedBackground} onChange={(e) => setSelectedBackground(e.target.value)} className="w-full bg-brand-50 border border-brand-500 rounded-xl p-3 text-xs text-black font-bold appearance-none outline-none focus:ring-2 focus:ring-brand-500">{backgroundOptions.map(b => <option key={b} value={b}>{b}</option>)}</select>
                   </div>
                </div>
                <textarea 
                  value={stylingNotes} 
                  onChange={(e) => setStylingNotes(e.target.value)} 
                  placeholder="Extra notes (e.g. 'Golden hour glow', 'Summer vibes')..." 
                  className="w-full h-20 bg-brand-50 border border-brand-500 rounded-xl p-3 text-xs text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner resize-none" 
                />
             </div>

             <button onClick={handleGenerate} disabled={!personImage || !outfitImage || isGenerating} className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-serif font-bold text-lg rounded-2xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
               {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
               {isGenerating ? 'Rendering...' : 'Render Wardrobe'}
             </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
             <div className="flex-1 bg-luxury-800 rounded-3xl border border-brand-900/30 shadow-2xl relative min-h-[600px] overflow-hidden flex items-center justify-center">
                {currentImage ? <img src={currentImage} className="w-full h-full object-contain animate-in fade-in duration-700" /> : (
                   <div className="flex flex-col items-center justify-center text-brand-400/10 p-12 text-center">
                      <Shirt className="w-48 h-48 mb-4 opacity-5" />
                      <p className="font-serif text-3xl font-bold">Try-On Mirror</p>
                      <p className="text-sm mt-2 font-medium opacity-40">Identity and skin tones strictly protected.</p>
                   </div>
                )}
                {isGenerating && (
                   <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                      <div className="relative mb-8"><div className="w-24 h-24 rounded-full border-4 border-brand-900 border-t-brand-500 animate-spin" /><Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-400 animate-pulse" /></div>
                      <h3 className="font-serif text-2xl text-brand-100 mb-2 font-bold uppercase tracking-tight">Designing Your Twin</h3>
                      <p className="text-brand-400/80 font-bold animate-pulse mb-6 max-w-xs uppercase text-[10px] tracking-widest">{loadingMessages[loadingStep]}</p>
                      <div className="w-64 h-2 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-3 shadow-inner"><div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} /></div>
                      <div className="flex items-center gap-2 mt-4 px-6 py-2.5 bg-emerald-950/40 rounded-full border border-emerald-500/30 shadow-lg"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Forensic Identity Preservation Active</span></div>
                   </div>
                )}
             </div>
             {generatedImages.length > 0 && (
               <div className="w-full bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-xl">
                  <div className="flex gap-5">
                     {generatedImages.map((img, i) => (
                        <div key={i} onClick={() => setSelectedImageIndex(i)} className={`relative w-28 aspect-[9/16] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all duration-300 ${selectedImageIndex === i ? 'border-brand-500 scale-105 shadow-2xl ring-4 ring-brand-500/10' : 'border-transparent opacity-40 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" /></div>
                     ))}
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};