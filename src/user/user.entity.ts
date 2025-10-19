import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

// Export Prisma's UserRole enum
export const UserRole = PrismaUserRole;
export type UserRole = PrismaUserRole;

// Export Prisma's User type
export type User = PrismaUser;