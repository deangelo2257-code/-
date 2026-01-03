import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, Era, Difficulty } from "../types";

// Vite's 'define' will replace process.env.API_KEY at build time.
// This declaration satisfies TypeScript.
declare const process: {
  env: {
    API_KEY: string;
  };
};

export const generateHistoryCards = async (era: Era, difficulty: Difficulty): Promise<Flashcard[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 환경변수나 .env 파일을 확인해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const difficultyPrompt = {
    [Difficulty.LOW]: "누구나 알 법한 아주 기본적인 역사적 사실과 인물 위주로",
    [Difficulty.MEDIUM]: "실제 수능 시험 수준의 표준적인 난이도로",
    [Difficulty.HIGH]: "지엽적인 사실이나 복합적인 흐름을 파악해야 하는 고난도 킬러 문항 수준으로",
  }[difficulty];

  const eraContext = era === Era.ALL ? "한국사 전 범위" : era;

  const prompt = `당신은 대한민국 수능 한국사 전문가입니다. 
  ${eraContext} 시기에 해당하는 핵심 내용을 바탕으로 단답형 질문 10개를 생성하세요. 
  난이도는 '${difficulty}' 수준이며, 특징은 다음과 같습니다: ${difficultyPrompt}
  
  반드시 다음 형식을 지키세요:
  1. 질문은 명확하고 간결해야 함.
  2. 정답은 1~5단어 이내의 명사형 단답이어야 함.
  3. 해설은 해당 사건/인물의 수능 빈출 포인트를 1~2문장으로 설명함.`;

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
    if (!text) throw new Error("Gemini로부터 응답을 받지 못했습니다.");
    
    const parsedData = JSON.parse(text);
    return parsedData.map((card: any, index: number) => ({
      ...card,
      id: card.id || `card-${Date.now()}-${index}`,
      era: card.era || eraContext
    }));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("API 키가 올바르지 않거나 설정되지 않았습니다.");
    }
    throw new Error("문제 생성 중 오류가 발생했습니다. (네트워크 상태나 API 키를 확인해주세요)");
  }
};