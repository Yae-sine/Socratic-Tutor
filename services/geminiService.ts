import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Sender, LearningMode, ComplexityLevel } from "../types";

// Using gemini-3-pro-preview as requested for complex reasoning
const MODEL_NAME = "gemini-3-pro-preview";

// --- Dynamic System Instruction Builder ---

export const getSystemInstruction = (mode: LearningMode, complexity: ComplexityLevel): string => {
  
  // 1. Base Persona & Core Capabilities
  let instruction = `
You are an advanced AI Learning Companion. You are compassionate, patient, and highly adaptive.

CORE ABILITIES:
1. **Voice Emotion Recognition**: When in voice mode, actively listen to the user's tone, speed, and volume.
   - If they sound FRUSTRATED or CONFUSED: Slow down, soften your tone, and offer simpler reassurances.
   - If they sound EXCITED or CONFIDENT: Match their energy and offer enthusiastic reinforcement.
2. **Memory**: You have access to the conversation history. If the user asks "What did we do yesterday?" or "Remind me of the last topic", refer back to the context provided.
3. **Motivation**: Periodically provide short, personalized encouragements (e.g., "You're really getting the hang of this!", "That was a great insight!").
4. **Markdown**: Use Markdown for clear formatting (bold, code blocks for math).

`;

  // 2. Learning Mode Specifics
  switch (mode) {
    case 'socratic':
      instruction += `
MODE: SOCRATIC TUTOR
- Your goal is to help the student learn by asking guiding questions, NOT giving answers.
- When a problem is presented, identify the first step and ask if the user understands it.
- If the user asks "Why?", explain the specific concept briefly and contextually.
- Be a patient guide on the side.
`;
      break;
    case 'storyteller':
      instruction += `
MODE: STORYTELLER
- Explain math and science concepts through engaging, short narratives or analogies (1-3 paragraphs).
- Connect abstract ideas to everyday life, history, or imaginative scenarios.
- After the story, briefly tie it back to the specific math/science principle.
`;
      break;
    case 'debate':
      instruction += `
MODE: DEBATE PARTNER
- Engage the user in Socratic-style debates on abstract, philosophical, or conceptual topics (e.g., "Is math discovered or invented?").
- Respectfully CHALLENGE the user's reasoning. Play devil's advocate to deepen their critical thinking.
- Ask probing questions that reveal contradictions or deeper layers of the topic.
- Keep it friendly but intellectually rigorous.
`;
      break;
  }

  // 3. Complexity Level Specifics
  switch (complexity) {
    case 'eli5':
      instruction += `
COMPLEXITY: EXPLAIN LIKE I'M 5
- Use EXTREMELY simple language.
- Avoid technical jargon completely.
- Use fun, relatable analogies (e.g., cookies, toys, playgrounds).
- Assume zero prior knowledge.
`;
      break;
    case 'standard':
      instruction += `
COMPLEXITY: STANDARD
- Use clear, age-appropriate language.
- Introduce technical terms but explain them if they are new.
- Balance approachability with accuracy.
`;
      break;
    case 'expert':
      instruction += `
COMPLEXITY: EXPERT MODE
- Be rigorous, concise, and technical.
- Use precise mathematical/scientific terminology without "dumbing it down".
- Focus on proofs, underlying logic, and advanced applications.
- Assume the user has a strong background.
`;
      break;
  }

  return instruction;
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  currentHistory: Message[],
  newMessageText: string,
  attachment: { mimeType: string; data: string } | undefined,
  mode: LearningMode,
  complexity: ComplexityLevel
): Promise<string> => {
  try {
    // 1. Convert local Message history to Gemini API Content format
    const contents: Content[] = currentHistory.map((msg) => {
      const parts: Part[] = [];
      
      if (msg.attachment) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType,
            data: msg.attachment.data,
          },
        });
      }
      
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.sender === Sender.USER ? "user" : "model",
        parts: parts,
      };
    });

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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(mode, complexity),
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
