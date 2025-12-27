
import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ArrowLeft, Sparkles, CheckCircle2, Bot, Play, Clock, Target, Hash, Camera, Clapperboard, Check, Share2, Copy, Video, Music2, Youtube, Instagram, Upload, Image as ImageIcon, Layout, Loader2, AlertCircle, Trash2, Download, Code, Send, Boxes, Box, Package, PlayCircle } from 'lucide-react';
import { generateUGCPoster, generateUGCVideoWorkflow, generateSceneImage, generateUGCCreativeIdeas, generateMotionVideo, UGCVideoWorkflow, UGCVideoWorkflowScene } from '../services/geminiService';
import { GeneratedImage, AspectRatio } from '../types';

interface UGCStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

interface SceneResult extends UGCVideoWorkflowScene {
  imageUrl: string | null;
  loading: boolean;
  videoUrl?: string;
  videoLoading?: boolean;
}

interface AssistantMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const UGCStudio: React.FC<UGCStudioProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'assistant'>('studio');

  // Step 1: Poster Creation
  const [productImage, setProductImage] = useState<string | null>(null);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [vibe, setVibe] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [posterUrls, setPosterUrls] = useState<string[]>([]);
  const [selectedPosterIndex, setSelectedPosterIndex] = useState<number>(0);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isGeneratingMotion, setIsGeneratingMotion] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Step 2: Video Plan Creation
  const [videoPlan, setVideoPlan] = useState<SceneResult[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Assistant State
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    { role: 'assistant', text: "Hey! I'm your UGC Creative Director. Describe your background or vibe, and I'll help you build an authentic cinematic ad. Try suggestions like 'Messy Bedroom' or 'Driver Seat Selfie'." }
  ]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const backgroundSuggestions = [
    "Messy Morning Bedroom", "Candid Car Interior", "Kitchen Counter with Coffee", "Gym Locker Room", "Busy Coffee Shop Window", "Public Park Bench", "Office Desk with Laptop", "Bathroom Vanity Mirror"
  ];

  const handleUpload = (setter: (s) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setter(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMakePoster = async () => {
    if (!productImage || !characterImage) return;
    setIsGeneratingPoster(true);
    setPosterUrls([]);
    setVideoPlan([]);
    setActiveVideoUrl(null);
    try {
      const urls = await generateUGCPoster(apiKey, productImage, characterImage, vibe || "Authentic candid UGC lifestyle", aspectRatio);
      setPosterUrls(urls);
      setSelectedPosterIndex(0);
      if (urls.length > 0) {
        onSaveToHistory({
          id: `ugc-poster-${Date.now()}`,
          originalData: characterImage,
          generatedData: urls[0],
          prompt: `UGC Poster: ${vibe}`,
          timestamp: Date.now(),
          aspectRatio
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const handleGenerateMotion = async () => {
    const posterUrl = posterUrls[selectedPosterIndex];
    if (!posterUrl) return;
    setIsGeneratingMotion(true);
    try {
      const vidUrl = await generateMotionVideo(apiKey, posterUrl, vibe || "Dynamic candid motion");
      setActiveVideoUrl(vidUrl);
    } catch (e) {
      alert("Motion generation failed. Please try again.");
    } finally {
      setIsGeneratingMotion(false);
    }
  };

  const handleMakeVideoPlan = async () => {
    const posterUrl = posterUrls[selectedPosterIndex];
    if (!posterUrl) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await generateUGCVideoWorkflow(apiKey, posterUrl, aspectRatio);
      const initialScenes: SceneResult[] = plan.scenes.map(s => ({ ...s, imageUrl: null, loading: true }));
      setVideoPlan(initialScenes);

      for (let i = 0; i < initialScenes.length; i++) {
        try {
          const imgUrl = await generateSceneImage(apiKey, posterUrl, initialScenes[i].visualPrompt, aspectRatio);
          setVideoPlan(prev => prev.map((s, idx) => idx === i ? { ...s, imageUrl: imgUrl, loading: false } : s));
        } catch (e) {
          setVideoPlan(prev => prev.map((s, idx) => idx === i ? { ...s, loading: false } : s));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleAssistantSend = async () => {
    if (!assistantInput.trim() || isAssistantTyping) return;
    const userMsg = assistantInput.trim();
    setAssistantMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAssistantInput('');
    setIsAssistantTyping(true);
    try {
      const reply = await generateUGCCreativeIdeas(apiKey, productImage, userMsg);
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: "Error syncing creative ideas. Check your connection." }]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [assistantMessages, isAssistantTyping]);

  const activePoster = posterUrls[selectedPosterIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       <div className="w-full max-w-7xl flex justify-between items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-bold">
             <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
               <Clapperboard className="w-6 h-6 text-emerald-500" />
               <h2 className="text-2xl font-serif text-brand-100 font-bold tracking-tight">UGC Viral Studio</h2>
            </div>
            <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">Authentic Ad Pipeline</p>
          </div>
          <div className="w-20" />
       </div>

       <div className="w-full max-w-lg bg-luxury-800 p-1.5 rounded-xl border border-brand-900/50 mb-8 flex shadow-inner">
          <button onClick={() => setActiveTab('studio')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'studio' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}>
             <Camera className="w-4 h-4" /> Photo Studio
          </button>
          <button onClick={() => setActiveTab('assistant')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'assistant' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}>
             <Bot className="w-4 h-4" /> UGC Assistant
          </button>
       </div>

       <div className="w-full max-w-7xl flex-1">
          {activeTab === 'studio' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-hide pr-2">
                   <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">Product Photo</label>
                            <div className="aspect-square bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 hover:border-emerald-500/50 relative flex items-center justify-center overflow-hidden group">
                               {productImage ? <img src={productImage} className="w-full h-full object-contain" /> : <Upload className="w-6 h-6 text-brand-700" />}
                               <input type="file" onChange={handleUpload(setProductImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">Character / Model</label>
                            <div className="aspect-square bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 hover:border-emerald-500/50 relative flex items-center justify-center overflow-hidden group">
                               {characterImage ? <img src={characterImage} className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-brand-700" />}
                               <input type="file" onChange={handleUpload(setCharacterImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">Environment & Vibe</label>
                         <textarea 
                            value={vibe} 
                            onChange={(e) => setVibe(e.target.value)} 
                            placeholder="Describe the setting clearly..." 
                            className="w-full h-28 bg-brand-50 border border-brand-500 rounded-xl p-4 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner" 
                         />
                         <div className="flex flex-wrap gap-1.5 mt-2">
                            {backgroundSuggestions.map(s => (
                               <button key={s} onClick={() => setVibe(s)} className="text-[9px] font-bold text-brand-300 bg-luxury-900 px-2 py-1 rounded border border-brand-900/50 hover:border-emerald-500/50 transition-all">{s}</button>
                            ))}
                         </div>
                      </div>
                      <button 
                         onClick={handleMakePoster} 
                         disabled={!productImage || !characterImage || isGeneratingPoster} 
                         className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-serif font-bold rounded-xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                         {isGeneratingPoster ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
                         {isGeneratingPoster ? 'Generating 4 Posters...' : 'Make 4 Posters'}
                      </button>
                   </div>
                   {posterUrls.length > 0 && (
                      <div className="space-y-4">
                         <div className="bg-luxury-800 p-5 rounded-2xl border border-indigo-500/20 shadow-xl group">
                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                               <PlayCircle className="w-4 h-4" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Premium: Generate Motion (Veo)</span>
                            </div>
                            <p className="text-[10px] text-brand-300 mb-4 font-medium italic">Turn this still into a 7-second high-fidelity cinematic video clip.</p>
                            <button 
                               onClick={handleGenerateMotion}
                               disabled={isGeneratingMotion}
                               className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-500 transition-all"
                            >
                               {isGeneratingMotion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
                               {isGeneratingMotion ? 'Rendering 7s Video...' : 'Animate Variation'}
                            </button>
                         </div>
                      </div>
                   )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                   <div className="bg-luxury-800 rounded-3xl border border-brand-900/30 p-6 shadow-2xl relative min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
                      {isGeneratingPoster ? (
                         <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                               <div className="w-16 h-16 rounded-full border-4 border-emerald-900 border-t-emerald-500 animate-spin" />
                               <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                            </div>
                            <p className="text-brand-100 font-serif text-lg font-bold">Locking Identity...</p>
                         </div>
                      ) : activeVideoUrl ? (
                         <div className="w-full flex flex-col gap-4">
                            <div className="flex justify-between items-center px-2">
                               <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">Veo-3.1 Motion Clip</span>
                               <button onClick={() => {const a = document.createElement('a'); a.href = activeVideoUrl; a.download = 'ugc-motion.mp4'; a.click();}} className="p-2 bg-luxury-900 text-brand-300 rounded-lg hover:bg-brand-900/50 border border-brand-900"><Download className="w-4 h-4" /></button>
                            </div>
                            <video src={activeVideoUrl} controls autoPlay loop className="w-full max-h-[600px] rounded-2xl shadow-2xl bg-black" />
                         </div>
                      ) : activePoster ? (
                         <div className="w-full flex flex-col gap-4">
                            <div className="flex justify-between items-center px-2">
                               <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">Variant {selectedPosterIndex + 1}</span>
                            </div>
                            <div className={`mx-auto rounded-2xl overflow-hidden shadow-2xl ${aspectRatio === '9:16' ? 'max-h-[600px] aspect-[9/16]' : 'max-h-[400px] aspect-[16:9]'} bg-luxury-950`}><img src={activePoster} className="w-full h-full object-contain" /></div>
                         </div>
                      ) : (
                         <div className="text-center text-brand-400/20">
                            <Clapperboard className="w-32 h-32 mx-auto mb-4 opacity-5" />
                            <h3 className="text-3xl font-serif text-brand-100/40 font-bold">UGC Creative Suite</h3>
                         </div>
                      )}
                      {isGeneratingMotion && (
                         <div className="absolute inset-0 bg-luxury-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                            <div className="w-20 h-20 rounded-full border-4 border-indigo-900 border-t-indigo-500 animate-spin mb-6" />
                            <h3 className="text-2xl font-serif text-brand-50 font-bold mb-2">Expanding to Motion</h3>
                            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">Running Veo-3.1 Predictive Frames...</p>
                         </div>
                      )}
                   </div>

                   {posterUrls.length > 0 && !isGeneratingPoster && (
                      <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 flex gap-4 overflow-x-auto scrollbar-hide shadow-xl">
                        {posterUrls.map((url, i) => (
                           <div 
                             key={i} 
                             onClick={() => { setSelectedPosterIndex(i); setActiveVideoUrl(null); }}
                             className={`relative w-24 aspect-[9/16] shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedPosterIndex === i ? 'border-emerald-500 scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                           >
                              <img src={url} className="w-full h-full object-cover" />
                           </div>
                        ))}
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
