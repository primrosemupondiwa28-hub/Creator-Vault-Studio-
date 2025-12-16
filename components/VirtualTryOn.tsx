import React, { useState } from 'react';
import { ArrowLeft, Shirt, Sparkles, RefreshCw, Ruler, User, Users, CheckCircle2 } from 'lucide-react';
import { generateCompositeImage } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface VirtualTryOnProps {
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ onBack, onSaveToHistory }) => {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [stylingNotes, setStylingNotes] = useState('');
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
    if (!personImage || !outfitImage) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    try {
      const prompt = stylingNotes.trim() || "Standard fit, fashion pose";
      const results = await generateCompositeImage(personImage, outfitImage, 'TRYON', prompt);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: personImage,
          generatedData: results[0],
          prompt: `Try-On: ${prompt}`,
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
          <h2 className="text-2xl font-serif text-brand-100">Virtual Wardrobe</h2>
          <div className="w-20" />
       </div>

       <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
          {/* Uploads & Inputs */}
          <div className="flex-1 space-y-4">
             {/* Upload Steps */}
             <div className="bg-luxury-800 p-6 rounded-3xl border border-brand-900/30 flex gap-4 items-center">
                <div className="w-24 h-32 bg-luxury-900 rounded-xl relative overflow-hidden flex-shrink-0 border border-brand-900">
                   {personImage ? <img src={personImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs">Upload</div>}
                   <input type="file" onChange={handleUpload(setPersonImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                   <h3 className="text-brand-100 font-serif flex items-center gap-2">
                     1. Select Model(s)
                     <Users className="w-4 h-4 text-brand-400" />
                   </h3>
                   <p className="text-sm text-brand-400/60">Upload photo (Single or Group)</p>
                </div>
             </div>

             <div className="bg-luxury-800 p-6 rounded-3xl border border-brand-900/30 flex gap-4 items-center">
                <div className="w-24 h-32 bg-luxury-900 rounded-xl relative overflow-hidden flex-shrink-0 border border-brand-900">
                   {outfitImage ? <img src={outfitImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs">Outfit</div>}
                   <input type="file" onChange={handleUpload(setOutfitImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                   <h3 className="text-brand-100 font-serif">2. Select Outfit</h3>
                   <p className="text-sm text-brand-400/60">Upload clothing lay flat or on hanger</p>
                </div>
             </div>

             {/* Styling Instructions */}
             <div className="bg-luxury-800 p-6 rounded-3xl border border-brand-900/30">
                <div className="flex items-center gap-2 mb-3">
                    <Ruler className="w-4 h-4 text-brand-500" />
                    <h3 className="text-brand-100 font-serif">3. Styling Notes & Fit</h3>
                </div>
                <div className="relative">
                    <textarea 
                      value={stylingNotes}
                      onChange={(e) => setStylingNotes(e.target.value)}
                      placeholder="e.g. 'Tuck in the shirt, add a belt.'&#10;OR 'Height 5'7, curvy fit.'&#10;For groups: 'Matching outfits for both.'"
                      className="w-full h-28 bg-luxury-900 rounded-xl border border-brand-900/50 p-3 text-brand-50 focus:border-brand-500 outline-none text-sm placeholder:text-brand-400/40 resize-none"
                    />
                    <div className="absolute top-3 right-3 text-brand-500/50">
                        <User className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-xs text-brand-400/50 mt-2 ml-1">Customize the look before generating.</p>
             </div>

             <button
               onClick={handleGenerate}
               disabled={!personImage || !outfitImage || isGenerating}
               className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-serif font-bold rounded-2xl shadow-xl shadow-pink-900/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
             >
               {isGenerating ? 'Fitting Outfit...' : 'Try On Now'}
             </button>
          </div>

          {/* Result Area */}
          <div className="flex-[1.5] flex flex-col gap-4">
             {/* Main Preview */}
             <div className="flex-1 bg-luxury-800 rounded-3xl border-4 border-luxury-700 shadow-2xl relative min-h-[500px] overflow-hidden">
                {currentImage ? (
                   <img src={currentImage} className="w-full h-full object-contain" />
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-400/30">
                      <Shirt className="w-24 h-24 mb-4 opacity-50" />
                      <p className="font-serif text-2xl">Magic Mirror</p>
                   </div>
                )}
                
                {isGenerating && (
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                      <Sparkles className="w-12 h-12 text-brand-400 animate-spin" />
                   </div>
                )}
             </div>

             {/* Swipeable Thumbnails - All Generated Images */}
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