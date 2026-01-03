
import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, Era, Difficulty, QuizState } from './types';
import { generateHistoryCards } from './services/geminiService';
import Card from './components/Card';

const App: React.FC = () => {
  const [era, setEra] = useState<Era>(Era.ALL);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizState>({
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    score: 0,
    completed: false,
  });

  const loadNewSet = useCallback(async (selectedEra: Era, selectedDifficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const newCards = await generateHistoryCards(selectedEra, selectedDifficulty);
      setQuiz({
        cards: newCards,
        currentIndex: 0,
        isFlipped: false,
        score: 0,
        completed: false,
      });
    } catch (err) {
      setError("문제를 가져오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewSet(Era.ALL, Difficulty.MEDIUM);
  }, [loadNewSet]);

  const handleNext = () => {
    if (quiz.currentIndex < quiz.cards.length - 1) {
      setQuiz(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
      }));
    } else {
      setQuiz(prev => ({ ...prev, completed: true }));
    }
  };

  const handleFlip = () => {
    setQuiz(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
  };

  const currentCard = quiz.cards[quiz.currentIndex];

  const difficultyColors = {
    [Difficulty.LOW]: 'bg-emerald-500',
    [Difficulty.MEDIUM]: 'bg-amber-500',
    [Difficulty.HIGH]: 'bg-rose-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">수능 한국사 FlashMaster</h1>
              <p className="text-xs text-gray-500 font-medium tracking-tight">AI 기반 스마트 학습 플래시카드</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Era Selection */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {[Era.ALL, Era.PRE_MODERN, Era.MODERN].map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEra(e);
                    loadNewSet(e, difficulty);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                    era === e 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {e === Era.ALL ? '전체' : e.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Difficulty Selection */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {[Difficulty.LOW, Difficulty.MEDIUM, Difficulty.HIGH].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d);
                    loadNewSet(era, d);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    difficulty === d 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${difficultyColors[d]} ${difficulty === d ? 'opacity-100' : 'opacity-40'}`}></span>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-bold animate-pulse">
              난이도 [{difficulty}] 수준의 문제를 생성하고 있습니다...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 rounded-2xl shadow-xl p-10 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">문제가 부서졌어요!</h3>
            <p className="text-gray-500 mb-8">{error}</p>
            <button 
              onClick={() => loadNewSet(era, difficulty)}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition"
            >
              다시 연결 시도
            </button>
          </div>
        ) : quiz.completed ? (
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md mx-auto border border-gray-100 mt-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">학습 완료!</h2>
            <div className="mb-8 p-4 bg-gray-50 rounded-xl inline-block w-full">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">학습 요약</p>
              <p className="text-gray-700 font-medium">시대: {era}</p>
              <p className="text-gray-700 font-medium">난이도: {difficulty}</p>
              <p className="text-gray-700 font-medium">풀이 수: {quiz.cards.length}개</p>
            </div>
            <button 
              onClick={() => loadNewSet(era, difficulty)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              같은 조건으로 다시 풀기
            </button>
          </div>
        ) : currentCard ? (
          <div className="flex flex-col gap-10">
            {/* Progress Bar Container */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase">Step</span>
                  <span className="text-lg font-black text-gray-900">{quiz.currentIndex + 1} <span className="text-gray-400 font-medium text-sm">/ {quiz.cards.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${difficultyColors[difficulty]}`}></span>
                   <span className="text-sm font-bold text-gray-600">{difficulty} 난이도</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
                  style={{ width: `${((quiz.currentIndex + 1) / quiz.cards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flashcard Area */}
            <div className="py-2">
              <Card card={currentCard} isFlipped={quiz.isFlipped} onClick={handleFlip} />
            </div>

            {/* Controls */}
            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={handleNext}
                disabled={!quiz.isFlipped}
                className={`w-full max-w-sm py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 ${
                  quiz.isFlipped 
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {quiz.currentIndex === quiz.cards.length - 1 ? '전체 학습 완료' : '다음 문제로 넘어가기'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="text-center">
                 <p className="text-gray-400 text-sm font-medium">TIP: 카드를 클릭해 정답과 상세 해설을 확인하세요.</p>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default App;
