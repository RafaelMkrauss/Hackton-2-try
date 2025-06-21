import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface GamificationQuestion {
  id: string;
  question: string;
  category?: string;
}

export interface QuickAnswer {
  id: string;
  questionId: string;
  answer: boolean;
  createdAt: string;
  question: GamificationQuestion;
}

export interface UserStats {
  totalAnswers: number;
  totalReports: number;
  currentStreak: number;
  longestStreak: number;
  needsEvaluation: boolean;
}

export interface ActivityDay {
  date: string;
  hasActivity: boolean;
  activityCount: number;
}

export function useGamification() {
  const [dailyQuestion, setDailyQuestion] = useState<GamificationQuestion | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyQuestion = async () => {
    try {
      const response = await api.get('/gamification/daily-question');
      setDailyQuestion(response.data);
    } catch (error) {
      console.error('Erro ao buscar pergunta diária:', error);
      setDailyQuestion(null);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/gamification/stats');
      setUserStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const submitQuickAnswer = async (questionId: string, answer: boolean) => {
    try {
      await api.post('/gamification/quick-answer', { questionId, answer });
      await fetchDailyQuestion(); // Refresh to get next question
      await fetchUserStats(); // Update stats
      return true;
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      throw error;
    }
  };

  const getActivityCalendar = async (year: number, month: number) => {
    try {
      const response = await api.get(`/gamification/calendar/${year}/${month}`);
      return response.data as ActivityDay[];
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDailyQuestion(), fetchUserStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    dailyQuestion,
    userStats,
    loading,
    submitQuickAnswer,
    getActivityCalendar,
    refreshData: () => Promise.all([fetchDailyQuestion(), fetchUserStats()])
  };
}
