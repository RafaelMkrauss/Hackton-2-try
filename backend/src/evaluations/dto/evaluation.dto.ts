import { Type } from 'class-transformer';
import { IsInt, IsString, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';

export class CategoryRatingDto {
  @IsString()
  category: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateSemestralEvaluationDto {
  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryRatingDto)
  ratings: CategoryRatingDto[];

  @IsOptional()
  @IsString()
  generalComment?: string;
}

export class UpdateSemestralEvaluationDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryRatingDto)
  ratings?: CategoryRatingDto[];

  @IsOptional()
  @IsString()
  generalComment?: string;
}
