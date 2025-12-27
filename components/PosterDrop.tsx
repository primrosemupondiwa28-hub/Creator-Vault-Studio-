import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Upload, Sparkles, RefreshCw, Download, Trash2, CheckCircle2, Sliders, Layout, Loader2, AlertCircle, Maximize, MapPin, Search } from 'lucide-react';
import { generatePosterPlacement } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface PosterDropProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

interface PosterResult {
  location: string;
  url: string | null;
  loading: boolean;
  error: string | null;
}

export const PosterDrop: React.FC<PosterDropProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [posterArtwork, setPosterArtwork] = useState<string | null>(null);
  const [locationList, setLocationList] = useState('Times Square billboard\nNYC subway lightbox\nLondon bus stop\nTokyo Shibuya crossing metro\nUrban brick wall in Brooklyn\nLuxury mall digital kiosk');
  const [ratio, setRatio] = useState('2:3'); // Aspect ratio of the poster itself
  
  const [results, setResults] = useState<PosterResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  const presets = [
    "Times Square", "Subway Station", "Bus Stop", "Airport Terminal", "City Wall", "Shopping Mall"
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setPosterArtwork(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addPreset = (preset: string) => {
    setLocationList(prev => prev.trim() ? `${prev}\n${preset}` : preset);
  };

  const handleGenerateBatch = async () => {
    if (!posterArtwork) return;
    const locations = locationList.split('\n').filter(l => l.trim());
    if (locations.length === 0) return;

    setIsBatchRunning(true);
    const initialResults: PosterResult[] = locations.map(l => ({
      location: l,
      url: null,
      loading: true,
      error: null
    }));
    setResults(initialResults);
    setSelectedResultIndex(null);

    for (let i = 0; i < locations.length; i++) {
      try {
        const url = await generatePosterPlacement(apiKey, posterArtwork, locations[i], ratio);
        if (url) {
          setResults(prev => prev.map((res, idx) => 
            idx === i ? { ...res, url, loading: false } : res
          ));
          onSaveToHistory({
            id: `poster-${Date.now()}-${i}`,
            originalData: posterArtwork,
            generatedData: url,
            prompt: `Poster Drop: ${locations[i]}`,
            timestamp: Date.now(),
            aspectRatio: '16:9'
          });
        }
      } catch (err: any) {
        setResults(prev => prev.map((res, idx) => 
          idx === i ? { ...res, loading: false, error: err.message || "Placement Failed" } : res
        ));
      }
    }
    setIsBatchRunning(false);
    if (locations.length > 0) setSelectedResultIndex(0);
  };

  const activeResult = selectedResultIndex !== null ? results[selectedResultIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-bold">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-blue-400">
            <Globe className="w-6 h-6" />
            <h2 className="text-2xl font-serif text-brand-100 font-bold tracking-tight">PosterDrop</h2>
          </div>
          <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">Global Marketing Simulation</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide pr-2">
          
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">
              1. Upload Poster / Artwork
            </label>
            <div className={`aspect-square bg-luxury-950 rounded-xl border-2 border-dashed transition-all relative flex flex-col items-center justify-center overflow-hidden group ${posterArtwork ? 'border-brand-500/50' : 'border-brand-900 hover:border-blue-500/50'}`}>
              {posterArtwork ? (
                <>
                  <img src={posterArtwork} className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => setPosterArtwork(null)} className="p-2 bg-rose-600 rounded-full text-white shadow-lg"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-12 h-12 text-brand-900 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                  <p className="text-brand-200 font-serif text-sm">Drop Poster File</p>
                  <p className="text-[10px] text-brand-400/60 mt-1">Accepts any marketing asset</p>
                </div>
              )}
              {!posterArtwork && <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />}
            </div>
          </div>

          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-3 block">
              2. Target Locations
            </label>
            <textarea
              value={locationList}
              onChange={(e) => setLocationList(e.target.value)}
              className="w-full h-32 bg-brand-50 border border-brand-500 rounded-xl p-3 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono scrollbar-thin scrollbar-thumb-brand-900 placeholder:text-gray-500"
              placeholder="One location per line..."
            />
            <div className="mt-4">
              <p className="text-[10px] font-bold text-brand-500 uppercase mb-2">Location Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button 
                    key={p}
                    onClick={() => addPreset(p)}
                    className="px-2 py-1 bg-luxury-900 hover:bg-blue-900/30 text-[10px] text-brand-300 rounded border border-brand-900/50 transition-colors"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">
              3. Poster Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['2:3', '4:5', '1:1', '9:16', '16:9'].map(r => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${ratio === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-luxury-900 border-brand-900/50 text-brand-300 hover:border-blue-500/50'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={!posterArtwork || isBatchRunning}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-brand-600 hover:to-blue-500 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-blue-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isBatchRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deploying Campaign...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                Drop Poster Globally
              </>
            )}
          </button>
        </div>

        {/* Right Side: Simulation Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="flex-1 bg-luxury-800 rounded-3xl border border-brand-900/30 p-6 shadow-2xl relative flex flex-col min-h-[500px]">
            {activeResult ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-900/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="px-3 py-1 bg-brand-900/50 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20">
                      {activeResult.location}
                    </span>
                    <span className="text-[10px] text-brand-400">• Cinematic 4K Perspective Render</span>
                  </div>
                  {activeResult.url && (
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = activeResult.url!;
                        a.download = `poster-${activeResult.location.replace(/\s+/g, '-')}.png`;
                        a.click();
                      }}
                      className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-luxury-950 rounded-2xl group shadow-inner">
                  {activeResult.loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-900 border-t-blue-500 animate-spin"></div>
                        <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 animate-pulse" />
                      </div>
                      <p className="text-brand-300 font-serif text-lg">Simulating {activeResult.location}...</p>
                    </div>
                  ) : activeResult.error ? (
                    <div className="text-center p-8">
                       <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                       <p className="text-brand-100">{activeResult.error}</p>
                    </div>
                  ) : (
                    <>
                      <img src={activeResult.url!} className="max-w-full max-h-full object-contain" />
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            <Sparkles className="w-3 h-3" /> Realism Engine Active
                         </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-brand-400/20">
                <Globe className="w-32 h-32 mb-6 opacity-5" />
                <h3 className="text-4xl font-serif mb-4 text-brand-50/10">Placement Simulation</h3>
                <p className="max-w-md text-sm leading-relaxed">Drop your marketing assets into world-class environments. Our Realism Engine automatically handles perspective correction and lighting integration.</p>
              </div>
            )}
          </div>

          {/* Result Strip */}
          {results.length > 0 && (
            <div className="bg-luxury-800 p-4 rounded-2xl border border-brand-900/30 flex gap-4 overflow-x-auto scrollbar-hide">
              {results.map((res, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedResultIndex(i)}
                  className={`relative w-32 aspect-video flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedResultIndex === i ? 'border-blue-500 scale-105 shadow-xl shadow-blue-900/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {res.loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-luxury-900">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  ) : res.url ? (
                    <img src={res.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-luxury-900 text-rose-500">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white text-center py-1 truncate px-1 uppercase tracking-tighter">
                    {res.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};