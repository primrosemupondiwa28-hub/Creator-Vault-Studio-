
import React, { useState, useRef } from 'react';
import { Wand2, Download, RefreshCw, ArrowLeft, SplitSquareHorizontal, Maximize2, ShieldCheck, Lock, UserCheck, Users, CheckCircle2, Sparkles, Smile, Scale, Palette, Image as ImageIcon, Mountain, Trees, Building2, Upload, X, Layout, Hand, Droplets } from 'lucide-react';
import { generateEditedImage, CosmeticEnhancements } from '../services/geminiService';
import { GeneratedImage, AspectRatio, SkinFinish, NailStyle } from '../types';

interface EditorProps {
  apiKey: string;
  originalImage: string;
  mimeType: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const Editor: React.FC<EditorProps> = ({ apiKey, originalImage, mimeType, onBack, onSaveToHistory }) => {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
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
    setGeneratedImages([]);

    try {
      const effectivePrompt = prompt.trim() || "Enhance image quality and apply selected cosmetic and structural adjustments.";
      const results = await generateEditedImage(apiKey, originalImage, mimeType, effectivePrompt, applyToAll, enhancements, aspectRatio, customBackground);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: originalImage,
          generatedData: results[0],
          prompt: prompt || "Beauty Studio Edit",
          timestamp: Date.now(),
          aspectRatio: aspectRatio
        });
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
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setCustomBackground(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearCustomBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomBackground(null);
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
           <div className="hidden md:flex items-center gap-2 mr-4 bg-slate-800 p-1 rounded-lg">
              {(['1:1', '4:3', '3:4', '16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-2 py-1 text-xs rounded ${aspectRatio === ratio ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>{ratio}</button>
              ))}
           </div>
           <button onClick={() => setViewMode(viewMode === 'split' ? 'single' : 'split')} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
             {viewMode === 'split' ? <Maximize2 className="w-5 h-5"/> : <SplitSquareHorizontal className="w-5 h-5"/>}
           </button>
           {currentGeneratedImage && <button onClick={() => downloadImage(currentGeneratedImage)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4" /> Download</button>}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden overflow-auto">
        <div className="flex-1 bg-slate-950 relative flex flex-col min-h-[50vh] lg:min-h-0">
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
                    <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1 font-medium"><ShieldCheck className="w-3 h-3" /> TrueTone™ Protected</div>
                 </div>
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <RefreshCw className="w-12 h-12 text-brand-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Generating 4 Variations...</h3>
              </div>
            )}
          </div>
          {generatedImages.length > 0 && (
            <div className="h-32 border-t border-slate-800 bg-slate-900 p-4 flex gap-4 overflow-x-auto items-center justify-center shrink-0">
               {generatedImages.map((img, idx) => (
                 <div key={idx} onClick={() => setSelectedImageIndex(idx)} className={`relative h-24 aspect-[3/4] md:aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all shrink-0 ${selectedImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-700 opacity-60 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" /></div>
               ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 p-6 flex flex-col gap-6 z-20 h-auto lg:h-full overflow-y-auto shrink-0">
           <div className="bg-luxury-800 border border-slate-700 rounded-xl p-4 shadow-lg">
             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700"><Lock className="w-4 h-4 text-emerald-400" /><span className="text-slate-200 text-xs font-bold uppercase">Identity Lock</span></div>
             <p className="text-slate-400 text-[10px] leading-relaxed">Identity is forensic-preserved. Faces are strictly protected from structural alteration.</p>
           </div>

           <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Layout className="w-3 h-3" /> Canvas</h4>
              <div className="grid grid-cols-3 gap-2">
                 {['1:1', '3:4', '9:16'].map((r) => <button key={r} onClick={() => setAspectRatio(r as AspectRatio)} className={`py-1.5 text-[10px] font-bold rounded border transition-all ${aspectRatio === r ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{r}</button>)}
              </div>
           </div>

           <textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder="Describe changes clearly..."
             className="w-full h-32 bg-brand-50 border border-brand-500 rounded-xl p-4 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner resize-none"
           />

           <button onClick={handleGenerate} disabled={isGenerating || !canGenerate} className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:to-brand-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2">
             {isGenerating ? 'Processing...' : 'Generate 4 Twins'}
             {!isGenerating && <Wand2 className="w-4 h-4" />}
           </button>
        </div>
      </div>
    </div>
  );
};
