
export interface Flashcard {
  id: string;
  era: string;
  question: string;
  answer: string;
  explanation: string;
}

export enum Era {
  ALL = '전체',
  PRE_MODERN = '전근대 (선사~조선)',
  MODERN = '근현대 (개항~현대)',
}

export enum Difficulty {
  LOW = '하',
  MEDIUM = '중',
  HIGH = '상',
}

export interface QuizState {
  cards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  score: number;
  completed: boolean;
}
