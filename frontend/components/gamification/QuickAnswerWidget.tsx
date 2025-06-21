'use client'

import { useState } from 'react';
import { useGamification, GamificationQuestion } from '@/lib/hooks/useGamification';
import { CheckIcon, XIcon, MessageSquareIcon } from 'lucide-react';

interface QuickAnswerCardProps {
  question: GamificationQuestion;
  onAnswered?: () => void;
}

export function QuickAnswerCard({ question, onAnswered }: QuickAnswerCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { submitQuickAnswer } = useGamification();

  const handleAnswer = async (answer: boolean) => {
    if (isSubmitting || answered) return;

    setIsSubmitting(true);
    try {
      await submitQuickAnswer(question.id, answer);
      setAnswered(true);
      if (onAnswered) onAnswered();
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (answered) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-green-700">
          <CheckIcon className="w-5 h-5" />
          <span className="font-medium">Pergunta respondida!</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          Obrigado por participar! Sua opinião ajuda a melhorar nossa cidade.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
          <MessageSquareIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">Pergunta Rápida</h3>
          <p className="text-gray-700 mb-4">{question.question}</p>
          {question.category && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-3">
              {question.category}
            </span>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswer(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              aria-label="Responder Sim"
            >
              <CheckIcon className="w-4 h-4" />
              Sim
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              aria-label="Responder Não"
            >
              <XIcon className="w-4 h-4" />
              Não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickAnswerWidgetProps {
  className?: string;
}

export function QuickAnswerWidget({ className = '' }: QuickAnswerWidgetProps) {
  const { dailyQuestion, loading } = useGamification();

  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!dailyQuestion) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <MessageSquareIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="font-medium">Todas as perguntas respondidas!</p>
          <p className="text-sm">Volte amanhã para mais perguntas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <QuickAnswerCard question={dailyQuestion} />
    </div>
  );
}
