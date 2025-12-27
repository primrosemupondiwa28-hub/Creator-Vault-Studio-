import React, { useState, useEffect } from 'react';
import { Upload, ShoppingBag, ArrowLeft, Wand2, RefreshCw, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { generateCompositeImage, enhancePrompt } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface CreatorStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Loading State
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const loadingMessages = [
    "Analyzing product dimensions...",
    "Mapping studio light sources...",
    "Composing commercial shot...",
    "Rendering high-resolution details..."
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

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          const increment = Math.random() * 2 + 0.5;
          return prev + increment;
        });
      }, 200);
    }
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
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
    if (!modelImage || !productImage) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    try {
      const results = await generateCompositeImage(apiKey, modelImage, productImage, 'CREATOR', prompt);
      
      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: modelImage,
          generatedData: results[0],
          prompt: prompt || 'Creator Studio Session',
          timestamp: Date.now(),
          aspectRatio: '3:4'
        });
      }
    } catch (e) {
      console.error(e);
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

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white font-bold transition-colors">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex flex-col items-center">
             <h2 className="text-2xl font-serif text-brand-100 font-bold">Creator Studio</h2>
             <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">Commercial Asset Forge</p>
          </div>
          <div className="w-20" />
       </div>

       <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                {/* Model Upload */}
                <div className="aspect-[3/4] bg-luxury-800 rounded-2xl border-2 border-dashed border-brand-900/50 hover:border-brand-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden">
                   {modelImage ? (
                      <img src={modelImage} className="w-full h-full object-cover" />
                   ) : (
                      <div className="text-center p-4">
                         <div className="w-12 h-12 bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-400">1</div>
                         <p className="text-brand-200 font-serif font-bold">The Creator</p>
                         <p className="text-[10px] text-brand-400/60 mt-1 uppercase font-bold">Upload Likeness</p>
                      </div>
                   )}
                   <input type="file" onChange={handleUpload(setModelImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                {/* Product Upload */}
                <div className="aspect-[3/4] bg-luxury-800 rounded-2xl border-2 border-dashed border-brand-900/50 hover:border-brand-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden">
                   {productImage ? (
                      <img src={productImage} className="w-full h-full object-cover" />
                   ) : (
                      <div className="text-center p-4">
                         <div className="w-12 h-12 bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-400">2</div>
                         <p className="text-brand-200 font-serif font-bold">The Product</p>
                         <p className="text-[10px] text-brand-400/60 mt-1 uppercase font-bold">Upload Item</p>
                      </div>
                   )}
                   <input type="file" onChange={handleUpload(setProductImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
             </div>

             <div className="bg-luxury-800 p-6 rounded-2xl border border-brand-900/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-brand-100 font-bold">Scene Vision</h3>
                  <button 
                     onClick={handleEnhancePrompt}
                     disabled={!prompt.trim() || isEnhancing}
                     className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                  >
                     <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
                     {isEnhancing ? 'Refining...' : 'Magic Wand'}
                  </button>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the shot clearly (e.g. 'Holding the product in a sunlit marble kitchen')..."
                  className="w-full h-24 bg-brand-50 border border-brand-500 rounded-xl p-4 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!modelImage || !productImage || isGenerating}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-serif font-bold shadow-xl transition-all disabled:opacity-50 hover:scale-[1.01]"
                >
                  {isGenerating ? 'Composing Shot...' : 'Generate Campaign'}
                </button>
             </div>
          </div>

          {/* Results Section */}
          <div className="flex flex-col h-full gap-4">
             <div className="bg-luxury-800 rounded-3xl p-6 flex-1 flex flex-col items-center justify-center border border-brand-900/30 relative overflow-hidden shadow-2xl min-h-[500px]">
                {isGenerating && (
                   <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur z-10 flex flex-col items-center justify-center p-8 text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full border-4 border-brand-900 border-t-brand-500 animate-spin"></div>
                        <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand-400" />
                      </div>
                      <p className="font-serif text-xl text-brand-100 mb-2 font-bold">AI Photographer at work...</p>
                      <p className="text-brand-400/70 text-xs font-bold animate-pulse mb-4 uppercase tracking-widest">{loadingMessages[loadingStep]}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-56 h-1.5 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-2 shadow-inner">
                        <div 
                          className="h-full bg-brand-500 transition-all duration-200 ease-out"
                          style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                        />
                      </div>
                   </div>
                )}
                
                {currentImage ? (
                   <img src={currentImage} className="w-full h-full object-contain rounded-xl shadow-lg animate-in fade-in duration-700" />
                ) : (
                   <div className="text-center text-brand-400/20">
                      <ShoppingBag className="w-24 h-24 mx-auto mb-4 opacity-5" />
                      <p className="font-serif text-2xl font-bold">Campaign Preview</p>
                      <p className="text-sm mt-2 font-medium">Upload model and product assets to begin.</p>
                   </div>
                )}
             </div>

             {/* Thumbnails */}
             {generatedImages.length > 0 && (
               <div className="w-full bg-luxury-800 p-4 rounded-2xl border border-brand-900/30 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-xl">
                  <div className="flex gap-4">
                     {generatedImages.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedImageIndex(i)}
                          className={`relative w-24 aspect-[3/4] rounded-lg overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all duration-300 ${selectedImageIndex === i ? 'border-brand-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                           <img src={img} className="w-full h-full object-cover" />
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