
import React, { useState } from 'react';
import { Key, Lock, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (inputKey.trim().length < 10) {
      setError('Please enter a valid API Key.');
      return;
    }
    onSave(inputKey.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-luxury-900 border border-brand-900/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-400/50 hover:text-brand-200 transition-colors p-2 hover:bg-brand-900/20 rounded-full">
          <X className="w-5 h-5" />
        </button>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-brand-900/20 rounded-full flex items-center justify-center mb-4 border border-brand-500/20">
            <Key className="w-8 h-8 text-brand-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-brand-50 mb-2">Unlock the Studio</h2>
          <p className="text-brand-300/60 text-sm">To generate images and enter this room, please provide your Google Gemini API Key.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2 block">Enter API Key</label>
            <div className="relative">
              <input 
                type="password"
                value={inputKey}
                onChange={(e) => { setInputKey(e.target.value); setError(''); }}
                placeholder="Paste AIzaSy... key here"
                className="w-full bg-brand-50 border border-brand-500 rounded-xl px-4 py-4 pl-12 text-sm text-black font-bold outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-500 shadow-inner"
              />
              <Lock className="w-4 h-4 text-brand-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {error}</p>}
          </div>

          <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:to-brand-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            Enter Studio
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-brand-900/30 text-center">
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-200 transition-colors border-b border-brand-500/30 pb-0.5 hover:border-brand-200">
            Get a free API Key from Google <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
