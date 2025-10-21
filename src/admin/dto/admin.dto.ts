import { IsEmail, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { UserRole } from '../../user/user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UserStatsDto {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  recentUsers: number; // Users created in last 30 days
}