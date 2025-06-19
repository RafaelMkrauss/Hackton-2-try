import { Controller, Get, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STAFF', 'ADMIN')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.staffService.getDashboardStats();
  }

  @Get('map-data')
  async getMapData() {
    return this.staffService.getReportsForMap();
  }

  @Get('analytics')
  async getAnalytics() {
    return this.staffService.getAnalytics();
  }
}
