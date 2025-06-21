import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateQuickAnswerDto {
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @IsNotEmpty()
  @IsBoolean()
  answer: boolean;
}

export class CreateGamificationQuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateTrimestralEvaluationDto {
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3, 4])
  trimester: number;

  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  ratings: CreateCategoryRatingDto[];

  @IsOptional()
  @IsString()
  generalComment?: string;
}

export class CreateCategoryRatingDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5])
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateTrimestralEvaluationDto {
  @IsOptional()
  ratings?: CreateCategoryRatingDto[];

  @IsOptional()
  @IsString()
  generalComment?: string;
}
