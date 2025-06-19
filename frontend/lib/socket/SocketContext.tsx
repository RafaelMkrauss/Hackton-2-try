'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    
    const socketInstance = io(WS_URL, {
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Conectado ao WebSocket');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Desconectado do WebSocket');
    });

    // Listeners para eventos em tempo real
    socketInstance.on('new-report', (data) => {
      toast.success('Novo relatório criado!');
      console.log('Novo relatório:', data);
    });

    socketInstance.on('report-status-update', (data) => {
      toast.success('Status de relatório atualizado!');
      console.log('Status atualizado:', data);
    });

    socketInstance.on('urgent-report', (data) => {
      toast.error('Relatório urgente criado!');
      console.log('Relatório urgente:', data);
    });

    socketInstance.on('user-report-update', (data) => {
      toast.success('Seu relatório foi atualizado!');
      console.log('Relatório do usuário atualizado:', data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
