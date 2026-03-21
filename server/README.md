# Reddit Clone — Server

Express + Apollo Server (GraphQL) backend with TypeORM (Postgres) and Redis sessions. Deployed on **Render** (free tier).

## Keep-Alive (Render Free Tier)

Render's free tier spins down web services after ~15 minutes of inactivity, causing slow cold starts. To prevent this, a `GET /health` endpoint in `src/index.ts` is pinged by an external cron job.

### cron-job.org Setup

1. Create an account at [cron-job.org](https://cron-job.org)
2. **Create cronjob** with:
   - **Title:** reddit-clone keep-alive
   - **URL:** `https://<your-render-service-url>/health`
   - **Schedule:** Every 5 minutes
   - **Request method:** GET
3. Save and enable

> The Render service URL is shown in your Render dashboard (e.g., `https://reddit-clone-server-xxxx.onrender.com`). If you upgrade to a paid Render plan, disable the cron job since paid services don't spin down.
