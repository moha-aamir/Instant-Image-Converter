
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const enhanceImageAI = async (base64Data: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("No API Key found for Gemini");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // We use gemini-2.5-flash-image for image-to-image tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: 'Re-render this image with professional studio quality, sharp details, and high fidelity. Enhance the clarity and remove compression artifacts. Return the enhanced image directly.',
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return null;
  }
};

export const analyzeImageAI = async (base64Data: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: 'Briefly describe the visual content of this image in one short sentence.' },
        ],
      },
    });
    return response.text || "Image analyzed.";
  } catch (e) {
    return "Could not analyze image.";
  }
};
