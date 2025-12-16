import React, { useState } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { ImageUpload } from './components/ImageUpload';
import { TwinlyEditor } from './components/TwinlyEditor';
import { CreatorStudio } from './components/CreatorStudio';
import { UGCStudio } from './components/UGCStudio';
import { VirtualTryOn } from './components/VirtualTryOn';
import { MerchStudio } from './components/MerchStudio';
import { ExplorePrompts } from './components/ExplorePrompts';
import { CaptionGenerator } from './components/CaptionGenerator';
import { Gallery } from './components/Gallery';
import { AppState, ViewMode, GeneratedImage } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentImage: null,
    secondaryImage: null,
    mimeType: '',
    isGenerating: false,
    error: null,
    history: []
  });
  
  const [view, setView] = useState<ViewMode>(ViewMode.HOME);

  const handleTwinlyUpload = (base64: string, mimeType: string) => {
    setState(prev => ({ ...prev, currentImage: base64, mimeType }));
    setView(ViewMode.TWINLY_EDITOR);
  };

  const handleSaveToHistory = (img: GeneratedImage) => {
    setState(prev => ({
      ...prev,
      history: [img, ...prev.history]
    }));
  };

  return (
    <div className="min-h-screen bg-luxury-900 text-brand-50 font-sans selection:bg-brand-500/30">
      <Header currentView={view} onChangeView={setView} />
      
      <main className="flex-1 relative">
        {view === ViewMode.HOME && <Home onNavigate={setView} />}

        {view === ViewMode.TWINLY_UPLOAD && (
          <div className="container mx-auto py-8">
             <ImageUpload onImageSelected={handleTwinlyUpload} />
          </div>
        )}

        {view === ViewMode.TWINLY_EDITOR && state.currentImage && (
          <TwinlyEditor 
            originalImage={state.currentImage}
            mimeType={state.mimeType}
            onBack={() => setView(ViewMode.HOME)} 
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.CREATOR_STUDIO && (
          <CreatorStudio 
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.UGC_STUDIO && (
          <UGCStudio 
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.VIRTUAL_TRYON && (
          <VirtualTryOn 
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.MERCH_STUDIO && (
          <MerchStudio 
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.CAPTION_GENERATOR && (
          <CaptionGenerator 
            onBack={() => setView(ViewMode.HOME)}
          />
        )}

        {view === ViewMode.EXPLORE_PROMPTS && (
          <ExplorePrompts onBack={() => setView(ViewMode.HOME)} />
        )}

        {view === ViewMode.GALLERY && (
          <Gallery history={state.history} onSelect={() => {}} />
        )}
      </main>
    </div>
  );
};

export default App;