import React from 'react';
import { GeneratedImage } from '../types';
import { Download, Clock } from 'lucide-react';

interface GalleryProps {
  history: GeneratedImage[];
  onSelect: (img: GeneratedImage) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-slate-500">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg">No edit history yet.</p>
        <p className="text-sm opacity-60">Your generated images will appear here.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Edit History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 group hover:border-brand-500/50 transition-all">
            <div className="relative aspect-video bg-slate-950">
              <img 
                src={item.generatedData} 
                alt={item.prompt} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => onSelect(item)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 right-3">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = item.generatedData;
                        link.download = `famstyle-${item.id}.png`;
                        link.click();
                    }}
                    className="p-2 bg-slate-800/80 hover:bg-brand-600 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-slate-300 text-sm line-clamp-2 mb-2" title={item.prompt}>
                "{item.prompt}"
              </p>
              <p className="text-xs text-slate-500">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
