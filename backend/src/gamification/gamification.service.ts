import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuickAnswerDto, CreateTrimestralEvaluationDto, UpdateTrimestralEvaluationDto } from './dto/gamification.dto';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getActiveQuestions() {
    return this.prisma.gamificationQuestion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async submitQuickAnswer(userId: string, createQuickAnswerDto: CreateQuickAnswerDto) {
    const { questionId, answer } = createQuickAnswerDto;

    // Check if user already answered this question today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingAnswer = await this.prisma.quickAnswer.findFirst({
      where: {
        userId,
        questionId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingAnswer) {
      throw new ConflictException('Você já respondeu esta pergunta hoje');
    }

    // Create quick answer
    const quickAnswer = await this.prisma.quickAnswer.create({
      data: {
        userId,
        questionId,
        answer
      },
      include: {
        question: true
      }
    });

    // Record user activity
    await this.recordUserActivity(userId, 'QUICK_ANSWER', { questionId, answer });

    return quickAnswer;
  }

  async getDailyQuestion(userId: string) {
    // Get a random question that the user hasn't answered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const answeredToday = await this.prisma.quickAnswer.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      select: { questionId: true }
    });

    const answeredQuestionIds = answeredToday.map(a => a.questionId);

    const availableQuestions = await this.prisma.gamificationQuestion.findMany({
      where: {
        isActive: true,
        id: {
          notIn: answeredQuestionIds
        }
      }
    });

    if (availableQuestions.length === 0) {
      return null; // User has answered all questions today
    }

    // Return a random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  async getUserStreak(userId: string) {
    const activities = await this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 365 // Check last year for streak calculation
    });

    if (activities.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Group activities by date
    const activityDates = new Set();
    activities.forEach(activity => {
      const dateStr = activity.date.toDateString();
      activityDates.add(dateStr);
    });    const sortedDates = Array.from(activityDates).sort((a, b) => 
      new Date(b as string).getTime() - new Date(a as string).getTime()
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Check if user was active today or yesterday
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      let checkDate = new Date();
      if (!sortedDates.includes(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (sortedDates.includes(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i] as string);
      const previousDate = new Date(sortedDates[i - 1] as string);
      const daysDiff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  async getActivityCalendar(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Group activities by date
    const activityMap = new Map();
    activities.forEach(activity => {
      const dateStr = activity.date.toISOString().split('T')[0];
      if (!activityMap.has(dateStr)) {
        activityMap.set(dateStr, []);
      }
      activityMap.get(dateStr).push(activity);
    });

    // Create calendar data
    const calendar = [];
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];
      calendar.push({
        date: dateStr,
        hasActivity: activityMap.has(dateStr),
        activityCount: activityMap.get(dateStr)?.length || 0
      });
    }

    return calendar;
  }

  async getUserStats(userId: string) {
    const [totalAnswers, totalReports, streak, currentEvaluation] = await Promise.all([
      this.prisma.quickAnswer.count({ where: { userId } }),
      this.prisma.report.count({ where: { userId } }),
      this.getUserStreak(userId),
      this.getCurrentTrimestralEvaluation(userId)
    ]);

    return {
      totalAnswers,
      totalReports,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      needsEvaluation: !currentEvaluation
    };
  }

  private async getCurrentTrimestralEvaluation(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const trimester = Math.ceil(month / 3);

    return this.prisma.trimestralEvaluation.findUnique({
      where: {
        userId_trimester_year: {
          userId,
          trimester,
          year
        }
      }
    });
  }

  async recordUserActivity(userId: string, activityType: string, metadata?: any) {
    return this.prisma.userActivity.create({
      data: {
        userId,
        activityType,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }

  // Trimestral Evaluation methods
  async createTrimestralEvaluation(userId: string, createEvaluationDto: CreateTrimestralEvaluationDto) {
    const { trimester, year, ratings, generalComment } = createEvaluationDto;

    // Check if evaluation already exists
    const existingEvaluation = await this.prisma.trimestralEvaluation.findUnique({
      where: {
        userId_trimester_year: {
          userId,
          trimester,
          year,
        },
      },
    });

    if (existingEvaluation) {
      throw new ConflictException('Avaliação para este trimestre já existe');
    }

    const evaluation = await this.prisma.trimestralEvaluation.create({
      data: {
        userId,
        trimester,
        year,
        generalComment,
        ratings: {
          create: ratings,
        },
      },
      include: {
        ratings: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Record user activity
    await this.recordUserActivity(userId, 'EVALUATION_COMPLETED', { trimester, year });

    return evaluation;
  }

  async getTrimestralEvaluationsByUser(userId: string) {
    return this.prisma.trimestralEvaluation.findMany({
      where: { userId },
      include: {
        ratings: true,
      },
      orderBy: [
        { year: 'desc' },
        { trimester: 'desc' }
      ],
    });
  }
}
