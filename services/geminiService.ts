
import { GoogleGenAI } from "@google/genai";

export const getAIInsights = async (
  currentWage: number,
  loss4Year: number,
  loss30Year: number,
  weeklyHours: number
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Context: A unionized healthcare worker is comparing two wage proposals (Alliance vs KP).
    Data:
    - Current Wage: $${currentWage}/hr
    - Weekly Hours: ${weeklyHours}
    - 4-Year Contract Cumulative Loss: $${loss4Year.toFixed(0)}
    - 30-Year Career Cumulative Loss: $${loss30Year.toFixed(0)}

    Task:
    Provide a concise (3-4 bullet points), powerful strategic insight on why "front-loading" raises is critical. 
    Explain how the early $${loss4Year.toFixed(0)} gap compounds into the massive $${loss30Year.toFixed(0)} deficit. 
    Use persuasive but professional language suitable for a union communication tool.
    Keep it brief and high-impact.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "The AI analysis is currently unavailable. Focus on the 'Snowball Effect' of front-loaded raises depicted in the charts.";
  }
};
