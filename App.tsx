import React, { useState, useEffect } from 'react';
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
import { ApiKeyModal } from './components/ApiKeyModal';
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
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [pendingView, setPendingView] = useState<ViewMode | null>(null);

  useEffect(() => {
    // Check local storage for existing key on mount
    const storedKey = localStorage.getItem('creator_vault_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Gatekeeping function: Checks for API Key before allowing navigation to functional studios
  const handleNavigate = (targetView: ViewMode) => {
    // Always allow navigation to Home
    if (targetView === ViewMode.HOME) {
      setView(ViewMode.HOME);
      return;
    }

    // For all other views, require API key
    if (apiKey) {
      setView(targetView);
    } else {
      setPendingView(targetView);
      setShowKeyModal(true);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('creator_vault_api_key', key);
    setShowKeyModal(false);
    
    // Redirect to the view they were trying to access
    if (pendingView) {
      setView(pendingView);
      setPendingView(null);
    }
  };

  const handleCloseModal = () => {
    setShowKeyModal(false);
    setPendingView(null);
  };

  const handleTwinlyUpload = (base64: string, mimeType: string) => {
    setState(prev => ({ ...prev, currentImage: base64, mimeType }));
    // No need to check key here as they are already inside the "room" (Twinly Upload)
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
      {showKeyModal && (
        <ApiKeyModal 
          onSave={handleSaveApiKey} 
          onClose={handleCloseModal} 
        />
      )}
      
      <Header currentView={view} onChangeView={handleNavigate} />
      
      <main className="flex-1 relative">
        {view === ViewMode.HOME && <Home onNavigate={handleNavigate} />}

        {view === ViewMode.TWINLY_UPLOAD && (
          <div className="container mx-auto py-8">
             <ImageUpload onImageSelected={handleTwinlyUpload} />
          </div>
        )}

        {view === ViewMode.TWINLY_EDITOR && state.currentImage && (
          <TwinlyEditor 
            apiKey={apiKey}
            originalImage={state.currentImage}
            mimeType={state.mimeType}
            onBack={() => setView(ViewMode.HOME)} 
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.CREATOR_STUDIO && (
          <CreatorStudio 
            apiKey={apiKey}
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.UGC_STUDIO && (
          <UGCStudio 
            apiKey={apiKey}
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.VIRTUAL_TRYON && (
          <VirtualTryOn 
            apiKey={apiKey}
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.MERCH_STUDIO && (
          <MerchStudio 
            apiKey={apiKey}
            onBack={() => setView(ViewMode.HOME)}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {view === ViewMode.CAPTION_GENERATOR && (
          <CaptionGenerator 
            apiKey={apiKey}
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