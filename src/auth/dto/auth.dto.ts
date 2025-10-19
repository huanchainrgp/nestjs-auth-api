import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6 characters)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  @IsOptional()
  lastName?: string;
}

export class RegisterAdminDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Admin email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123456', description: 'Admin password (min 6 characters)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Admin', description: 'Admin first name', required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'User', description: 'Admin last name', required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ 
    example: 'admin', 
    description: 'User role',
    enum: UserRole,
    default: UserRole.ADMIN
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 'super-secret-admin-key', description: 'Admin registration secret key' })
  @IsNotEmpty()
  adminSecret: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  firstName?: string | null;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  lastName?: string | null;

  @ApiProperty({ example: 'user', description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ type: UserResponseDto, description: 'User information' })
  user: UserResponseDto;
}