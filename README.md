# NestJS Authentication API

A complete NestJS REST API with user authentication, JWT tokens, and Swagger documentation.

## Features

- ✅ User Registration
- ✅ User Login
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Swagger API Documentation
- ✅ TypeORM with SQLite
- ✅ Input Validation
- ✅ Password Hashing with bcrypt

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database operations
- **SQLite** - Lightweight database
- **Passport JWT** - Authentication middleware
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **bcryptjs** - Password hashing

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

### Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment variables (optional):
Edit the `.env` file to customize settings:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3000
```

## Running the Application

### Development Mode
```bash
yarn start:dev
```

### Production Mode
```bash
yarn build
yarn start:prod
```

The application will start on `http://localhost:3000`

## API Documentation

Once the application is running, you can access the **Swagger documentation** at:

**http://localhost:3000/api**

This provides an interactive interface to test all API endpoints.

## API Endpoints

### Authentication

#### 1. Register a New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 3. Get User Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Testing with cURL

### Register a user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with your JWT):
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   └── auth.dto.ts          # Data Transfer Objects
│   ├── auth.controller.ts       # Auth endpoints
│   ├── auth.service.ts          # Auth business logic
│   ├── auth.module.ts           # Auth module
│   ├── jwt.strategy.ts          # JWT strategy
│   └── jwt-auth.guard.ts        # JWT guard
├── user/
│   ├── user.entity.ts           # User database entity
│   ├── user.service.ts          # User service
│   └── user.module.ts           # User module
├── app.module.ts                # Root module
└── main.ts                      # Application entry point
```

## Security Features

- Passwords are hashed using bcrypt before storing
- JWT tokens expire after 24 hours (configurable)
- Input validation on all endpoints
- CORS enabled
- Protected routes require valid JWT token

## Database

The application uses SQLite by default for simplicity. The database file (`database.sqlite`) is created automatically in the project root.

To switch to PostgreSQL or MySQL, update the TypeORM configuration in `src/app.module.ts`.

## Available Scripts

- `yarn start` - Start the application
- `yarn start:dev` - Start in development mode with watch
- `yarn start:prod` - Start in production mode
- `yarn build` - Build the application
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` |

## License

MIT
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
