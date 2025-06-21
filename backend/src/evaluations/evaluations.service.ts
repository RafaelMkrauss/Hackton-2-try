import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemestralEvaluationDto, UpdateSemestralEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  // Convert semester (1, 2) to trimester (1, 2, 3, 4)
  private semesterToTrimester(semester: number): number {
    return semester === 1 ? 1 : 3; // First semester = Q1, Second semester = Q3
  }

  async create(userId: string, createEvaluationDto: CreateSemestralEvaluationDto) {
    const { semester, year, ratings, generalComment } = createEvaluationDto;

    // Convert semester to trimester
    const trimester = this.semesterToTrimester(semester);

    // Check if evaluation already exists for this user, trimester, and year
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
      throw new ConflictException('Avaliação para este período já existe');
    }

    return this.prisma.trimestralEvaluation.create({
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
  }
  async findByUser(userId: string) {
    return this.prisma.trimestralEvaluation.findMany({
      where: { userId },
      include: {
        ratings: true,
      },
      orderBy: [
        { year: 'desc' },
        { trimester: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId?: string) {
    const evaluation = await this.prisma.trimestralEvaluation.findUnique({
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
    const evaluation = await this.findOne(id, userId);    const { ratings, generalComment } = updateEvaluationDto;

    // Update the evaluation
    const updatedEvaluation = await this.prisma.trimestralEvaluation.update({
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

    return this.prisma.trimestralEvaluation.delete({
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
    const trimester = this.semesterToTrimester(semester);

    return this.prisma.trimestralEvaluation.findUnique({
      where: {
        userId_trimester_year: {
          userId,
          trimester,
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
    const trimester = this.semesterToTrimester(semester);

    const evaluations = await this.prisma.trimestralEvaluation.findMany({
      where: {
        userId: { in: userIds },
        year,
        trimester,
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
      trimester,
      year,
    };
  }
}
