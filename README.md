# Review Statistics Microservices Monorepo

🔗 Repository: https://github.com/prasadshetty25/Review-Statistics-App

A NestJS microservices architecture with JWT authentication, shared libraries, and PostgreSQL database.

## 📋 Prerequisites

Before cloning and running this project, ensure you have the following installed:

### Required
- **Node.js**: v20 or higher (includes npm)
- **PostgreSQL**: v16 (or use Docker Compose)
- **Git**: For cloning the repository

### Optional (for containerized setup)
- **Docker**: v20+ and Docker Compose v2+

### About Nx
- **Nx is NOT required to be installed globally** - it's included as a devDependency
- After running `npm install`, Nx will be available via `npx nx` commands
- All scripts in `package.json` use `npx nx`, so no global installation needed

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git https://github.com/prasadshetty25/Review-Statistics-App
cd App-Review-Statistics
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all dependencies including Nx (as a devDependency).

### Step 3: Set Up Environment Variables

Create `.env` files in each service directory or set environment variables. See [Environment Variables](#-environment-variables) section below.

### Step 4: Set Up Database

#### Option A: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Or start all services (PostgreSQL + both microservices)
npm run docker:up
```

#### Option B: Local PostgreSQL

Ensure PostgreSQL 16 is running locally with:
- Host: 
- Port:
- Database:
- User: 
- Password: 

### Step 5: Run the Services

#### Option 1: Local Development (Recommended for development)

```bash
# Start both services simultaneously
npm run dev:all

# Or start individually:
npm run dev:auth                    # Auth service (port 3001)
npm run dev:auth:watch             # With hot reload
npm run dev:reviews-service        # Reviews service (port 3000)
npm run dev:reviews-service:watch  # With hot reload
```

#### Option 2: Docker Compose (Recommended for production-like setup)

```bash
# Start all services (PostgreSQL, Auth, Reviews)
npm run docker:up

# View logs
npm run docker:logs:auth
npm run docker:logs:reviews-service

# Stop all services
npm run docker:down
```

## 📦 Services

- **reviews-service** (Port 3000) - Reviews CRUD, statistics, public/protected endpoints
- **auth-service** (Port 3001) - User authentication, registration, token validation

## 📚 Shared Libraries

- **auth** - JWT guards, decorators, strategies
- **database** - TypeORM entities, migrations
- **config** - Centralized configuration
- **logging** - HTTP logging with database persistence
- **common** - Exception filters, utilities

## 🔧 Environment Variables

Create `.env` files in your service directories or set these environment variables:

### Database Configuration

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SYNCHRONIZE=
DB_LOGGING=
```

### JWT Configuration

```env
JWT_SECRET=
JWT_EXPIRES_IN=
```

### Service Configuration

```env
# Reviews Service
APP_NAME=reviews-service
NODE_ENV=development
PORT=3000

# Auth Service
APP_NAME=auth-service
NODE_ENV=development
AUTH_PORT=3001
```

### Logging Configuration

```env
LOGGING_ENABLED=true
LOGGING_LOG_TO_DATABASE=true
LOGGING_IGNORE_ENDPOINTS=/health,/test
LOGGING_LOG_REQUEST_BODY=false
LOGGING_LOG_RESPONSE_BODY=false
LOGGING_LOG_HEADERS=false
```

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# Rebuild Docker images
npm run docker:build

# View logs
npm run docker:logs:auth
npm run docker:logs:reviews-service
```

## 🏗️ Tech Stack

- **Framework**: NestJS
- **Monorepo**: NX Architecture
- **Database**: PostgreSQL with TypeORM
- **Containerization**: Docker (each microservice has its own Dockerfile)
- **Libraries**: Modular shared libraries for auth, config, database, common utilities

## 📝 Available Scripts

### Development
- `npm run dev:auth` - Start auth service
- `npm run dev:auth:watch` - Start auth service with hot reload
- `npm run dev:reviews-service` - Start reviews service
- `npm run dev:reviews-service:watch` - Start reviews service with hot reload
- `npm run dev:reviews-service:debug` - Start reviews service with debugger
- `npm run dev:all` - Start both services simultaneously

### Build
- `npm run build:reviews-service` - Build reviews service
- `npm run build:reviews-service:prod` - Build reviews service for production
- `npm run build:auth:prod` - Build auth service for production
- `npm run build:all` - Build all services

### Production
- `npm run start:reviews-service` - Start reviews service (production)
- `npm run start:auth` - Start auth service (production)

### Testing
- `npm run test:reviews-service` - Run all tests for reviews service
- `npm run test:reviews-service:watch` - Run tests in watch mode
- `npm run test:reviews-service:coverage` - Run tests with coverage report

## 🧪 Testing

The reviews-service includes comprehensive Jest test suites for both the service and controller layers.

### Running Tests

```bash
# Run all tests
npm run test:reviews-service

# Run tests in watch mode (re-runs on file changes)
npm run test:reviews-service:watch

# Run tests with coverage report
npm run test:reviews-service:coverage
```

### Test Structure

Tests are organized in a separate `__tests__` folder within each module:

```
apps/reviews-service/src/modules/reviews/
├── __tests__/
│   ├── reviews.controller.spec.ts
│   └── reviews.service.spec.ts
├── reviews.controller.ts
├── reviews.service.ts
└── ...
```

### Test Coverage

The test suite includes:
- **Service Tests**: Unit tests for `ReviewsService` covering:
  - Creating reviews (with duplicate check)
  - Calculating average ratings
  - Fetching latest comments
  - Error handling scenarios

- **Controller Tests**: Unit tests for `ReviewsController` covering:
  - HTTP endpoint handlers
  - Request validation
  - Response formatting
  - Configuration handling

## 🌐 API Endpoints

- Reviews Service: http://localhost:3000
- Auth Service: http://localhost:3001
