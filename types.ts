export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type SkinFinish = 'default' | 'glowing' | 'matte' | 'dewy_satin';
export type NailStyle = 'default' | 'french' | 'almond' | 'square' | 'stiletto' | 'nude' | 'red' | 'black' | 'chrome';
export type HairStyle = 'default' | 'straight_sleek' | 'voluminous_blowout' | 'wavy_beachy' | 'curly_coily' | 'braids' | 'afro_natural' | 'updo_bun' | 'short_pixie' | 'bob_cut' | 'long_layers' | 'buzz_cut' | 'bald' | 'mohawk' | 'side_part' | 'curtain_bangs';
export type HairTexture = 'default' | 'smooth_silky' | 'messy_tousled' | 'wet_look' | 'matte_dry' | 'glossy_shiny' | 'coarse_kinky';
export type HairTarget = 'everyone' | 'women' | 'men' | 'children' | 'person_on_left' | 'person_on_right';
export type HairColor = 'default' | 'blonde' | 'brunette' | 'black' | 'red' | 'auburn' | 'copper' | 'silver' | 'platinum' | 'white' | 'pastel_pink' | 'pastel_purple' | 'midnight_blue' | 'neon_green';
export type FacialHair = 'default' | 'clean_shaven' | 'light_stubble' | 'heavy_stubble' | 'full_beard' | 'goatee' | 'mustache' | 'handlebars';

export interface GeneratedImage {
  id: string;
  originalData: string; // Base64
  generatedData: string; // Base64
  prompt: string;
  timestamp: number;
  aspectRatio?: AspectRatio;
}

export interface AppState {
  currentImage: string | null; // Primary Subject Image
  secondaryImage: string | null; // Product or Outfit Image
  mimeType: string;
  isGenerating: boolean;
  error: string | null;
  history: GeneratedImage[];
}

export enum ViewMode {
  HOME = 'HOME',
  TWINLY_UPLOAD = 'TWINLY_UPLOAD',
  TWINLY_EDITOR = 'TWINLY_EDITOR',
  CREATOR_STUDIO = 'CREATOR_STUDIO',
  UGC_STUDIO = 'UGC_STUDIO',
  VIRTUAL_TRYON = 'VIRTUAL_TRYON',
  MERCH_STUDIO = 'MERCH_STUDIO',
  BTS_STUDIO = 'BTS_STUDIO',
  CAPTION_GENERATOR = 'CAPTION_GENERATOR',
  EXPLORE_PROMPTS = 'EXPLORE_PROMPTS',
  GALLERY = 'GALLERY'
}