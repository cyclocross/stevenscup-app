# Local environment

Date: 02.08.2025 10:00

In the early project phase there is only a production postgres database, started at Neon and linked to Vercel deployment.

Local server and production server share the same database. Development is on `main` branch.


## Steps to setup local environment

```bash
brew install vercel-cli
```

```bash
echo "Link current directory to a Vercel Project"
vercel link
```

```bash
echo "Pull env vars from vercel project, Neon URLs were automatically added to vercel env"
vercel env pull .env.local
```

```bash
echo "Generate drizzle bindings"
nm run db:generate
```

```bash
echo "Migrate the database, initially or after changes to the schema"
npm run db:migrate
```
