import React from 'react';
import { Camera, Home, Sparkles, Shirt, ShoppingBag, History } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onChangeView }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-900/50 bg-luxury-900/80 backdrop-blur supports-[backdrop-filter]:bg-luxury-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChangeView(ViewMode.HOME)}>
          <Sparkles className="h-5 w-5 text-brand-500" />
          <span className="text-xl font-serif font-bold tracking-wide text-brand-50">Welcome to Creator Vault Studio</span>
        </div>
        
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onChangeView(ViewMode.HOME)}
            className={`p-2 rounded-full transition-colors ${
              currentView === ViewMode.HOME 
                ? 'text-brand-400 bg-brand-900/20' 
                : 'text-brand-200/60 hover:text-brand-200'
            }`}
            title="Home"
          >
            <Home className="h-5 w-5" />
          </button>
          
          <div className="h-4 w-px bg-brand-900/50 mx-2" />

          <button
            onClick={() => onChangeView(ViewMode.TWINLY_UPLOAD)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              [ViewMode.TWINLY_UPLOAD, ViewMode.TWINLY_EDITOR].includes(currentView)
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                : 'text-brand-200/70 hover:text-brand-100 hover:bg-brand-900/20'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span className="hidden lg:inline">Editor</span>
          </button>

          <button
            onClick={() => onChangeView(ViewMode.GALLERY)}
            className={`p-2 rounded-full transition-colors ${
              currentView === ViewMode.GALLERY
                ? 'text-brand-400 bg-brand-900/20' 
                : 'text-brand-200/60 hover:text-brand-200'
            }`}
            title="Gallery"
          >
            <History className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
};