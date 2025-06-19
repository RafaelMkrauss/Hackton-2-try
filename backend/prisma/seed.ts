import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário staff
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@hackaton.com' },
    update: {},
    create: {
      email: 'staff@hackaton.com',
      password: staffPassword,
      name: 'Staff Admin',
      role: 'STAFF',
    },
  });

  console.log('👤 Usuário staff criado:', staff.email);

  // Criar usuário demo
  const userPassword = await bcrypt.hash('user123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@hackaton.com' },
    update: {},
    create: {
      email: 'user@hackaton.com',
      password: userPassword,
      name: 'Usuário Demo',
      role: 'USER',
    },
  });

  console.log('👤 Usuário demo criado:', demoUser.email);

  // Criar relatórios de exemplo
  const sampleReports = [
    {
      category: 'Buraco na Rua',
      description: 'Buraco grande na Rua das Flores, próximo ao número 123. Está causando problemas para os carros.',
      latitude: -23.5505,
      longitude: -46.6333,
      address: 'Rua das Flores, 123 - São Paulo, SP',
      status: 'PENDING',
      priority: 'HIGH',
      userId: demoUser.id,
    },
    {
      category: 'Iluminação Pública',
      description: 'Poste de luz queimado na Av. Paulista, altura do número 500. Área muito escura à noite.',
      latitude: -23.5613,
      longitude: -46.6565,
      address: 'Av. Paulista, 500 - São Paulo, SP',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      userId: demoUser.id,
    },
    {
      category: 'Semáforo com Defeito',
      description: 'Semáforo não está funcionando no cruzamento da Rua Augusta com Rua Oscar Freire.',
      latitude: -23.5629,
      longitude: -46.6544,
      address: 'Rua Augusta x Rua Oscar Freire - São Paulo, SP',
      status: 'RESOLVED',
      priority: 'URGENT',
      userId: demoUser.id,
      comment: 'Problema resolvido pela equipe de manutenção.',
    },
    {
      category: 'Lixo Acumulado',
      description: 'Acúmulo de lixo na esquina da Rua 25 de Março com Rua do Gasômetro.',
      latitude: -23.5447,
      longitude: -46.6238,
      address: 'Rua 25 de Março x Rua do Gasômetro - São Paulo, SP',
      status: 'PENDING',
      priority: 'MEDIUM',
      userId: demoUser.id,
    },
    {
      category: 'Poda de Árvore',
      description: 'Árvore com galhos baixos atrapalhando a passagem de pedestres na Rua da Consolação.',
      latitude: -23.5533,
      longitude: -46.6593,
      address: 'Rua da Consolação, 1000 - São Paulo, SP',
      status: 'PENDING',
      priority: 'LOW',
      userId: null, // Relatório anônimo
    },
  ];

  for (const reportData of sampleReports) {
    const report = await prisma.report.create({
      data: reportData,
    });
    console.log(`📋 Relatório criado: ${report.category}`);
  }

  // Criar notificações de exemplo
  const notifications = [
    {
      userId: demoUser.id,
      title: 'Relatório Atualizado',
      message: 'Seu relatório sobre iluminação pública está em andamento.',
      type: 'report_update',
    },
    {
      userId: demoUser.id,
      title: 'Relatório Resolvido',
      message: 'Seu relatório sobre semáforo foi resolvido com sucesso.',
      type: 'report_update',
    },
  ];

  for (const notificationData of notifications) {
    const notification = await prisma.notification.create({
      data: notificationData,
    });
    console.log(`🔔 Notificação criada: ${notification.title}`);
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📝 Credenciais de acesso:');
  console.log('Staff: staff@hackaton.com / staff123');
  console.log('User: user@hackaton.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
