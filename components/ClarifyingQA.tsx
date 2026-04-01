'use client';

import React, { useState } from 'react';
import type { ClarifyingQuestion, ClarifyingAnswer } from '@/types/case';

interface ClarifyingQAProps {
  questions: ClarifyingQuestion[];
  onComplete: (answers: ClarifyingAnswer[]) => void;
  loading?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  market: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  financials: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  operations: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  competition: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  customer: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
  strategy: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
};

export default function ClarifyingQA({ questions, onComplete, loading = false }: ClarifyingQAProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;
  const canProceed = answeredCount >= 2;
  const current = questions[currentIndex];
  const categoryStyle = CATEGORY_COLORS[current?.category] || CATEGORY_COLORS.strategy;

  const handleNext = () => {
    if (currentAnswer.trim()) {
      setAnswers((prev) => ({ ...prev, [currentIndex]: currentAnswer }));
    }
    setCurrentAnswer(answers[currentIndex + 1] || '');
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrev = () => {
    if (currentAnswer.trim()) {
      setAnswers((prev) => ({ ...prev, [currentIndex]: currentAnswer }));
    }
    setCurrentAnswer(answers[currentIndex - 1] || '');
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: '' }));
    setCurrentAnswer(answers[currentIndex + 1] || '');
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleSubmit = () => {
    // Save current answer
    const finalAnswers = { ...answers };
    if (currentAnswer.trim()) {
      finalAnswers[currentIndex] = currentAnswer;
    }

    // Build the answers array
    const result: ClarifyingAnswer[] = questions
      .map((q, i) => ({
        question: q.question,
        answer: finalAnswers[i]?.trim() || '',
      }))
      .filter((a) => a.answer.length > 0);

    onComplete(result);
  };

  if (!current) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (currentAnswer.trim()) {
                setAnswers((prev) => ({ ...prev, [currentIndex]: currentAnswer }));
              }
              setCurrentAnswer(answers[i] || '');
              setCurrentIndex(i);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-[#c9a84c] scale-125'
                : answers[i]?.trim()
                ? 'bg-emerald-500/60'
                : 'bg-white/10'
            }`}
          />
        ))}
        <span className="ml-3 text-xs font-mono text-[#8896ab]">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Question card */}
      <div className="section-card !border-l-[#3b82f6]" style={{ borderLeftColor: categoryStyle.text.replace('text-', '').includes('blue') ? '#3b82f6' : '#c9a84c' }}>
        <div className="p-6">
          {/* Category badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium uppercase tracking-wider ${categoryStyle.bg} ${categoryStyle.text} mb-4`}
          >
            {current.category}
          </span>

          {/* Question */}
          <h4 className="text-lg text-white font-medium leading-relaxed mb-2">
            {current.question}
          </h4>

          {/* Why important */}
          <p className="text-sm text-[#8896ab] italic mb-6">
            <span className="text-[#c9a84c]">Why this matters:</span> {current.why_important}
          </p>

          {/* Answer input */}
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here... (or skip to let the AI make assumptions)"
            className="w-full min-h-[100px] bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-[#8896ab]/40 focus:outline-none focus:border-[#c9a84c]/40 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all duration-200 resize-none font-body text-sm"
            disabled={loading}
          />

          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 text-sm text-[#8896ab] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={handleSkip}
                disabled={currentIndex === questions.length - 1}
                className="px-3 py-1.5 text-sm text-[#8896ab] hover:text-white transition-colors"
              >
                Skip →
              </button>
            </div>

            <div className="flex gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 text-sm bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-lg transition-all duration-200 border border-white/[0.08]"
                >
                  Next
                </button>
              ) : null}

              <button
                onClick={handleSubmit}
                disabled={!canProceed || loading}
                className={`px-5 py-1.5 text-sm rounded-lg font-medium transition-all duration-300 ${
                  canProceed && !loading
                    ? 'bg-gradient-to-r from-[#c9a84c] to-[#e8d48b] text-[#0a0f1e] hover:shadow-lg hover:shadow-[#c9a84c]/20'
                    : 'bg-white/5 text-[#8896ab] cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Generating Solution...
                  </span>
                ) : (
                  `Generate Solution (${answeredCount} answered)`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Minimum answers hint */}
      {!canProceed && (
        <p className="text-center text-xs text-[#8896ab]/50 mt-4 font-mono">
          Answer at least 2 questions to proceed
        </p>
      )}
    </div>
  );
}
