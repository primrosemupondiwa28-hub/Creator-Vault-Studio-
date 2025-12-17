import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Download, RefreshCw, ArrowLeft, SplitSquareHorizontal, Maximize2, ShieldCheck, Lock, Sparkles, Smile, Palette, Image as ImageIcon, Upload, X, Layout, Hand, Droplets, Scissors, Users, User, Check, Feather } from 'lucide-react';
import { generateEditedImage, CosmeticEnhancements } from '../services/geminiService';
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
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'single'>('split');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  
  // Loading State
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
      
      // Cycle messages
      stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);

      // Simulate progress (15s approx total time)
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          const increment = Math.random() * 2 + 0.5; // Random increment between 0.5% and 2.5%
          return prev + increment;
        });
      }, 200);
    }
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
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
      const results = await generateEditedImage(
        apiKey,
        originalImage, 
        mimeType, 
        prompt || (enhancements.hairStyle !== 'default' ? "Apply hair transformation." : "Enhanced portrait."), 
        true, // Always apply to subject
        enhancements,
        aspectRatio,
        customBackground
      );
      
      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: originalImage,
          generatedData: results[0],
          prompt: prompt || `Hair: ${enhancements.hairStyle}`,
          timestamp: Date.now(),
          aspectRatio: aspectRatio
        });
      }
    } catch (err: any) {
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentGeneratedImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result && typeof ev.target.result === 'string') {
          setCustomBackground(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const hairOptions: {value: HairStyle, label: string}[] = [
    { value: 'default', label: 'Current Hair' },
    { value: 'voluminous_blowout', label: 'Blowout' },
    { value: 'straight_sleek', label: 'Sleek Straight' },
    { value: 'wavy_beachy', label: 'Beachy Waves' },
    { value: 'curly_coily', label: 'Coily Curls' },
    { value: 'braids', label: 'Braids' },
    { value: 'afro_natural', label: 'Natural Afro' },
    { value: 'updo_bun', label: 'Elegant Updo' },
    { value: 'short_pixie', label: 'Short Pixie' },
    { value: 'bob_cut', label: 'Chic Bob' },
    { value: 'long_layers', label: 'Long Layers' },
    { value: 'curtain_bangs', label: 'Curtain Bangs' },
    { value: 'side_part', label: 'Side Part' },
    { value: 'buzz_cut', label: 'Buzz Cut' },
    { value: 'bald', label: 'Bald' },
    { value: 'mohawk', label: 'Mohawk' },
  ];

  const facialHairOptions: {value: FacialHair, label: string}[] = [
    { value: 'default', label: 'Keep Current' },
    { value: 'clean_shaven', label: 'Clean Shaven' },
    { value: 'light_stubble', label: 'Light Stubble' },
    { value: 'heavy_stubble', label: 'Heavy Stubble' },
    { value: 'full_beard', label: 'Full Beard' },
    { value: 'goatee', label: 'Goatee' },
    { value: 'mustache', label: 'Mustache' },
    { value: 'handlebars', label: 'Handlebar Mustache' },
  ];

  const colorOptions: {value: HairColor, label: string, hex: string}[] = [
    { value: 'default', label: 'Current', hex: 'transparent' },
    { value: 'blonde', label: 'Blonde', hex: '#e6cba8' },
    { value: 'brunette', label: 'Brunette', hex: '#4a3728' },
    { value: 'black', label: 'Black', hex: '#1a1a1a' },
    { value: 'red', label: 'Red', hex: '#8a3324' },
    { value: 'auburn', label: 'Auburn', hex: '#592f2a' },
    { value: 'copper', label: 'Copper', hex: '#b87333' },
    { value: 'silver', label: 'Silver', hex: '#c0c0c0' },
    { value: 'platinum', label: 'Platinum', hex: '#e5e4e2' },
    { value: 'white', label: 'White', hex: '#ffffff' },
    { value: 'pastel_pink', label: 'Pink', hex: '#ffb7c5' },
    { value: 'pastel_purple', label: 'Lavender', hex: '#e6e6fa' },
    { value: 'midnight_blue', label: 'Midnight Blue', hex: '#191970' },
    { value: 'neon_green', label: 'Neon Green', hex: '#39ff14' },
  ];

  const textureOptions: {value: HairTexture, label: string}[] = [
    { value: 'default', label: 'Natural / Default' },
    { value: 'smooth_silky', label: 'Silky Smooth' },
    { value: 'messy_tousled', label: 'Messy / Tousled' },
    { value: 'wet_look', label: 'Wet Look' },
    { value: 'glossy_shiny', label: 'High Gloss' },
    { value: 'matte_dry', label: 'Soft Matte' },
    { value: 'coarse_kinky', label: 'Coarse / Textured' },
  ];

  const targetOptions: {value: HairTarget, label: string}[] = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'women', label: 'Women' },
    { value: 'men', label: 'Men' },
    { value: 'children', label: 'Children' },
    { value: 'person_on_left', label: 'Left Person' },
    { value: 'person_on_right', label: 'Right Person' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-luxury-900 text-brand-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-900/30 bg-luxury-800">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Exit Studio
        </button>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 bg-luxury-700 p-1 rounded-lg">
              {(['1:1', '3:4', '4:3', '16:9'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1 text-xs font-medium rounded ${aspectRatio === ratio ? 'bg-brand-600 text-white shadow-md' : 'text-brand-300 hover:text-white'}`}
                >
                  {ratio}
                </button>
              ))}
           </div>
           
           {currentGeneratedImage && (
             <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentGeneratedImage;
                link.download = `twinly-${Date.now()}.png`;
                link.click();
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-brand-900/40"
             >
               Save Photo
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Canvas Area */}
        <div className="flex-1 bg-luxury-900 relative flex flex-col items-center justify-center p-8">
          
          {/* Persistent Safety Badge */}
          <div className="absolute top-4 z-20 flex items-center gap-2 px-4 py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-full backdrop-blur-md shadow-lg shadow-emerald-900/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-100/90">Identity & Skin Tone Locked</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></div>
          </div>

          <div className="relative w-full h-full max-w-5xl flex gap-4 mt-8">
            {/* Split View */}
            {(!currentGeneratedImage || viewMode === 'split') && (
               <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-brand-900/30 bg-luxury-800 flex items-center justify-center group">
                  <img src={originalImage} className="max-w-full max-h-full object-contain" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-xs px-3 py-1 rounded-full border border-white/10 text-white/80">Reference</div>
               </div>
            )}
            
            {/* Result View */}
            {currentGeneratedImage && (
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-emerald-500/30 bg-luxury-800 flex items-center justify-center">
                 <img src={currentGeneratedImage} className="max-w-full max-h-full object-contain" />
                 
                 {/* TrueTone Badge */}
                 <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/30 z-10">
                   <ShieldCheck className="w-3.5 h-3.5" /> 
                   <span>TrueTone™ Preserved</span>
                 </div>

                 {/* NEW: Identity Locked Badge Bottom Right */}
                 <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-luxury-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/30 shadow-2xl z-10 hover:bg-luxury-950/95 transition-all cursor-help group/badge">
                    <div className="bg-emerald-500/20 p-2 rounded-full ring-1 ring-emerald-500/30">
                      <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1.5">
                         <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Identity Locked</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                       </div>
                       <span className="text-[10px] text-emerald-400/70 font-medium">Features Preserved</span>
                    </div>
                 </div>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-900 border-t-brand-500 animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-2xl font-serif text-brand-100 mb-2">Designing Twin...</h3>
                <p className="text-brand-400/80 font-medium animate-pulse mb-4 min-w-[200px] text-center">{loadingMessages[loadingStep]}</p>
                
                {/* Progress Bar */}
                <div className="w-64 h-2 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-6">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-200 ease-out"
                    style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                  />
                </div>
                <p className="text-brand-400/60 text-xs font-mono mb-6">{Math.min(100, Math.round(progress))}% Complete</p>
                
                <div className="flex items-center gap-2 text-emerald-400/80 text-xs font-bold bg-emerald-950/40 px-4 py-2 rounded-full border border-emerald-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>IDENTITY PRESERVATION ACTIVE</span>
                </div>
              </div>
            )}
          </div>

          {/* Variations Strip */}
          {generatedImages.length > 0 && (
             <div className="mt-6 h-20 flex gap-4">
                {generatedImages.map((img, i) => (
                   <img 
                     key={i} 
                     src={img} 
                     onClick={() => setSelectedImageIndex(i)}
                     className={`h-full rounded-lg cursor-pointer border-2 transition-all ${selectedImageIndex === i ? 'border-brand-500 scale-105 shadow-lg shadow-brand-900/50' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   />
                ))}
             </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full lg:w-96 bg-luxury-800 border-l border-brand-900/30 p-6 flex flex-col gap-8 overflow-y-auto">
           
           {/* Prompt Section */}
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-brand-200">
               <Sparkles className="w-4 h-4 text-brand-500" />
               <h3 className="font-serif font-semibold">Your Vision</h3>
             </div>
             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Describe the new scene (e.g., 'Wearing a red silk dress at a gala in Paris'). The AI will invent the pose."
               className="w-full h-32 bg-luxury-900 border border-brand-900/50 rounded-xl p-4 text-sm text-brand-50 placeholder-brand-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none transition-all"
             />
           </div>

           {/* Hair Studio */}
           <div className="space-y-4">
             <h3 className="font-serif font-semibold text-brand-200 flex items-center gap-2">
                <Scissors className="w-4 h-4" /> Hair Studio
             </h3>
             <div className="space-y-4">
               
               {/* Hair Style Grid */}
               <div>
                 <label className="text-xs text-brand-400 font-medium mb-2 block">Hair Style</label>
                 <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-brand-900">
                   {hairOptions.map(opt => (
                     <button
                       key={opt.value}
                       onClick={() => setEnhancements({...enhancements, hairStyle: opt.value})}
                       className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${enhancements.hairStyle === opt.value ? 'bg-brand-600 border-brand-500 text-white shadow-md' : 'bg-luxury-900 border-brand-900/30 text-brand-200 hover:border-brand-500/50'}`}
                     >
                       {opt.label}
                       {enhancements.hairStyle === opt.value && <Check className="w-3 h-3" />}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Hair Texture */}
               <div>
                  <label className="text-xs text-brand-400 font-medium mb-1.5 flex items-center gap-1">
                     <Feather className="w-3 h-3" /> Hair Texture
                  </label>
                  <div className="relative">
                    <select
                      value={enhancements.hairTexture}
                      onChange={(e) => setEnhancements(prev => ({...prev, hairTexture: e.target.value as HairTexture}))}
                      className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-sm text-brand-100 outline-none focus:border-brand-500 appearance-none"
                    >
                      {textureOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
               </div>

               {/* Target Selector */}
               <div>
                 <label className="text-xs text-brand-400 font-medium mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Apply To
                 </label>
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {targetOptions.map(opt => (
                       <button
                         key={opt.value}
                         onClick={() => setEnhancements({...enhancements, hairTarget: opt.value})}
                         className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${enhancements.hairTarget === opt.value ? 'bg-brand-900/60 border-brand-500 text-brand-100' : 'bg-luxury-900 border-transparent text-brand-400 hover:bg-luxury-900/80'}`}
                       >
                         {opt.label}
                       </button>
                    ))}
                 </div>
               </div>

               {/* Hair Color */}
               <div>
                 <label className="text-xs text-brand-400 font-medium mb-2 block">Hair Color</label>
                 <div className="flex flex-wrap gap-2">
                    {colorOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setEnhancements({...enhancements, hairColor: opt.value})}
                        className={`w-8 h-8 rounded-full border-2 transition-all relative group flex items-center justify-center ${enhancements.hairColor === opt.value ? 'border-brand-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                        style={{ backgroundColor: opt.value === 'default' ? 'transparent' : opt.hex }}
                        title={opt.label}
                      >
                         {opt.value === 'default' && <div className="w-full h-0.5 bg-brand-400 -rotate-45" />}
                      </button>
                    ))}
                 </div>
               </div>

               {/* Facial Hair */}
               <div>
                 <label className="text-xs text-brand-400 font-medium mb-1.5 flex items-center gap-1">
                    <User className="w-3 h-3" /> Facial Hair (Men)
                 </label>
                 <div className="relative">
                   <select
                     value={enhancements.facialHair}
                     onChange={(e) => setEnhancements(prev => ({...prev, facialHair: e.target.value as FacialHair}))}
                     className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-sm text-brand-100 outline-none focus:border-brand-500 appearance-none"
                   >
                     {facialHairOptions.map(opt => (
                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                     ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                 </div>
               </div>

             </div>
           </div>

           {/* Beauty Controls */}
           <div className="space-y-4">
             <h3 className="font-serif font-semibold text-brand-200 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Beauty Studio
             </h3>
             
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setEnhancements(p => ({...p, teethWhitening: !p.teethWhitening}))}
                 className={`p-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-2 ${enhancements.teethWhitening ? 'bg-brand-900/40 border-brand-500 text-brand-100' : 'bg-luxury-900 border-transparent text-brand-400/60'}`}
               >
                 <Smile className="w-4 h-4" /> Whitening
               </button>
               <button 
                 onClick={() => setEnhancements(p => ({...p, makeupMode: !p.makeupMode}))}
                 className={`p-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-2 ${enhancements.makeupMode ? 'bg-brand-900/40 border-brand-500 text-brand-100' : 'bg-luxury-900 border-transparent text-brand-400/60'}`}
               >
                 <Sparkles className="w-4 h-4" /> Glamour Makeup
               </button>
             </div>

             <div>
                <label className="text-xs font-medium text-brand-300 mb-2 block">Skin Finish</label>
                <div className="grid grid-cols-3 gap-2">
                   {['default', 'matte', 'glowing'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setEnhancements(p => ({...p, skinFinish: f as SkinFinish}))}
                        className={`py-2 px-1 rounded-lg text-[10px] uppercase tracking-wide border ${enhancements.skinFinish === f ? 'bg-brand-500 border-brand-500 text-white' : 'bg-luxury-900 border-brand-900/30 text-brand-400'}`}
                      >
                        {f}
                      </button>
                   ))}
                </div>
             </div>
           </div>

           {/* Background Upload */}
           <div className="space-y-2">
              <h3 className="font-serif font-semibold text-brand-200 flex items-center gap-2">
                 <ImageIcon className="w-4 h-4" /> Custom Scene
              </h3>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 rounded-xl border border-dashed border-brand-900 hover:border-brand-500 flex items-center justify-center gap-2 cursor-pointer bg-luxury-900/50 transition-colors"
              >
                {customBackground ? (
                  <span className="text-xs text-brand-300">Image Loaded (Click to change)</span>
                ) : (
                  <>
                     <Upload className="w-3 h-3 text-brand-400" />
                     <span className="text-xs text-brand-400">Upload Background (Optional)</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleBackgroundUpload} hidden />
           </div>

           <button
             onClick={handleGenerate}
             disabled={!canGenerate || isGenerating}
             className="mt-auto w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:to-brand-400 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-brand-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             {isGenerating ? 'Creating...' : 'Generate 4 Twins'}
           </button>

        </div>
      </div>
    </div>
  );
}