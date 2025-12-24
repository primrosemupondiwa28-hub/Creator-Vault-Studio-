import { GoogleGenAI, Modality, Type, Chat } from "@google/genai";
import { AspectRatio, SkinFinish, NailStyle, HairStyle, HairTarget, HairColor, FacialHair, HairTexture } from '../types';

const cleanBase64 = (base64: string): string => {
  if (base64.includes('base64,')) {
    return base64.split('base64,')[1];
  }
  return base64;
};

export interface CosmeticEnhancements {
  teethWhitening?: boolean;
  eyeBrightening?: boolean;
  makeupMode?: boolean;
  skinFinish?: SkinFinish;
  nailStyle?: NailStyle;
  hairStyle?: HairStyle;
  hairTexture?: HairTexture;
  hairTarget?: HairTarget;
  hairColor?: HairColor;
  facialHair?: FacialHair;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'twitter';

export interface CaptionOptions {
  tone: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
}

export interface SocialCaptions {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
}

export interface UGCPlanRequest {
  niche: string;
  audience: string;
  length: string;
  tone: string;
  goal: string;
  platform: string;
  imageBase64?: string | null;
}

export interface UGCVideoPlan {
  title: string;
  viralHook: string;
  scenes: {
    timeRange: string;
    visual: string;
    audio: string;
  }[];
  caption: string;
  hashtags: string[];
  postingTips: string;
}

export interface UGCVideoWorkflowScene {
  id: number;
  title: string;
  visualPrompt: string;
  veoConfig: string; // JSON string
}

export interface UGCVideoWorkflow {
  scenes: UGCVideoWorkflowScene[];
}

export interface IllustrationConfig {
  primaryColor: string;
  secondaryColor: string;
  strictPalette: boolean;
  styleLock: boolean;
  intensity: number;
  propSize: number;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    const isRetryable = e.status === 500 || e.status === 503 || e.status === 429;
    if (retries > 0 && isRetryable) {
      console.warn(`API request failed with ${e.status}. Retrying... attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, baseDelay));
      return withRetry(fn, retries - 1, baseDelay * 1.5);
    }
    throw e;
  }
}

const generateSingleImage = async (
  ai: GoogleGenAI,
  parts: any[],
  aspectRatio: AspectRatio
): Promise<string | null> => {
  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: { aspectRatio }
        },
      });
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
    });
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
};

export const generateUGCPoster = async (
  apiKey: string,
  productBase64: string,
  characterBase64: string,
  vibeDescription: string,
  aspectRatio: AspectRatio
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `
    ROLE: Authentic UGC Content Creator.
    TASK: Create 4 professional yet AUTHENTIC UGC (User Generated Content) STYLE advertising posters.
    
    COMPOSITION PROTOCOL:
    1. SUBJECT INTEGRATION: Seamlessly merge the Character (Input 2) and Product (Input 1). 
    2. INTERACTION: The character MUST be naturally holding, wearing, or using the product. 
    3. STRICT PRODUCT LOCK: Input 1 contains the product. You MUST preserve the EXACT design, text, labels, branding, and shape of the product in Input 1. Do not hallucinate different words or change the packaging design.
    4. REALISM ENGINE: Apply physically accurate contact shadows and subtle drop shadows beneath the product to ground it in the character's environment.
    5. STYLE & VIBE: ${vibeDescription}. 
    6. AESTHETIC: Authentic UGC style. Should look like a real photo taken by a person at home, in a car, or a public space. Use natural, non-studio lighting. No artificial "brand" backdrops.
    7. OUTPUT: High-fidelity 4K quality variations. Generate 4 distinct variations of pose and candid angle.
  `;

  const parts = [
    { inlineData: { data: cleanBase64(productBase64), mimeType: 'image/png' } },
    { inlineData: { data: cleanBase64(characterBase64), mimeType: 'image/png' } },
    { text: systemPrompt }
  ];

  const promises = Array(4).fill(null).map(async (_, index) => {
    // Add a slight stagger to avoid identical simultaneous requests if the model is deterministic
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 200));
    return generateSingleImage(ai, parts, aspectRatio);
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateUGCVideoWorkflow = async (
  apiKey: string,
  posterBase64: string,
  aspectRatio: AspectRatio
): Promise<UGCVideoWorkflow> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze the advertising poster in Input 1. 
    Create a 40-second cinematic video plan with EXACTLY 5 distinct scenes (8s each).
    
    REQUIRED SCENE LIST:
    1. Unboxing macro shot
    2. Product in action (Character using it)
    3. Close-up texture detail
    4. Lifestyle shot with background (Environment focus)
    5. Call-to-action with logo and URL placement
    
    For EACH scene, provide:
    - 'visualPrompt': A descriptive prompt for an image generator to create a still for this scene, keeping the character and product identical to the poster.
    - 'veoConfig': A valid JSON string following Veo 3 schema: {"camera": "...", "lens": "...", "movement": "...", "lighting": "...", "framing": "..."}. Camera should use smooth dolly/zoom motions. 
    
    Return as JSON with 'scenes' array.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { data: cleanBase64(posterBase64), mimeType: 'image/png' } },
        { text: prompt }
      ] 
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                title: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                veoConfig: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSceneImage = async (
  apiKey: string,
  posterBase64: string,
  scenePrompt: string,
  aspectRatio: AspectRatio
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [
    { inlineData: { data: cleanBase64(posterBase64), mimeType: 'image/png' } },
    { text: `Generate a context-aware cinematic still for this scene: "${scenePrompt}". Strictly preserve the character's facial features and the EXACT product design and labels from the poster.` }
  ];
  return generateSingleImage(ai, parts, aspectRatio);
};

export const generateUGCCreativeIdeas = async (
  apiKey: string,
  productBase64: string | null,
  userMessage: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [];
  if (productBase64) {
    parts.push({ inlineData: { data: cleanBase64(productBase64), mimeType: 'image/png' } });
  }
  parts.push({ text: `ROLE: UGC Creative Director. TASK: Brainstorm viral backgrounds, hooks, and scene ideas. USER: "${userMessage}". Suggest authentic UGC settings like "Messy morning kitchen counter", "Candid car interior selfie", "Cozy unmade bed", or "Busy coffee shop window seat".` });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts }
  });
  return response.text;
};

export const generateIllustrationVariation = async (apiKey: string, baseImage: string, variationPrompt: string, config: IllustrationConfig): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `Variation of Input 1: "${variationPrompt}". Intensity: ${config.intensity}%, PropSize: ${config.propSize}%`;
  const parts = [{ inlineData: { data: cleanBase64(baseImage), mimeType: 'image/png' } }, { text: systemPrompt }];
  return generateSingleImage(ai, parts, '1:1');
};

export const enhancePrompt = async (apiKey: string, simplePrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Detailed realistic description of: ' + simplePrompt
  });
  return response.text || simplePrompt;
};

export const generateBTSImage = async (apiKey: string, imageBase64: string, title: string, characters: string, era: string, vibe: string, energy: string, phase: string, aesthetic: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `BTS still of User (Input 1) with ${characters} on set of ${title}. Aesthetic: ${aesthetic}.`;
  const parts = [{ inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } }, { text: systemPrompt }];
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, '9:16'));
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateBTSVideo = async (apiKey: string, firstFrameBase64: string, title: string, characters: string, aesthetic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `BTS video of ${title} with ${characters}, ${aesthetic}`,
    image: { imageBytes: cleanBase64(firstFrameBase64), mimeType: 'image/png' },
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
  });
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateEditedImage = async (apiKey: string, imageBase64: string, mimeType: string, userPrompt: string, applyToAll: boolean, enhancements: CosmeticEnhancements, aspectRatio: AspectRatio, customBackgroundBase64?: string | null): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `Edit image: "${userPrompt}". Hair Style: ${enhancements.hairStyle}, Hair Color: ${enhancements.hairColor}. Identity locked.`;
  const parts: any[] = [{ inlineData: { data: cleanBase64(imageBase64), mimeType } }];
  if (customBackgroundBase64) parts.push({ inlineData: { data: cleanBase64(customBackgroundBase64), mimeType: 'image/png' } });
  parts.push({ text: systemPrompt });
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, aspectRatio));
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateCompositeImage = async (apiKey: string, subjectBase64: string, referenceBase64: string, mode: 'CREATOR' | 'TRYON' | 'UGC', userPrompt: string, aspectRatio: AspectRatio = '3:4', hairStyle: HairStyle = 'default', nailStyle: NailStyle = 'default', nailColor: string = 'default'): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `Fashion swap. Subject: Input 1. Outfit: Input 2. Hair: ${hairStyle}, Nails: ${nailStyle} in ${nailColor}. Instruction: ${userPrompt}`;
  const parts = [{ inlineData: { data: cleanBase64(subjectBase64), mimeType: 'image/png' } }, { inlineData: { data: cleanBase64(referenceBase64), mimeType: 'image/png' } }, { text: systemPrompt }];
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, aspectRatio));
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateMockup = async (apiKey: string, artworkBase64: string, productType: string, scene: string, config: { scale: number, position: string }): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [{ inlineData: { data: cleanBase64(artworkBase64), mimeType: 'image/png' } }, { text: `Mockup ${productType} in ${scene}` }];
  return generateSingleImage(ai, parts, '1:1');
};

export const generatePosterPlacement = async (apiKey: string, artworkBase64: string, locationPrompt: string, posterRatio: string = "2:3"): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [{ inlineData: { data: cleanBase64(artworkBase64), mimeType: 'image/png' } }, { text: `Place artwork in ${locationPrompt}` }];
  return generateSingleImage(ai, parts, '16:9');
};

export const generateSocialCaptions = async (apiKey: string, imageBase64: string, platforms: SocialPlatform[], context: string, options: CaptionOptions): Promise<SocialCaptions> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } }, { text: `Captions for ${platforms.join(',')}` }] },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
};

export const generateUGCVideoPlan = async (apiKey: string, request: UGCPlanRequest): Promise<UGCVideoPlan> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Video plan for ${request.platform}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
};

export const initSupportChat = (apiKey: string): Chat => {
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({ model: 'gemini-3-flash-preview' });
};