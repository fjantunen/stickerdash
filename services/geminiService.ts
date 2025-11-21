import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const judgeDrawing = async (
  base64Image: string, 
  targetWord: string
): Promise<{ isMatch: boolean; feedback: string }> => {
  
  // Clean the base64 string if it contains metadata
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const prompt = `
    You are a judge in a sticker drawing game. 
    The user was asked to draw: "${targetWord}". 
    Look at the provided image. 
    Does the drawing reasonably resemble a "${targetWord}"? 
    Be encouraging but fair. It doesn't need to be a masterpiece, but it must be recognizable as the target object.
    If it's just a scribble or completely wrong, reject it.
    Provide a short, fun 1-sentence feedback critique explaining why you accepted or rejected it.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      isMatch: {
        type: Type.BOOLEAN,
        description: "True if the drawing looks like the target word, false otherwise.",
      },
      feedback: {
        type: Type.STRING,
        description: "A short, fun critique of the drawing.",
      },
    },
    required: ["isMatch", "feedback"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a fun, slightly eccentric art critic for a sticker company.",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(text);
    return result;

  } catch (error) {
    console.error("Error judging drawing:", error);
    // Fallback in case of API error to avoid getting stuck, though ideally we show an error UI
    return {
      isMatch: false,
      feedback: "I couldn't see that clearly (Technical Error). Try again!"
    };
  }
};
