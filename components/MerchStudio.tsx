import React, { useState, useEffect } from 'react';
import { ArrowLeft, Box, CheckCircle2, Image as ImageIcon, Layers, Package, RefreshCw, Shirt, Smartphone, Sparkles, Upload, Download, Trash2, Sliders, Palette, Layout, Loader2, AlertCircle, Maximize, Move } from 'lucide-react';
import { generateMockup } from '../services/geminiService';
import { GeneratedImage } from '../types';

interface MerchStudioProps {
  apiKey: string;
  onBack: () => void;
  onSaveToHistory: (img: GeneratedImage) => void;
}

interface MockupResult {
  product: string;
  url: string | null;
  loading: boolean;
  error: string | null;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ apiKey, onBack, onSaveToHistory }) => {
  const [artwork, setArtwork] = useState<string | null>(null);
  const [productList, setProductList] = useState('mug\nt-shirt\nhoodie\ntote bag\nphone case');
  const [scene, setScene] = useState('studio'); // studio, lifestyle, flat-lay, outdoor
  const [config, setConfig] = useState({
    scale: 60,
    position: 'center' // top, center, bottom
  });

  const [results, setResults] = useState<MockupResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  const scenes = [
    { id: 'studio', label: 'Pro Studio', icon: <Box className="w-3 h-3" /> },
    { id: 'lifestyle', label: 'Lifestyle (Café)', icon: <Smartphone className="w-3 h-3" /> },
    { id: 'flat-lay', label: 'Flat-Lay', icon: <Layout className="w-3 h-3" /> },
    { id: 'outdoor', label: 'Outdoor / Street', icon: <Package className="w-3 h-3" /> },
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setArtwork(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBatch = async () => {
    if (!artwork) return;
    const products = productList.split('\n').filter(p => p.trim());
    if (products.length === 0) return;

    setIsBatchRunning(true);
    const initialResults: MockupResult[] = products.map(p => ({
      product: p,
      url: null,
      loading: true,
      error: null
    }));
    setResults(initialResults);
    setSelectedResultIndex(null);

    for (let i = 0; i < products.length; i++) {
      try {
        const url = await generateMockup(apiKey, artwork, products[i], scene, config);
        if (url) {
          setResults(prev => prev.map((res, idx) => 
            idx === i ? { ...res, url, loading: false } : res
          ));
          onSaveToHistory({
            id: `merch-${Date.now()}-${i}`,
            originalData: artwork,
            generatedData: url,
            prompt: `Mockup: ${products[i]} in ${scene}`,
            timestamp: Date.now(),
            aspectRatio: '1:1'
          });
        }
      } catch (err: any) {
        setResults(prev => prev.map((res, idx) => 
          idx === i ? { ...res, loading: false, error: err.message || "Failed" } : res
        ));
      }
    }
    setIsBatchRunning(false);
    if (products.length > 0) setSelectedResultIndex(0);
  };

  const downloadAll = () => {
    results.forEach((res, i) => {
      if (res.url) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = `mockup-${res.product.replace(/\s+/g, '-')}.png`;
        a.click();
      }
    });
  };

  const activeResult = selectedResultIndex !== null ? results[selectedResultIndex] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-teal-400">
            <Package className="w-6 h-6" />
            <h2 className="text-2xl font-serif text-brand-100 font-bold">Merch Studio</h2>
          </div>
          <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">High-Fidelity Mockup Forge</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide pr-2">
          
          {/* 1. Artwork Upload */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">
              1. Upload Artwork
            </label>
            <div className={`aspect-square bg-luxury-950 rounded-xl border-2 border-dashed transition-all relative flex flex-col items-center justify-center overflow-hidden group ${artwork ? 'border-brand-500/50' : 'border-brand-900 hover:border-teal-500/50'}`}>
              {artwork ? (
                <>
                  <img src={artwork} className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => setArtwork(null)} className="p-2 bg-rose-600 rounded-full text-white shadow-lg"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-12 h-12 text-brand-900 mx-auto mb-3 group-hover:text-teal-500 transition-colors" />
                  <p className="text-brand-200 font-serif text-sm">Drop Graphic</p>
                  <p className="text-[10px] text-brand-400/60 mt-1">PNG with transparency best</p>
                </div>
              )}
              {!artwork && <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />}
            </div>
          </div>

          {/* 2. Product Options */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-3 block">
              2. Target Products
            </label>
            <textarea
              value={productList}
              onChange={(e) => setProductList(e.target.value)}
              className="w-full h-32 bg-luxury-950 border border-brand-900 rounded-xl p-3 text-xs text-brand-50 outline-none focus:border-teal-500 transition-all font-mono scrollbar-thin scrollbar-thumb-brand-900"
              placeholder="One product per line..."
            />
            <p className="text-[10px] text-brand-400/50 mt-2">Example: Ceramic Mug, Oversized Hoodie, iPhone 15 Case</p>
          </div>

          {/* 3. Scene Selector */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">
              3. Scene Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {scenes.map(s => (
                <button
                  key={s.id}
                  onClick={() => setScene(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${scene === s.id ? 'bg-teal-600 border-teal-500 text-white' : 'bg-luxury-900 border-brand-900/50 text-brand-300 hover:border-teal-500/50'}`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Controls */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 space-y-4">
            <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3 h-3" /> Realism Controls
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold text-brand-400">ARTWORK SCALE</span>
                  <span className="text-[10px] font-mono text-teal-500">{config.scale}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" 
                  value={config.scale}
                  onChange={(e) => setConfig({...config, scale: parseInt(e.target.value)})}
                  className="w-full h-1 bg-brand-900 rounded-full appearance-none accent-teal-500" 
                />
              </div>

              <div>
                <label className="text-[10px] text-brand-400 font-bold uppercase block mb-2">Vertical Placement</label>
                <div className="flex gap-2">
                  {['top', 'center', 'bottom'].map(p => (
                    <button
                      key={p}
                      onClick={() => setConfig({...config, position: p})}
                      className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border capitalize transition-all ${config.position === p ? 'bg-brand-600 border-brand-500 text-white' : 'bg-luxury-900 border-brand-900/50 text-brand-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={!artwork || isBatchRunning}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-brand-600 hover:to-teal-500 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-teal-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isBatchRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Batch...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Generate All Mockups
              </>
            )}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Main Display Area */}
          <div className="flex-1 bg-luxury-800 rounded-3xl border border-brand-900/30 p-6 shadow-2xl relative flex flex-col min-h-[500px]">
            {activeResult ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-900/30">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-brand-900/50 rounded-full text-[10px] font-bold text-teal-400 uppercase tracking-widest border border-teal-500/20">
                      {activeResult.product}
                    </span>
                    <span className="text-[10px] text-brand-400">• High Resolution 3000px Render</span>
                  </div>
                  {activeResult.url && (
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = activeResult.url!;
                        a.download = `mockup-${activeResult.product}.png`;
                        a.click();
                      }}
                      className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-luxury-950 rounded-2xl group">
                  {activeResult.loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                      <p className="text-brand-300 font-serif text-lg">Rendering {activeResult.product}...</p>
                    </div>
                  ) : activeResult.error ? (
                    <div className="text-center p-8">
                       <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                       <p className="text-brand-100">{activeResult.error}</p>
                    </div>
                  ) : (
                    <>
                      <img src={activeResult.url!} className="max-w-full max-h-full object-contain shadow-2xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-in zoom-in">
                            <CheckCircle2 className="w-4 h-4" /> Ready for Print
                         </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-brand-400/20">
                <Box className="w-24 h-24 mb-6 opacity-5" />
                <h3 className="text-3xl font-serif mb-2">Merch Forge</h3>
                <p className="max-w-md text-sm">Upload your artwork and define your product line. Gemini 2.5 Flash Image will handle the material physics and lighting.</p>
              </div>
            )}
          </div>

          {/* Result Thumbnails Strip */}
          {results.length > 0 && (
            <div className="bg-luxury-800 p-4 rounded-2xl border border-brand-900/30 flex justify-between items-center">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {results.map((res, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedResultIndex(i)}
                    className={`relative w-24 aspect-square flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedResultIndex === i ? 'border-teal-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {res.loading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-luxury-900">
                        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                      </div>
                    ) : res.url ? (
                      <img src={res.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-luxury-900">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white text-center py-1 truncate px-1 uppercase">
                      {res.product}
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={downloadAll}
                className="ml-4 flex flex-col items-center gap-1 text-brand-400 hover:text-teal-400 transition-colors"
                title="Download All as ZIP (simulated)"
              >
                <div className="p-3 bg-luxury-900 rounded-full border border-brand-900">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase">Export All</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};