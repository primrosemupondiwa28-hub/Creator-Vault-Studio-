
import React, { useState, useEffect } from 'react';
// Fix: Import Image as ImageIcon
import { ArrowLeft, Palette, Upload, Sparkles, Wand2, Download, Trash2, Check, LayoutGrid, Layers, Settings2, Info, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateIllustrationVariation, IllustrationConfig } from '../services/geminiService';

interface DynamicIllustrationProps {
  apiKey: string;
  onBack: () => void;
}

interface IllustrationResult {
  prompt: string;
  url: string | null;
  loading: boolean;
  error: string | null;
}

export const DynamicIllustration: React.FC<DynamicIllustrationProps> = ({ apiKey, onBack }) => {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [variationInput, setVariationInput] = useState('happy grin\nenraged face\ncrying tears of joy\nreading a book\nparty hat + confetti');
  const [config, setConfig] = useState<IllustrationConfig>({
    primaryColor: '#c9a77c',
    secondaryColor: '#3d2e1e',
    strictPalette: false,
    styleLock: true,
    intensity: 75,
    propSize: 50
  });

  const [results, setResults] = useState<IllustrationResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'png' | 'spritesheet' | 'gif'>('png');

  const presets = [
    "happy", "shocked", "crying-laugh", "wink", "reading book", "laptop", "coffee", "thumbs-up", "superhero pose", "party hat"
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => ev.target?.result && setBaseImage(ev.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addPreset = (preset: string) => {
    setVariationInput(prev => prev.trim() ? `${prev}\n${preset}` : preset);
  };

  const handleGenerateBatch = async () => {
    if (!baseImage) return;
    const variations = variationInput.split('\n').filter(line => line.trim());
    if (variations.length === 0) return;

    setIsBatchRunning(true);
    const initialResults: IllustrationResult[] = variations.map(v => ({
      prompt: v,
      url: null,
      loading: true,
      error: null
    }));
    setResults(initialResults);

    // Process in sequential chunks to avoid overwhelming API or hitting rate limits
    for (let i = 0; i < variations.length; i++) {
      try {
        const url = await generateIllustrationVariation(apiKey, baseImage, variations[i], config);
        setResults(prev => prev.map((res, idx) => 
          idx === i ? { ...res, url, loading: false } : res
        ));
      } catch (err: any) {
        setResults(prev => prev.map((res, idx) => 
          idx === i ? { ...res, loading: false, error: err.message || "Failed" } : res
        ));
      }
    }
    setIsBatchRunning(false);
  };

  const downloadAll = () => {
    results.forEach((res, i) => {
      if (res.url) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = `illustration-${i}-${res.prompt.replace(/\s+/g, '-')}.png`;
        a.click();
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-amber-400">
            <Palette className="w-6 h-6" />
            <h2 className="text-2xl font-serif text-brand-100 font-bold">Illustration Forge</h2>
          </div>
          <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">Mascot & Avatar Generator</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide pr-2">
          
          {/* Base Upload */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-brand-500 uppercase tracking-wider block">
                1. Base Avatar / Mascot
              </label>
              <div className="flex items-center gap-1 text-[8px] text-amber-500 font-bold px-2 py-0.5 bg-amber-500/10 rounded">
                ILLUSTRATION ONLY
              </div>
            </div>
            
            <div className={`aspect-square bg-luxury-950 rounded-xl border-2 border-dashed transition-all relative flex flex-col items-center justify-center overflow-hidden group ${baseImage ? 'border-brand-500/50' : 'border-brand-900 hover:border-amber-500/50'}`}>
              {baseImage ? (
                <>
                  <img src={baseImage} className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button onClick={() => setBaseImage(null)} className="p-2 bg-rose-600 rounded-full text-white shadow-lg"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <Upload className="w-12 h-12 text-brand-900 mx-auto mb-3 group-hover:text-amber-500 transition-colors" />
                  <p className="text-brand-200 font-serif text-sm">Upload Base Art</p>
                  <p className="text-[10px] text-brand-400/60 mt-1">PNG with transparency preferred</p>
                </div>
              )}
              {!baseImage && <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />}
            </div>
            {!baseImage && (
               <div className="mt-3 flex items-start gap-2 text-[10px] text-brand-400/70 italic">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Reject real-person photos; use an illustrated character or mascot for consistent results.</span>
               </div>
            )}
          </div>

          {/* Variations Input */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">
              2. Variation List
            </label>
            <textarea
              value={variationInput}
              onChange={(e) => setVariationInput(e.target.value)}
              className="w-full h-32 bg-luxury-950 border border-brand-900 rounded-xl p-3 text-xs text-brand-50 outline-none focus:border-amber-500 transition-all font-mono scrollbar-thin scrollbar-thumb-brand-900"
              placeholder="One prompt per line..."
            />
            <div className="mt-4">
              <p className="text-[10px] font-bold text-brand-500 uppercase mb-2">Sample Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button 
                    key={p}
                    onClick={() => addPreset(p)}
                    className="px-2 py-1 bg-luxury-900 hover:bg-brand-900/50 text-[10px] text-brand-300 rounded border border-brand-900/50 transition-colors"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Brand Controls */}
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 space-y-4">
            <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> Brand Controls
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-brand-400 mb-1 block">Primary Hex</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={config.primaryColor}
                    onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                    className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={config.primaryColor}
                    onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                    className="flex-1 bg-luxury-950 border border-brand-900 rounded px-2 py-1.5 text-[10px] text-brand-100 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-brand-400 mb-1 block">Secondary Hex</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                    className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={config.secondaryColor}
                    onChange={(e) => setConfig({...config, secondaryColor: e.target.value})}
                    className="flex-1 bg-luxury-950 border border-brand-900 rounded px-2 py-1.5 text-[10px] text-brand-100 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-luxury-900 border border-brand-900/30">
              <span className="text-[10px] font-bold text-brand-200">Strict Palette</span>
              <button 
                onClick={() => setConfig({...config, strictPalette: !config.strictPalette})}
                className={`w-8 h-4 rounded-full relative transition-colors ${config.strictPalette ? 'bg-amber-600' : 'bg-brand-900/50'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.strictPalette ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Consistency Sliders */}
            <div className="space-y-4 pt-2">
               <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-brand-400">EXPRESSION INTENSITY</span>
                    <span className="text-[10px] font-mono text-amber-500">{config.intensity}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={config.intensity}
                    onChange={(e) => setConfig({...config, intensity: parseInt(e.target.value)})}
                    className="w-full h-1 bg-brand-900 rounded-full appearance-none accent-amber-500" 
                  />
               </div>
               <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-brand-400">PROP SCALE</span>
                    <span className="text-[10px] font-mono text-amber-500">{config.propSize}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={config.propSize}
                    onChange={(e) => setConfig({...config, propSize: parseInt(e.target.value)})}
                    className="w-full h-1 bg-brand-900 rounded-full appearance-none accent-amber-500" 
                  />
               </div>
               <div className="flex items-center justify-between p-2 rounded bg-luxury-900 border border-brand-900/30">
                <span className="text-[10px] font-bold text-brand-200">Style Lock (Consistency)</span>
                <button 
                  onClick={() => setConfig({...config, styleLock: !config.styleLock})}
                  className={`w-8 h-4 rounded-full relative transition-colors ${config.styleLock ? 'bg-amber-600' : 'bg-brand-900/50'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.styleLock ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateBatch}
            disabled={!baseImage || isBatchRunning}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-brand-600 hover:to-amber-500 text-white font-serif font-bold tracking-wide rounded-xl shadow-xl shadow-amber-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isBatchRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Forging Variations...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Batch
              </>
            )}
          </button>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Tabs Bar */}
          <div className="w-full bg-luxury-800 p-1.5 rounded-xl border border-brand-900/30 flex shadow-inner">
            <button 
              onClick={() => setActiveTab('png')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'png' ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}
            >
              <ImageIcon className="w-3 h-3" /> PNG Files
            </button>
            <button 
              onClick={() => setActiveTab('spritesheet')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'spritesheet' ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}
            >
              <LayoutGrid className="w-3 h-3" /> Sprite Sheet
            </button>
            <button 
              onClick={() => setActiveTab('gif')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'gif' ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}
            >
              <Layers className="w-3 h-3" /> Loop GIF
            </button>
          </div>

          {/* Visualization Area */}
          <div className="flex-1 bg-luxury-800 rounded-3xl border border-brand-900/30 p-6 shadow-2xl overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-brand-900">
            {results.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-brand-900/30">
                  <h3 className="text-lg font-serif text-brand-100">Variation Gallery</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={downloadAll}
                      className="px-4 py-2 bg-luxury-900 border border-brand-900 text-brand-300 rounded-lg text-xs font-bold hover:bg-brand-900/50 transition-all flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" /> Download All (.ZIP)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {results.map((res, i) => (
                    <div key={i} className="group relative aspect-square bg-luxury-950 rounded-2xl border border-brand-900/30 overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
                      {res.loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                           <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                           <p className="text-[10px] text-brand-400 font-mono animate-pulse">Rendering {i+1}...</p>
                        </div>
                      ) : res.error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-2">
                           <AlertCircle className="w-6 h-6 text-rose-500" />
                           <p className="text-[10px] text-rose-400">{res.error}</p>
                        </div>
                      ) : (
                        <>
                          <img src={res.url!} className="w-full h-full object-contain p-2" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur rounded text-[8px] font-bold text-amber-500 uppercase tracking-widest border border-amber-500/20">
                            {res.prompt}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = res.url!;
                                a.download = `variation-${res.prompt}.png`;
                                a.click();
                              }}
                              className="p-2 bg-white text-black rounded-full hover:bg-amber-400 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-brand-400/20">
                <Sparkles className="w-24 h-24 mb-6 opacity-5" />
                <h3 className="text-3xl font-serif mb-2">Illustration Forge</h3>
                <p className="max-w-md text-sm">Upload your character and define your variations. Perfect for UI states, game sprites, and brand mascots.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
