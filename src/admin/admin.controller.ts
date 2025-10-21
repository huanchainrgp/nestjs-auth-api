import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto, UpdateUserDto, GetUsersQueryDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @Get('users/stats')
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('users/recent')
  async getRecentUsers(@Query('limit') limit: number = 10) {
    return this.adminService.getRecentUsers(limit);
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, updateUserRoleDto);
  }

  @Post('users/:id/revoke-tokens')
  @HttpCode(HttpStatus.OK)
  async revokeUserTokens(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.revokeUserTokens(id);
    return { message: 'User tokens revoked successfully' };
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const requestingAdminId = req.user.sub;
    await this.adminService.deleteUser(id, requestingAdminId);
  }

  @Get('dashboard')
  async getDashboard() {
    const [stats, recentUsers] = await Promise.all([
      this.adminService.getUserStats(),
      this.adminService.getRecentUsers(5),
    ]);

    return {
      stats,
      recentUsers,
    };
  }
}