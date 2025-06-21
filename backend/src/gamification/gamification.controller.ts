import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuickAnswerDto, CreateTrimestralEvaluationDto } from './dto/gamification.dto';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('questions')
  async getActiveQuestions() {
    return this.gamificationService.getActiveQuestions();
  }

  @Post('quick-answer')
  async submitQuickAnswer(@Request() req, @Body() createQuickAnswerDto: CreateQuickAnswerDto) {
    return this.gamificationService.submitQuickAnswer(req.user.id, createQuickAnswerDto);
  }

  @Get('streak')
  async getUserStreak(@Request() req) {
    return this.gamificationService.getUserStreak(req.user.id);
  }

  @Get('calendar/:year/:month')
  async getActivityCalendar(@Request() req, @Param('year') year: string, @Param('month') month: string) {
    return this.gamificationService.getActivityCalendar(req.user.id, parseInt(year), parseInt(month));
  }

  @Get('daily-question')
  async getDailyQuestion(@Request() req) {
    return this.gamificationService.getDailyQuestion(req.user.id);
  }

  @Get('stats')
  async getUserStats(@Request() req) {
    return this.gamificationService.getUserStats(req.user.id);
  }

  @Post('trimestral-evaluation')
  async createTrimestralEvaluation(@Request() req, @Body() createEvaluationDto: CreateTrimestralEvaluationDto) {
    return this.gamificationService.createTrimestralEvaluation(req.user.id, createEvaluationDto);
  }

  @Get('trimestral-evaluations')
  async getTrimestralEvaluations(@Request() req) {
    return this.gamificationService.getTrimestralEvaluationsByUser(req.user.id);
  }
}
