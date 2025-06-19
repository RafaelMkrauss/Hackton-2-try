import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // Notificar sobre novo relatório
  notifyNewReport(report: any) {
    this.server.emit('new-report', {
      type: 'NEW_REPORT',
      data: report,
      timestamp: new Date(),
    });
  }

  // Notificar sobre mudança de status
  notifyReportStatusUpdate(reportId: string, status: string, userId?: string) {
    const message = {
      type: 'REPORT_STATUS_UPDATE',
      data: {
        reportId,
        status,
        userId,
      },
      timestamp: new Date(),
    };

    // Notificar todos os clientes
    this.server.emit('report-status-update', message);

    // Se especificado, notificar usuário específico
    if (userId) {
      this.server.to(`user-${userId}`).emit('user-report-update', message);
    }
  }

  // Notificar staff sobre relatórios urgentes
  notifyUrgentReport(report: any) {
    this.server.emit('urgent-report', {
      type: 'URGENT_REPORT',
      data: report,
      timestamp: new Date(),
    });
  }

  // Notificar sobre estatísticas atualizadas
  notifyStatsUpdate(stats: any) {
    this.server.emit('stats-update', {
      type: 'STATS_UPDATE',
      data: stats,
      timestamp: new Date(),
    });
  }

  // Entrar em sala específica (ex: staff, user-specific)
  joinRoom(client: Socket, room: string) {
    client.join(room);
    console.log(`Cliente ${client.id} entrou na sala: ${room}`);
  }

  // Sair de uma sala
  leaveRoom(client: Socket, room: string) {
    client.leave(room);
    console.log(`Cliente ${client.id} saiu da sala: ${room}`);
  }
}
