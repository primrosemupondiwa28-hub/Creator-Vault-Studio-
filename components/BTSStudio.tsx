import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clapperboard, Sparkles, RefreshCw, Upload, Camera, Film, Play, Download, Trash2, CheckCircle2, Wand2, Monitor, Video, VideoIcon, Layout, Users, Star, ShieldAlert } from 'lucide-react';
import { generateBTSImage, generateBTSVideo } from '../services/geminiService';
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
  const [era, setEra] = useState('Modern');
  const [vibe, setVibe] = useState('Candid Production');
  const [energy, setEnergy] = useState('High Energy');
  
  // New Enhanced BTS Selectors
  const [phase, setPhase] = useState('On-Set Break');
  const [aesthetic, setAesthetic] = useState('Raw Handheld');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Loading States
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadingMessages = [
    "Scouting production location...",
    "Retrieving celebrity likeness data...",
    "Coordinating with the cast...",
    "Capturing " + aesthetic.toLowerCase() + " still..."
  ];

  const videoLoadingMessages = [
    "Recording production b-roll...",
    "Applying viral handheld motion...",
    "Synchronizing set ambience...",
    "Finalizing viral Reels cut..."
  ];

  useEffect(() => {
    let stepInterval: any;
    let progressInterval: any;

    if (isGenerating || isGeneratingVideo) {
      setLoadingStep(0);
      setProgress(0);
      
      stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 3500);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return 98;
          return prev + (Math.random() * 1.5);
        });
      }, 200);
    }
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isGenerating, isGeneratingVideo]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setSubjectImage(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImages = async () => {
    if (!subjectImage || !mediaTitle) return;

    setIsGenerating(true);
    setGeneratedImages([]);
    setGeneratedVideoUrl(null);
    try {
      const results = await generateBTSImage(apiKey, subjectImage, mediaTitle, characters, era, vibe, energy, phase, aesthetic);
      setProgress(100);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      
      if (results[0]) {
        onSaveToHistory({
          id: Date.now().toString(),
          originalData: subjectImage,
          generatedData: results[0],
          prompt: `BTS with ${characters || 'Cast'} in ${mediaTitle}`,
          timestamp: Date.now(),
          aspectRatio: '9:16'
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    const firstFrame = generatedImages[selectedImageIndex];
    if (!firstFrame) return;

    // Veo video generation still requires key selection as it is a premium feature
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      return;
    }

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    try {
      const videoUrl = await generateBTSVideo(apiKey, firstFrame, mediaTitle, characters, aesthetic);
      setGeneratedVideoUrl(videoUrl);
      setShowVideoModal(true);
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const currentImage = generatedImages.length > 0 ? generatedImages[selectedImageIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-serif text-brand-100 font-bold">Viral BTS Generator</h2>
          </div>
          <p className="text-[10px] text-rose-400 uppercase tracking-[0.2em] font-bold mt-1">Candid Production Suite</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Actor Upload */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block flex items-center gap-2">
              1. The Star (Your Photo)
            </label>
            <div className="aspect-[3/4] bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 hover:border-rose-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden group">
              {subjectImage ? (
                <>
                  <img src={subjectImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => setSubjectImage(null)} className="p-2 bg-rose-600 rounded-full text-white"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-brand-200 font-serif text-sm">Upload Your Face</p>
                  <p className="text-[10px] text-brand-400/60 mt-1">Clear faces work best</p>
                </div>
              )}
              {!subjectImage && <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />}
            </div>
          </div>

          {/* Production Details */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 space-y-4">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider block flex items-center justify-between">
              <span>2. Production Brief</span>
              <div className="flex items-center gap-1 text-[8px] text-emerald-500">
                <ShieldAlert className="w-2 h-2" /> ACCURACY PROTOCOL
              </div>
            </label>
            
            <div>
              <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold">Sitcom or Film Title</label>
              <input 
                type="text" 
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
                placeholder="e.g. Abbott Elementary, The Office"
                className="w-full bg-luxury-950 border border-brand-900 rounded-xl px-4 py-3 text-sm text-brand-50 outline-none focus:border-rose-500 transition-all placeholder:text-brand-900"
              />
            </div>

            <div>
              <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold flex items-center gap-1">
                <Users className="w-3 h-3" /> Target Cast Member(s)
              </label>
              <input 
                type="text" 
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="e.g. Tyler James Williams"
                className="w-full bg-luxury-950 border border-brand-900 rounded-xl px-4 py-3 text-sm text-brand-50 outline-none focus:border-rose-500 transition-all placeholder:text-brand-900"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold flex items-center gap-1.5">
                   <VideoIcon className="w-3 h-3 text-rose-500" /> Production Phase
                </label>
                <select 
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full bg-luxury-950 border border-brand-900 rounded-xl px-4 py-2.5 text-xs text-brand-100 outline-none focus:border-rose-500 appearance-none"
                >
                  <option>On-Set Break</option>
                  <option>Wardrobe Fitting</option>
                  <option>Table Read</option>
                  <option>Action Sequence</option>
                  <option>Post-Show Party</option>
                  <option>Directing Meeting</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-brand-400 mb-1.5 block uppercase font-bold flex items-center gap-1.5">
                   <Layout className="w-3 h-3 text-rose-500" /> Viral Aesthetic
                </label>
                <select 
                  value={aesthetic}
                  onChange={(e) => setAesthetic(e.target.value)}
                  className="w-full bg-luxury-950 border border-brand-900 rounded-xl px-4 py-2.5 text-xs text-brand-100 outline-none focus:border-rose-500 appearance-none"
                >
                  <option>Raw iPhone Leak</option>
                  <option>Cinematic Documentary</option>
                  <option>90s VHS Camcorder</option>
                  <option>Candid Flash Photography</option>
                  <option>High-Key Professional B-Roll</option>
                  <option>Moody Noir Set</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateImages}
            disabled={!subjectImage || !mediaTitle || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-brand-600 hover:to-rose-500 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-rose-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            Step on Set (Generate Stills)
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-[600px]">
          
          {/* Main Display */}
          <div className="flex-1 bg-luxury-800 rounded-3xl border border-brand-900/30 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            {isGenerating || isGeneratingVideo ? (
              <div className="absolute inset-0 bg-luxury-900/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-rose-900/30 border-t-rose-500 animate-spin"></div>
                  <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-2xl font-serif text-brand-50 mb-3">
                  {isGeneratingVideo ? "Directing Leaked Scene..." : "Capturing Production Stills..."}
                </h3>
                <p className="text-brand-300/80 font-medium animate-pulse mb-6 max-w-xs">
                  {isGeneratingVideo ? videoLoadingMessages[loadingStep] : loadingMessages[loadingStep]}
                </p>
                
                <div className="w-64 h-1.5 bg-luxury-950 rounded-full overflow-hidden border border-brand-900/50 mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-brand-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest flex items-center gap-2">
                   <ShieldAlert className="w-3 h-3" /> 
                   Strict Identity Locking Active
                </p>
              </div>
            ) : null}

            {currentImage ? (
              <div className="relative w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                   <img src={currentImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-xl" />
                </div>
                
                {/* Dedicated Video Section - Highly Visible */}
                <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-2 bg-rose-600/20 px-4 py-1.5 rounded-full border border-rose-500/30">
                      <Star className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs font-bold text-rose-100 uppercase tracking-widest">Viral Content Ready</span>
                   </div>
                   
                   <div className="flex gap-4 w-full max-w-md">
                      <button 
                        onClick={handleGenerateVideo}
                        className="flex-1 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-2xl group"
                      >
                        <Video className="w-5 h-5 text-rose-600 group-hover:animate-pulse" />
                        Turn into Viral Video
                      </button>
                      
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = currentImage;
                          a.download = `bts-${mediaTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
                          a.click();
                        }}
                        className="p-4 bg-luxury-900/90 text-white rounded-2xl hover:bg-luxury-700 transition-all backdrop-blur-md border border-white/10"
                        title="Download Still"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                   </div>
                   <p className="text-[10px] text-brand-400/60 font-medium">Animates this still into a high-engagement handheld production clip.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-brand-400/20 p-12 text-center">
                <Monitor className="w-32 h-32 mb-6 opacity-10" />
                <h3 className="text-3xl font-serif mb-2">Production Monitor</h3>
                <p className="max-w-xs text-sm">Upload your subject and specify your favorite cast members to begin the production.</p>
              </div>
            )}
          </div>

          {/* Thumbnails Strip */}
          {generatedImages.length > 0 && (
            <div className="bg-luxury-800 p-4 rounded-2xl border border-brand-900/30 flex gap-4 overflow-x-auto scrollbar-hide">
              {generatedImages.map((img, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative w-20 aspect-[9/16] flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === i ? 'border-rose-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                  {selectedImageIndex === i && <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-white" /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal - The Video Feature Output */}
      {showVideoModal && generatedVideoUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg aspect-[9/16] bg-luxury-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col ring-8 ring-luxury-900">
            <div className="flex-1 relative bg-black">
              <video 
                ref={videoRef}
                src={generatedVideoUrl} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay 
                loop
              />
              {/* Leaked Text Overlay Vibe */}
              <div className="absolute top-8 left-6 pointer-events-none opacity-40">
                 <div className="text-[10px] font-mono text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    RECORDING SET B-ROLL
                 </div>
                 <div className="text-[10px] font-mono text-white mt-1 uppercase">SCENE: {mediaTitle}</div>
              </div>
            </div>
            
            <div className="p-8 bg-luxury-900 border-t border-white/5 space-y-4">
              <h4 className="text-brand-50 font-serif text-center font-bold">Your Viral BTS Clip is Ready!</h4>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = generatedVideoUrl;
                    a.download = `bts-viral-${Date.now()}.mp4`;
                    a.click();
                  }}
                  className="flex-1 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download for TikTok
                </button>
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="px-6 py-4 bg-luxury-800 text-brand-300 font-bold rounded-2xl hover:bg-luxury-700 transition-colors border border-white/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};