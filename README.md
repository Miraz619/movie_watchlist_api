# Movie Watchlist API

A RESTful backend API built using **Node.js, Express.js, TypeScript, PostgreSQL, and Drizzle ORM**.

The project focuses on user authentication, role-based authorization, profile management, and secure session handling.

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL, Drizzle ORM
- **Authentication:** JWT, bcryptjs, HTTP-only cookies
- **Validation:** Zod
- **Development:** Docker, Docker Compose

## Features

- User registration and login
- JWT access and refresh tokens
- Refresh-token rotation with SHA-256 hashing
- Signout and session revocation
- Role-based access control (Admin/User)
- User profile management
- Admin-only user listing
- Centralized error handling
- Database migrations and transactions

## Getting Started

### Prerequisites

- Git
- Docker and Docker Compose
- Node.js and npm (for local development)

### 1. Clone the Repository

```bash
git clone https://github.com/Miraz619/movie_watchlist_api.git
cd movie_watchlist_api
```

### 2. Environment Configuration

Create a `.env` file in the project root.

```env
PORT=4001
POSTGRES_USER=movie_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=movie_watchlist
DATABASE_URL=postgresql://movie_user:your_password@localhost:5433/movie_watchlist

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_TOKEN_SECRET=your_secure_access_secret
JWT_REFRESH_TOKEN_SECRET=your_secure_refresh_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

Use secure, different JWT secrets and never commit your `.env` file.

### Option A — Run with Docker

Docker Compose runs PostgreSQL, applies database migrations, and starts the Express API.

```bash
docker compose up -d --build
```

Check service status:

```bash
docker compose ps -a
```

View logs:

```bash
docker compose logs -f api
```

Stop the application:

```bash
docker compose down
```

**Note:** The Docker Compose `api` service must receive the JWT secrets, token expiry settings, bcrypt configuration, and other required environment variables through `environment:` or `env_file:`.

### Option B — Run Locally

Install dependencies:

```bash
npm install
```

Start PostgreSQL in Docker:

```bash
docker compose up -d db
```

Apply database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

For local development, `DATABASE_URL` should use `localhost:5433`. Inside Docker, services connect to PostgreSQL using `db:5432`.

### API URL

```text
http://localhost:4001
```

Health check:

```http
GET /health
```

## API Endpoints

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh-token` | Refresh token |
| POST | `/api/auth/signout` | Refresh session |

### User Management

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/users/register` | Public |
| GET | `/api/users/me` | Authenticated |
| PATCH | `/api/users/me` | Authenticated |
| DELETE | `/api/users/me/profile` | Authenticated |
| GET | `/api/users` | Admin |
| DELETE | `/api/users/:userId` | Owner/Admin |

## Authentication Overview

The API uses two JWTs:

- **Access token:** Short-lived (15 minutes) for protected API requests.
- **Refresh token:** Longer-lived (initially 7 days) for obtaining new tokens.

Refresh-token rotation replaces the old refresh token with a new one. A SHA-256 hash of the active refresh token is stored in PostgreSQL.

Authentication tokens are delivered using HTTP-only cookies.

## Project Structure

```text
src/
├── config/
├── db/
│   └── schema/
├── errors/
├── middlewares/
├── modules/
│   ├── auth/
│   └── user/
├── utils/
├── app.ts
└── server.ts
```

The application follows a **Route → Middleware → Controller → Service → Database** architecture.

## Documentation

For detailed information about database design, authentication, refresh-token rotation, engineering decisions, and API behavior, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## Repository

https://github.com/Miraz619/movie_watchlist_api

## Status

Under active development.
