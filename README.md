# ÆTHRA — Agent Intelligence Exchange

## Windows Setup — NO DOCKER REQUIRED

### 1. Extract the ZIP

Extract this project somewhere simple, for example:

```text
C:\Projects\aethra
```

### 2. Open Command Prompt in the project

In File Explorer, open the `aethra` folder, click the address bar, type:

```text
cmd
```

Press Enter.

### 3. Install dependencies

```cmd
npm install
```

### 4. Start ÆTHRA

```cmd
npm run dev
```

Open:

```text
http://localhost:3000
```

## Database — Neon PostgreSQL

Docker is NOT required.

The UI can run immediately without PostgreSQL. When you are ready to enable the production database:

1. Create a free Neon PostgreSQL project.
2. Copy the PostgreSQL connection string.
3. Create a file named `.env`.
4. Add:

```env
DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
```

5. Run:

```cmd
npm run db:generate
npm run db:push
```

## Production deployment

### Vercel

1. Push the project to GitHub.
2. Import the GitHub repository into Vercel.
3. Add your production environment variables.
4. Deploy.

## Current project status

Included and runnable:
- Premium ÆTHRA homepage
- Agent marketplace
- Four required agent categories
- Agent detail pages
- Agent Mirror UI
- Agent Arena
- Autonomy Vault UI
- Agent Advantage Lab
- API endpoint
- PostgreSQL Prisma schema

Not faked:
- Live Altana transactions
- Live ERC-8004 indexing
- Live ERC-8183 hiring
- PancakeSwap execution

Those integrations require your real API credentials and the current SDK versions.
