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

## Auth0 Setup

1. Create a Regular Web Application in Auth0 Dashboard.

2. In `Application -> Settings`, set:

```text
Allowed Callback URLs:x
http://localhost:3000/auth/callback

Allowed Logout URLs:
http://localhost:3000/login

Allowed Web Origins:
http://localhost:3000
```

3. Copy the following values into `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/orlogozarlaga"

AUTH0_DOMAIN="dev-oqcbacp6nbl2y2b1.us.auth0.com"
AUTH0_CLIENT_ID="CRpK7dD5nuZwOQ5y0EJBc5qy5zKL63C8"
AUTH0_CLIENT_SECRET="u17wVdmG7Jp1Rc03ZUk-m3mQwHRM2hqivhmhrVMdZJ4fNLOGhKptLBchYbBuIKGG"
AUTH0_SECRET="c4be60be8637129807fdd55b9daf1867a40692a24e8e3058382443db36f21d2d"
APP_BASE_URL=http://localhost:3000

```

4. Generate `AUTH0_SECRET` locally:

```bash
openssl rand -hex 32
```

Then place the output into:

```env
AUTH0_SECRET="paste-generated-value-here"
```

5. Enable Universal Login in Auth0 and keep the app on the default hosted login page.

6. Start the app and open:

```text
http://localhost:3000/login
```

7. Test the full flow:

- Click `Continue with Auth0`
- Sign up or log in from Auth0 hosted page
- Confirm you return to `/pocketDashboard`
- Click `Logout` and confirm you return to `/login`

## Notes

- Authentication is Auth0-only. There is no local email/password fallback in this app.
- `npx prisma db seed` creates a sample user record for `demo@user.com`, but access still
  requires a real Auth0 login with the same email.
