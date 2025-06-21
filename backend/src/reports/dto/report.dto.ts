import { IsString, IsNumber, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  title?: string;

  @IsString({ message: 'Categoria deve ser uma string' })
  category: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  description: string;

  @IsNumber({}, { message: 'Latitude deve ser um número' })
  latitude: number;

  @IsNumber({}, { message: 'Longitude deve ser um número' })
  longitude: number;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'URL da foto deve ser uma string' })
  photoUrl?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { message: 'Prioridade inválida' })
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class UpdateReportStatusDto {
  @IsEnum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], { 
    message: 'Status inválido' 
  })
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

  @IsOptional()
  @IsString({ message: 'Comentário deve ser uma string' })
  comment?: string;
}

export class ReportFilterDto {
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
