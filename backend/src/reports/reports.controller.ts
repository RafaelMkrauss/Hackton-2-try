import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportStatusDto, ReportFilterDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user?: any,
  ) {
    return this.reportsService.create(createReportDto, user?.id);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF', 'ADMIN')
  async findAll(@Query() filters: ReportFilterDto) {
    return this.reportsService.findAll(filters);
  }

  @Get('public')
  async findAllPublic(@Query() filters: ReportFilterDto) {
    return this.reportsService.findAllPublic(filters);
  }
  @Get('map')
  async getMapData() {
    return this.reportsService.getMapData();
  }

  @Get('public-stats')
  async getPublicStats() {
    return this.reportsService.getPublicStats();
  }

  @Get('recent')
  async getRecentReports(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.reportsService.getRecentReports(limitNum);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF', 'ADMIN')
  async getStats() {
    return this.reportsService.getStats();
  }

  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  async getMyReports(
    @CurrentUser() user: any,
    @Query() filters: ReportFilterDto,
  ) {
    return this.reportsService.findByUser(user.id, filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF', 'ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.updateStatus(id, updateStatusDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.delete(id, user.id, user.role);
  }
}
