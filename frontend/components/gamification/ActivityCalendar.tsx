'use client'

import { useState, useEffect } from 'react';
import { useGamification, ActivityDay } from '@/lib/hooks/useGamification';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, FlameIcon } from 'lucide-react';

interface ActivityCalendarProps {
  className?: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ActivityCalendar({ className = '' }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const { getActivityCalendar, userStats } = useGamification();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const loadCalendarData = async () => {
      setLoading(true);
      try {
        const data = await getActivityCalendar(year, month);
        setActivityData(data);
      } catch (error) {
        console.error('Erro ao carregar calendário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, [year, month, getActivityCalendar]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];
      const activity = activityData.find(a => a.date === dateStr);
      days.push({
        day,
        hasActivity: activity?.hasActivity || false,
        activityCount: activity?.activityCount || 0,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }

    return days;
  };

  const getActivityColor = (hasActivity: boolean, activityCount: number) => {
    if (!hasActivity) return 'bg-gray-100';
    if (activityCount === 1) return 'bg-green-200';
    if (activityCount === 2) return 'bg-green-400';
    return 'bg-green-600';
  };

  const days = getDaysInMonth();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Calendário de Atividades</h3>
        </div>
        {userStats && (
          <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
            <FlameIcon className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              {userStats.currentStreak} dias
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Mês anterior"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h4 className="font-medium text-gray-900">
          {MONTHS[month - 1]} {year}
        </h4>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Próximo mês"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm rounded ${
                day
                  ? `${getActivityColor(day.hasActivity, day.activityCount)} ${
                      day.isToday ? 'ring-2 ring-blue-500' : ''
                    } hover:scale-110 transition-transform cursor-pointer`
                  : ''
              }`}
              title={
                day && day.hasActivity
                  ? `${day.activityCount} atividade${day.activityCount > 1 ? 's' : ''}`
                  : day
                  ? 'Nenhuma atividade'
                  : ''
              }
            >
              {day && (
                <span className={day.hasActivity ? 'text-white font-medium' : 'text-gray-600'}>
                  {day.day}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Sem atividade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span>1 atividade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>2 atividades</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span>3+ atividades</span>
        </div>
      </div>
    </div>
  );
}
