
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clapperboard, Sparkles, RefreshCw, Upload, Camera, Film, Play, Download, Trash2, CheckCircle2, Wand2, Monitor, Video, VideoIcon, Layout, Users, Star, ShieldAlert, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { generateBTSImage, fetchTrendingProductionSets, TrendingSet } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface BTSStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

export const BTSStudio: React.FC<BTSStudioProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [subjectImage, setSubjectImage] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [characters, setCharacters] = useState('');
  const [phase, setPhase] = useState('On-Set Break');
  const [aesthetic, setAesthetic] = useState('Raw Handheld');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [trendingSets, setTrendingSets] = useState<TrendingSet[]>([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Setting up set lighting...",
    "Positioning background cast...",
    "Capturing candid chemistry...",
    "Finalizing BTS aesthetic..."
  ];

  useEffect(() => {
    // Initial fetch of trending production sets
    const loadTrends = async () => {
      setIsFetchingTrends(true);
      try {
        const trends = await fetchTrendingProductionSets(apiKey);
        setTrendingSets(trends);
      } catch (e) {
        console.error("Trends fetch failed", e);
      } finally {
        setIsFetchingTrends(false);
      }
    };
    loadTrends();
  }, [apiKey]);

  useEffect(() => {
    let stepInterval: any;
    let progressInterval: any;
    if (isGenerating) {
      setLoadingStep(0);
      setProgress(0);
      stepInterval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingMessages.length), 3500);
      progressInterval = setInterval(() => setProgress(prev => prev >= 98 ? 98 : prev + (Math.random() * 1.5)), 200);
    }
    return () => { clearInterval(stepInterval); clearInterval(progressInterval); };
  }, [isGenerating]);

  const handleGenerateImages = async () => {
    if (!subjectImage || !mediaTitle) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    try {
      const results = await generateBTSImage(apiKey, subjectImage, mediaTitle, characters, 'Modern', 'Candid', 'High', phase, aesthetic);
      setProgress(100);
      setGeneratedImages(results);
      if (results[0]) onSaveToHistory({ id: Date.now().toString(), originalData: subjectImage, generatedData: results[0], prompt: `BTS: ${mediaTitle}`, timestamp: Date.now(), aspectRatio: '9:16' });
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  const handleSelectTrend = (trend: TrendingSet) => {
    setMediaTitle(trend.title);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-bold"><ArrowLeft className="w-4 h-4" /> Home</button>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2"><Clapperboard className="w-6 h-6 text-rose-500" /><h2 className="text-2xl font-serif text-brand-100 font-bold">Viral BTS Studio</h2></div>
          <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold mt-1">Candid Production Suite</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">1. The Star (Your Photo)</label>
            <div className="aspect-[3/4] bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 relative flex flex-col items-center justify-center overflow-hidden group">
              {subjectImage ? <img src={subjectImage} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Camera className="w-8 h-8 text-rose-900 mx-auto mb-2" /><p className="text-brand-300 font-serif text-xs font-bold">Upload Your Face</p></div>}
              <input type="file" onChange={(e) => {const f = e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=(ev)=>setSubjectImage(ev.target?.result as string); r.readAsDataURL(f);}}} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-luxury-800 p-6 rounded-2xl border border-brand-900/30 space-y-5">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider block flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> 2. Grounded Context
            </label>
            
            <div className="space-y-3">
               <label className="text-[10px] text-brand-400 mb-1 block uppercase font-bold tracking-widest">Trending Production Sets</label>
               {isFetchingTrends ? (
                 <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold py-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> FETCHING REAL-WORLD DATA...
                 </div>
               ) : (
                 <div className="flex flex-wrap gap-2">
                    {trendingSets.map((trend, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <button 
                          onClick={() => handleSelectTrend(trend)}
                          className={`text-[9px] font-bold px-3 py-1.5 rounded-full border transition-all ${mediaTitle === trend.title ? 'bg-rose-600 border-rose-500 text-white' : 'bg-rose-950/20 border-rose-900/40 text-rose-300 hover:border-rose-500/50'}`}
                        >
                          {trend.title}
                        </button>
                        <a href={trend.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-luxury-900 border border-brand-900 rounded-full text-brand-400 hover:text-white transition-colors" title="View Source">
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))}
                    {trendingSets.length === 0 && <p className="text-[10px] text-brand-600">No active trends found.</p>}
                 </div>
               )}
            </div>

            <div>
              <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold tracking-widest">Show or Film Title</label>
              <input 
                type="text" 
                value={mediaTitle} 
                onChange={(e) => setMediaTitle(e.target.value)} 
                placeholder="e.g. The Bear, Euphoria, Insecure..." 
                className="w-full bg-brand-50 border border-brand-500 rounded-xl px-4 py-3 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500" 
              />
            </div>
            <div>
              <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold tracking-widest">Cast Members (Optional)</label>
              <input 
                type="text" 
                value={characters} 
                onChange={(e) => setCharacters(e.target.value)} 
                placeholder="Who are you on set with?" 
                className="w-full bg-brand-50 border border-brand-500 rounded-xl px-4 py-3 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500" 
              />
            </div>
            <button onClick={handleGenerateImages} disabled={!subjectImage || !mediaTitle || isGenerating} className="w-full py-4 bg-gradient-to-r from-rose-600 to-brand-600 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]">
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Step on Set
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-[600px] bg-luxury-800 rounded-3xl border border-brand-900/30 p-4 relative overflow-hidden shadow-2xl items-center justify-center">
           {currentImage ? (
             <div className="w-full h-full flex flex-col items-center">
               <div className="flex-1 flex items-center justify-center w-full">
                  <img src={currentImage} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-xl animate-in fade-in zoom-in duration-500" />
               </div>
               {generatedImages.length > 1 && (
                 <div className="flex gap-3 mt-4 overflow-x-auto pb-2 w-full justify-center">
                    {generatedImages.map((img, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedImageIndex(i)}
                        className={`w-16 aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImageIndex === i ? 'border-rose-500 scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                 </div>
               )}
             </div>
           ) : (
             <div className="text-center text-brand-400/20">
               <Monitor className="w-24 h-24 mx-auto mb-4 opacity-10" />
               <p className="font-serif text-xl">Monitor Feed Offline</p>
               <p className="text-xs mt-2 font-medium">Select a production set to begin filming.</p>
             </div>
           )}
           {isGenerating && (
             <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur flex flex-col items-center justify-center p-8 text-center z-20">
               <div className="relative mb-6">
                  <Film className="w-16 h-16 text-rose-500 animate-pulse" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full animate-ping" />
               </div>
               <h3 className="text-2xl font-serif text-brand-50 font-bold mb-2">Recording Candid Stills...</h3>
               <p className="text-brand-400 text-xs font-bold animate-pulse uppercase tracking-widest">{loadingMessages[loadingStep]}</p>
               <div className="w-64 h-1.5 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mt-6 shadow-inner">
                  <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${progress}%` }} />
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
