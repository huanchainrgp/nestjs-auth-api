import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { RegisterDto, RegisterAdminDto } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto, role: UserRole = UserRole.USER): Promise<User> {
    const { email, password, firstName, lastName } = registerDto;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    return this.userRepository.save(user);
  }

  async createAdmin(registerAdminDto: RegisterAdminDto): Promise<User> {
    const { email, password, firstName, lastName, role } = registerAdminDto;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || UserRole.ADMIN,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt']
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
    await this.userRepository.delete(id);
  }

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    return this.userRepository.save(user);
  }
}