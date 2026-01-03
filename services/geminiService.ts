
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, Era, Difficulty } from "../types";

// Declare process for TypeScript to satisfy the compiler during the build process
declare const process: {
  env: {
    API_KEY: string;
  };
};

export const generateHistoryCards = async (era: Era, difficulty: Difficulty): Promise<Flashcard[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const difficultyPrompt = {
    [Difficulty.LOW]: "누구나 알 법한 아주 기본적인 역사적 사실과 인물 위주로",
    [Difficulty.MEDIUM]: "실제 수능 시험 수준의 표준적인 난이도로",
    [Difficulty.HIGH]: "지엽적인 사실이나 복합적인 흐름을 파악해야 하는 고난도 킬러 문항 수준으로",
  }[difficulty];

  const prompt = `한국 대학 수학능력시험(수능) 한국사 기출 패턴을 분석하여, ${era} 시기에 해당하는 핵심 단답형 질문 10개를 생성해줘. 
  난이도는 '${difficulty}' 수준으로, ${difficultyPrompt} 구성해줘.
  질문은 명확해야 하며, 답은 1~5단어 이내의 단답형이어야 함. 
  각 카드마다 짧은 핵심 설명을 포함해줘.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              era: { type: Type.STRING },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["id", "era", "question", "answer", "explanation"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating cards:", error);
    throw error;
  }
};
