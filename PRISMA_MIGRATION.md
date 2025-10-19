# Prisma Migration Guide

## Overview

This project has been successfully migrated from TypeORM to Prisma ORM. This guide explains what changed and how to work with Prisma.

## What Changed

### 1. Dependencies

**Removed:**
- `@nestjs/typeorm`
- `typeorm`
- `sqlite3`

**Added:**
- `@prisma/client` - Prisma Client for database queries
- `prisma` (dev dependency) - Prisma CLI for migrations and schema management

### 2. Configuration

**Yarn Configuration:**
- Created `.yarnrc.yml` with `nodeLinker: node-modules` to ensure compatibility with Prisma (Yarn PnP is not compatible with Prisma)

**Database Schema:**
- Migrated from TypeORM decorators to Prisma schema (`prisma/schema.prisma`)
- User entity with enum for roles (USER, ADMIN, SUPER_ADMIN)

### 3. Project Structure

**New Files:**
- `prisma/schema.prisma` - Database schema definition
- `src/prisma/prisma.service.ts` - Prisma client service
- `src/prisma/prisma.module.ts` - Global Prisma module
- `.yarnrc.yml` - Yarn configuration for node-modules

**Modified Files:**
- `src/user/user.entity.ts` - Now exports Prisma types instead of TypeORM decorators
- `src/user/user.service.ts` - Uses PrismaService instead of TypeORM repository
- `src/user/user.module.ts` - Imports PrismaModule instead of TypeOrmModule
- `src/app.module.ts` - Uses PrismaModule instead of TypeORM configuration
- `package.json` - Updated dependencies and added Prisma scripts

## Database Schema

The Prisma schema is located in `prisma/schema.prisma`:

\`\`\`prisma
enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
\`\`\`

## Available Scripts

### Prisma Commands

\`\`\`bash
# Generate Prisma Client (run this after schema changes)
yarn prisma:generate

# Create and run migrations
yarn prisma:migrate

# Open Prisma Studio (GUI for viewing/editing data)
yarn prisma:studio

# Seed the database (requires creating prisma/seed.ts)
yarn prisma:seed
\`\`\`

### Direct Prisma CLI Commands

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Format schema file
npx prisma format
\`\`\`

## Migration Workflow

### 1. Initial Setup (Already Done)

\`\`\`bash
# Install dependencies
yarn install

# Generate Prisma Client
yarn prisma:generate
\`\`\`

### 2. Create Initial Migration

\`\`\`bash
# This will create the database tables based on your schema
npx prisma migrate dev --name init
\`\`\`

### 3. Making Schema Changes

When you need to modify the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_your_change`
3. Prisma will:
   - Create a new migration file
   - Apply it to your database
   - Regenerate the Prisma Client

### 4. Viewing Data

\`\`\`bash
# Open Prisma Studio
yarn prisma:studio
\`\`\`

This opens a web interface at http://localhost:5555 where you can view and edit your data.

## Code Changes Summary

### Before (TypeORM)

\`\`\`typescript
// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  // ... other decorators
}

// user.service.ts
constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,
) {}

async create(data: RegisterDto): Promise<User> {
  const user = this.userRepository.create(data);
  return this.userRepository.save(user);
}
\`\`\`

### After (Prisma)

\`\`\`typescript
// user.entity.ts
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';
export type User = PrismaUser;
export const UserRole = PrismaUserRole;

// user.service.ts
constructor(
  private prisma: PrismaService,
) {}

async create(data: RegisterDto): Promise<User> {
  return this.prisma.user.create({ data });
}
\`\`\`

## Important Notes

1. **Yarn PnP Disabled:** This project now uses `node-modules` instead of Yarn PnP because Prisma doesn't support PnP mode.

2. **Type Safety:** Prisma Client is fully type-safe and auto-generated based on your schema. You get autocomplete for all database operations.

3. **Migrations:** Always use Prisma migrations instead of the old `synchronize: true` option from TypeORM. This is safer for production.

4. **Environment Variables:** Make sure your `.env` file contains the `DATABASE_URL` variable:
   \`\`\`
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   \`\`\`

5. **First-time Setup:** After cloning the repository, run:
   \`\`\`bash
   yarn install
   npx prisma generate
   npx prisma migrate dev
   \`\`\`

## Troubleshooting

### Prisma Client not found
\`\`\`bash
npx prisma generate
\`\`\`

### Database out of sync
\`\`\`bash
npx prisma migrate dev
\`\`\`

### Want to reset everything
\`\`\`bash
npx prisma migrate reset
\`\`\`

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## Migration Completed ✅

All TypeORM code has been successfully migrated to Prisma. The application maintains the same functionality with improved type safety and developer experience.
