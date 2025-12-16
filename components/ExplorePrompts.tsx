import React, { useState } from 'react';
import { ArrowLeft, Copy, Sparkles, Code, FileJson, Check } from 'lucide-react';

interface ExplorePromptsProps {
  onBack: () => void;
}

export const ExplorePrompts: React.FC<ExplorePromptsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'json'>('standard');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const standardPrompts = [
    { title: "Parisian Chic", text: "Wearing a beige trench coat and beret, sitting at a cafe in Paris, soft morning light, editorial style.", category: "Lifestyle" },
    { title: "Gala Glamour", text: "Wearing a sparkling gold floor-length gown, red carpet event, camera flashes in background, confident pose.", category: "Fashion" },
    { title: "Office Executive", text: "Modern minimalist white office, wearing a sharp navy suit, standing by window with city skyline view.", category: "Professional" },
    { title: "Cyberpunk Edge", text: "Neon city street at night, wearing a futuristic leather jacket with glowing accents, purple and blue rim lighting.", category: "Creative" },
    { title: "Old Money Aesthetic", text: "Tennis court country club setting, wearing white pleated skirt and polo, sunlight filtering through trees.", category: "Lifestyle" },
    { title: "Vogue Cover", text: "Extreme close up portrait, avant-garde makeup, studio lighting, solid bold color background, high fashion.", category: "Editorial" },
  ];

  const jsonPrompts = [
    {
      title: "Private Lounge Luxury - Soft Life Travel",
      category: "Travel",
      text: `{
 "type": "ultra_realistic_lifestyle_selfie",
 "subject": {
   "use_reference_image": "Use reference image exactly, do not alter facial features",
   "demographics": "Black woman with rich deep-brown undertones",
   "pose": "Slight high-angle selfie, boarding pass visible at the edge of the frame",
   "expression": "Calm, expensive, slightly amused",
   "focus": "Ultra sharp facial detail and hair texture"
 },
 "skin_and_texture_details": {
   "complexion": "Deep brown with warm undertones",
   "surface_texture": "Highly detailed natural skin texture with visible pores, soft cheek texture, gentle sheen across T-zone",
   "micro_details": "Individually defined baby hairs, natural brow strands, micro-shadows around nostrils",
   "rendering": "SSS-based skin shading for depth and realism",
   "finish": "Healthy skin finish with dimensional glow, zero smoothing or blurring"
 },
 "grooming_and_styling": {
   "hair": "Soft, voluminous jet-black blowout with layered movement and visible strand texture",
   "makeup": "Soft glam neutrals with a defined lash line, brown smoked crease, radiant highlighter",
   "clothing": "Beige cashmere wrap with visible fiber texture-fine-knit ribbing, subtle plushness"
 },
 "accessories": {
   "eyewear": "Prada tortoise sunglasses hooked on her neckline, visible acetate texture",
   "jewelry": "Diamond studs, VCA MOP pendant necklace, Cartier Love bracelet",
   "bag": "Etoupe Hermès Birkin placed beside her with visible grain leather texture"
 },
 "lighting_and_atmosphere": {
   "source": "Soft diffused overhead lounge lighting",
   "quality": "Clean, commercial, even illumination",
   "interaction": "Gentle highlights on cheekbones, glossy lips, and under-eye area"
 },
 "environment": {
   "setting": "Private airline lounge",
   "background": "Muted beige seating, blurred silhouettes of travelers, champagne flutes in soft bokeh"
 },
 "technical_specs": {
   "resolution": "8k",
   "style": "High-end editorial meets hyper-real iPhone realism",
   "clarity": "Crisp textures with no noise or smoothing"
 }
}`
    },
    {
      title: "Y2K Pink Boutique Hotel - Pinterest Baddie",
      category: "Lifestyle",
      text: `{ 
 "type": "ultra_realistic_lifestyle_selfie", 
 "subject": { 
   "use_reference_image": "Use reference image exactly, do not alter facial features", 
   "demographics": "Black woman with deep cocoa skin and golden undertones", 
   "pose": "Front-facing selfie with slight chin lift and relaxed wrist angle", 
   "expression": "Soft-life playful confidence, slight glossy smirk", 
   "focus": "Ultra detailed complexion and reflective lip gloss texture" 
 }, 
 "skin_and_texture_details": { 
   "complexion": "Cocoa brown with warm golden undertones", 
   "surface_texture": "Highly detailed natural skin texture with visible pores, subtle forehead sheen, natural cheek texture, textured smile lines", 
   "micro_details": "Individually defined baby hairs, brow strands visible, detailed lip lines with gloss reflection", 
   "rendering": "SSS for realistic light penetration and skin depth", 
   "finish": "Radiant but natural finish with no smoothing" 
 }, 
 "grooming_and_styling": { 
   "hair": "Silky Y2K swoop ponytail with visible gel shine and smooth laid edges", 
   "makeup": "Frosted pink gloss, dramatic curled lashes, soft contoured cheeks with shimmer highlight", 
   "clothing": "Plush pink faux-fur bolero with fluffy fiber texture and thick Y2K-inspired collar" 
 }, 
 "accessories": { 
   "eyewear": "Tiny chrome Y2K sunglasses sitting on her head", 
   "jewelry": "Large silver hoops, rhinestone choker with reflective stones", 
   "bag": "Baby-pink Dior saddle bag with embossed monogram fabric texture" 
 }, 
 "lighting_and_atmosphere": { 
   "source": "Warm boutique hotel lamps and pink LED accent lighting", 
   "quality": "Soft, dreamy glow", 
   "interaction": "Glossy lip reflections and warm cheek highlights" 
 }, 
 "environment": { 
   "setting": "Pink-themed boutique hotel suite", 
   "background": "Soft pink bedding, chrome decor accents, blurred LED wall lights" 
 }, 
 "technical_specs": { 
   "resolution": "8k", 
   "style": "Y2K glam meets hyper-realistic beauty photography", 
   "clarity": "Ultra crisp and detailed" 
 }
}`
    },
    {
      title: "In-Car Pouting Pose",
      category: "Lifestyle",
      text: `{
 "type": "ultra_realistic_lifestyle_selfie",
 "subject": {
   "use_reference_image": "Use the reference image i have provided, do not change any facial features",
   "demographics": "Woman with tan, olive skin tone",
   "pose": "Seated in a car, arm extended for a selfie angle",
   "expression": "Confident and playful, lips pursed in a pout",
   "focus": "Sharp focus on the face and lips"
 },
 "skin_and_texture_details": {
   "complexion": "Smooth tan skin",
   "surface_texture": "High-fidelity epidermal detail with visible pores and natural skin grain",
   "micro_details": "Presence of vellus hair (peach fuzz) on jawline to prove realism, natural crease lines around the mouth",
   "rendering": "Subsurface scattering (SSS) enabled to show skin depth, absolutely no plastic smoothing or airbrush effects",
   "finish": "Natural skin hydration sheen without being oily"
 },
 "grooming_and_styling": {
   "hair": "Long, bone-straight blonde hair with realistic strand separation and shine",
   "makeup": "Minimal clean look, high-shine glossy lips reflecting the light",
   "clothing": "Simple soft pink tank top showing realistic cotton fabric texture"
 },
 "accessories": {
   "eyewear": "Oversized square prada tortoiseshell sunglasses resting on her head",
   "jewelry": "Delicate gold van cleef and arpels 5 motif malachite necklace with realistic specular reflection"
 },
 "lighting_and_atmosphere": {
   "source": "Natural daytime sunlight entering through the car window",
   "quality": "Soft, diffused illumination that wraps around the facial features",
   "interaction": "Light creating gentle highlights on the forehead, nose bridge, and glossy lips",
   "reflections": "Subtle reflection of the car interior and outside world visible in the sunglasses lenses"
 },
 "environment": {
   "setting": "Car interior (driver or passenger seat)",
   "background": "Bright urban street scene visible through the window, slightly out of focus to keep attention on the subject"
 },
 "technical_specs": {
   "resolution": "8k photography",
   "style": "Cinematic, raw capture aesthetic",
   "clarity": "Crisp details, no motion blur, high dynamic range"
 }
}`
    },
    {
      title: "Near the Ocean Pose",
      category: "Travel",
      text: `{
 "type": "ultra_realistic_lifestyle_selfie",
 "subject": {
   "use_reference_image": "Base likeness on reference image, no facial changes",
   "demographics": "Tan olive skin",
   "pose": "Holding camera slightly above eye level, hair blowing in the wind",
   "expression": "Soft serene confidence",
   "focus": "High-definition skin and hair movement"
 },
 "skin_and_texture_details": {
   "complexion": "Warm tan-olive",
   "surface_texture": "High-resolution pores, freckles, natural texture",
   "micro_details": "Wind-tousled baby hairs, peach fuzz catching the sun",
   "rendering": "Subsurface scattering active",
   "finish": "Sunlit glow with natural sheen"
 },
 "grooming_and_styling": {
   "hair": "Long blonde blowout, natural movement from wind",
   "makeup": "Minimal glow glam with bronzy tones",
   "clothing": "White linen button-down slightly open at the top"
 },
 "accessories": {
   "eyewear": "Prada black sunnies on head",
   "jewelry": "VCA MOP necklace + bracelet, Cartier Love, diamond studs",
   "bag": "Tan Hermès Mini Kelly resting on balcony table"
 },
 "lighting_and_atmosphere": {
   "source": "Golden hour sunlight",
   "quality": "Cinematic warm glow",
   "interaction": "Light illuminating hair strands and gloss",
   "reflections": "Soft reflections on balcony glass"
 },
 "environment": {
   "setting": "Hotel balcony overlooking ocean",
   "background": "Blurry coastline, warm sky"
 },
 "technical_specs": {
   "resolution": "8k",
   "style": "Cinematic luxury",
   "clarity": "High dynamic range, crisp realism"
 }
}`
    },
    {
      title: "Rooftop Pool Golden Hour",
      category: "Lifestyle",
      text: `{
 "type": "ultra_realistic_lifestyle_selfie",
 "subject": {
   "use_reference_image": "Use reference image exactly, do not alter facial features",
   "demographics": "Black woman with golden-deep brown undertones",
   "pose": "High-angle selfie with upper body angled toward the sun, shoulders slightly raised",
   "expression": "Relaxed soft-life contentment, subtle glowing smile",
   "focus": "Ultra-detailed sunlit skin texture and wet glow"
 },
 "skin_and_texture_details": {
   "complexion": "Golden-deep brown with radiant undertones",
   "surface_texture": "Highly detailed natural skin texture with visible pores, sun-lit highlights on cheeks",
   "micro_details": "Wet baby hairs curled slightly from humidity, visible brow hairs, natural lip texture",
   "rendering": "Strong SSS for sunset glow depth",
   "finish": "Warm illuminated glow, natural skin-no smoothing"
 },
 "grooming_and_styling": {
   "hair": "Long boho waves with wet-look texture and individual strand separation",
   "makeup": "Glowy bronzed makeup, soft gold shimmer on lids, glossy nude-brown lips",
   "clothing": "Soft beige ribbed knit bikini top with visible rib texture and matte elasticity"
 },
 "accessories": {
   "eyewear": "Oversized gradient-lens sunglasses perched on head",
   "jewelry": "Gold layered necklaces, thin gold bangles, small hoops",
   "bag": "Wicker designer pool tote with woven texture visible"
 },
 "lighting_and_atmosphere": {
   "source": "Golden hour sunlight",
   "quality": "Warm, directional, glowing",
   "interaction": "Sun flares reflecting on cheekbones, natural shadows on chest and jawline"
 },
 "environment": {
   "setting": "Luxury rooftop pool overlooking a city skyline",
   "background": "Blurred city buildings, turquoise pool water, soft bokeh reflections"
 }
}`
    },
    {
      title: "Jet Window Glow-Up - Luxury Travel Boss",
      category: "Travel",
      text: `{ 
 "type": "ultra_realistic_lifestyle_selfie", 
 "subject": { 
   "use_reference_image": "Use reference image exactly, do not alter facial features", 
   "demographics": "Black woman with rich ebony skin and cool undertones", 
   "pose": "Selfie angled slightly toward the jet window, soft lean toward the light", 
   "expression": "Serene, wealthy-soft-life expression with relaxed eyes", 
   "focus": "Ultra detailed skin texture with window light reflections" 
 }, 
 "skin_and_texture_details": { 
   "complexion": "Ebony skin with cool undertones", 
   "surface_texture": "Highly detailed natural pores, subtle matte areas around jawline, soft-textured cheeks", 
   "micro_details": "Defined baby hairs near hairline, textured brow hairs, detailed lip texture with natural creases", 
   "rendering": "Strong SSS with natural bounce from window light", 
   "finish": "True-to-life finish with subtle glow and zero smoothing" 
 }, 
 "grooming_and_styling": { 
   "hair": "Straight, sleek middle-part wig with visible strand flow and natural density", 
   "makeup": "Earth-tone glam: bronze lids, soft matte complexion, glossed brown-lined lips", 
   "clothing": "Cream ribbed-knit long-sleeve top with visible vertical stitching and soft stretch texture" 
 }, 
 "accessories": { 
   "eyewear": "Gold aviator sunglasses resting on head", 
   "jewelry": "Gold Cuban-link chain, stacked thin bangles", 
   "bag": "Black Chanel Classic Flap with visible caviar leather texture" 
 }, 
 "lighting_and_atmosphere": { 
   "source": "Natural daylight from plane window",
   "quality": "Soft, luminous, diffused glow", 
   "interaction": "Catchlights in eyes, glowing cheekbones, soft shadows along jaw" 
 }, 
 "environment": { 
   "setting": "First-class airplane window seat", 
   "background": "Blurred sky through window, subtle cabin interior textures" 
 }, 
 "technical_specs": { 
   "resolution": "8k", 
   "style": "Editorial soft-life travel realism", 
   "clarity": "Hyper crisp and naturally lit" 
 }
}`
    },
    {
      title: "First Class Champagne Moment",
      category: "Travel",
      text: `{ 
 "type": "ultra_realistic_lifestyle_selfie", 
 "subject": { 
   "use_reference_image": "Use reference image exactly, do not alter facial features", 
   "demographics": "Black woman with smooth dark-chocolate undertones", 
   "pose": "Seated selfie with camera angled slightly down, champagne glass near her shoulder", 
   "expression": "Rich, unbothered, luxury-soft-life expression", 
   "focus": "High-detail facial texture and reflective highlights" 
 }, 
 "skin_and_texture_details": { 
   "complexion": "Dark chocolate with neutral-golden undertones", 
   "surface_texture": "Highly detailed natural skin texture with visible pores, soft contour shadows, subtle upper-lip and cheek texture", 
   "micro_details": "Baby hairs laid with precision, textured brow strands, natural lip creases with gloss", 
   "rendering": "Realistic SSS with cabin lighting diffusion", 
   "finish": "Healthy lit-from-within glow-no smoothing or airbrush" 
 }, 
 "grooming_and_styling": { 
   "hair": "Sleek bob with razor-sharp ends, visible strand shine and movement", 
   "makeup": "Matte-soft base, brown-lined lips, fluttery lashes, neutral bronze eyeshadow", 
   "clothing": "Stone-grey cashmere cardigan with visible knitted fibers, draped softly over shoulders" 
 }, 
 "accessories": { 
   "eyewear": "Gold-rimmed aviator sunglasses hanging from neckline", 
   "jewelry": "Diamond tennis necklace, thin diamond-studded bracelet", 
   "bag": "Black Hermès Kelly bag with rich grain texture" 
 }, 
 "lighting_and_atmosphere": { 
   "source": "First-class cabin warm ceiling lights", 
   "quality": "Soft, diffused, flattering", 
   "interaction": "Champagne reflections flicker on cheek, soft highlights across lips" 
 }, 
 "environment": { 
   "setting": "First-class airplane suite", 
   "background": "Softly lit cabin, blurred partitions, champagne tray visible" 
 }, 
 "technical_specs": { 
   "resolution": "8k", 
   "style": "Editorial luxury travel realism", 
   "clarity": "Hyper-defined textures" 
 }
}`
    },
    {
      title: "Paris Balcony Satin Robe",
      category: "Lifestyle",
      text: `{ 
 "type": "ultra_realistic_lifestyle_selfie", 
 "subject": { 
   "use_reference_image": "Use reference image exactly, do not alter facial features", 
   "demographics": "Black woman with soft warm-brown undertones", 
   "pose": "Selfie from chest-up, balcony blurred behind, slight tilt toward the light", 
   "expression": "Soft, feminine, dreamy-expensive energy", 
   "focus": "Ultra-detailed cheek texture and soft reflective highlights" 
 }, 
 "skin_and_texture_details": { 
   "complexion": "Warm brown with peachy-golden undertones", 
   "surface_texture": "Highly detailed natural pores, subtle nose texture, fine texture on décolletage, gentle sheen on cheekbones", 
   "micro_details": "Wispy baby hairs outlined clearly, textured lashes, natural brow hair separation", 
   "rendering": "Soft-lens realism with natural SSS", 
   "finish": "Radiant, soft-focus but still textured and real" 
 }, 
 "grooming_and_styling": { 
   "hair": "Loose romantic curls, soft movement, individual strands visible", 
   "makeup": "Rosy-bronze glow, glossy mauve lips, soft flutter lashes", 
   "clothing": "Ivory satin robe with visible silky sheen, smooth fabric drape, reflective folds" 
 }, 
 "accessories": { 
   "eyewear": "Delicate gold-frame reading glasses tucked in robe pocket", 
   "jewelry": "Pearl-drop earrings, thin layered gold necklaces", 
   "bag": "Small beige Jacquemus bag with structured leather texture" 
 }, 
 "lighting_and_atmosphere": { 
   "source": "Natural Parisian daylight", 
   "quality": "Soft, diffused, slightly cool", 
   "interaction": "Reflective glimmer on satin and cheekbones" 
 }, 
 "environment": { 
   "setting": "Paris balcony overlooking Haussmann buildings", 
   "background": "Softly blurred rooftops, wrought-iron balcony detailing" 
 }, 
 "technical_specs": { 
   "resolution": "8k", 
   "style": "Soft editorial luxury lifestyle", 
   "clarity": "High clarity, soft but detailed" 
 }
}`
    },
    {
      title: "Y2K Night-Out Bathroom Mirror Selfie",
      category: "Lifestyle",
      text: `{ 
 "type": "ultra_realistic_lifestyle_selfie", 
 "subject": { 
   "use_reference_image": "Use reference image exactly, do not alter facial features", 
   "demographics": "Black woman with rich mahogany undertones", 
   "pose": "Mirror selfie with phone covering lower face, camera angled upward", 
   "expression": "Confident Y2K baddie energy, relaxed eyes", 
   "focus": "Ultra-detailed T-zone texture, makeup reflectivity, and hairline detail" 
 }, 
 "skin_and_texture_details": { 
   "complexion": "Mahogany brown with cool-red undertones", 
   "surface_texture": "Highly detailed pores across nose and cheeks, soft facial texture", 
   "micro_details": "Sharp baby hair swoops with gel texture, separated brow hairs, detailed lip gloss creases", 
   "rendering": "Even indoor SSS for bathroom light realism", 
   "finish": "True-to-skin glow with natural texture"
 }, 
 "grooming_and_styling": { 
   "hair": "Long jet-black straight hair with high-shine flat-iron finish", 
   "makeup": "High-gloss lips, silver shimmer lids, sharp wing liner, sculpted Y2K cheek contour", 
   "clothing": "Sparkly silver mini-top with metallic woven texture that reflects light" 
 }, 
 "accessories": { 
   "eyewear": "N/A", 
   "jewelry": "Chunky silver hoops, rhinestone bracelet", 
   "bag": "Mini chrome baguette bag with mirror-like surface" 
 }, 
 "lighting_and_atmosphere": { 
   "source": "Bathroom vanity fluorescent lights", 
   "quality": "Bright, crisp, reflective", 
   "interaction": "Glossy lip hotspots, hair shine reflections, sparkle on top" 
 }, 
 "environment": { 
   "setting": "Trendy nightclub bathroom", 
   "background": "Tiled walls, neon sign blurred in background, reflective surfaces" 
 }, 
 "technical_specs": { 
   "resolution": "8k", 
   "style": "Y2K glam realism", 
   "clarity": "Hyper crisp reflections and textures" 
 }
}`
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentList = activeTab === 'standard' ? standardPrompts : jsonPrompts;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-luxury-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-luxury-800 text-brand-300 transition-colors">
                 <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-serif text-brand-50">Style Library</h1>
                <p className="text-brand-300/60 text-sm mt-1">Curated prompts for high-fidelity generation</p>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex bg-luxury-800 p-1 rounded-xl border border-brand-900/30">
              <button
                onClick={() => setActiveTab('standard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'standard' ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}
              >
                <Sparkles className="w-4 h-4" />
                Standard
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'json' ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-300 hover:text-white'}`}
              >
                <FileJson className="w-4 h-4" />
                Realism JSON
              </button>
           </div>
        </div>

        <div className={`grid gap-6 ${activeTab === 'standard' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
           {currentList.map((p, i) => (
             <div key={i} className={`bg-luxury-800 border border-brand-900/30 p-6 rounded-2xl hover:border-brand-500/50 transition-all group flex flex-col ${activeTab === 'json' ? 'row-span-2' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                   <span className="text-xs font-bold tracking-wider text-brand-500 uppercase px-2 py-1 bg-brand-500/10 rounded border border-brand-500/20">{p.category}</span>
                   {activeTab === 'json' && <Code className="w-4 h-4 text-brand-800" />}
                   {activeTab === 'standard' && <Sparkles className="w-4 h-4 text-brand-800 group-hover:text-brand-500 transition-colors" />}
                </div>
                
                <h3 className="text-xl font-serif text-brand-100 mb-3">{p.title}</h3>
                
                <div className="flex-1 mb-6 relative">
                  {activeTab === 'json' ? (
                    <div className="bg-luxury-900 p-4 rounded-xl border border-brand-900/50 h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand-900">
                      <pre className="text-xs font-mono text-emerald-300/90 whitespace-pre-wrap font-light leading-relaxed">
                        {p.text}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-brand-300/70 text-sm leading-relaxed">"{p.text}"</p>
                  )}
                </div>

                <button 
                  onClick={() => copyToClipboard(p.text, i)}
                  className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    copiedIndex === i 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                    : 'bg-luxury-900 hover:bg-brand-900/30 text-brand-300 border border-transparent'
                  }`}
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy {activeTab === 'json' ? 'JSON' : 'Prompt'}
                    </>
                  )}
                </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};