
import React from 'react';
import { Flashcard } from '../types';

interface CardProps {
  card: Flashcard;
  isFlipped: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, isFlipped, onClick }) => {
  return (
    <div 
      className="relative w-full max-w-md h-80 perspective-1000 cursor-pointer group mx-auto"
      onClick={onClick}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border-t-4 border-indigo-600 p-8 flex flex-col justify-center items-center text-center">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
            {card.era}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
            {card.question}
          </h3>
          <p className="mt-8 text-gray-400 text-sm animate-pulse">카드를 클릭하여 정답 확인</p>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-indigo-600 rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center text-center text-white rotate-y-180">
          <div className="mb-4">
            <span className="text-indigo-200 text-sm font-medium">정답</span>
            <h2 className="text-3xl font-black mt-1">{card.answer}</h2>
          </div>
          <div className="w-12 h-1 bg-indigo-400 rounded-full mb-4"></div>
          <p className="text-indigo-50 text-base leading-relaxed overflow-y-auto max-h-40">
            {card.explanation}
          </p>
          <p className="mt-6 text-indigo-300 text-xs">다시 클릭하여 질문 보기</p>
        </div>

      </div>
    </div>
  );
};

export default Card;
