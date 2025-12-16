import React, { useState } from 'react';
import { Upload, ShoppingBag, ArrowLeft, Wand2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generateCompositeImage } from '../services/geminiService';
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

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <h2 className="text-2xl font-serif text-brand-100">Creator Studio</h2>
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
                         <p className="text-brand-200 font-serif">The Creator</p>
                         <p className="text-xs text-brand-400/60 mt-1">Upload yourself</p>
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
                         <p className="text-brand-200 font-serif">The Product</p>
                         <p className="text-xs text-brand-400/60 mt-1">Upload item</p>
                      </div>
                   )}
                   <input type="file" onChange={handleUpload(setProductImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
             </div>

             <div className="bg-luxury-800 p-6 rounded-2xl border border-brand-900/30">
                <h3 className="font-serif text-brand-100 mb-4">Scene Vision</h3>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the shot (e.g. 'Holding the serum bottle in a sunlit marble bathroom')."
                  className="w-full h-24 bg-luxury-900 rounded-xl border border-brand-900/50 p-3 text-brand-50 focus:border-brand-500 outline-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!modelImage || !productImage || isGenerating}
                  className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'Composing Shot...' : 'Generate Campaign'}
                </button>
             </div>
          </div>

          {/* Results Section */}
          <div className="flex flex-col h-full gap-4">
             <div className="bg-luxury-800 rounded-3xl p-6 flex-1 flex flex-col items-center justify-center border border-brand-900/30 relative overflow-hidden">
                {isGenerating && (
                   <div className="absolute inset-0 bg-luxury-900/80 backdrop-blur z-10 flex flex-col items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                      <p className="font-serif text-brand-200">AI Photographer is working...</p>
                   </div>
                )}
                
                {currentImage ? (
                   <img src={currentImage} className="w-full h-full object-contain rounded-xl shadow-lg" />
                ) : (
                   <div className="text-center text-brand-400/40">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-serif text-xl">Campaign Preview</p>
                      <p className="text-sm mt-2">Upload images to begin</p>
                   </div>
                )}
             </div>

             {/* Thumbnails */}
             {generatedImages.length > 0 && (
               <div className="w-full bg-luxury-800 p-3 rounded-2xl border border-brand-900/30 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <div className="flex gap-3">
                     {generatedImages.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedImageIndex(i)}
                          className={`relative w-24 aspect-[3/4] rounded-lg overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${selectedImageIndex === i ? 'border-brand-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                           <img src={img} className="w-full h-full object-cover" />
                           {selectedImageIndex === i && (
                              <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                                 <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
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