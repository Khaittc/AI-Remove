import { GoogleGenAI } from "@google/genai";

export const removeLogoFromImage = async (
  base64Image: string,
  mimeType: string,
  instructions: string
): Promise<string> => {
  try {
    // Initialize the client inside the function to ensure it picks up the latest API key
    // if the user switches accounts/keys via the UI.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Construct a robust prompt for the model
    const prompt = `Edit this image. ${instructions}. Ensure the removed area is reconstructed naturally to match the surrounding background. Preserve the original image quality and aspect ratio as much as possible. Return only the edited image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract the image from the response
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data returned from the model.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};