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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportStatusDto, ReportFilterDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { parse } from 'path';
import * as fs from 'fs/promises';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  /*
  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user?: any,
  ) {
    return this.reportsService.create(createReportDto, user?.id);
  }
  */

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 5 }],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const name = `${Date.now()}-${file.originalname}`;
            cb(null, name);
          },
        }),
      },
    ),
  )

  async create(
  @UploadedFiles() files: { images?: Express.Multer.File[] },
  @Body() createReportDto: CreateReportDto,
  @CurrentUser() user?: any,
  ) {
  if (!files.images || files.images.length === 0) {
    throw new BadRequestException('Nenhuma imagem enviada');
  }

  const validImages: Express.Multer.File[] = [];

  for (const file of files.images) {
    const predictionStr = await this.reportsService.runPythonModel(file.path);
    const prediction = parseFloat(predictionStr);

    if (isNaN(prediction) || prediction < 0.5) {
      console.log(`Image ${file.originalname} rejected with prediction: ${prediction}`);
      await fs.unlink(file.path);
      continue;
    }

    validImages.push(file);
  }

  if (validImages.length === 0) {
    throw new BadRequestException('Todas as imagens foram rejeitadas pela IA (predição < 0.5)');
  }

  return this.reportsService.create(createReportDto, user?.id);
}


  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF', 'ADMIN')
  async findAll(@Query() filters: ReportFilterDto) {
    return this.reportsService.findAll(filters);
  }

  @Get('map')
  async getMapData() {
    return this.reportsService.getMapData();
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
