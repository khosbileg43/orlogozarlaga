## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/orlogozarlaga"

AUTH0_DOMAIN="your-tenant.us.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
AUTH0_SECRET="32-byte-hex-secret"
APP_BASE_URL="http://localhost:3000"
```

3. Start PostgreSQL locally:

```bash
docker run --name orlogozarlaga-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=orlogozarlaga \
  -p 5433:5432 \
  -d postgres:16
```

4. Run migrations and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the app:

```bash
npm run dev
```
