import React, { useState } from 'react';
import { ArrowLeft, Box, CheckCircle2, Image as ImageIcon, Layers, Package, RefreshCw, Shirt, Smartphone, Sparkles, Upload, Book, BookOpen, Tablet } from 'lucide-react';
import { generateMockup } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface MerchStudioProps {
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ onBack, onSaveToHistory }) => {
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [customBaseImage, setCustomBaseImage] = useState<string | null>(null);
  
  const [category, setCategory] = useState<'apparel' | 'packaging' | 'tech' | 'art' | 'books'>('apparel');
  const [prompt, setPrompt] = useState('');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Presets
  const templates = {
    apparel: [
      { name: "Oversized Hoodie", material: "Heavy Cotton", icon: <Shirt className="w-4 h-4" /> },
      { name: "Vintage Tee", material: "Washed Cotton", icon: <Shirt className="w-4 h-4" /> },
      { name: "Beanie", material: "Wool Knit", icon: <Sparkles className="w-4 h-4" /> },
    ],
    packaging: [
      { name: "Coffee Pouch", material: "Matte Foil", icon: <Package className="w-4 h-4" /> },
      { name: "Cosmetic Jar", material: "Frosted Glass", icon: <Box className="w-4 h-4" /> },
      { name: "Shipping Box", material: "Cardboard", icon: <Package className="w-4 h-4" /> },
    ],
    tech: [
      { name: "iPhone Case", material: "Silicone", icon: <Smartphone className="w-4 h-4" /> },
      { name: "MacBook Screen", material: "Digital Screen", icon: <Smartphone className="w-4 h-4" /> },
    ],
    art: [
      { name: "Poster Frame", material: "Wood & Glass", icon: <ImageIcon className="w-4 h-4" /> },
      { name: "Canvas Wrap", material: "Canvas", icon: <ImageIcon className="w-4 h-4" /> },
    ],
    books: [
      { name: "Hardcover Novel", material: "Matte Jacket", icon: <Book className="w-4 h-4" /> },
      { name: "Paperback Stack", material: "Paper Stock", icon: <BookOpen className="w-4 h-4" /> },
      { name: "E-Book Reader", material: "E-Ink Screen", icon: <Tablet className="w-4 h-4" /> },
      { name: "Open Magazine", material: "Glossy Paper", icon: <BookOpen className="w-4 h-4" /> },
    ]
  };

  const [selectedTemplate, setSelectedTemplate] = useState(templates.apparel[0]);

  const handleUpload = (setter: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setter(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!designImage) return;
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const results = await generateMockup(
        designImage,
        customBaseImage, // Optional
        customBaseImage ? "Custom Object" : selectedTemplate.name,
        selectedTemplate.material,
        prompt || "Professional studio lighting, clean minimal background",
        '1:1'
      );
      
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: designImage,
          generatedData: results[0],
          prompt: `Mockup: ${selectedTemplate.name}`,
          timestamp: Date.now(),
          aspectRatio: '1:1'
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
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" />
            <h2 className="text-2xl font-serif text-brand-100">Merch Studio</h2>
          </div>
          <div className="w-20" />
       </div>

       <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Step 1: Design Upload */}
             <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
                <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block flex items-center gap-2">
                   1. Your Design / Logo
                </label>
                <div className="aspect-square bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 hover:border-brand-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden">
                   {designImage ? (
                      <img src={designImage} className="w-full h-full object-contain p-4" />
                   ) : (
                      <div className="text-center p-4">
                         <div className="w-12 h-12 bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-400">
                           <ImageIcon className="w-6 h-6" />
                         </div>
                         <p className="text-brand-200 font-serif text-sm">Upload Graphic</p>
                      </div>
                   )}
                   <input type="file" onChange={handleUpload(setDesignImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
             </div>

             {/* Step 2: Product Selection */}
             <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
                <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block flex items-center gap-2">
                   2. Choose Product
                </label>
                
                {/* Categories */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-900">
                   {(['apparel', 'packaging', 'tech', 'art', 'books'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setCategory(cat); setSelectedTemplate(templates[cat][0]); setCustomBaseImage(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${category === cat ? 'bg-brand-600 text-white' : 'bg-luxury-900 text-brand-300 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                   ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                   {templates[category].map((t) => (
                      <button
                        key={t.name}
                        onClick={() => { setSelectedTemplate(t); setCustomBaseImage(null); }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${selectedTemplate.name === t.name && !customBaseImage ? 'bg-brand-900/40 border-brand-500 ring-1 ring-brand-500/20' : 'bg-luxury-900 border-transparent hover:border-brand-900'}`}
                      >
                         <div className={`p-2 rounded-full ${selectedTemplate.name === t.name && !customBaseImage ? 'bg-brand-500 text-white' : 'bg-luxury-800 text-brand-400'}`}>
                           {t.icon}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-brand-100">{t.name}</p>
                            <p className="text-[10px] text-brand-400/60">{t.material}</p>
                         </div>
                      </button>
                   ))}
                </div>

                {/* OR Custom Base */}
                <div className="relative border-t border-brand-900/30 pt-4 mt-2">
                   <p className="text-[10px] text-brand-400 text-center mb-2 bg-luxury-800 absolute -top-2.5 left-1/2 -translate-x-1/2 px-2">OR</p>
                   <div className={`w-full h-12 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors relative ${customBaseImage ? 'border-brand-500 bg-brand-500/10' : 'border-brand-900 hover:border-brand-500 bg-luxury-900/50'}`}>
                      {customBaseImage ? (
                         <span className="text-xs text-brand-300">Custom Base Loaded</span>
                      ) : (
                         <>
                           <Upload className="w-3 h-3 text-brand-400" />
                           <span className="text-xs text-brand-400">Upload Custom Base Image</span>
                         </>
                      )}
                      <input type="file" onChange={handleUpload(setCustomBaseImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>
             </div>

             {/* Step 3: Vibe */}
             <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
                <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block">
                   3. Scene & Lighting
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Sitting on a minimalist concrete table', 'Warm sunset lighting', 'Cyberpunk neon background'."
                  className="w-full h-20 bg-luxury-900 rounded-xl border border-brand-900/50 p-3 text-brand-50 focus:border-brand-500 outline-none text-xs"
                />
             </div>
             
             <button
               onClick={handleGenerate}
               disabled={!designImage || isGenerating}
               className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:to-brand-400 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-brand-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
               {isGenerating ? 'Rendering Mockup...' : 'Generate 4 Mockups'}
             </button>
          </div>

          {/* Right Panel: Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-4">
             <div className="bg-luxury-800 rounded-3xl p-6 flex-1 flex flex-col items-center justify-center border border-brand-900/30 relative overflow-hidden min-h-[500px] shadow-2xl">
                {isGenerating && (
                   <div className="absolute inset-0 bg-luxury-900/80 backdrop-blur z-10 flex flex-col items-center justify-center">
                      <RefreshCw className="w-12 h-12 text-brand-500 animate-spin mb-4" />
                      <p className="font-serif text-2xl text-brand-100">Applying Design...</p>
                      <p className="text-brand-400/60 mt-2 text-sm">Warping texture to {customBaseImage ? 'Custom Object' : selectedTemplate.name} geometry</p>
                   </div>
                )}
                
                {currentImage ? (
                   <img src={currentImage} className="w-full h-full object-contain rounded-xl shadow-lg" />
                ) : (
                   <div className="text-center text-brand-400/30">
                      <Box className="w-24 h-24 mx-auto mb-4 opacity-30" />
                      <p className="font-serif text-3xl">Mockup Preview</p>
                      <p className="text-sm mt-3 max-w-xs mx-auto">Upload your logo and select a product to visualize professional merchandise.</p>
                   </div>
                )}
             </div>

             {/* Thumbnails */}
             {generatedImages.length > 0 && (
               <div className="w-full bg-luxury-800 p-4 rounded-2xl border border-brand-900/30 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <div className="flex gap-4">
                     {generatedImages.map((img, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedImageIndex(i)}
                          className={`relative w-28 aspect-square rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${selectedImageIndex === i ? 'border-brand-500 scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                           <img src={img} className="w-full h-full object-cover" />
                           {selectedImageIndex === i && (
                              <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
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