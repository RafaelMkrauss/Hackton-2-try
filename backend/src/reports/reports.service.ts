import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, UpdateReportStatusDto, ReportFilterDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, userId?: string) {
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        userId,
        priority: createReportDto.priority || 'MEDIUM',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async findAll(filters: ReportFilterDto) {
    const { status, category, priority, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return report;
  }

  async findByUser(userId: string, filters: ReportFilterDto) {
    const { status, category, priority, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, updateStatusDto: UpdateReportStatusDto, staffId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        comment: updateStatusDto.comment,
        staffId,
        updatedAt: new Date(),
      },
      include: {
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

  async delete(id: string, userId: string, userRole: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    // Apenas o próprio usuário ou staff pode deletar
    if (report.userId !== userId && userRole !== 'STAFF' && userRole !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para deletar este relatório');
    }

    await this.prisma.report.delete({
      where: { id },
    });

    return { message: 'Relatório deletado com sucesso' };
  }

  async getMapData() {
    const reports = await this.prisma.report.findMany({
      select: {
        id: true,
        latitude: true,
        longitude: true,
        category: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      where: {
        status: {
          not: 'REJECTED',
        },
      },
    });

    return reports;
  }

  async getStats() {
    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
      categoryStats,
      priorityStats,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.report.count({ where: { status: 'REJECTED' } }),
      this.prisma.report.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      }),
      this.prisma.report.groupBy({
        by: ['priority'],
        _count: {
          priority: true,
        },
      }),
    ]);

    return {
      totalReports,
      statusStats: {
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        rejected: rejectedReports,
      },
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.category,
      })),
      priorityStats: priorityStats.map(stat => ({
        priority: stat.priority,
        count: stat._count.priority,
      })),
    };
  }
}
