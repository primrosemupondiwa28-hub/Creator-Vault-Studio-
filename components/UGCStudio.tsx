import React, { useState, useEffect } from 'react';
import { Smartphone, ArrowLeft, Sparkles, CheckCircle2, Bot, Play, Clock, Target, Hash, Camera, Clapperboard, Check, Share2, Copy, Video, Music2, Youtube, Instagram, Upload, Image as ImageIcon } from 'lucide-react';
import { generateCompositeImage, generateUGCVideoPlan, UGCPlanRequest, UGCVideoPlan } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface UGCStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const UGCStudio: React.FC<UGCStudioProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  // View State
  const [activeTab, setActiveTab] = useState<'studio' | 'assistant'>('studio');

  // Studio State
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // UGC Assistant State
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [planResult, setPlanResult] = useState<UGCVideoPlan | null>(null);
  const [assistantImage, setAssistantImage] = useState<string | null>(null);

  // Assistant Form State
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [videoLength, setVideoLength] = useState('30s');
  const [platform, setPlatform] = useState('TikTok');
  const [tone, setTone] = useState('Trendy & Fun');
  const [goal, setGoal] = useState('');
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Loading Animation State
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Detecting viral aesthetics...",
    "Optimizing lighting for engagement...",
    "Generating authentic texture...",
    "Applying social grade finish..."
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
      }, 2500);

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

  const autoPrompts = [
    "POV: Holding the product close to the camera, soft aesthetic bedroom background, morning sunlight, cozy vibe.",
    "Lifestyle shot: Sitting in a modern beige cafe, holding the product, laughing candidly, manicured nails visible.",
    "Mirror selfie style: Holding the product in front of a mirror, chic outfit, golden hour lighting flare.",
    "Unboxing aesthetic: Product on a marble table with flowers, hands interacting with it, bright airy lighting.",
    "Gym lifestyle: Post-workout glow, holding the product in a luxury gym setting, energetic and authentic.",
    "Outdoor golden hour: Walking down a city street, holding the product naturally, blurred background, warm tones."
  ];

  const handleAutoGeneratePrompt = () => {
    const random = autoPrompts[Math.floor(Math.random() * autoPrompts.length)];
    setPrompt(random);
  };

  const handleGenerateImage = async () => {
    if (!modelImage || !productImage) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    
    const effectivePrompt = prompt || autoPrompts[Math.floor(Math.random() * autoPrompts.length)];

    try {
      const results = await generateCompositeImage(apiKey, modelImage, productImage, 'UGC', effectivePrompt);
      
      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: modelImage,
          generatedData: results[0],
          prompt: effectivePrompt,
          timestamp: Date.now(),
          aspectRatio: '9:16' // UGC is usually vertical
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!niche || !audience) return;
    setIsPlanLoading(true);
    try {
      const request: UGCPlanRequest = {
        niche,
        audience,
        length: videoLength,
        tone,
        goal,
        platform,
        imageBase64: assistantImage
      };
      const result = await generateUGCVideoPlan(apiKey, request);
      setPlanResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanLoading(false);
    }
  };
  
  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };
  
  const copyFullScript = () => {
    if (!planResult) return;
    const script = planResult.scenes.map(s => `[${s.timeRange}] ${s.audio}`).join('\n');
    copyText(script, 'full_script');
  };

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       
       <div className="w-full max-w-6xl flex justify-between items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-brand-500" />
            <h2 className="text-2xl font-serif text-brand-100">UGC Viral Studio</h2>
          </div>
          <div className="w-20" />
       </div>

       {/* Tab Navigation */}
       <div className="w-full max-w-lg bg-luxury-800 p-1.5 rounded-xl border border-brand-900/50 mb-8 flex shadow-inner">
          <button 
              onClick={() => setActiveTab('studio')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'studio' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'text-brand-300 hover:text-white hover:bg-brand-900/30'
              }`}
          >
              <Camera className="w-4 h-4" />
              Photo Studio
          </button>
          <button 
              onClick={() => setActiveTab('assistant')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === 'assistant' 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' 
                  : 'text-brand-300 hover:text-white hover:bg-brand-900/30'
              }`}
          >
              <Bot className="w-4 h-4" />
              UGC Assistant
          </button>
       </div>

       {/* Content Area */}
       <div className="w-full max-w-6xl flex-1">
          
          {/* TAB 1: PHOTO STUDIO */}
          {activeTab === 'studio' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                {/* Input Section */}
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      {/* Model Upload */}
                      <div className="aspect-[3/4] bg-luxury-800 rounded-2xl border-2 border-dashed border-brand-900/50 hover:border-brand-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden group">
                         {modelImage ? (
                            <img src={modelImage} className="w-full h-full object-cover" />
                         ) : (
                            <div className="text-center p-4">
                               <div className="w-12 h-12 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform">1</div>
                               <p className="text-brand-200 font-serif">Influencer</p>
                               <p className="text-xs text-brand-400/60 mt-1">Upload yourself</p>
                            </div>
                         )}
                         <input type="file" onChange={handleUpload(setModelImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                         {modelImage && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">Change Photo</div>}
                      </div>

                      {/* Product Upload */}
                      <div className="aspect-[3/4] bg-luxury-800 rounded-2xl border-2 border-dashed border-brand-900/50 hover:border-brand-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden group">
                         {productImage ? (
                            <img src={productImage} className="w-full h-full object-cover" />
                         ) : (
                            <div className="text-center p-4">
                               <div className="w-12 h-12 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform">2</div>
                               <p className="text-brand-200 font-serif">Brand Product</p>
                               <p className="text-xs text-brand-400/60 mt-1">Upload item</p>
                            </div>
                         )}
                         <input type="file" onChange={handleUpload(setProductImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                         {productImage && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">Change Photo</div>}
                      </div>
                   </div>

                   <div className="bg-luxury-800 p-6 rounded-2xl border border-brand-900/30">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-serif text-brand-100">Content Vibe</h3>
                        <button 
                          onClick={handleAutoGeneratePrompt}
                          className="text-xs flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-900/50"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Generate Concept
                        </button>
                      </div>
                      
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the video/photo concept (e.g. 'POV unboxing in a sunlit bedroom'). Or click Auto-Generate."
                        className="w-full h-24 bg-luxury-900 rounded-xl border border-brand-900/50 p-3 text-brand-50 focus:border-brand-500 outline-none"
                      />
                      <button
                        onClick={handleGenerateImage}
                        disabled={!modelImage || !productImage || isGenerating}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                      >
                        {isGenerating ? 'Generating Viral Content...' : 'Create 4 UGC Photos'}
                      </button>
                   </div>
                </div>

                {/* Results Section */}
                <div className="flex flex-col h-full gap-4">
                   <div className="bg-luxury-800 rounded-3xl p-6 flex-1 flex flex-col items-center justify-center border border-brand-900/30 relative overflow-hidden min-h-[500px]">
                      {isGenerating && (
                         <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur z-10 flex flex-col items-center justify-center">
                            <div className="relative mb-6">
                              <div className="w-16 h-16 rounded-full border-4 border-emerald-900 border-t-emerald-500 animate-spin"></div>
                              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="font-serif text-xl text-brand-100 mb-2">AI Creator is styling...</p>
                            <p className="text-emerald-400/70 text-sm animate-pulse mb-4">{loadingMessages[loadingStep]}</p>
                            
                            {/* Progress Bar */}
                            <div className="w-56 h-1.5 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-2">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-200 ease-out"
                                style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                              />
                            </div>
                            <p className="text-emerald-400/50 text-xs font-mono">{Math.min(100, Math.round(progress))}%</p>
                         </div>
                      )}
                      
                      {currentImage ? (
                         <img src={currentImage} className="w-full h-full object-contain rounded-xl shadow-lg" />
                      ) : (
                         <div className="text-center text-brand-400/40">
                            <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="font-serif text-xl">UGC Preview</p>
                            <p className="text-sm mt-2">Upload images & select vibe</p>
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
          )}

          {/* TAB 2: UGC ASSISTANT */}
          {activeTab === 'assistant' && (
             <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!planResult ? (
                  <div className="bg-luxury-800 border border-brand-900/30 rounded-3xl p-8 shadow-2xl">
                     <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
                           <Bot className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-serif text-brand-50 mb-2">Brief Your Assistant</h2>
                        <p className="text-brand-300/60 max-w-md mx-auto">Upload a reference or product photo, fill in the details, and I'll plan your next viral video.</p>
                     </div>

                     <div className="mb-8">
                        <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                           <ImageIcon className="w-3 h-3" /> Reference Photo (Optional)
                        </label>
                        <div className="relative w-full h-32 bg-luxury-900 border-2 border-dashed border-brand-900/50 hover:border-pink-500/30 rounded-xl flex items-center justify-center transition-colors overflow-hidden group">
                           {assistantImage ? (
                              <div className="relative w-full h-full">
                                <img src={assistantImage} alt="Ref" className="w-full h-full object-contain opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center text-brand-100">
                                   <div className="bg-black/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white/10">Change Photo</div>
                                </div>
                              </div>
                           ) : (
                              <div className="flex flex-col items-center gap-2 text-brand-400/50">
                                 <Upload className="w-6 h-6" />
                                 <span className="text-xs">Drag & drop or click to upload context</span>
                              </div>
                           )}
                           <input type="file" onChange={handleUpload(setAssistantImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-6">
                         {/* Platform Selector Dropdown */}
                         <div>
                            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                              <Share2 className="w-3 h-3" /> Platform
                            </label>
                            <div className="relative">
                               <select
                                 value={platform}
                                 onChange={(e) => setPlatform(e.target.value)}
                                 className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl px-4 py-3.5 text-sm text-brand-50 outline-none focus:border-pink-500 transition-colors appearance-none"
                               >
                                 <option value="TikTok">TikTok</option>
                                 <option value="Instagram Reels">Instagram Reels</option>
                                 <option value="YouTube Shorts">YouTube Shorts</option>
                                 <option value="Facebook">Facebook</option>
                                 <option value="X (Twitter)">X (Twitter)</option>
                               </select>
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-400">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                               </div>
                            </div>
                         </div>

                         <div>
                           <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                             <Hash className="w-3 h-3" /> Niche / Theme
                           </label>
                           <input
                             type="text"
                             value={niche}
                             onChange={(e) => setNiche(e.target.value)}
                             placeholder="e.g. Skincare, Fitness, Fashion Haul"
                             className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl px-4 py-3.5 text-sm text-brand-50 outline-none focus:border-pink-500 transition-colors"
                           />
                         </div>

                         <div>
                           <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                             <Target className="w-3 h-3" /> Target Audience
                           </label>
                           <input
                             type="text"
                             value={audience}
                             onChange={(e) => setAudience(e.target.value)}
                             placeholder="e.g. Busy moms, Gen Z students"
                             className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl px-4 py-3.5 text-sm text-brand-50 outline-none focus:border-pink-500 transition-colors"
                           />
                         </div>
                       </div>

                       <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Duration
                              </label>
                              <select
                                value={videoLength}
                                onChange={(e) => setVideoLength(e.target.value)}
                                className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl px-4 py-3.5 text-sm text-brand-50 outline-none focus:border-pink-500 transition-colors"
                              >
                                <option value="15s">15 Seconds</option>
                                <option value="30s">30 Seconds</option>
                                <option value="60s">60 Seconds</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Tone
                              </label>
                              <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl px-4 py-3.5 text-sm text-brand-50 outline-none focus:border-pink-500 transition-colors"
                              >
                                <option value="Trendy & Fun">Trendy</option>
                                <option value="Educational">Educational</option>
                                <option value="Inspiring">Inspiring</option>
                                <option value="ASMR">ASMR</option>
                                <option value="High Energy">High Energy</option>
                                <option value="Faith">Faith</option>
                                <option value="Baddie">Baddie</option>
                              </select>
                            </div>
                         </div>

                         <div>
                           <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                             <CheckCircle2 className="w-3 h-3" /> Goal (Optional)
                           </label>
                           <input
                             type="text"
                             value={goal}
                             onChange={(e) => setGoal(e.target.value)}
                             placeholder="e.g. Drive sales, increase followers"
                             className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl px-4 py-3.5 text-sm text-brand-50 outline-none focus:border-pink-500 transition-colors"
                           />
                         </div>
                       </div>
                     </div>

                     <button 
                        onClick={handleCreatePlan}
                        disabled={!niche || !audience || isPlanLoading}
                        className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                      >
                        {isPlanLoading ? (
                          <>
                            <Sparkles className="w-5 h-5 animate-spin" /> Analyzing {platform} Trends...
                          </>
                        ) : (
                          <>
                            <Clapperboard className="w-5 h-5 fill-current" /> Generate Video Plan
                          </>
                        )}
                      </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-serif text-brand-100 flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-pink-500" />
                          <span>Video Strategy Ready</span>
                       </h2>
                       <div className="flex gap-3">
                           <button 
                             onClick={() => setPlanResult(null)}
                             className="px-4 py-2 text-sm bg-luxury-800 hover:bg-luxury-700 border border-brand-900/50 rounded-lg text-brand-300 transition-colors"
                           >
                             New Brief
                           </button>
                       </div>
                     </div>

                     {/* Main Plan Dashboard */}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT COLUMN: Script & Timeline */}
                        <div className="lg:col-span-2 space-y-6">
                           
                           {/* Viral Hook Card */}
                           <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-2xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10">
                                 <Sparkles className="w-24 h-24 text-pink-500" />
                              </div>
                              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">The Viral Hook</h3>
                              <p className="text-2xl font-serif text-white leading-relaxed">"{planResult.viralHook}"</p>
                              <div className="mt-4 flex items-center gap-2 text-sm text-pink-200/60">
                                 <Clock className="w-4 h-4" /> 0:00 - 0:03
                              </div>
                           </div>
                           
                           {/* Script Timeline */}
                           <div className="bg-luxury-800 rounded-2xl border border-brand-900/30 p-6">
                              <div className="flex items-center justify-between mb-6">
                                 <h3 className="font-serif text-lg text-brand-100">Scene Breakdown</h3>
                                 <button 
                                   onClick={copyFullScript}
                                   className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-white bg-luxury-900 px-3 py-1.5 rounded-lg border border-brand-900 transition-all"
                                 >
                                    {copiedSection === 'full_script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy Script
                                 </button>
                              </div>
                              
                              <div className="space-y-6">
                                 {planResult.scenes.map((scene, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-brand-900/50 last:border-0 pb-6 last:pb-0">
                                       <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-luxury-800" />
                                       <div className="flex flex-col md:flex-row gap-4">
                                          <div className="w-24 flex-shrink-0">
                                             <span className="text-xs font-bold text-brand-500 bg-brand-900/20 px-2 py-1 rounded">{scene.timeRange}</span>
                                          </div>
                                          <div className="flex-1 space-y-3">
                                             <div className="bg-luxury-900/50 p-3 rounded-xl border border-brand-900/30">
                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-1">
                                                   <Video className="w-3 h-3" /> Visual
                                                </div>
                                                <p className="text-sm text-brand-100">{scene.visual}</p>
                                             </div>
                                             <div className="bg-luxury-900/50 p-3 rounded-xl border border-brand-900/30">
                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase mb-1">
                                                   <Music2 className="w-3 h-3" /> Audio / Script
                                                </div>
                                                <p className="text-sm text-brand-100 font-medium">"{scene.audio}"</p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* RIGHT COLUMN: Metadata & Tips */}
                        <div className="space-y-6">
                           <div className="bg-luxury-800 rounded-2xl border border-brand-900/30 p-6">
                              <h3 className="font-serif text-lg text-brand-100 mb-4">Caption</h3>
                              <div className="bg-luxury-900 p-4 rounded-xl text-sm text-brand-200/80 mb-3 whitespace-pre-wrap">
                                 {planResult.caption}
                              </div>
                              <button 
                                onClick={() => copyText(planResult.caption, 'caption')}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-white bg-brand-900/20 hover:bg-brand-900/40 rounded-lg transition-all"
                              >
                                 {copiedSection === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Caption
                              </button>
                           </div>

                           <div className="bg-luxury-800 rounded-2xl border border-brand-900/30 p-6">
                              <h3 className="font-serif text-lg text-brand-100 mb-4">Hashtags</h3>
                              <div className="flex flex-wrap gap-2 mb-4">
                                 {planResult.hashtags.map((tag, i) => (
                                    <span key={i} className="text-xs text-brand-300 bg-brand-900/30 px-2 py-1 rounded-md">{tag}</span>
                                 ))}
                              </div>
                              <button 
                                onClick={() => copyText(planResult.hashtags.join(' '), 'tags')}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-white bg-brand-900/20 hover:bg-brand-900/40 rounded-lg transition-all"
                              >
                                 {copiedSection === 'tags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Tags
                              </button>
                           </div>

                           <div className="bg-gradient-to-b from-brand-900/20 to-luxury-800 rounded-2xl border border-brand-500/20 p-6">
                              <div className="flex items-center gap-2 mb-3">
                                 <Target className="w-4 h-4 text-brand-500" />
                                 <h3 className="font-serif text-brand-100">Pro Tips</h3>
                              </div>
                              <p className="text-sm text-brand-200/70 leading-relaxed">
                                 {planResult.postingTips}
                              </p>
                           </div>
                        </div>

                     </div>
                  </div>
                )}
             </div>
          )}

       </div>
    </div>
  );
};