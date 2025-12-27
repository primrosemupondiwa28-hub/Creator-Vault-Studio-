
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

export interface UGCVideoWorkflowScene {
  visualPrompt: string;
  script: string;
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

export interface TrendingSet {
  title: string;
  location: string;
  sourceUrl: string;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    const isRetryable = e.status === 500 || e.status === 503 || e.status === 429;
    if (retries > 0 && isRetryable) {
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
          imageConfig: { aspectRatio }
        },
      });
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    });
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
};

export const fetchTrendingProductionSets = async (apiKey: string): Promise<TrendingSet[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: "Identify 4 high-profile, currently trending film productions, red carpets, or major media events happening right now or in the very recent news (2024-2025). Provide the title, location, and a reliable web URL for each.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Name of the movie, show or event" },
            location: { type: Type.STRING, description: "Where it is taking place" },
            sourceUrl: { type: Type.STRING, description: "URL to the news source" }
          },
          required: ["title", "location", "sourceUrl"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse trending sets:", e);
    return [];
  }
};

export const generateMotionVideo = async (apiKey: string, imageBase64: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic motion: ${prompt}. Professional cinematography, high quality.`,
    image: {
      imageBytes: cleanBase64(imageBase64),
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateBTSVideo = async (apiKey: string, imageBase64: string, prompt: string): Promise<string> => {
    return generateMotionVideo(apiKey, imageBase64, prompt);
};

export const generateUGCPoster = async (
  apiKey: string,
  productBase64: string,
  characterBase64: string,
  vibeDescription: string,
  aspectRatio: AspectRatio
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemPrompt = `ROLE: Authentic UGC Creator. Task: 4 Ad variation. Product integration must be EXACT. Vibe: ${vibeDescription}`;
  const parts = [
    { inlineData: { data: cleanBase64(productBase64), mimeType: 'image/png' } },
    { inlineData: { data: cleanBase64(characterBase64), mimeType: 'image/png' } },
    { text: systemPrompt }
  ];
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, aspectRatio));
  const res = await Promise.all(promises);
  return res.filter((r): r is string => r !== null);
};

export const generateUGCVideoWorkflow = async (apiKey: string, imageBase64: string, aspectRatio: AspectRatio): Promise<UGCVideoWorkflow> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } },
      { text: "Generate a 3-scene UGC video workflow. Each scene needs a visual description and a script. Return JSON." }
    ],
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
                visualPrompt: { type: Type.STRING },
                script: { type: Type.STRING }
              },
              required: ['visualPrompt', 'script']
            }
          }
        },
        required: ['scenes']
      }
    }
  });
  try {
    return JSON.parse(response.text || '{"scenes":[]}');
  } catch (e) {
    return { scenes: [] };
  }
};

export const generateSceneImage = async (apiKey: string, imageBase64: string, visualPrompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [
    { inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } },
    { text: `UGC Scene: ${visualPrompt}. Keep character identity and product consistent.` }
  ];
  return generateSingleImage(ai, parts, aspectRatio);
};

export const generateUGCCreativeIdeas = async (apiKey: string, productImage: string | null, userMsg: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [{ text: `Generate UGC creative ideas for this request: ${userMsg}` }];
  if (productImage) {
    parts.push({ inlineData: { data: cleanBase64(productImage), mimeType: 'image/png' } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts }
  });
  return response.text || "No ideas could be generated at this time.";
};

export const generateBTSImage = async (
  apiKey: string, 
  imageBase64: string, 
  title: string, 
  characters: string,
  style: string = 'Modern',
  aesthetic: string = 'Candid',
  quality: string = 'High',
  phase: string = 'On-Set Break',
  productionAesthetic: string = 'Raw Handheld'
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Suggest 4 current real-world trending film sets or events for a BTS shoot of "${title}". Phase: ${phase}. Style: ${style}.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  
  const systemPrompt = `BTS still. Title: ${title}. ${response.text}. Aesthetic: ${aesthetic}. Quality: ${quality}. Production Style: ${productionAesthetic}. Characters: ${characters}. Candid production look.`;
  const parts = [{ inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } }, { text: systemPrompt }];
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, '9:16'));
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateEditedImage = async (apiKey: string, imageBase64: string, mimeType: string, userPrompt: string, applyToAll: boolean, enhancements: CosmeticEnhancements, aspectRatio: AspectRatio, customBackgroundBase64?: string | null): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [{ inlineData: { data: cleanBase64(imageBase64), mimeType } }];
  if (customBackgroundBase64) parts.push({ inlineData: { data: cleanBase64(customBackgroundBase64), mimeType: 'image/png' } });
  parts.push({ text: `Edit: ${userPrompt}. Identity preserved. Hair: ${enhancements.hairStyle}` });
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, aspectRatio));
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateCompositeImage = async (apiKey: string, subjectBase64: string, referenceBase64: string, mode: 'CREATOR' | 'TRYON' | 'UGC', userPrompt: string, aspectRatio: AspectRatio = '3:4', hairStyle: HairStyle = 'default', nailStyle: NailStyle = 'default', nailColor: string = 'default'): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [{ inlineData: { data: cleanBase64(subjectBase64), mimeType: 'image/png' } }, { inlineData: { data: cleanBase64(referenceBase64), mimeType: 'image/png' } }, { text: `Composite: ${userPrompt}. Mode: ${mode}. Styling - Hair: ${hairStyle}, Nails: ${nailStyle}, Nail Color: ${nailColor}.` }];
  const promises = Array(4).fill(null).map(() => generateSingleImage(ai, parts, aspectRatio));
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateSocialCaptions = async (apiKey: string, imageBase64: string, platforms: SocialPlatform[], context: string, options: CaptionOptions): Promise<SocialCaptions> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } },
      { text: `Write ${platforms.join(', ')} captions for: ${context}. Tone: ${options.tone}. Use Hashtags: ${options.includeHashtags}, Use Emojis: ${options.includeEmojis}. Return JSON.` }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instagram: { type: Type.STRING },
          tiktok: { type: Type.STRING },
          facebook: { type: Type.STRING },
          twitter: { type: Type.STRING }
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {};
  }
};

export const generateMockup = async (apiKey: string, artworkBase64: string, product: string, scene: string, config: { scale: number, position: string }): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [
    { inlineData: { data: cleanBase64(artworkBase64), mimeType: 'image/png' } },
    { text: `Create a professional product mockup for a ${product}. Environment: ${scene}. Scale artwork by ${config.scale}% at ${config.position}.` }
  ];
  return generateSingleImage(ai, parts, '1:1');
};

export const generateIllustrationVariation = async (apiKey: string, baseImage: string, variation: string, config: IllustrationConfig): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [
    { inlineData: { data: cleanBase64(baseImage), mimeType: 'image/png' } },
    { text: `Generate a consistent illustration variation for this character: ${variation}. Primary color: ${config.primaryColor}, Secondary color: ${config.secondaryColor}. Intensity: ${config.intensity}%.` }
  ];
  return generateSingleImage(ai, parts, '1:1');
};

export const generatePosterPlacement = async (apiKey: string, artworkBase64: string, location: string, ratio: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey });
  const parts = [
    { inlineData: { data: cleanBase64(artworkBase64), mimeType: 'image/png' } },
    { text: `Visualize this poster (${ratio}) in ${location}. Realistic lighting and perspective.` }
  ];
  return generateSingleImage(ai, parts, '16:9');
};

export const enhancePrompt = async (apiKey: string, simplePrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Professional highly detailed descriptive prompt for: ' + simplePrompt
  });
  return response.text || simplePrompt;
};

export const initSupportChat = (apiKey: string): Chat => {
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({ model: 'gemini-3-flash-preview' });
};
