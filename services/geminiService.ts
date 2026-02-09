
import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createAiChat(context: string): Chat {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are a professional educational assistant for the EduStream Pro platform. 
      Your goal is to help students understand complex concepts, debug code, and provide guidance on their learning path.
      
      Topic context for this session: ${context}
      
      Guidelines:
      - Provide concise, encouraging, and highly technical explanations.
      - Use Markdown for formatting code snippets, lists, and key points.
      - If you don't know something, be honest.
      - Maintain a mentor-like, supportive tone.`,
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 } // Standard chat, no heavy reasoning budget needed unless requested
    },
  });
}

export async function askAiTutor(question: string, context: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a professional educational assistant for a student platform. 
      Topic context: ${context}
      Student question: ${question}`,
      config: {
        systemInstruction: "Provide concise, encouraging, and highly technical explanations. Use Markdown for formatting code snippets or key points.",
        temperature: 0.7,
      }
    });
    return response.text || "I'm sorry, I couldn't generate a response right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI Tutor is currently resting. Please try again in a moment.";
  }
}
