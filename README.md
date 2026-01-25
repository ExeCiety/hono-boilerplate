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

  checks_total.......: 1783253 29720.852622/s
  checks_succeeded...: 0.00%   0 out of 1783253
  checks_failed......: 100.00% 1783253 out of 1783253

  ✗ status 200
    ↳  0% — ✓ 0 / ✗ 1783253

  HTTP
  http_req_duration....: avg=316.25µs min=38µs    med=191µs    max=33.34ms p(90)=772µs    p(95)=1.12ms
  http_req_failed......: 100.00% 1783253 out of 1783253
  http_reqs............: 1783253 29720.852622/s

  EXECUTION
  iteration_duration...: avg=334.08µs min=46.95µs med=208.04µs max=33.36ms p(90)=797.04µs p(95)=1.14ms
  iterations...........: 1783253 29720.852622/s
  vus..................: 10      min=10                 max=10
  vus_max..............: 10      min=10                 max=10

  NETWORK
  data_received........: 1.7 GB  28 MB/s
  data_sent............: 125 MB  2.1 MB/s
```

| Metric | Value |
|--------|-------|
| Requests/sec | **29,720** |
| Avg Latency | 316.25µs |
| P95 Latency | 1.12ms |
| Total Requests | 1,783,253 |

## License

MIT
