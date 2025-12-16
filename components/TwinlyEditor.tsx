import React, { useState, useRef } from 'react';
import { Wand2, Download, RefreshCw, ArrowLeft, SplitSquareHorizontal, Maximize2, ShieldCheck, Lock, Sparkles, Smile, Palette, Image as ImageIcon, Upload, X, Layout, Hand, Droplets, Scissors, Users } from 'lucide-react';
import { generateEditedImage, CosmeticEnhancements } from '../services/geminiService';
import { GeneratedImage, AspectRatio, SkinFinish, NailStyle, HairStyle, HairTarget, HairColor } from '../types';

interface TwinlyEditorProps {
  originalImage: string;
  mimeType: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const TwinlyEditor: React.FC<TwinlyEditorProps> = ({ originalImage, mimeType, onBack, onSaveToHistory }) => {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'single'>('split');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  
  const [enhancements, setEnhancements] = useState<CosmeticEnhancements>({
    teethWhitening: false,
    eyeBrightening: false,
    makeupMode: false,
    skinFinish: 'default',
    nailStyle: 'default',
    hairStyle: 'default',
    hairTarget: 'everyone',
    hairColor: 'default'
  });
  
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = prompt.trim().length > 0 || enhancements.hairStyle !== 'default' || enhancements.hairColor !== 'default';

  const handleGenerate = async () => {
    if (!canGenerate && enhancements.hairStyle === 'default') return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const results = await generateEditedImage(
        originalImage, 
        mimeType, 
        prompt || (enhancements.hairStyle !== 'default' ? "Apply hair transformation." : "Enhanced portrait."), 
        true, // Always apply to subject
        enhancements,
        aspectRatio,
        customBackground
      );
      
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
    { value: 'default', label: 'Keep Current Hair' },
    { value: 'voluminous_blowout', label: 'Voluminous Blowout' },
    { value: 'straight_sleek', label: 'Straight & Sleek' },
    { value: 'wavy_beachy', label: 'Wavy / Beachy' },
    { value: 'curly_coily', label: 'Curly / Coily' },
    { value: 'braids', label: 'Braids / Cornrows' },
    { value: 'afro_natural', label: 'Afro / Natural' },
    { value: 'updo_bun', label: 'Elegant Updo' },
    { value: 'short_pixie', label: 'Short Pixie' },
    { value: 'bob_cut', label: 'Chic Bob' },
    { value: 'long_layers', label: 'Long Layers' },
    { value: 'curtain_bangs', label: 'Curtain Bangs' },
    { value: 'side_part', label: 'Deep Side Part' },
    { value: 'buzz_cut', label: 'Buzz Cut' },
  ];

  const colorOptions: {value: HairColor, label: string}[] = [
    { value: 'default', label: 'Keep Current Color' },
    { value: 'blonde', label: 'Blonde' },
    { value: 'brunette', label: 'Brunette' },
    { value: 'black', label: 'Jet Black' },
    { value: 'red', label: 'Red' },
    { value: 'auburn', label: 'Auburn' },
    { value: 'silver', label: 'Silver / Grey' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'pastel_pink', label: 'Pastel Pink' },
  ];

  const targetOptions: {value: HairTarget, label: string}[] = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'women', label: 'Women' },
    { value: 'men', label: 'Men' },
    { value: 'children', label: 'Children' },
    { value: 'person_on_left', label: 'Person on Left' },
    { value: 'person_on_right', label: 'Person on Right' },
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
              <div className="absolute inset-0 bg-luxury-900/80 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-900 border-t-brand-500 animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-400" />
                </div>
                <h3 className="mt-6 text-2xl font-serif text-brand-100">Designing...</h3>
                <div className="flex items-center gap-2 mt-3 text-emerald-400/80 text-sm font-medium bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Lock className="w-3 h-3" />
                  <span>Preserving Facial Structures</span>
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
             <div className="space-y-3">
               <div>
                 <label className="text-xs text-brand-400 font-medium mb-1.5 block">Hair Style</label>
                 <div className="relative">
                   <select
                     value={enhancements.hairStyle}
                     onChange={(e) => setEnhancements(prev => ({...prev, hairStyle: e.target.value as HairStyle}))}
                     className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-sm text-brand-100 outline-none focus:border-brand-500 appearance-none"
                   >
                     {hairOptions.map(opt => (
                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                     ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                 </div>
               </div>

               <div>
                 <label className="text-xs text-brand-400 font-medium mb-1.5 block">Hair Color</label>
                 <div className="relative">
                   <select
                     value={enhancements.hairColor}
                     onChange={(e) => setEnhancements(prev => ({...prev, hairColor: e.target.value as HairColor}))}
                     className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-sm text-brand-100 outline-none focus:border-brand-500 appearance-none"
                   >
                     {colorOptions.map(opt => (
                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                     ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                 </div>
               </div>

               <div>
                 <label className="text-xs text-brand-400 font-medium mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Apply To
                 </label>
                 <div className="relative">
                   <select
                     value={enhancements.hairTarget}
                     onChange={(e) => setEnhancements(prev => ({...prev, hairTarget: e.target.value as HairTarget}))}
                     className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-sm text-brand-100 outline-none focus:border-brand-500 appearance-none"
                   >
                     {targetOptions.map(opt => (
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
