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

  // Format hairstyle string for prompt
  const targetHair = enhancements.hairStyle !== 'default' 
    ? enhancements.hairStyle.replace(/_/g, ' ') 
    : null;
    
  const targetColor = enhancements.hairColor !== 'default'
    ? enhancements.hairColor.replace(/_/g, ' ')
    : null;

  const targetFacialHair = enhancements.facialHair !== 'default'
    ? enhancements.facialHair.replace(/_/g, ' ')
    : null;

  const targetTexture = enhancements.hairTexture !== 'default'
    ? enhancements.hairTexture.replace(/_/g, ' ')
    : null;

  const targetSubjectRaw = enhancements.hairTarget || 'everyone';
  const targetSubject = targetSubjectRaw.replace(/_/g, ' ');

  const protectionPrompt = `
    ROLE: Forensic Identity Specialist & High-End Portrait Photographer.
    TASK: Edit the image based on instructions while strictly maintaining the identity of the subjects.

    USER_INSTRUCTION: "${userPrompt}"

    *** CRITICAL: ZERO FACIAL VARIATION POLICY ***
    1. **IDENTITY LOCK**: The facial structure (eyes, nose, mouth, jaw, head shape) must be a 100% match to the source image.
    2. **NO RESHAPING**: Do not slim the face, do not change eye size, do not alter age.
    3. **CONSISTENCY**: Across all generated variations, the person's face must look identical. Variations should ONLY apply to the background, lighting, or requested hair/clothing changes.
    4. **SOURCE TRUTH**: The input image is the absolute reference. Do not "imagine" a better face. Use the one provided.

    *** PROTOCOL: MULTI-SUBJECT & SKIN TONE ***
    - **INDIVIDUAL PROCESSING**: Treat each person as a separate protected entity.
    - **SKIN TONE FIDELITY**: Strictly preserve the specific melanin and undertones of EACH person. 
    - **MIXED COUPLES/FAMILIES**: Do not homogenize skin tones. If one person is dark and one is light, maintain that exact contrast.

    *** STYLING INSTRUCTIONS ***
    - Skin Finish: ${enhancements.skinFinish}
    - ${enhancements.teethWhitening ? 'Teeth: Natural White.' : ''}
    - ${enhancements.eyeBrightening ? 'Eyes: Bright & Clear.' : ''}
    
    ${enhancements.makeupMode ? `
    - **MAKEUP**: Soft Luxury Glam enhancing natural features. Foundation must match natural skin tone exactly.
    ` : '- Makeup: Natural, clean.'}
    
    ${(targetHair || targetColor || targetFacialHair || targetTexture) ? `
    - **HAIR TRANSFORMATION INSTRUCTIONS**:
      - **Target Group**: ${targetSubject.toUpperCase()} ONLY.
      - **New Style**: ${targetHair || 'Maintain structure'}.
      - **New Color**: ${targetColor || 'Maintain color'}.
      - **New Texture**: ${targetTexture || 'Maintain texture'}.
      - **Facial Hair**: ${targetFacialHair || 'Maintain existing'} (Men only).
      - **CONSTRAINT**: Ensure the new hair respects the subject's original hairline and head volume. Do not distort the skull to fit the hair.
    ` : '- Keep natural hair texture, color, and style.'}

    OUTPUT REQUIREMENT: Photorealistic, High-Definition, Identity-Accurate.
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
  apiKey: string,
  subjectBase64: string,
  referenceBase64: string, // Product or Outfit
  mode: 'CREATOR' | 'TRYON' | 'UGC',
  userPrompt: string,
  aspectRatio: AspectRatio = '3:4'
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

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
    // TRYON - AGGRESSIVE REPLACEMENT & MULTI-SUBJECT HANDLING
    
    // Auto-Scene Logic if prompt is empty
    const backgroundInstruction = userPrompt.trim() 
      ? `USER SCENE REQUEST: "${userPrompt}"` 
      : `AUTO-SCENE: Generate a high-quality background that perfectly matches the aesthetic of the Clothing in Input 2 (e.g., if formal -> luxury hall, if casual -> city/park). Do NOT use the background from Input 1 or Input 2.`;

    systemPrompt = `
      ROLE: Advanced Virtual Tailor & Fashion Compositor.
      TASK: Perform a COMPLETE CLOTHING SWAP on ALL subjects in the photo.

      --- INPUTS ---
      INPUT 1 (THE SUBJECTS): The users/people. (Primary Source for Face/Body/Pose).
      INPUT 2 (THE CLOTHING): The reference garment(s). (Primary Source for Texture/Style).

      --- CRITICAL EXECUTION RULES ---
      1. **SUBJECT PRIORITY**: The people in the output MUST be the exact people from Input 1.
      2. **MULTI-PERSON HANDLING**: Detect EVERY person in Input 1. Apply the clothing style from Input 2 to ALL of them. 
         - If Input 2 is a single item, adapt it to create matching outfits for everyone (e.g., Mom & Kid matching sets, or Couple matching vibes).
      3. **CLOTHING REPLACEMENT**: Completely replace the original outfits of Input 1.
         - Do NOT just recolor. Map the texture, pattern, and cut of Input 2 onto the bodies of Input 1.
      4. **FULL BODY FRAMING**: Ensure the output shows enough of the body to display the outfit clearly.
         - If Input 1 is a close-up, attempt to generate a 3/4 view to showcase the garment, while keeping the head/face identical.
      
      --- BACKGROUND & SCENE ---
      ${backgroundInstruction}
      - The background must be new and immersive.
      - DO NOT copy the background from Input 1.
      - DO NOT copy the background from Input 2 (especially if it is a studio mockup).

      --- STRICT PRESERVATION ---
      - FACIAL IDENTITY: Locked to Input 1.
      - SKIN TONE: Locked to Input 1.
      - POSE: Generally follow Input 1's pose, but optimize frame for showcasing the full outfit.

      OUTPUT: High-resolution shot of the subjects from Input 1 wearing the clothes from Input 2.
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
  apiKey: string,
  designBase64: string,
  targetProduct: string | null, // If null, user relies on text prompt
  productType: string, // "T-Shirt", "Mug", etc.
  material: string, // "Cotton", "Ceramic"
  userPrompt: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

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
  apiKey: string,
  imageBase64: string,
  platforms: SocialPlatform[],
  context: string = "",
  options: CaptionOptions
): Promise<SocialCaptions> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

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

// UGC Bestie Structured Plan Logic
export const generateUGCVideoPlan = async (
  apiKey: string,
  request: UGCPlanRequest
): Promise<UGCVideoPlan> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are UGC Bestie, a viral content strategist. 
    Create a highly engaging short-form video plan.

    User Brief:
    - Niche: ${request.niche}
    - Audience: ${request.audience}
    - Platform: ${request.platform}
    - Length: ${request.length}
    - Tone: ${request.tone}
    - Goal: ${request.goal || "Growth"}
    ${request.imageBase64 ? "- Context: I have uploaded an image. Analyze it and incorporate its features (colors, product type, or setting) into the visual instructions." : ""}

    REQUIREMENTS:
    1. **Viral Hook**: First 3 seconds must be visually or verbally arresting to stop scrolling.
    2. **Scenes**: Break down video into specific time segments. Separate visual instructions from audio/script.
    3. **Optimization**: Tailor the language and style specifically for ${request.platform}.

    Return ONLY JSON.
  `;

  const parts: any[] = [{ text: prompt }];

  if (request.imageBase64) {
    parts.unshift({ inlineData: { data: cleanBase64(request.imageBase64), mimeType: 'image/png' } });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            viralHook: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeRange: { type: Type.STRING, description: "e.g. 0:00-0:03" },
                  visual: { type: Type.STRING, description: "Camera angle, action, or text overlay instructions" },
                  audio: { type: Type.STRING, description: "Spoken script, voiceover line, or sound effect description" }
                }
              }
            },
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            postingTips: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as UGCVideoPlan;
    }
    throw new Error("Failed to generate plan");
  } catch (error) {
    console.error("UGC Plan generation failed", error);
    throw error;
  }
};

// Global Support Bot Logic
export const initSupportChat = (apiKey: string): Chat => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are the **Vault Assistant**, the dedicated AI support agent for **Creator Vault Studio**.
    Your role is to help users navigate the app, explain features, and troubleshoot issues.

    **APP OVERVIEW:**
    Creator Vault Studio is a premium AI photo generation suite with strict identity preservation (TrueTone™).

    **KEY FEATURES (KNOW THESE):**
    1. **Twinly Editor (Flagship)**: For families, couples, and portraits. STRICTLY preserves facial identity using 'Identity Lock'. Features: Hair Studio, Beauty Studio, Background replacement.
    2. **Creator Studio**: For commercial marketing assets. Blends a Model + Product into a professional scene.
    3. **UGC Viral Studio**: For social media content. Creates authentic, influencer-style photos (TikTok/Reels vibe). Includes a Video Planner tool.
    4. **Virtual Wardrobe (Try-On)**: Virtual dressing room. Upload a Person + Outfit to see the fit.
    5. **Merch Studio**: Product mockups. Place a Design/Logo onto Hoodies, Mugs, Packaging, etc.
    6. **Caption AI**: Generates social media captions based on images.
    7. **Style Library**: A collection of high-quality prompts.

    **COMMON TROUBLESHOOTING:**
    - **Face distortion?** Suggest using high-res photos where the face is clearly visible. Ensure 'Twinly Editor' is used for people-focused edits.
    - **Generation failed?** Check API key, internet connection, or try a simpler prompt.
    - **Unrealistic results?** Add keywords like "photorealistic, 8k, highly detailed" to the prompt.

    **TONE:**
    Professional, helpful, concise, and polite. 
    Do not hallucinate features that don't exist.
    If asked about billing/subscriptions, refer them to the Google Gemini API pricing (since this app uses their own key).
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
};