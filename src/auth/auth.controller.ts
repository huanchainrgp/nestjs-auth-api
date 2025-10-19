import { Controller, Post, Body, UseGuards, Get, Request, Delete, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto, RegisterAdminDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../user/user.entity';
import { UserService } from '../user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'User with this email already exists' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('register-admin')
  @ApiOperation({ summary: 'Register a new admin user (requires admin secret)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Admin successfully registered',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid admin secret or user already exists' 
  })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto): Promise<AuthResponseDto> {
    return this.authService.registerAdmin(registerAdminDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  getProfile(@Request() req): UserResponseDto {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    type: [UserResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required' 
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user (Super Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Super Admin access required' 
  })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.deleteUser(Number(id));
    return { message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('users/:id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role (Super Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User role updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Super Admin access required' 
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUserRole(Number(id), role);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}