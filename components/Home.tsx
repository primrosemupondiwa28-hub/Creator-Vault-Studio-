import React from 'react';
import { Camera, ShoppingBag, Shirt, Lightbulb, Smartphone, Star, Quote, MessageSquareText, ArrowRight, Sparkles, Layers, Clapperboard, Palette, Globe } from 'lucide-react';
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
      description: 'Step onto the set of your favorite show or movie. Generate viral behind-the-scenes content instantly.',
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
      description: 'Generate authentic POV, unboxing, and lifestyle shots optimized for high engagement.',
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
      description: 'See yourself in any outfit instantly. Upload clothes and visualize the fit with precision.',
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
      description: 'Professional product visualization. Place designs on apparel, packaging, and devices instantly.',
      icon: <Layers className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.MERCH_STUDIO),
      color: 'text-teal-200',
      bgHover: 'group-hover:bg-teal-900/40',
      borderHover: 'group-hover:border-teal-500/50'
    },
    {
      id: 'captions',
      title: 'Caption AI',
      subtitle: 'Copywriting',
      description: 'Instant viral captions for Instagram, TikTok, and X based on deep image analysis.',
      icon: <MessageSquareText className="w-6 h-6" />,
      action: () => onNavigate(ViewMode.CAPTION_GENERATOR),
      color: 'text-blue-200',
      bgHover: 'group-hover:bg-blue-900/40',
      borderHover: 'group-hover:border-blue-500/50'
    }
  ];

  const reviews = [
    {
      name: "Amara Okeke",
      handle: "@amara.luxe",
      image: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=200&h=200", 
      text: "Finally an AI that respects my skin tone! The TrueTone™ technology is legit. I used the Creator Studio for my jewelry line and the results looked like a $5k photoshoot. No weird smoothing, just melanin popping.",
      role: "Fashion Creator"
    },
    {
      name: "Sarah Jenkins",
      handle: "@sarah.styles",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200", 
      text: "The Virtual Try-On saved my haul video. I uploaded flat lays of the dresses and saw exactly how they'd fit. The 'Baddie' aesthetic prompt is my go-to for IG filler pics.",
      role: "Lifestyle Influencer"
    },
    {
      name: "Yuna Kim",
      handle: "@yuna_digital",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200", 
      text: "I was skeptical about the identity lock, but Twinly Editor kept my face perfectly while changing the background to Paris. My followers didn't even know it was AI. 10/10 recommend.",
      role: "Beauty Blogger"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-luxury-950">
      <div className="relative pt-20 pb-24 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-luxury-900 to-luxury-950 border-b border-brand-900/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 px-4 py-1.5 bg-brand-900/50 border border-brand-500/20 rounded-full backdrop-blur-sm">
             <Sparkles className="w-3.5 h-3.5 text-brand-400" />
             <span className="text-xs font-bold text-brand-200 tracking-widest uppercase">Generative AI Suite V2.1</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-50 mb-6 tracking-tight drop-shadow-sm">
            Creator Vault Studio
          </h1>
          <p className="text-brand-100/70 text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-4">
            The premium studio for digital twins, virtual fashion, and viral content.
          </p>
          <p className="text-brand-400/90 text-sm font-medium tracking-wide uppercase opacity-80">
            Powered by TrueTone™ Identity Preservation
          </p>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 -mt-12 pb-24 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <div 
              key={studio.id}
              onClick={studio.action}
              className={`group relative flex flex-col bg-luxury-800 border border-brand-900/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:shadow-2xl hover:shadow-black/50 ${studio.borderHover} ${studio.bgHover}`}
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
                 <p className="text-sm text-brand-200/60 leading-relaxed min-h-[40px]">
                   {studio.description}
                 </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-900/10 flex items-center justify-between">
                 <span className="text-xs font-medium text-brand-400 group-hover:text-brand-200 transition-colors">Enter Room</span>
                 <div className={`w-1.5 h-1.5 rounded-full bg-current opacity-30 group-hover:opacity-100 ${studio.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 pt-16 border-t border-brand-900/30">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-brand-100 mb-2">Creator Stories</h2>
                <p className="text-brand-300/60">Join the movement of digital authenticity.</p>
              </div>
              <div className="flex gap-2">
                 {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-500 text-brand-500" />
                 ))}
                 <span className="text-brand-300 font-medium ml-2">5.0 / 5.0 Rating</span>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                 <div key={index} className="bg-luxury-800/40 rounded-2xl p-8 border border-brand-900/20 hover:bg-luxury-800/60 transition-colors">
                    <Quote className="w-8 h-8 text-brand-500/20 mb-6" />
                    <p className="text-brand-100/90 text-sm leading-relaxed italic mb-8 min-h-[80px]">
                       "{review.text}"
                    </p>
                    <div className="flex items-center gap-4">
                       <img 
                         src={review.image} 
                         alt={review.name} 
                         className="w-12 h-12 rounded-full object-cover border border-brand-500/30"
                         onError={(e) => {
                             (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.name}&background=c9a77c&color=fff`;
                         }}
                       />
                       <div>
                          <h4 className="font-bold text-brand-50 font-serif text-sm">{review.name}</h4>
                          <p className="text-xs text-brand-400 font-medium">{review.handle}</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};