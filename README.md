# Hono REST API Boilerplate

Production-ready REST API boilerplate using **Hono** with **Bun** runtime.

## Features

- 🚀 **Hono** - Lightweight, fast web framework
- 🔥 **Bun** - Fast JavaScript runtime
- 🗃️ **Drizzle ORM** - Type-safe SQL query builder
- 📦 **PostgreSQL** - Production database
- 🔐 **JWT Authentication** - Bearer token auth
- ✅ **Zod** - Request validation
- 📝 **OpenAPI/Swagger** - API documentation
- 🛡️ **Security** - CORS, rate limiting, secure headers
- 📊 **Structured Logging** - JSON formatted logs
- 🔄 **Graceful Shutdown** - Handle SIGINT/SIGTERM

## Architecture

```
Controller → Service → Repository
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
cd hono-boilerplate

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### Database Setup

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate
```

### Run Development Server

```bash
bun run dev
```

Server will start at `http://localhost:3000`

### Production

```bash
bun run start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| GET | `/api/v1/users` | List users (paginated) |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Query Parameters

```
GET /api/v1/users?page=1&limit=10&sort=-createdAt&search=john
```

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field, prefix with `-` for DESC
- `search` - Search in name field

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": [ ... ]
  },
  "requestId": "uuid"
}
```

## Testing

```bash
bun test
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run start` | Start production server |
| `bun test` | Run tests |
| `bun run lint` | Run ESLint |
| `bun run format` | Format with Prettier |
| `bun run db:generate` | Generate migrations |
| `bun run db:migrate` | Run migrations |
| `bun run db:push` | Push schema changes |
| `bun run db:studio` | Open Drizzle Studio |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `CORS_ORIGIN` | Allowed origins | * |
| `RATE_LIMIT_MAX` | Max requests/window | 100 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 60000 |

## Project Structure

```
src/
├── config/
│   └── env.js              # Environment config
├── db/
│   ├── index.js            # Database connection
│   ├── schema.js           # Drizzle schema
│   └── migrate.js          # Migration runner
├── middlewares/
│   ├── authJwt.js          # JWT authentication
│   ├── errorHandler.js     # Global error handler
│   ├── logger.js           # Request logging
│   ├── rateLimit.js        # Rate limiting
│   ├── requestId.js        # Request ID
│   └── validate.js         # Zod validation
├── modules/
│   └── user/
│       ├── user.controller.js
│       ├── user.repository.js
│       ├── user.routes.js
│       ├── user.schema.js
│       └── user.service.js
├── routes/
│   └── index.js            # Route aggregator
├── utils/
│   ├── jwt.js              # JWT helpers
│   ├── pagination.js       # Pagination utils
│   └── response.js         # Response helpers
├── app.js                  # Hono app setup
└── index.js                # Server bootstrap
tests/
├── user.controller.test.js
└── user.service.test.js
```

## Benchmark

Load testing with [k6](https://k6.io/) - 10 VUs for 60 seconds.

### GET - /

```
scenarios: (100.00%) 1 scenario, 10 max VUs, 1m30s max duration (incl. graceful stop):
              * default: 10 looping VUs for 1m0s (gracefulStop: 30s)



  █ TOTAL RESULTS 

    checks_total.......: 1756389 29272.41819/s
    checks_succeeded...: 100.00% 1756389 out of 1756389
    checks_failed......: 0.00%   0 out of 1756389

    ✓ status 200

    HTTP
    http_req_duration..............: avg=319.06µs min=34µs    med=177µs    max=46.67ms p(90)=752µs    p(95)=1.12ms
      { expected_response:true }...: avg=319.06µs min=34µs    med=177µs    max=46.67ms p(90)=752µs    p(95)=1.12ms
    http_req_failed................: 0.00%   0 out of 1756389
    http_reqs......................: 1756389 29272.41819/s

    EXECUTION
    iteration_duration.............: avg=338.88µs min=43.54µs med=194.95µs max=46.73ms p(90)=777.37µs p(95)=1.15ms
    iterations.....................: 1756389 29272.41819/s
    vus............................: 10      min=10           max=10
    vus_max........................: 10      min=10           max=10

    NETWORK
    data_received..................: 1.2 GB  21 MB/s
    data_sent......................: 123 MB  2.0 MB/s
```

| Metric | Value |
|--------|-------|
| Requests/sec | **29,272** |
| Avg Latency | 319.06µs |
| P95 Latency | 1.12ms |
| Total Requests | 1,756,389 |

## License

MIT
