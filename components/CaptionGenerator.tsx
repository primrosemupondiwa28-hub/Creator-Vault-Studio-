import React, { useState } from 'react';
import { ArrowLeft, Upload, Check, Copy, Instagram, Facebook, Twitter, Music2, Sparkles, MessageSquareText, Layers, Hash, Smile, Settings2 } from 'lucide-react';
import { generateSocialCaptions, SocialCaptions, SocialPlatform, CaptionOptions } from '../services/geminiService';

interface CaptionGeneratorProps {
  apiKey: string;
  onBack: () => void;
}

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({ apiKey, onBack }) => {
  const [image, setImage] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [captions, setCaptions] = useState<SocialCaptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Settings State
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['instagram', 'tiktok', 'facebook', 'twitter']);
  const [tone, setTone] = useState('Casual');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);

  const toneOptions = [
    "Casual", "Professional", "Funny", "Luxury/Elegant", "Enthusiastic", "Sales/Promotional"
  ];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result && typeof ev.target.result === 'string') {
          setImage(ev.target.result);
          setCaptions(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleGenerate = async () => {
    if (!image) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one social media platform.");
      return;
    }
    
    setIsGenerating(true);
    setCaptions(null); // Clear previous results

    try {
      const options: CaptionOptions = {
        tone,
        includeHashtags,
        includeEmojis
      };
      const result = await generateSocialCaptions(apiKey, image, selectedPlatforms, context, options);
      setCaptions(result);
    } catch (e) {
      console.error(e);
      alert("Failed to generate captions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string | undefined, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <div className="flex items-center gap-2">
           <MessageSquareText className="w-6 h-6 text-brand-500" />
           <h2 className="text-2xl font-serif text-brand-100">Social Caption AI</h2>
        </div>
        <div className="w-20" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Upload & Input */}
        <div className="flex flex-col gap-6">
          <div className="bg-luxury-800 rounded-2xl p-6 border border-brand-900/30">
             <div className="aspect-square bg-luxury-900 rounded-xl border-2 border-dashed border-brand-900 hover:border-brand-500/50 transition-colors relative flex flex-col items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} alt="Upload" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-brand-400/50">
                    <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-serif">Upload Content</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
          </div>

          <div className="bg-luxury-800 rounded-2xl p-6 border border-brand-900/30 flex flex-col gap-4">
            
            {/* Platform Selection */}
            <div>
              <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                <Layers className="w-3 h-3" /> Select Platforms
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => togglePlatform('instagram')}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${selectedPlatforms.includes('instagram') ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]' : 'bg-luxury-900 border-brand-900/50 text-brand-600 opacity-60 hover:opacity-100 hover:border-brand-700'}`}
                >
                  <Instagram className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Instagram</span>
                </button>
                
                <button 
                  onClick={() => togglePlatform('tiktok')}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${selectedPlatforms.includes('tiktok') ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-luxury-900 border-brand-900/50 text-brand-600 opacity-60 hover:opacity-100 hover:border-brand-700'}`}
                >
                  <Music2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium">TikTok</span>
                </button>

                <button 
                  onClick={() => togglePlatform('facebook')}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${selectedPlatforms.includes('facebook') ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-luxury-900 border-brand-900/50 text-brand-600 opacity-60 hover:opacity-100 hover:border-brand-700'}`}
                >
                  <Facebook className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Facebook</span>
                </button>

                <button 
                  onClick={() => togglePlatform('twitter')}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${selectedPlatforms.includes('twitter') ? 'bg-slate-600/20 border-slate-400 text-slate-300 shadow-[0_0_10px_rgba(148,163,184,0.2)]' : 'bg-luxury-900 border-brand-900/50 text-brand-600 opacity-60 hover:opacity-100 hover:border-brand-700'}`}
                >
                  <Twitter className="w-5 h-5" />
                  <span className="text-[10px] font-medium">X (Twitter)</span>
                </button>
              </div>
            </div>

            {/* NEW: Settings & Controls */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                     <Settings2 className="w-3 h-3" /> Writing Tone
                  </label>
                  <div className="relative">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-sm text-brand-100 outline-none focus:border-brand-500 appearance-none"
                    >
                      {toneOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1 block">Extras</label>
                  
                  {/* Hashtag Toggle */}
                  <div 
                    onClick={() => setIncludeHashtags(!includeHashtags)}
                    className="flex items-center justify-between p-2 rounded-lg border border-brand-900/30 bg-luxury-900 cursor-pointer hover:border-brand-500/30 transition-all"
                  >
                     <div className="flex items-center gap-2 text-brand-200">
                        <Hash className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-medium">Add Hashtags</span>
                     </div>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${includeHashtags ? 'bg-brand-500' : 'bg-brand-900/50'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${includeHashtags ? 'left-4.5' : 'left-0.5'}`} />
                     </div>
                  </div>

                  {/* Emoji Toggle */}
                  <div 
                    onClick={() => setIncludeEmojis(!includeEmojis)}
                    className="flex items-center justify-between p-2 rounded-lg border border-brand-900/30 bg-luxury-900 cursor-pointer hover:border-brand-500/30 transition-all"
                  >
                     <div className="flex items-center gap-2 text-brand-200">
                        <Smile className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-medium">Add Emojis</span>
                     </div>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${includeEmojis ? 'bg-brand-500' : 'bg-brand-900/50'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${includeEmojis ? 'left-4.5' : 'left-0.5'}`} />
                     </div>
                  </div>
               </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block">Vibe / Context (Optional)</label>
              <textarea 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. 'Funny photo of my dog', 'Sales announcement for skincare', 'Travel photo in Bali'. Leave empty for AI interpretation."
                className="w-full h-24 bg-luxury-900 border border-brand-900/50 rounded-xl p-3 text-brand-50 placeholder-brand-700 focus:border-brand-500 outline-none resize-none"
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!image || isGenerating || selectedPlatforms.length === 0}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:to-brand-400 text-white font-medium rounded-xl shadow-lg shadow-brand-900/30 disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Writing Copy...' : 'Generate Captions'}
              {!isGenerating && <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="flex flex-col gap-4">
          {!captions && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-brand-400/30 border border-brand-900/30 rounded-3xl bg-luxury-800/50 min-h-[400px]">
               <MessageSquareText className="w-16 h-16 mb-4 opacity-30" />
               <p className="font-serif text-lg">Your captions will appear here</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-brand-500 border border-brand-900/30 rounded-3xl bg-luxury-800/50 min-h-[400px]">
               <Sparkles className="w-12 h-12 mb-4 animate-spin" />
               <p className="font-serif text-lg text-brand-200">Analyzing Image & Trends...</p>
               <p className="text-xs text-brand-400/60 mt-2">Writing {tone.toLowerCase()} captions...</p>
            </div>
          )}

          {captions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              {captions.instagram && (
                <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 hover:border-pink-500/30 transition-colors group">
                  <div className="flex items-center justify-between mb-3 text-pink-500">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-5 h-5" />
                      <span className="font-bold text-sm">Instagram</span>
                    </div>
                    <button onClick={() => copyToClipboard(captions.instagram, 'insta')} className="hover:text-pink-300">
                      {copiedKey === 'insta' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-brand-100 whitespace-pre-line leading-relaxed font-light">{captions.instagram}</p>
                </div>
              )}

              {/* TikTok */}
              {captions.tiktok && (
                <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 hover:border-cyan-500/30 transition-colors group">
                  <div className="flex items-center justify-between mb-3 text-cyan-400">
                    <div className="flex items-center gap-2">
                      <Music2 className="w-5 h-5" />
                      <span className="font-bold text-sm">TikTok</span>
                    </div>
                    <button onClick={() => copyToClipboard(captions.tiktok, 'tiktok')} className="hover:text-cyan-200">
                      {copiedKey === 'tiktok' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-brand-100 whitespace-pre-line leading-relaxed font-light">{captions.tiktok}</p>
                </div>
              )}

              {/* Facebook */}
              {captions.facebook && (
                <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 hover:border-blue-500/30 transition-colors group">
                  <div className="flex items-center justify-between mb-3 text-blue-500">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-5 h-5" />
                      <span className="font-bold text-sm">Facebook</span>
                    </div>
                    <button onClick={() => copyToClipboard(captions.facebook, 'fb')} className="hover:text-blue-300">
                      {copiedKey === 'fb' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-brand-100 whitespace-pre-line leading-relaxed font-light">{captions.facebook}</p>
                </div>
              )}

              {/* X / Twitter */}
              {captions.twitter && (
                <div className="bg-luxury-800 p-5 rounded-2xl border border-brand-900/30 hover:border-slate-400/30 transition-colors group">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-5 h-5" />
                      <span className="font-bold text-sm">X (Twitter)</span>
                    </div>
                    <button onClick={() => copyToClipboard(captions.twitter, 'x')} className="hover:text-white">
                      {copiedKey === 'x' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-brand-100 whitespace-pre-line leading-relaxed font-light">{captions.twitter}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};