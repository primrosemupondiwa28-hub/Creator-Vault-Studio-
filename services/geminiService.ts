import { GoogleGenAI, Modality, Type, Chat } from "@google/genai";
import { AspectRatio, SkinFinish, NailStyle, HairStyle, HairTarget, HairColor, FacialHair, HairTexture } from '../types';

const cleanBase64 = (base64: string): string => {
  if (base64.includes('base64,')) {
    return base64.split('base64,')[1];
  }
  return base64;
};

export interface CosmeticEnhancements {
  teethWhitening: boolean;
  eyeBrightening: boolean;
  makeupMode: boolean;
  skinFinish: SkinFinish;
  nailStyle: NailStyle;
  hairStyle: HairStyle;
  hairTexture: HairTexture;
  hairTarget: HairTarget;
  hairColor: HairColor;
  facialHair: FacialHair;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'twitter';

export interface SocialCaptions {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
}

export interface CaptionOptions {
  tone: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
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

export interface UGCScene {
  timeRange: string;
  visual: string;
  audio: string;
}

export interface UGCVideoPlan {
  title: string;
  viralHook: string;
  scenes: UGCScene[];
  caption: string;
  hashtags: string[];
  postingTips: string;
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

// Magic Wand Service
export const enhancePrompt = async (apiKey: string, simplePrompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are a prompt engineering expert. 
    Rewrite the user's prompt into a photorealistic, highly detailed description.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: simplePrompt }] },
      config: { systemInstruction }
    });
    return response.text || simplePrompt;
  } catch (e) {
    return simplePrompt;
  }
};

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
          imageConfig: {
            aspectRatio: aspectRatio,
          }
        },
      });

      // Find the image part in candidates
      const candidate = response.candidates?.[0];
      if (!candidate) return null;
      
      const part = candidate.content?.parts?.find(p => p.inlineData);
      if (part && part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    });
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
};

// BTS Generator Logic
export const generateBTSImage = async (
  apiKey: string,
  imageBase64: string,
  title: string,
  characters: string,
  era: string,
  vibe: string,
  energy: string,
  phase: string = "On-Set Break",
  aesthetic: string = "Raw Handheld",
  aspectRatio: AspectRatio = '9:16'
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    ROLE: Production Photographer.
    TASK: Generate a photorealistic BTS still of the User (Input 1) with the cast members: ${characters}.
    
    CELEBRITY ACCURACY: Match the exact facial features of ${characters}.
    USER IDENTITY: Preserve the face from Input 1 100%.
    CONTEXT: On the set of "${title}" during ${phase}.
    AESTHETIC: ${aesthetic}.
  `;

  const parts = [
    { inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } },
    { text: systemPrompt }
  ];

  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateBTSVideo = async (
  apiKey: string,
  firstFrameBase64: string,
  title: string,
  characters: string,
  aesthetic: string = "Raw Handheld"
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    A viral behind-the-scenes video from the set of "${title}". 
    Features the user and ${characters} interacting candidly.
    Camera Style: Handheld, raw, authentic.
  `;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: cleanBase64(firstFrameBase64),
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Twinly Editor Logic
export const generateEditedImage = async (
  apiKey: string,
  imageBase64: string, 
  mimeType: string, 
  userPrompt: string,
  applyToAll: boolean = true,
  enhancements: CosmeticEnhancements,
  aspectRatio: AspectRatio = '1:1',
  customBackgroundBase64?: string | null
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const targetHair = enhancements.hairStyle !== 'default' ? enhancements.hairStyle.replace(/_/g, ' ') : null;
  const targetColor = enhancements.hairColor !== 'default' ? enhancements.hairColor.replace(/_/g, ' ') : null;
  const targetFacialHair = enhancements.facialHair !== 'default' ? enhancements.facialHair.replace(/_/g, ' ') : null;
  const targetTexture = enhancements.hairTexture !== 'default' ? enhancements.hairTexture.replace(/_/g, ' ') : null;
  const targetSubject = (enhancements.hairTarget || 'everyone').replace(/_/g, ' ');

  const systemPrompt = `
    ROLE: Forensic Identity Specialist.
    TASK: Edit the image strictly maintaining the identity of the subjects.
    
    INSTRUCTION: "${userPrompt}"
    
    HAIR CHANGES (Target: ${targetSubject}):
    ${targetHair ? `- Style: ${targetHair}` : ''}
    ${targetColor ? `- Color: ${targetColor}` : ''}
    ${targetTexture ? `- Texture: ${targetTexture}` : ''}
    ${targetFacialHair ? `- Facial Hair: ${targetFacialHair}` : ''}

    STRICT IDENTITY LOCK: Do not alter facial structure or skin tone.
  `;

  const parts: any[] = [
    { inlineData: { data: cleanBase64(imageBase64), mimeType: mimeType } }
  ];

  if (customBackgroundBase64) {
    parts.push({ inlineData: { data: cleanBase64(customBackgroundBase64), mimeType: 'image/png' } });
  }

  parts.push({ text: systemPrompt });

  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

// Creator Studio, UGC Studio & Virtual Try-On Logic
export const generateCompositeImage = async (
  apiKey: string,
  subjectBase64: string,
  referenceBase64: string, // Product or Outfit
  mode: 'CREATOR' | 'TRYON' | 'UGC',
  userPrompt: string,
  aspectRatio: AspectRatio = '3:4',
  hairStyle: HairStyle = 'default',
  nailStyle: NailStyle = 'default',
  nailColor: string = 'default'
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  let systemPrompt = "";

  if (mode === 'CREATOR') {
    systemPrompt = `ROLE: Product Photographer. TASK: Place the Product (Input 2) with the Model (Input 1). SCENE: ${userPrompt || "Luxury studio"}.`;
  } else if (mode === 'UGC') {
    systemPrompt = `ROLE: Content Creator. TASK: Authentic lifestyle shot of Influencer (Input 1) with Product (Input 2). VIBE: ${userPrompt || "Candid selfie"}.`;
  } else {
    // TRYON - AGGRESSIVE REALISM & SEAMLESS BLENDING
    const hairInstruction = hairStyle !== 'default' ? `HAIRSTYLE: Update the subject's hair to a ${hairStyle.replace(/_/g, ' ')} style.` : "HAIRSTYLE: Maintain original hair exactly.";
    const nailInstruction = nailStyle !== 'default' ? `NAILS: Apply ${nailStyle.replace(/_/g, ' ')} shape nails in ${nailColor === 'default' ? 'a natural' : nailColor} color.` : "";
    
    systemPrompt = `
      TASK: Perform a high-fidelity digital clothing swap. 
      SOURCE_IDENTITY: Use the exact face and skin tone of the person in Input 1. DO NOT change any facial features.
      TARGET_OUTFIT: Transfer the clothes, jewelry, bag, and shoes from Input 2 onto the subject.
      
      *** STRICT CONSTRAINTS ***
      1. **JEWELRY REPLACEMENT**: REMOVE ALL ORIGINAL JEWELRY (earrings, necklaces, rings, bracelets) that the person is wearing in Input 1. The ONLY jewelry on the model must be the jewelry from the new outfit in Input 2. If Input 2 has no jewelry, the model should wear none.
      2. **ORIGINAL LOOK**: The result must look like the original photo, not a photoshop. The clothing must drape naturally on the body with perfect matching shadows and lighting.
      3. **FULL BODY**: The subject must be in a STANDING POSE to show the entire outfit including SHOES.
      4. **EXCLUSION**: DO NOT include perfume bottles or scent packaging from Input 2. Focus only on wearable clothes, jewelry, bag, and shoes.
      5. **BACKGROUND**: Generate a high-end, complementary studio or lifestyle environment background that matches the outfit.
      6. **STRICT IDENTITY LOCK**: Ensure facial features are consistently locked and not altered in any way from Input 1.
      
      ${hairInstruction}
      ${nailInstruction}
      ${userPrompt || ""}
    `;
  }

  const parts = [
    { inlineData: { data: cleanBase64(subjectBase64), mimeType: 'image/png' } },
    { inlineData: { data: cleanBase64(referenceBase64), mimeType: 'image/png' } },
    { text: systemPrompt }
  ];

  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 800));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateMockup = async (
  apiKey: string,
  designBase64: string,
  targetProduct: string | null,
  productType: string,
  material: string,
  userPrompt: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `ROLE: Mockup Artist. TASK: Apply design (Input 1) onto ${productType} (${material}).`;
  const parts: any[] = [{ inlineData: { data: cleanBase64(designBase64), mimeType: 'image/png' } }];
  if (targetProduct) parts.push({ inlineData: { data: cleanBase64(targetProduct), mimeType: 'image/png' } });
  parts.push({ text: systemPrompt });

  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateSocialCaptions = async (
  apiKey: string,
  imageBase64: string,
  platforms: SocialPlatform[],
  context: string = "",
  options: CaptionOptions
): Promise<SocialCaptions> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate distinct social captions for: ${platforms.join(', ')}. Context: "${context}". Tone: ${options.tone}. Return JSON.`;
  const properties: Record<string, any> = {};
  const requiredFields: string[] = [];
  if (platforms.includes('instagram')) { properties.instagram = { type: Type.STRING }; requiredFields.push('instagram'); }
  if (platforms.includes('tiktok')) { properties.tiktok = { type: Type.STRING }; requiredFields.push('tiktok'); }
  if (platforms.includes('facebook')) { properties.facebook = { type: Type.STRING }; requiredFields.push('facebook'); }
  if (platforms.includes('twitter')) { properties.twitter = { type: Type.STRING }; requiredFields.push('twitter'); }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } }, { text: prompt }] },
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties, required: requiredFields } }
    });
    return JSON.parse(response.text || '{}') as SocialCaptions;
  } catch (error) {
    throw error;
  }
};

export const generateUGCVideoPlan = async (apiKey: string, request: UGCPlanRequest): Promise<UGCVideoPlan> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Create a viral video plan for ${request.platform}. Niche: ${request.niche}. Return JSON.`;
  const parts: any[] = [{ text: prompt }];
  if (request.imageBase64) parts.unshift({ inlineData: { data: cleanBase64(request.imageBase64), mimeType: 'image/png' } });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, viralHook: { type: Type.STRING }, scenes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timeRange: { type: Type.STRING }, visual: { type: Type.STRING }, audio: { type: Type.STRING } } } }, caption: { type: Type.STRING }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }, postingTips: { type: Type.STRING } } } }
    });
    return JSON.parse(response.text || '{}') as UGCVideoPlan;
  } catch (error) {
    throw error;
  }
};

export const initSupportChat = (apiKey: string): Chat => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: "Help users navigate Creator Vault Studio." },
  });
};