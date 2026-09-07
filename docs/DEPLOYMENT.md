# ÆTHRA Deployment — Windows, No Docker

## Run locally

```cmd
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Add Neon PostgreSQL

Create a Neon database and copy its connection string.

Create `.env`:

```env
DATABASE_URL="YOUR_CONNECTION_STRING"
```

Then:

```cmd
npm run db:generate
npm run db:push
```

## Deploy to Vercel

Push the project to GitHub, import it into Vercel, add the same environment variables, and deploy.
