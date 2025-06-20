import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateSemestralEvaluationDto, UpdateSemestralEvaluationDto } from './dto/evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  create(@Request() req, @Body() createEvaluationDto: CreateSemestralEvaluationDto) {
    return this.evaluationsService.create(req.user.sub, createEvaluationDto);
  }

  @Get('my-evaluations')
  findMyEvaluations(@Request() req) {
    return this.evaluationsService.findByUser(req.user.sub);
  }

  @Get('current')
  getCurrentEvaluation(@Request() req) {
    return this.evaluationsService.getCurrentUserEvaluation(req.user.sub);
  }

  @Get('current-semester')
  getCurrentSemester() {
    return this.evaluationsService.getCurrentSemester();
  }

  @Get('area-statistics')
  getAreaStatistics(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = radius ? parseFloat(radius) : 0.01;
    
    return this.evaluationsService.getAreaStatistics(lat, lng, rad);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.evaluationsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateEvaluationDto: UpdateSemestralEvaluationDto,
  ) {
    return this.evaluationsService.update(id, req.user.sub, updateEvaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.evaluationsService.remove(id, req.user.sub);
  }
}
