
import React, { useState, useEffect } from 'react';
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

  const presets = ["happy", "shocked", "wink", "reading", "laptop", "party hat"];

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
    setResults(variations.map(v => ({ prompt: v, url: null, loading: true, error: null })));

    for (let i = 0; i < variations.length; i++) {
      try {
        const url = await generateIllustrationVariation(apiKey, baseImage, variations[i], config);
        setResults(prev => prev.map((res, idx) => idx === i ? { ...res, url, loading: false } : res));
      } catch (err: any) {
        setResults(prev => prev.map((res, idx) => idx === i ? { ...res, loading: false, error: err.message || "Failed" } : res));
      }
    }
    setIsBatchRunning(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors font-bold"><ArrowLeft className="w-4 h-4" /> Home</button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-amber-400"><Palette className="w-6 h-6" /><h2 className="text-2xl font-serif text-brand-100 font-bold">Illustration Forge</h2></div>
          <p className="text-[10px] text-brand-400 uppercase tracking-widest font-bold mt-1">Mascot & Avatar Generator</p>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">1. Base Art</label>
            <div className={`aspect-square bg-luxury-950 rounded-xl border-2 border-dashed relative flex flex-col items-center justify-center overflow-hidden group ${baseImage ? 'border-brand-500' : 'border-brand-900'}`}>
              {baseImage ? <img src={baseImage} className="w-full h-full object-contain p-4" /> : <div className="text-center"><Upload className="w-10 h-10 text-brand-900 mx-auto mb-2"/><p className="text-brand-200 text-xs">Drop Artwork</p></div>}
              <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30">
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-4 block">2. Variations</label>
            <textarea
              value={variationInput}
              onChange={(e) => setVariationInput(e.target.value)}
              className="w-full h-40 bg-brand-50 border border-brand-500 rounded-xl p-4 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner font-mono"
              placeholder="One emotion/pose per line..."
            />
            <div className="flex flex-wrap gap-1.5 mt-3">{presets.map(p => <button key={p} onClick={() => addPreset(p)} className="text-[9px] font-bold text-brand-300 bg-luxury-900 px-2 py-1 rounded border border-brand-900/50">+ {p}</button>)}</div>
          </div>

          <button onClick={handleGenerateBatch} disabled={!baseImage || isBatchRunning} className="w-full py-4 bg-gradient-to-r from-amber-600 to-brand-600 text-white font-bold rounded-xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {isBatchRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Generate All
          </button>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex-1 bg-luxury-800 rounded-3xl border border-brand-900/30 p-6 shadow-2xl min-h-[500px]">
            {results.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {results.map((res, i) => (
                    <div key={i} className="aspect-square bg-luxury-950 rounded-2xl border border-brand-900/30 overflow-hidden relative">
                       {res.loading ? <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div> : <img src={res.url!} className="w-full h-full object-contain p-2" />}
                       <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] font-bold text-amber-500 uppercase">{res.prompt}</div>
                    </div>
                 ))}
               </div>
            ) : <div className="h-full flex items-center justify-center text-brand-400/20 text-3xl font-serif">Mascot Preview Area</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
