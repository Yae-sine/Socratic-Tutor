import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Sender } from "../types";

// Using gemini-3-pro-preview as requested for complex reasoning
const MODEL_NAME = "gemini-3-pro-preview";

// System instruction to enforce Socratic method
export const SYSTEM_INSTRUCTION = `
You are a compassionate, Socratic AI math tutor. Your goal is to help the student learn and understand, not just to provide answers.

Rules:
1. When the user presents a problem (text or image), DO NOT solve it completely immediately.
2. Identify the first logical step to solve the problem.
3. Explain the goal of this specific step conceptually.
4. Ask the user if they can try that step or if they understand the concept.
5. If the user asks "Why?" or seeks clarification, provide a BRIEF, FOCUSED explanation of the specific mathematical concept needed for the CURRENT step. Ensure the explanation is directly tied to the context of the problem being solved. Avoid generic lectures.
6. Be patient, encouraging, and use clear language.
7. Use Markdown to format math equations nicely (e.g., bolding variables, using code blocks for complex expressions if needed, though standard text representation is preferred for readability unless complex).
8. Never be condescending. Treat mistakes as learning opportunities.
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  currentHistory: Message[],
  newMessageText: string,
  attachment?: { mimeType: string; data: string }
): Promise<string> => {
  try {
    // 1. Convert local Message history to Gemini API Content format
    const contents: Content[] = currentHistory.map((msg) => {
      const parts: Part[] = [];
      
      // If there was an attachment in history, add it
      if (msg.attachment) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType,
            data: msg.attachment.data,
          },
        });
      }
      
      // Add text part
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.sender === Sender.USER ? "user" : "model",
        parts: parts,
      };
    });

    // 2. Add the NEW message to the contents
    const newParts: Part[] = [];
    if (attachment) {
      newParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data,
        },
      });
    }
    newParts.push({ text: newMessageText });

    contents.push({
      role: "user",
      parts: newParts,
    });

    // 3. Call generateContent with thinking configuration
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // High thinking budget for complex math reasoning as requested
        thinkingConfig: {
            thinkingBudget: 32768
        }
      },
    });

    return response.text || "I'm having trouble thinking about that right now. Could you try rephrasing?";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};
