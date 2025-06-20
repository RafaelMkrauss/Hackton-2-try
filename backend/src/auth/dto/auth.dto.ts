import { IsEmail, IsOptional, IsString, MinLength, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude deve ser um número' })
  @IsLatitude({ message: 'Latitude deve ser válida' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude deve ser um número' })
  @IsLongitude({ message: 'Longitude deve ser válida' })
  longitude?: number;

  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  neighborhood?: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}
