import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio, SkinFinish, NailStyle, HairStyle } from '../types';

const API_KEY = process.env.API_KEY || '';

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
          imageConfig: {
            aspectRatio: aspectRatio,
          }
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    });
  } catch (e) {
    console.error("Single generation failed", e);
    return null;
  }
};

// Twinly Editor Logic
export const generateEditedImage = async (
  imageBase64: string, 
  mimeType: string, 
  userPrompt: string,
  applyToAll: boolean = true,
  enhancements: CosmeticEnhancements,
  aspectRatio: AspectRatio = '1:1',
  customBackgroundBase64?: string | null
): Promise<string[]> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Format hairstyle string for prompt
  const targetHair = enhancements.hairStyle !== 'default' 
    ? enhancements.hairStyle.replace(/_/g, ' ') 
    : null;

  const protectionPrompt = `
    ROLE: Forensic Identity Specialist & High-End Portrait Photographer.
    TASK: Re-contextualize the subjects into a new scene while maintaining 100% forensic fidelity to their original appearances.

    USER_INSTRUCTION: "${userPrompt}"

    *** CRITICAL PROTOCOL: MULTI-SUBJECT IDENTITY ISOLATION ***
    - **INDIVIDUAL PROCESSING**: Detect EACH person in the image as a separate entity. 
    - **RACE & ETHNICITY LOCK**: You must strictly preserve the unique race, ethnicity, and skin tone of EACH individual independently. 
    - **ANTI-HOMOGENIZATION (MIXED GROUPS)**: If the image contains people of different races or skin tones (e.g., a dark-skinned parent and a light-skinned child, or a mixed-race couple), **DO NOT** match their skin tones. 
        - Subject A must retain Subject A's exact skin tone (e.g., Deep Ebony).
        - Subject B must retain Subject B's exact skin tone (e.g., Light Olive).
        - **DO NOT BLEND THEM.** It is critical to show the contrast in skin tones exactly as they appear in the source.
    - **ABSOLUTE PROHIBITION**: Do not darken light skin or lighten dark skin to match other subjects in the photo.

    *** PROTOCOL 2: FACIAL STRUCTURE HARD-LOCK ***
    - Maintain exact facial structure, eye shape, nose shape, and bone structure for EVERY person.
    - Do not "beautify" features in a way that alters ethnicity or identity.
    - TrueTone™: Preserve exact melanin values and undertones for each individual.

    *** PROTOCOL 3: STYLING & ATMOSPHERE ***
    - Skin Finish: ${enhancements.skinFinish}
    - ${enhancements.teethWhitening ? 'Teeth: Natural White.' : ''}
    - ${enhancements.eyeBrightening ? 'Eyes: Bright & Clear.' : ''}
    
    ${enhancements.makeupMode ? `
    - **MAKEUP PROTOCOL (HIGH-END GLAMOUR)**:
      1. **STYLE**: Apply "Soft Luxury Glam". Think red-carpet natural. Defined lashes, eyeliner, subtle contour, and satin/gloss lips.
      2. **SUBTLETY**: Makeup must enhance, not mask. It should look like the subject's best version of themselves, not a face-paint overlay.
      3. **IDENTITY PRESERVATION**: Do NOT alter eye shape (e.g., fox-eye trend) or lip size/shape.
      4. **SKIN TONE SAFETY**: Foundation and contour must perfectly match the subject's natural undertones. No "whitewashing" or "bronzing" that shifts ethnicity.
    ` : '- Makeup: Natural, clean, fresh-faced.'}
    
    ${targetHair ? `
    - **HAIR TRANSFORMATION PROTOCOL**:
      1. **TARGET STYLE**: Change hairstyle to "${targetHair}".
      2. **HAIRLINE ANCHORING**: You must maintain the subject's **original hairline exactly**. Do not lower or raise the forehead line. The new hair must grow from the existing scalp boundary.
      3. **SKIN TONE PRESERVATION**: Changing hair MUST NOT affect the face's skin tone. 
         - If the subject is Dark-Skinned and the new hair is Blonde, the skin MUST remain Dark.
         - If the subject is Light-Skinned and the new hair is Black, the skin MUST remain Light.
         - **Do not blend** hair color into skin tone.
      4. **REALISM**: Ensure realistic shadowing where hair meets skin.` 
    : '- Keep natural hair texture and style unless instructed otherwise.'}

    OUTPUT: Photorealistic, High-Definition, Identity-Accurate.
  `;

  const parts: any[] = [
    { inlineData: { data: cleanBase64(imageBase64), mimeType: mimeType } }
  ];

  if (customBackgroundBase64) {
    parts.push({ inlineData: { data: cleanBase64(customBackgroundBase64), mimeType: 'image/png' } });
  }

  parts.push({ text: protectionPrompt });

  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

// Creator Studio, UGC Studio & Virtual Try-On Logic
export const generateCompositeImage = async (
  subjectBase64: string,
  referenceBase64: string, // Product or Outfit
  mode: 'CREATOR' | 'TRYON' | 'UGC',
  userPrompt: string,
  aspectRatio: AspectRatio = '3:4'
): Promise<string[]> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let systemPrompt = "";

  if (mode === 'CREATOR') {
    systemPrompt = `
      ROLE: Commercial Product Photographer.
      TASK: Create a high-end marketing image.
      
      INPUT 1: The Model (Facial Identity & Body Type).
      INPUT 2: The Product (Object to be featured).
      
      INSTRUCTION:
      - Generate the Model holding, using, or interacting with the Product.
      - SCENE: ${userPrompt || "Minimalist luxury studio setting"}.
      - CRITICAL: Keep Model's face/identity exactly as Input 1.
      - CRITICAL: Keep Product appearance exactly as Input 2.
      - Lighting: Professional commercial lighting.
    `;
  } else if (mode === 'UGC') {
    systemPrompt = `
      ROLE: Social Media Influencer & UGC Content Creator.
      TASK: Create a viral, authentic, 'User Generated Content' style image.
      
      INPUT 1: The Influencer (Facial Identity).
      INPUT 2: The Product (Item to promote).
      
      INSTRUCTION:
      - VIBE: Authentic, candid, high-quality iPhone aesthetic, TikTok/Instagram ready.
      - SCENE: ${userPrompt || "Aesthetic lifestyle setting, golden hour, or modern home"}.
      - ACTION: The Influencer is holding/using the product in a natural, convincing way (e.g., POV, mirror selfie style, or casual lifestyle shot).
      - LIGHTING: Natural window light or Ring light. 
      - CRITICAL: Face must match Input 1. Product must match Input 2.
    `;
  } else {
    // TRYON
    systemPrompt = `
      ROLE: Elite Virtual Tailor & Forensic Identity Specialist.
      TASK: Superimpose the Outfit (Input 2) onto the Model (Input 1) with ZERO alteration to the Model's face, skin tone, or body type.
      
      INPUT 1: The Model(s). (Reference for Face, Skin, Body Shape).
      INPUT 2: The Outfit. (Reference for Clothing).
      
      USER_NOTES (STYLING): ${userPrompt}
      
      *** STRICT IDENTITY & RACE PROTECTION PROTOCOL ***
      1. MULTI-SUBJECT ISOLATION: If multiple people are in Input 1, treat them as separate individuals. 
      2. MIXED-RACE PROTECTION: If Input 1 contains people of different races (e.g., Parent/Child), you must preserve the distinct skin tone of EACH person. Do not make them look like the same race if they are not.
      3. FACE LOCK: The face in the output MUST be a pixel-perfect match to Input 1. Do not "re-imagine" the person.
      4. SKIN TONE LOCK: Preserve the exact melanin, undertones, and skin texture of EACH person in Input 1. Do not lighten, darken, or smooth the skin.
      5. BODY SHAPE LOCK: Keep the model's exact body proportions. Only change the fabric covering them.
      
      INSTRUCTION:
      - Dress the subject in Input 1 with the outfit from Input 2.
      - If Input 1 has multiple people, dress them all according to the style of Input 2.
      - Maintain the original lighting on the face to ensure it looks authentic.
      - If the pose needs to adjust slightly for the clothes, keep the head angle and expression identical to Input 1.
    `;
  }

  const parts = [
    { inlineData: { data: cleanBase64(subjectBase64), mimeType: 'image/png' } },
    { inlineData: { data: cleanBase64(referenceBase64), mimeType: 'image/png' } },
    { text: systemPrompt }
  ];

  // Generate 4 variations
  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateMockup = async (
  designBase64: string,
  targetProduct: string | null, // If null, user relies on text prompt
  productType: string, // "T-Shirt", "Mug", etc.
  material: string, // "Cotton", "Ceramic"
  userPrompt: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string[]> => {
  if (!API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemPrompt = `
    ROLE: High-End Product Photographer & Mockup Specialist.
    TASK: Apply the graphical design (Input 1) onto a specific product substrate.

    INPUT 1: The Design/Logo (Graphic Art).
    ${targetProduct ? "INPUT 2: The Blank Product Base (Target Object)." : ""}
    
    PRODUCT DETAILS:
    - Item: ${productType}
    - Material: ${material}
    - Scene/Vibe: ${userPrompt || "Minimalist studio lighting, clean background"}

    EXECUTION RULES:
    1. **GEOMETRIC WARPING**: The Design (Input 1) must warp perfectly to match the curvature and perspective of the product.
    2. **TEXTURE INTEGRATION**: The design must look "printed on" the material, not floating above it. Apply grain, fabric weave, or reflection gloss as dictated by the Material type.
    3. **LIGHTING & SHADOW**: Cast natural shadows *over* the design where the product folds or curves.
    4. **SCALE**: Place the design in a realistic print area for this product type.
    
    OUTPUT: A photorealistic product photograph.
  `;

  const parts: any[] = [
    { inlineData: { data: cleanBase64(designBase64), mimeType: 'image/png' } }
  ];

  if (targetProduct) {
    parts.push({ inlineData: { data: cleanBase64(targetProduct), mimeType: 'image/png' } });
  }

  parts.push({ text: systemPrompt });

  const promises = Array(4).fill(null).map(async (_, index) => {
    if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
    return generateSingleImage(ai, parts, aspectRatio);
  });
  
  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

export const generateSocialCaptions = async (
  imageBase64: string,
  platforms: SocialPlatform[],
  context: string = "",
  options: CaptionOptions
): Promise<SocialCaptions> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Build the requirements text based on selected platforms and options
  let requirementsText = "";
  const emojiInstruction = options.includeEmojis ? "Use relevant emojis generously." : "STRICTLY NO EMOJIS.";
  const hashtagInstruction = options.includeHashtags ? "Include 5-10 relevant hashtags." : "STRICTLY NO HASHTAGS.";
  
  if (platforms.includes('instagram')) {
    requirementsText += `\n- **Instagram**: Aesthetic. ${emojiInstruction} ${hashtagInstruction} Spacing for readability. Focus on visual description/lifestyle.`;
  }
  if (platforms.includes('tiktok')) {
    requirementsText += `\n- **TikTok**: Short, punchy, trend-aware. ${emojiInstruction} ${hashtagInstruction} First person POV often works best.`;
  }
  if (platforms.includes('facebook')) {
    requirementsText += `\n- **Facebook**: Engaging, slightly longer form, community-focused. ${emojiInstruction} ${options.includeHashtags ? "Limit to 1-2 hashtags." : "No hashtags."}`;
  }
  if (platforms.includes('twitter')) {
    requirementsText += `\n- **X (Twitter)**: Short (under 280 chars), witty or provocative. ${options.includeEmojis ? "Minimal emojis." : "No emojis."} ${options.includeHashtags ? "Max 1-2 hashtags." : "No hashtags."}`;
  }

  const prompt = `
    Analyze the uploaded image and generate distinct social media captions tailored to specific platforms.
    
    Image Context provided by user: "${context}"

    Selected Platforms to Generate For: ${platforms.join(', ')}
    
    GLOBAL SETTINGS:
    - Writing Tone: ${options.tone}
    - Include Hashtags: ${options.includeHashtags}
    - Include Emojis: ${options.includeEmojis}

    Requirements per platform:${requirementsText}
    
    Return the response in valid JSON format corresponding to the requested platforms.
  `;

  // Dynamically build schema
  const properties: Record<string, any> = {};
  const requiredFields: string[] = [];

  if (platforms.includes('instagram')) {
    properties.instagram = { type: Type.STRING };
    requiredFields.push('instagram');
  }
  if (platforms.includes('tiktok')) {
    properties.tiktok = { type: Type.STRING };
    requiredFields.push('tiktok');
  }
  if (platforms.includes('facebook')) {
    properties.facebook = { type: Type.STRING };
    requiredFields.push('facebook');
  }
  if (platforms.includes('twitter')) {
    properties.twitter = { type: Type.STRING };
    requiredFields.push('twitter');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: cleanBase64(imageBase64), mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: properties,
          required: requiredFields
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SocialCaptions;
    }
    throw new Error("No text response from model");
  } catch (error) {
    console.error("Caption generation failed", error);
    throw error;
  }
};