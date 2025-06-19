import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      totalUsers,
      recentReports,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      totalUsers,
      recentReports,
    };
  }

  async getReportsForMap() {
    return this.prisma.report.findMany({
      select: {
        id: true,
        latitude: true,
        longitude: true,
        category: true,
        status: true,
        priority: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAnalytics() {
    const [
      reportsByCategory,
      reportsByStatus,
      reportsByPriority,
      reportsByMonth,
    ] = await Promise.all([
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
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      this.prisma.report.groupBy({
        by: ['priority'],
        _count: {
          priority: true,
        },
      }),
      this.prisma.$queryRaw`
        SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count
        FROM reports
        WHERE createdAt >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month
      `,
    ]);

    return {
      reportsByCategory: reportsByCategory.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
      reportsByStatus: reportsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      reportsByPriority: reportsByPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      reportsByMonth,
    };
  }
}
