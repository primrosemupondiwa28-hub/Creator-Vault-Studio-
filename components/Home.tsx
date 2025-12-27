
import React from 'react';
import { Camera, ShoppingBag, Shirt, Smartphone, ArrowRight, Sparkles, Layers, Clapperboard, Palette, Globe } from 'lucide-react';
import { ViewMode } from '../types';

interface HomeProps {
  onNavigate: (view: ViewMode) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const studios = [
    {
      id: 'twinly',
      title: 'Twinly Editor',
      subtitle: 'Identity Studio',
      description: 'The flagship engine. Change scenery, outfits, and styling while strictly preserving facial identity.',
      icon: <Camera className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.TWINLY_UPLOAD),
      color: 'text-brand-200',
      bgHover: 'group-hover:bg-brand-900/40',
      borderHover: 'group-hover:border-brand-500/50'
    },
    {
      id: 'posterdrop',
      title: 'PosterDrop',
      subtitle: 'Global Signage',
      description: 'Visualize your marketing posters in world-famous locations. NYC billboards to Tokyo metro lightboxes.',
      icon: <Globe className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.POSTER_DROP),
      color: 'text-blue-300',
      bgHover: 'group-hover:bg-blue-900/40',
      borderHover: 'group-hover:border-blue-500/50'
    },
    {
      id: 'illustration',
      title: 'Illustration Forge',
      subtitle: 'Mascot Variation',
      description: 'Generate consistent variations for avatars and mascots. Emotions, poses, and props with brand lock.',
      icon: <Palette className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.DYNAMIC_ILLUSTRATION),
      color: 'text-amber-300',
      bgHover: 'group-hover:bg-amber-900/40',
      borderHover: 'group-hover:border-amber-500/50'
    },
    {
      id: 'bts',
      title: 'Viral BTS Generator',
      subtitle: 'Candid Production',
      description: 'Step onto the set of your favorite show. Real-time search grounding for trending environments.',
      icon: <Clapperboard className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.BTS_STUDIO),
      color: 'text-rose-200',
      bgHover: 'group-hover:bg-rose-900/40',
      borderHover: 'group-hover:border-rose-500/50'
    },
    {
      id: 'ugc',
      title: 'UGC Viral Studio',
      subtitle: 'Social Content',
      description: 'Generate authentic POV and lifestyle shots with cinematic video expansion options.',
      icon: <Smartphone className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.UGC_STUDIO),
      color: 'text-emerald-200',
      bgHover: 'group-hover:bg-emerald-900/40',
      borderHover: 'group-hover:border-emerald-500/50'
    },
    {
      id: 'creator',
      title: 'Creator Studio',
      subtitle: 'Campaign Builder',
      description: 'Professional marketing generation. Seamlessly blend models with products for commercial assets.',
      icon: <ShoppingBag className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.CREATOR_STUDIO),
      color: 'text-purple-200',
      bgHover: 'group-hover:bg-purple-900/40',
      borderHover: 'group-hover:border-purple-500/50'
    },
    {
      id: 'tryon',
      title: 'Virtual Wardrobe',
      subtitle: 'Try-On Mirror',
      description: 'See yourself in any outfit instantly. Identity and skin tones strictly protected.',
      icon: <Shirt className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.VIRTUAL_TRYON),
      color: 'text-pink-200',
      bgHover: 'group-hover:bg-pink-900/40',
      borderHover: 'group-hover:border-pink-500/50'
    },
    {
      id: 'merch',
      title: 'Merch Studio',
      subtitle: 'Mockup Forge',
      description: 'Professional product visualization on apparel, packaging, and devices instantly.',
      icon: <Layers className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.MERCH_STUDIO),
      color: 'text-teal-200',
      bgHover: 'group-hover:bg-teal-900/40',
      borderHover: 'group-hover:border-teal-500/50'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-luxury-950">
      <div className="relative pt-20 pb-24 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-luxury-900 to-luxury-950 border-b border-brand-900/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 px-4 py-1.5 bg-brand-900/50 border border-brand-500/20 rounded-full backdrop-blur-sm shadow-xl">
             <Sparkles className="w-3.5 h-3.5 text-brand-400" />
             <span className="text-xs font-bold text-brand-200 tracking-widest uppercase">Premium Creator Suite V2.5</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-50 mb-6 tracking-tight">
            Creator Vault Studio
          </h1>
          <p className="text-brand-100/70 text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-4">
            The All-In-One AI Engine Powering Content, Campaigns & Commerce.
          </p>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 -mt-12 pb-24 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <div 
              key={studio.id}
              onClick={studio.action}
              className={`group relative flex flex-col bg-luxury-800 border border-brand-900/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:shadow-2xl ${studio.borderHover} ${studio.bgHover}`}
            >
              <div className="flex items-start justify-between mb-4">
                 <div className={`p-3 rounded-xl bg-luxury-900/80 border border-brand-900/20 ${studio.color} group-hover:scale-110 transition-transform duration-300`}>
                    {studio.icon}
                 </div>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                    <ArrowRight className={`w-5 h-5 ${studio.color}`} />
                 </div>
              </div>
              <div>
                 <p className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-60 ${studio.color}`}>{studio.subtitle}</p>
                 <h3 className="text-xl font-serif font-bold text-brand-50 mb-3">{studio.title}</h3>
                 <p className="text-sm text-brand-200/60 leading-relaxed">
                   {studio.description}
                 </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
