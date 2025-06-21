'use client'

import { useGamification } from '@/lib/hooks/useGamification';
import { 
  TrophyIcon, 
  FlameIcon, 
  MessageSquareIcon, 
  FileTextIcon,
  CalendarIcon,
  TrendingUpIcon
} from 'lucide-react';

interface GamificationStatsProps {
  className?: string;
}

export function GamificationStats({ className = '' }: GamificationStatsProps) {
  const { userStats, loading } = useGamification();

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return null;
  }

  const stats = [
    {
      icon: FlameIcon,
      label: 'Streak Atual',
      value: userStats.currentStreak,
      suffix: userStats.currentStreak === 1 ? 'dia' : 'dias',
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      icon: TrophyIcon,
      label: 'Maior Streak',
      value: userStats.longestStreak,
      suffix: userStats.longestStreak === 1 ? 'dia' : 'dias',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      icon: MessageSquareIcon,
      label: 'Respostas',
      value: userStats.totalAnswers,
      suffix: userStats.totalAnswers === 1 ? 'pergunta' : 'perguntas',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: FileTextIcon,
      label: 'Relatórios',
      value: userStats.totalReports,
      suffix: userStats.totalReports === 1 ? 'relatório' : 'relatórios',
      color: 'text-green-600',
      bg: 'bg-green-100'
    }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUpIcon className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Suas Estatísticas</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 text-center"
            >
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.bg} mb-2`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.suffix}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {userStats.needsEvaluation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="font-medium text-sm">Avaliação Pendente</span>
          </div>
          <p className="text-blue-600 text-xs">
            Complete sua avaliação trimestral para ganhar pontos extras!
          </p>
        </div>
      )}
    </div>
  );
}
