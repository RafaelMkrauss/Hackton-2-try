import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemestralEvaluationDto, UpdateSemestralEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createEvaluationDto: CreateSemestralEvaluationDto) {
    const { semester, year, ratings, generalComment } = createEvaluationDto;

    // Check if evaluation already exists for this user, semester, and year
    const existingEvaluation = await this.prisma.semestralEvaluation.findUnique({
      where: {
        userId_semester_year: {
          userId,
          semester,
          year,
        },
      },
    });

    if (existingEvaluation) {
      throw new ConflictException('Avaliação para este semestre já existe');
    }

    return this.prisma.semestralEvaluation.create({
      data: {
        userId,
        semester,
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
  }

  async findByUser(userId: string) {
    return this.prisma.semestralEvaluation.findMany({
      where: { userId },
      include: {
        ratings: true,
      },
      orderBy: [
        { year: 'desc' },
        { semester: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId?: string) {
    const evaluation = await this.prisma.semestralEvaluation.findUnique({
      where: { id },
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

    if (!evaluation) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    // If userId is provided, check ownership
    if (userId && evaluation.userId !== userId) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return evaluation;
  }

  async update(id: string, userId: string, updateEvaluationDto: UpdateSemestralEvaluationDto) {
    const evaluation = await this.findOne(id, userId);

    const { ratings, generalComment } = updateEvaluationDto;

    // Update the evaluation
    const updatedEvaluation = await this.prisma.semestralEvaluation.update({
      where: { id },
      data: {
        generalComment,
      },
      include: {
        ratings: true,
      },
    });

    // If ratings are provided, update them
    if (ratings) {
      // Delete existing ratings
      await this.prisma.categoryRating.deleteMany({
        where: { evaluationId: id },
      });

      // Create new ratings
      await this.prisma.categoryRating.createMany({
        data: ratings.map(rating => ({
          ...rating,
          evaluationId: id,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.semestralEvaluation.delete({
      where: { id },
    });
  }

  async getCurrentSemester() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const semester = month <= 6 ? 1 : 2;

    return { year, semester };
  }

  async getCurrentUserEvaluation(userId: string) {
    const { year, semester } = await this.getCurrentSemester();

    return this.prisma.semestralEvaluation.findUnique({
      where: {
        userId_semester_year: {
          userId,
          semester,
          year,
        },
      },
      include: {
        ratings: true,
      },
    });
  }

  async getAreaStatistics(latitude: number, longitude: number, radius: number = 0.01) {
    // Get users in the area
    const usersInArea = await this.prisma.user.findMany({
      where: {
        latitude: {
          gte: latitude - radius,
          lte: latitude + radius,
        },
        longitude: {
          gte: longitude - radius,
          lte: longitude + radius,
        },
      },
      select: { id: true },
    });

    const userIds = usersInArea.map(user => user.id);

    if (userIds.length === 0) {
      return { message: 'Nenhum usuário encontrado na área' };
    }

    // Get latest evaluations from users in the area
    const { year, semester } = await this.getCurrentSemester();

    const evaluations = await this.prisma.semestralEvaluation.findMany({
      where: {
        userId: { in: userIds },
        year,
        semester,
      },
      include: {
        ratings: true,
      },
    });

    // Calculate average ratings by category
    const categoryAverages = {};
    const categoryCount = {};

    evaluations.forEach(evaluation => {
      evaluation.ratings.forEach(rating => {
        if (!categoryAverages[rating.category]) {
          categoryAverages[rating.category] = 0;
          categoryCount[rating.category] = 0;
        }
        categoryAverages[rating.category] += rating.rating;
        categoryCount[rating.category]++;
      });
    });

    // Calculate final averages
    Object.keys(categoryAverages).forEach(category => {
      categoryAverages[category] = categoryAverages[category] / categoryCount[category];
    });

    return {
      totalEvaluations: evaluations.length,
      totalUsersInArea: userIds.length,
      participationRate: (evaluations.length / userIds.length) * 100,
      categoryAverages,
      semester,
      year,
    };
  }
}
