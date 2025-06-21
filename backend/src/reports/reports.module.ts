import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { IaService } from '@/ia/ia.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService,
              IaService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
