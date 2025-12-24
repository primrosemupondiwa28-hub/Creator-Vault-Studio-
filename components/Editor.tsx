
import React, { useState, useRef } from 'react';
import { Wand2, Download, RefreshCw, ArrowLeft, SplitSquareHorizontal, Maximize2, ShieldCheck, Lock, UserCheck, Users, CheckCircle2, Sparkles, Smile, Scale, Palette, Image as ImageIcon, Mountain, Trees, Building2, Upload, X, Layout, Hand, Droplets } from 'lucide-react';
import { generateEditedImage, CosmeticEnhancements } from '../services/geminiService';
import { GeneratedImage, AspectRatio, SkinFinish, NailStyle } from '../types';

interface EditorProps {
  apiKey: string; // Add missing apiKey prop
  originalImage: string;
  mimeType: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const Editor: React.FC<EditorProps> = ({ apiKey, originalImage, mimeType, onBack, onSaveToHistory }) => {
  // generatedImages is now an array of 4
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0); // Which one is currently main view
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'single'>('split');
  const [applyToAll, setApplyToAll] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  
  const [enhancements, setEnhancements] = useState<CosmeticEnhancements>({
    teethWhitening: false,
    eyeBrightening: false,
    makeupMode: false,
    skinFinish: 'default',
    nailStyle: 'default'
  });
  
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation Logic: Enable button if prompt exists OR background uploaded OR any enhancement active
  const hasEnhancements = 
    enhancements.teethWhitening || 
    enhancements.eyeBrightening || 
    enhancements.makeupMode || 
    enhancements.skinFinish !== 'default' || 
    enhancements.nailStyle !== 'default';

  const canGenerate = prompt.trim().length > 0 || customBackground !== null || hasEnhancements;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]); // Clear previous results

    try {
      // If prompt is empty but settings are active, provide a default instruction
      const effectivePrompt = prompt.trim() || "Enhance image quality and apply selected cosmetic and structural adjustments.";

      const results = await generateEditedImage(
        apiKey, // Correct: Added apiKey as first parameter
        originalImage, 
        mimeType, 
        effectivePrompt, 
        applyToAll, 
        enhancements,
        aspectRatio,
        customBackground
      );
      
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        const newRecord: GeneratedImage = {
          id: Date.now().toString(),
          originalData: originalImage,
          generatedData: results[0],
          prompt: prompt || "Beauty Studio Edit",
          timestamp: Date.now(),
          aspectRatio: aspectRatio
        };
        onSaveToHistory(newRecord);
      }

    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `famstyle-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Background image too large. Keep under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result && typeof ev.target.result === 'string') {
          setCustomBackground(ev.target.result);
          setPrompt(""); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCustomBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomBackground(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const backgroundPresets = [
    { name: "Studio White", icon: <ImageIcon className="w-3 h-3" />, prompt: "clean minimal bright white studio background" },
    { name: "Luxury Home", icon: <ImageIcon className="w-3 h-3" />, prompt: "modern luxury living room interior, soft warm lighting" },
    { name: "Nature Park", icon: <Trees className="w-3 h-3" />, prompt: "lush green park with blurred bokeh background, sunny day" },
    { name: "City Street", icon: <Building2 className="w-3 h-3" />, prompt: "upscale parisian city street, soft daylight" },
    { name: "Beach Sunset", icon: <Mountain className="w-3 h-3" />, prompt: "tropical beach during golden hour sunset, soft warm light" },
  ];

  const currentGeneratedImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
           <div className="hidden md:flex items-center gap-2 mr-4 bg-slate-800 p-1 rounded-lg">
              {(['1:1', '4:3', '3:4', '16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-1 text-xs rounded ${aspectRatio === ratio ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {ratio}
                </button>
              ))}
           </div>

           <button
             onClick={() => setViewMode(viewMode === 'split' ? 'single' : 'split')}
             className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
             title="Toggle Split View"
           >
             {viewMode === 'split' ? <Maximize2 className="w-5 h-5"/> : <SplitSquareHorizontal className="w-5 h-5"/>}
           </button>
           {currentGeneratedImage && (
             <button 
              onClick={() => downloadImage(currentGeneratedImage)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
             >
               <Download className="w-4 h-4" />
               Download
             </button>
           )}
        </div>
      </div>

      {/* Main Workspace - Fixed overflow handling for mobile */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden overflow-auto">
        
        {/* Image Area */}
        <div className="flex-1 bg-slate-950 relative flex flex-col min-h-[50vh] lg:min-h-0">
          
          {/* Main Canvas */}
          <div className="flex-1 overflow-hidden p-4 flex items-center justify-center relative">
            {!currentGeneratedImage ? (
               <div className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden">
                  <img src={originalImage} alt="Original" className="max-w-full max-h-[70vh] object-contain" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">Original</div>
               </div>
            ) : (
              <div className={`grid gap-4 w-full h-full place-items-center ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                 {(viewMode === 'split') && (
                    <div className="relative w-full h-full flex items-center justify-center">
                       <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                       <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">Original</div>
                    </div>
                 )}
                 <div className="relative w-full h-full flex items-center justify-center">
                    <img src={currentGeneratedImage} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg shadow-lg ring-1 ring-slate-700" />
                    <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      TrueTone™ Protected
                    </div>
                 </div>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <RefreshCw className="w-12 h-12 text-brand-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Generating 4 Variations...</h3>
                <div className="text-sm text-slate-400">Applying {aspectRatio} Canvas & Beauty Protocols</div>
              </div>
            )}
            
             {error && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg max-w-[90%]">
                {error}
              </div>
            )}
          </div>

          {/* Variation Strip */}
          {generatedImages.length > 0 && (
            <div className="h-32 border-t border-slate-800 bg-slate-900 p-4 flex gap-4 overflow-x-auto items-center justify-center shrink-0">
               {generatedImages.map((img, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setSelectedImageIndex(idx)}
                   className={`relative h-24 aspect-[3/4] md:aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                     selectedImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-700 opacity-60 hover:opacity-100'
                   }`}
                 >
                   <img src={img} className="w-full h-full object-cover" alt={`Var ${idx}`} />
                   {selectedImageIndex === idx && (
                     <div className="absolute inset-0 flex items-center justify-center bg-brand-500/20">
                        <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                     </div>
                   )}
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 p-6 flex flex-col gap-6 z-20 h-auto lg:h-full overflow-y-auto shrink-0">
           
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4 mb-2 shadow-lg">
             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200 text-sm font-bold tracking-wide uppercase">Identity Lock System</span>
             </div>
             
             <div className="space-y-3">
               <div className="flex items-start gap-3">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                 <p className="text-slate-400 text-xs">
                   <strong className="text-slate-200">Forensic Preservation:</strong> Faces are strictly protected from structural alteration.
                 </p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                 <p className="text-slate-400 text-xs">
                   <strong className="text-slate-200">Anti-Bias TrueTone™:</strong> Decouples hairstyles from skin tone.
                 </p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                 <p className="text-slate-400 text-xs">
                   <strong className="text-slate-200">Hairline Anchor:</strong> Preserves natural forehead shape & scalp blending.
                 </p>
               </div>
             </div>
           </div>

           {/* Canvas Settings */}
           <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                 <Layout className="w-3 h-3" />
                 Canvas Shape
              </h4>
              <div className="grid grid-cols-3 gap-2">
                 {['1:1', '3:4', '9:16', '4:3', '16:9'].map((ratio) => (
                   <button
                     key={ratio}
                     onClick={() => setAspectRatio(ratio as AspectRatio)}
                     className={`px-2 py-1.5 text-xs rounded-md border transition-all ${
                       aspectRatio === ratio 
                       ? 'bg-brand-600 text-white border-brand-500' 
                       : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                     }`}
                   >
                     {ratio}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-3">
                {/* Apply to Everyone */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => setApplyToAll(!applyToAll)}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-5 h-5 ${applyToAll ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium text-slate-200">Apply to Everyone</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${applyToAll ? 'bg-brand-500 border-brand-500' : 'border-slate-500'}`}>
                     {applyToAll && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                
                {/* Soft Retouch Section */}
                <div className="border-t border-slate-800 pt-4 mt-4">
                   <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Beauty Studio
                   </h4>
                   
                   <div className="grid grid-cols-2 gap-2 mb-2">
                      <button 
                         className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${enhancements.teethWhitening ? 'bg-purple-500/10 border-purple-500' : 'bg-slate-800/30 border-slate-700'}`}
                         onClick={() => setEnhancements(prev => ({ ...prev, teethWhitening: !prev.teethWhitening }))}
                      >
                         <Smile className={`w-4 h-4 mb-1 ${enhancements.teethWhitening ? 'text-purple-400' : 'text-slate-500'}`} />
                         <span className="text-[10px] text-slate-300">Teeth</span>
                      </button>

                      <button 
                         className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${enhancements.eyeBrightening ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-800/30 border-slate-700'}`}
                         onClick={() => setEnhancements(prev => ({ ...prev, eyeBrightening: !prev.eyeBrightening }))}
                      >
                         <Sparkles className={`w-4 h-4 mb-1 ${enhancements.eyeBrightening ? 'text-blue-400' : 'text-slate-500'}`} />
                         <span className="text-[10px] text-slate-300">Eyes</span>
                      </button>
                   </div>

                   {/* Skin Finish */}
                   <div className="mb-3">
                      <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                         <Droplets className="w-3 h-3" /> Skin Finish
                      </label>
                      <select 
                        value={enhancements.skinFinish}
                        onChange={(e) => setEnhancements(prev => ({...prev, skinFinish: e.target.value as SkinFinish}))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 p-2 outline-none focus:border-brand-500"
                      >
                        <option value="default">Natural (Default)</option>
                        <option value="glowing">Glowing / Radiant</option>
                        <option value="matte">Soft Matte</option>
                        <option value="dewy_satin">Dewy Satin</option>
                      </select>
                   </div>

                   {/* Nails */}
                   <div className="mb-3">
                      <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                         <Hand className="w-3 h-3" /> Nail Art
                      </label>
                      <select 
                        value={enhancements.nailStyle}
                        onChange={(e) => setEnhancements(prev => ({...prev, nailStyle: e.target.value as NailStyle}))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 p-2 outline-none focus:border-brand-500"
                      >
                        <option value="default">Natural (Default)</option>
                        <option value="french">French Tip</option>
                        <option value="nude">Nude / Neutral</option>
                        <option value="red">Classic Red</option>
                        <option value="black">Glossy Black</option>
                        <option value="chrome">Chrome / Metallic</option>
                      </select>
                   </div>

                    {/* Makeup Mode Toggle */}
                    <div 
                       className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          enhancements.makeupMode 
                          ? 'bg-pink-500/10 border-pink-500/50' 
                          : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800'
                       }`}
                       onClick={() => setEnhancements(prev => ({ ...prev, makeupMode: !prev.makeupMode }))}
                    >
                        <div className="flex items-center gap-3">
                           <Palette className={`w-5 h-5 ${enhancements.makeupMode ? 'text-pink-400' : 'text-slate-500'}`} />
                           <div className="flex flex-col">
                              <span className={`text-xs font-medium ${enhancements.makeupMode ? 'text-pink-100' : 'text-slate-300'}`}>Makeup Mode</span>
                           </div>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${enhancements.makeupMode ? 'bg-pink-500' : 'bg-slate-600'}`}>
                           <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${enhancements.makeupMode ? 'left-4.5' : 'left-0.5'}`} />
                        </div>
                    </div>
                </div>

                {/* Background & Scene Section */}
                <div className="border-t border-slate-800 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" />
                      Scene
                    </h4>
                    {customBackground && (
                       <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-1.5 py-0.5 rounded">Custom</span>
                    )}
                  </div>

                  {/* Custom Background Upload */}
                  <div className="mb-3">
                     <input 
                       type="file" 
                       ref={fileInputRef}
                       onChange={handleBackgroundUpload}
                       accept="image/*"
                       className="hidden"
                     />
                     {!customBackground ? (
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 hover:border-slate-500 rounded-lg text-xs text-slate-300 transition-all"
                       >
                         <Upload className="w-3 h-3" />
                         <span>Upload Background</span>
                       </button>
                     ) : (
                       <div className="relative group rounded-lg overflow-hidden border border-brand-500/50">
                         <img src={customBackground} alt="Custom Background" className="w-full h-12 object-cover opacity-70" />
                         <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                               onClick={clearCustomBackground}
                               className="p-1 bg-red-500/90 text-white rounded hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                         </div>
                       </div>
                     )}
                  </div>
                  
                  {/* Presets */}
                  <div className={`grid grid-cols-2 gap-2 transition-opacity ${customBackground ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    {backgroundPresets.map((bg) => (
                      <button
                        key={bg.name}
                        onClick={() => setPrompt(prev => prev ? `${prev}, placed in a ${bg.prompt}` : `Everyone placed in a ${bg.prompt}`)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors text-left"
                      >
                        {bg.icon}
                        <span>{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             <textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder={customBackground
                 ? "Describe outfit changes... (Enter to generate)"
                 : "Describe outfit/background changes, or use settings below... (Enter to generate)"
               }
               className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none placeholder:text-slate-600"
             />

           <button
             onClick={handleGenerate}
             disabled={isGenerating || !canGenerate}
             title={!canGenerate ? "Please enter a prompt or select a beauty setting" : "Generate Images"}
             className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
           >
             {isGenerating ? 'Creating 4 Versions...' : 'Generate 4 Versions'}
             {!isGenerating && <Wand2 className="w-4 h-4" />}
           </button>
        </div>

      </div>
    </div>
  );
};
