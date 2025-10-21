import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { User, UserRole } from '../user/user.entity';
import { UpdateUserRoleDto, UpdateUserDto, GetUsersQueryDto, UserStatsDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async getAllUsers(query: GetUsersQueryDto) {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tokenVersion: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user exists
    await this.getUserById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    return updatedUser;
  }

  async updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto): Promise<Omit<User, 'password'>> {
    // Check if user exists
    await this.getUserById(id);

    const updatedUser = await this.userService.updateUserRole(id, updateUserRoleDto.role);
    const { password, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  }

  async deleteUser(id: number, requestingAdminId: number): Promise<void> {
    // Check if user exists
    const user = await this.getUserById(id);

    // Prevent admin from deleting themselves
    if (id === requestingAdminId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.userService.deleteUser(id);
  }

  async revokeUserTokens(id: number): Promise<void> {
    // Check if user exists
    await this.getUserById(id);

    await this.authService.revokeUserTokens(id);
  }

  async getUserStats(): Promise<UserStatsDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.user.count({ where: { role: UserRole.USER } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      recentUsers,
    };
  }

  async getRecentUsers(limit: number = 10): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }
}