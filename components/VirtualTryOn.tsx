import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shirt, Sparkles, RefreshCw, Ruler, User, Users, CheckCircle2, ShieldCheck, AlertCircle, RefreshCcw, Scissors, Check, Zap, Hand } from 'lucide-react';
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
  const [stylingNotes, setStylingNotes] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading State
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Analyzing body pose for natural fit...",
    "Stripping original jewelry for fresh look...",
    "Applying target accessories & shoes...",
    "Matching environmental lighting...",
    "Sculpting manicured nail shape...",
    "Finalizing original, un-staged look..."
  ];

  const hairOptions: {value: HairStyle, label: string}[] = [
    { value: 'default', label: 'Keep Original' },
    { value: 'voluminous_blowout', label: 'Blowout' },
    { value: 'straight_sleek', label: 'Sleek' },
    { value: 'wavy_beachy', label: 'Beachy' },
    { value: 'curly_coily', label: 'Curls' },
    { value: 'updo_bun', label: 'Updo' },
    { value: 'bob_cut', label: 'Bob' },
  ];

  const nailShapeOptions: {value: NailStyle, label: string}[] = [
    { value: 'default', label: 'Original' },
    { value: 'french', label: 'French Tip' },
    { value: 'almond', label: 'Almond' },
    { value: 'square', label: 'Square' },
    { value: 'stiletto', label: 'Stiletto' },
  ];

  const nailColorOptions = [
    { value: 'default', label: 'Natural', hex: 'transparent' },
    { value: 'classic red', label: 'Red', hex: '#b91c1c' },
    { value: 'neutral nude', label: 'Nude', hex: '#d2b48c' },
    { value: 'glossy white', label: 'White', hex: '#ffffff' },
    { value: 'deep black', label: 'Black', hex: '#000000' },
    { value: 'chrome silver', label: 'Chrome', hex: '#e5e7eb' },
    { value: 'soft pink', label: 'Pink', hex: '#f9a8d4' },
    { value: 'lux gold', label: 'Gold', hex: '#fbbf24' },
  ];

  useEffect(() => {
    let stepInterval: any;
    let progressInterval: any;

    if (isGenerating) {
      setLoadingStep(0);
      setProgress(0);
      
      stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return 98;
          const increment = Math.random() * 1.5 + 0.2;
          return prev + increment;
        });
      }, 200);
    }
    return () => {
      if (stepInterval) clearInterval(stepInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
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
      const results = await generateCompositeImage(
        apiKey, 
        personImage, 
        outfitImage, 
        'TRYON', 
        `STRICT FACIAL IDENTITY LOCK. ${stylingNotes}`, 
        '9:16', 
        selectedHair,
        selectedNail,
        selectedNailColor
      );
      
      if (results.length === 0) {
        throw new Error("No images were generated. Ensure both photos are clear.");
      }

      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: personImage,
          generatedData: results[0],
          prompt: `Jewelry-Exchange Try-On: Nails ${selectedNail} ${selectedNailColor}.`,
          timestamp: Date.now(),
          aspectRatio: '9:16'
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during the clothing swap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Shirt className="w-6 h-6 text-brand-500" />
              <h2 className="text-2xl font-serif text-brand-100 font-bold">Virtual Wardrobe</h2>
            </div>
            <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1 text-center">Identity-Locked Fashion Studio</p>
          </div>
          <div className="w-20" />
       </div>

       <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
          {/* Controls Panel */}
          <div className="w-full lg:w-96 space-y-6">
             <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                   <p className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Jewelry Exchange Active</p>
                   <p className="text-[10px] text-emerald-400/80">Original jewelry is removed and replaced ONLY by the accessories in the new outfit.</p>
                </div>
             </div>

             {/* Image Upload Grid */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-luxury-800 p-4 rounded-3xl border border-brand-900/30 flex flex-col items-center">
                   <div className="w-full aspect-[3/4] bg-luxury-900 rounded-xl relative overflow-hidden mb-3 border border-brand-900">
                      {personImage ? <img src={personImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs">Model</div>}
                      <input type="file" onChange={handleUpload(setPersonImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <h3 className="text-[10px] text-brand-400 uppercase font-bold">1. Subject</h3>
                </div>

                <div className="bg-luxury-800 p-4 rounded-3xl border border-brand-900/30 flex flex-col items-center">
                   <div className="w-full aspect-[3/4] bg-luxury-900 rounded-xl relative overflow-hidden mb-3 border border-brand-900">
                      {outfitImage ? <img src={outfitImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs text-center px-2">Target Outfit</div>}
                      <input type="file" onChange={handleUpload(setOutfitImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                   <h3 className="text-[10px] text-brand-400 uppercase font-bold">2. Pieces</h3>
                </div>
             </div>

             {/* Hairstyle Section */}
             <div className="bg-luxury-800 p-5 rounded-3xl border border-brand-900/30 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Scissors className="w-4 h-4 text-brand-500" />
                    <h3 className="text-brand-100 font-serif font-bold">Hairstyle</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                   {hairOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedHair(opt.value)}
                        className={`px-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${selectedHair === opt.value ? 'bg-brand-600 border-brand-500 text-white' : 'bg-luxury-900 border-brand-900/30 text-brand-400 hover:border-brand-500/50'}`}
                      >
                        {opt.label}
                      </button>
                   ))}
                </div>
             </div>

             {/* Nail Studio Section */}
             <div className="bg-luxury-800 p-5 rounded-3xl border border-brand-900/30 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Hand className="w-4 h-4 text-brand-500" />
                    <h3 className="text-brand-100 font-serif font-bold">Nail Studio</h3>
                </div>
                
                <div className="mb-4">
                   <p className="text-[10px] font-bold text-brand-500 uppercase mb-2">Shape</p>
                   <div className="grid grid-cols-3 gap-2">
                      {nailShapeOptions.map(opt => (
                         <button
                           key={opt.value}
                           onClick={() => setSelectedNail(opt.value)}
                           className={`px-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${selectedNail === opt.value ? 'bg-brand-600 border-brand-500 text-white' : 'bg-luxury-900 border-brand-900/30 text-brand-400 hover:border-brand-500/50'}`}
                         >
                           {opt.label}
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] font-bold text-brand-500 uppercase mb-2">Color</p>
                   <div className="flex flex-wrap gap-2">
                      {nailColorOptions.map(opt => (
                         <button
                           key={opt.value}
                           onClick={() => setSelectedNailColor(opt.value)}
                           className={`w-6 h-6 rounded-full border-2 transition-all relative ${selectedNailColor === opt.value ? 'border-brand-500 scale-110 ring-2 ring-brand-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                           style={{ backgroundColor: opt.value === 'default' ? 'transparent' : opt.hex }}
                           title={opt.label}
                         >
                            {opt.value === 'default' && <div className="absolute inset-0 flex items-center justify-center text-[8px] text-brand-400">X</div>}
                         </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* Vibe & Details */}
             <div className="bg-luxury-800 p-5 rounded-3xl border border-brand-900/30">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-brand-500" />
                    <h3 className="text-brand-100 font-serif font-bold">Styling Notes</h3>
                </div>
                <textarea 
                  value={stylingNotes}
                  onChange={(e) => setStylingNotes(e.target.value)}
                  placeholder="e.g. 'Walking in a modern street'. (Perfume ignored, old jewelry removed automatically)"
                  className="w-full h-24 bg-luxury-900 rounded-xl border border-brand-900/50 p-3 text-brand-50 focus:border-brand-500 outline-none text-xs placeholder:text-brand-400/30 resize-none"
                />
             </div>

             <button
               onClick={handleGenerate}
               disabled={!personImage || !outfitImage || isGenerating}
               className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-serif font-bold text-lg rounded-2xl shadow-xl shadow-brand-900/30 hover:scale-[1.02] transition-all disabled:opacity-50"
             >
               {isGenerating ? 'Mapping Seamless Look...' : 'Fit Full Outfit'}
             </button>

             {error && (
                <div className="bg-rose-950/30 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                   <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                   <div>
                      <p className="text-xs font-bold text-rose-100 uppercase tracking-wide">Studio Error</p>
                      <p className="text-[10px] text-rose-400/90 mt-1">{error}</p>
                   </div>
                </div>
             )}
          </div>

          {/* Visualization Area */}
          <div className="flex-1 flex flex-col gap-4">
             <div className="flex-1 bg-luxury-800 rounded-3xl border-4 border-luxury-700 shadow-2xl relative min-h-[600px] overflow-hidden flex items-center justify-center">
                {currentImage ? (
                   <img src={currentImage} className="w-full h-full object-contain" />
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-400/10 p-12 text-center select-none">
                      <Shirt className="w-48 h-48 mb-4 opacity-5" />
                      <p className="font-serif text-3xl">Magic Mirror</p>
                      <p className="text-sm mt-4 max-w-xs leading-relaxed">Your full look will appear here. Faces are strictly locked, original jewelry is removed, and target accessories are seamlessly blended.</p>
                   </div>
                )}
                
                {isGenerating && (
                   <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center">
                      <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-full border-4 border-brand-900 border-t-brand-500 animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-400" />
                      </div>
                      <h3 className="font-serif text-2xl text-brand-100 mb-2 font-bold uppercase tracking-tight">Un-Staging Your Look</h3>
                      <p className="text-brand-400/80 font-medium animate-pulse mb-6 max-w-xs">{loadingMessages[loadingStep]}</p>

                      {/* Progress Section */}
                      <div className="w-64 h-2 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-3">
                        <div 
                          className="h-full bg-brand-500 transition-all duration-300 ease-out"
                          style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 mb-8">
                        <p className="text-brand-100 text-xl font-mono font-bold">{Math.min(100, Math.round(progress))}%</p>
                        <p className="text-[10px] text-brand-500 uppercase tracking-widest font-bold">Generation Progress</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-950/40 rounded-full border border-emerald-500/20">
                         <ShieldCheck className="w-3 h-3 text-emerald-500" />
                         <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Natural Blend Mode Active</span>
                      </div>
                   </div>
                )}
             </div>

             {/* Results Strip */}
             {generatedImages.length > 0 && (
               <div className="w-full bg-luxury-800 p-4 rounded-2xl border border-brand-900/30 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <div className="flex gap-4">
                     {generatedImages.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedImageIndex(i)}
                          className={`relative w-28 aspect-[9/16] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${selectedImageIndex === i ? 'border-brand-500 scale-105 shadow-xl' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                           <img src={img} className="w-full h-full object-cover" />
                           {selectedImageIndex === i && (
                              <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center">
                                 <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};