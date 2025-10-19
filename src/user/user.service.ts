import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from './user.entity';
import { RegisterDto, RegisterAdminDto } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(registerDto: RegisterDto, role: UserRole = UserRole.USER): Promise<User> {
    const { email, password, firstName, lastName } = registerDto;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });
  }

  async createAdmin(registerAdminDto: RegisterAdminDto): Promise<User> {
    const { email, password, firstName, lastName, role } = registerAdminDto;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.ADMIN,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}