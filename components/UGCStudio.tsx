import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ArrowLeft, Sparkles, CheckCircle2, Bot, Play, Clock, Target, Hash, Camera, Clapperboard, Check, Share2, Copy, Video, Music2, Youtube, Instagram, Upload, Image as ImageIcon, Layout, Loader2, AlertCircle, Trash2, Download, Code, Send, Boxes, Box, Package } from 'lucide-react';
import { generateUGCPoster, generateUGCVideoWorkflow, generateSceneImage, generateUGCCreativeIdeas, UGCVideoWorkflow, UGCVideoWorkflowScene } from '../services/geminiService';
import { GeneratedImage, AspectRatio } from '../types';

interface UGCStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

interface SceneResult extends UGCVideoWorkflowScene {
  imageUrl: string | null;
  loading: boolean;
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

  const handleUpload = (setter: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const downloadAllScenes = () => {
    videoPlan.forEach((scene, i) => {
      if (scene.imageUrl) {
        const a = document.createElement('a'); a.href = scene.imageUrl; a.download = `scene-${i+1}.png`; a.click();
      }
    });
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [assistantMessages, isAssistantTyping]);

  const activePoster = posterUrls[selectedPosterIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
       <div className="w-full max-w-7xl flex justify-between items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-medium">
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
                            <p className="text-[9px] text-brand-400/60 uppercase text-center font-bold">Strict Product Lock</p>
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
                         <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">UGC Environment & Vibe</label>
                         <textarea 
                            value={vibe} 
                            onChange={(e) => setVibe(e.target.value)} 
                            placeholder="Describe the setting (e.g. 'Unmade bed with morning sunlight') or use suggestions below..." 
                            className="w-full h-28 bg-luxury-950 border border-brand-900 rounded-xl p-4 text-sm text-white font-medium outline-none focus:border-emerald-500 transition-all placeholder:text-brand-400/50 shadow-inner" 
                         />
                         <div className="flex flex-wrap gap-1.5 mt-2">
                            {backgroundSuggestions.map(s => (
                               <button key={s} onClick={() => setVibe(s)} className="text-[9px] font-bold text-brand-300 bg-luxury-900 px-2 py-1 rounded border border-brand-900/50 hover:border-emerald-500/50 transition-all">{s}</button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block">Output Ratio</label>
                         <div className="grid grid-cols-2 gap-2">
                            {['9:16', '16:9'].map(r => (
                               <button key={r} onClick={() => setAspectRatio(r as AspectRatio)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === r ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-luxury-950 border-brand-900 text-brand-400 hover:border-brand-500/30'}`}>
                                  {r === '9:16' ? 'Vertical (Social)' : 'Horizontal (Cinematic)'}
                               </button>
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
                      <div className="bg-luxury-800 p-5 rounded-2xl border border-emerald-500/20 animate-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-2 text-emerald-400 mb-4">
                            <Video className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Generate Video Sequence</span>
                         </div>
                         <p className="text-[11px] text-brand-300 mb-4 leading-relaxed font-medium">Use the selected variation to build a 5-scene 40s cinematic storyboard with Veo-3 motion controls.</p>
                         <button 
                            onClick={handleMakeVideoPlan} 
                            disabled={isGeneratingPlan} 
                            className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-50 transition-colors"
                         >
                            {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />} 
                            {isGeneratingPlan ? 'Mapping Storyboard...' : 'Make Video Plan from Poster'}
                         </button>
                      </div>
                   )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                   <div className="bg-luxury-800 rounded-3xl border border-brand-900/30 p-6 shadow-2xl relative min-h-[450px] flex flex-col items-center justify-center overflow-hidden">
                      {isGeneratingPoster ? (
                         <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                               <div className="w-16 h-16 rounded-full border-4 border-emerald-900 border-t-emerald-500 animate-spin" />
                               <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                            </div>
                            <p className="text-brand-100 font-serif text-lg font-bold">Locking Original Brand Labels...</p>
                            <p className="text-brand-400 text-xs animate-pulse">Ensuring product identity matches 1:1</p>
                         </div>
                      ) : activePoster ? (
                         <div className="w-full flex flex-col gap-4">
                            <div className="flex justify-between items-center px-2">
                               <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-400 uppercase border border-emerald-500/20 tracking-widest">Variant {selectedPosterIndex + 1}</span>
                                  <span className="text-[10px] text-brand-200 font-bold">• Brand Integrity Locked</span>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => {const a = document.createElement('a'); a.href = activePoster; a.download = `ugc-poster-${selectedPosterIndex+1}.png`; a.click();}} className="p-2 bg-luxury-900 text-brand-300 rounded-lg hover:bg-brand-900/50 border border-brand-900"><Download className="w-4 h-4" /></button>
                               </div>
                            </div>
                            <div className={`mx-auto rounded-2xl overflow-hidden shadow-2xl ${aspectRatio === '9:16' ? 'max-h-[600px] aspect-[9/16]' : 'max-h-[400px] aspect-[16:9]'} bg-luxury-950`}>
                               <img src={activePoster} className="w-full h-full object-contain" />
                            </div>
                         </div>
                      ) : (
                         <div className="text-center text-brand-400/20">
                            <Package className="w-32 h-32 mx-auto mb-4 opacity-5" />
                            <h3 className="text-3xl font-serif text-brand-100/40">UGC Creative Suite</h3>
                            <p className="max-w-sm mx-auto text-sm mt-2 text-brand-400/60 font-medium">Upload assets and describe a candid setting. Our engine preserves your product labels exactly as they appear in your photo.</p>
                         </div>
                      )}
                   </div>

                   {posterUrls.length > 0 && !isGeneratingPoster && (
                      <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 flex gap-4 overflow-x-auto scrollbar-hide shadow-xl">
                        {posterUrls.map((url, i) => (
                           <div 
                             key={i} 
                             onClick={() => setSelectedPosterIndex(i)}
                             className={`relative w-24 aspect-[9/16] shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedPosterIndex === i ? 'border-emerald-500 scale-110 shadow-lg ring-4 ring-emerald-500/10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                           >
                              <img src={url} className="w-full h-full object-cover" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white font-bold text-center py-1">Variation {i+1}</div>
                           </div>
                        ))}
                      </div>
                   )}

                   {(isGeneratingPlan || videoPlan.length > 0) && (
                      <div className="bg-luxury-800 rounded-3xl border border-brand-900/30 p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
                         <div className="flex justify-between items-center border-b border-brand-900/30 pb-6">
                            <div>
                               <h3 className="text-xl font-serif text-brand-50 font-bold flex items-center gap-3">
                                  <Video className="w-6 h-6 text-emerald-500" /> 
                                  Cinematography Plan (5 Scenes)
                               </h3>
                               <p className="text-xs text-brand-400 mt-1 font-medium italic">Based on Variation #{selectedPosterIndex+1} • Custom Veo-3 Directives</p>
                            </div>
                            {videoPlan.length > 0 && !isGeneratingPlan && (
                               <button onClick={downloadAllScenes} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all shadow-lg">
                                  <Download className="w-3.5 h-3.5" /> Export All Scenes
                               </button>
                            )}
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {videoPlan.length > 0 ? videoPlan.map((scene, i) => (
                               <div key={i} className="bg-luxury-900 rounded-2xl border border-brand-900/50 overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg">
                                  <div className={`relative ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16:9]'} bg-black overflow-hidden`}>
                                     {scene.loading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                           <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                           <span className="text-[8px] text-brand-400 font-bold uppercase tracking-widest">Rendering Scene Still...</span>
                                        </div>
                                     ) : scene.imageUrl ? (
                                        <img src={scene.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                     ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-rose-500/30"><AlertCircle className="w-8 h-8" /></div>
                                     )}
                                     <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[8px] font-bold text-emerald-400 uppercase border border-emerald-500/20">Scene {i+1}</div>
                                  </div>
                                  <div className="p-4 space-y-3">
                                     <div>
                                        <h4 className="text-[11px] font-bold text-brand-50 uppercase tracking-wide">{scene.title}</h4>
                                        <p className="text-[9px] text-brand-300 line-clamp-2 mt-1 leading-relaxed italic font-medium">"{scene.visualPrompt}"</p>
                                     </div>
                                     <div className="pt-3 border-t border-brand-900/50">
                                        <div className="flex items-center justify-between mb-2">
                                           <span className="text-[8px] font-bold text-brand-500 uppercase flex items-center gap-1">
                                              <Code className="w-2.5 h-2.5" /> Veo-3 JSON PROMPT
                                           </span>
                                           <button onClick={() => navigator.clipboard.writeText(scene.veoConfig)} className="text-[8px] font-bold text-emerald-500 hover:text-white transition-colors flex items-center gap-1">
                                              <Copy className="w-2.5 h-2.5" /> COPY
                                           </button>
                                        </div>
                                        <div className="bg-black/40 rounded-lg p-2 font-mono text-[8px] text-emerald-400/80 break-all overflow-y-auto max-h-20 scrollbar-hide border border-emerald-500/5">
                                           {scene.veoConfig}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            )) : Array(5).fill(0).map((_, i) => (
                               <div key={i} className="bg-luxury-900 rounded-2xl border border-brand-900/50 p-4 space-y-4 animate-pulse">
                                  <div className={`w-full ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16:9]'} bg-luxury-950 rounded-xl`} />
                                  <div className="h-4 bg-luxury-950 rounded w-3/4" />
                                  <div className="h-3 bg-luxury-950 rounded w-1/2" />
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'assistant' && (
             <div className="w-full max-w-4xl mx-auto flex flex-col h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-1 bg-luxury-800 border border-brand-900/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                   <div className="bg-luxury-700/50 p-6 border-b border-brand-900/30 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                         <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h3 className="text-lg font-serif text-brand-50 font-bold">UGC Creative Director</h3>
                         <p className="text-[10px] text-pink-400 uppercase tracking-widest font-bold">Viral Strategy & Environment Mapping</p>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-brand-900 bg-luxury-950/20">
                      {assistantMessages.map((msg, i) => (
                         <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-md ${msg.role === 'user' ? 'bg-brand-600' : 'bg-luxury-700 border border-brand-900'}`}>
                               {msg.role === 'user' ? <div className="w-2 h-2 bg-white rounded-full" /> : <Bot className="w-5 h-5 text-pink-400" />}
                            </div>
                            <div className={`max-w-[75%] rounded-2xl p-4 text-sm shadow-xl font-medium ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-luxury-800 text-brand-50 border border-brand-900/50 rounded-tl-none'}`}>
                               <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                            </div>
                         </div>
                      ))}
                      {isAssistantTyping && (
                         <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-luxury-700 border border-brand-900 flex items-center justify-center shadow-md">
                               <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
                            </div>
                            <div className="bg-luxury-800 rounded-2xl rounded-tl-none p-4 border border-brand-900/50">
                               <div className="flex gap-1.5">
                                  <div className="w-2 h-2 bg-pink-500/50 rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-pink-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-pink-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                               </div>
                            </div>
                         </div>
                      )}
                      <div ref={messagesEndRef} />
                   </div>
                   <div className="p-6 bg-luxury-800 border-t border-brand-900/30">
                      <div className="relative">
                         <input 
                            type="text" 
                            value={assistantInput} 
                            onChange={(e) => setAssistantInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleAssistantSend()} 
                            placeholder="Ask for background ideas, hooks, or a storyboard..." 
                            className="w-full bg-luxury-950 border border-brand-900 rounded-2xl py-4 pl-6 pr-14 text-sm text-white font-medium focus:border-pink-500 outline-none placeholder:text-brand-400/50 transition-all shadow-inner" 
                         />
                         <button 
                            onClick={handleAssistantSend} 
                            disabled={!assistantInput.trim() || isAssistantTyping} 
                            className="absolute right-2 top-2 bottom-2 w-10 bg-gradient-to-b from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg disabled:opacity-50 transition-all hover:scale-105"
                         >
                            <Send className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};