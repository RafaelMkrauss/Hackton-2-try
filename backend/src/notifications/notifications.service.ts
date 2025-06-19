import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string, message: string, type: string = 'info') {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  async findByUser(userId: string, limit: number = 10) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async notifyReportStatusUpdate(reportId: string, userId: string, status: string) {
    const statusMessages = {
      'IN_PROGRESS': 'Seu relatório está sendo analisado',
      'RESOLVED': 'Seu relatório foi resolvido',
      'REJECTED': 'Seu relatório foi rejeitado',
    };

    const message = statusMessages[status] || 'Status do seu relatório foi atualizado';

    return this.create(
      userId,
      'Status do Relatório Atualizado',
      message,
      'report_update'
    );
  }
}
