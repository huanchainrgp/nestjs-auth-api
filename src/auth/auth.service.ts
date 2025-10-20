import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, RegisterAdminDto } from './dto/auth.dto';
import { User, UserRole } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create new user with USER role
    const user = await this.userService.create(registerDto, UserRole.USER);
    console.log('New user registered:', registerDto);
    
    // Generate JWT token with tokenVersion
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tokenVersion: user.tokenVersion 
    };
    const access_token = this.jwtService.sign(payload);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    // Validate admin secret
    const expectedAdminSecret = process.env.ADMIN_SECRET || 'super-secret-admin-key';
    if (registerAdminDto.adminSecret !== expectedAdminSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerAdminDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create new admin user
    const user = await this.userService.createAdmin(registerAdminDto);
    console.log('New admin registered:', { email: registerAdminDto.email, role: user.role });
    
    // Generate JWT token with tokenVersion
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tokenVersion: user.tokenVersion 
    };
    const access_token = this.jwtService.sign(payload);

    // Return user data without password and admin secret
    const { password, ...userWithoutPassword } = user;
    
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // Validate user credentials
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with role and tokenVersion
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tokenVersion: user.tokenVersion 
    };
    const access_token = this.jwtService.sign(payload);

    // Return user data without password
    const { password: userPassword, ...userWithoutPassword } = user;
    
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async validateUserById(id: number): Promise<User | null> {
    return this.userService.findById(id);
  }

  async revokeUserTokens(userId: number): Promise<void> {
    await this.userService.incrementTokenVersion(userId);
  }
}