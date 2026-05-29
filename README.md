# ClarityCommerce AI-Concierge Routing Proxy Service (claritycommerce.cc)
### Built by [nitishkumar.pro](https://nitishkumar.pro)

This is a complete, production-grade Next.js 14 App Router project implementing a high-performance **Multi-Model Orchestrator & Auto-Router Microservice**.

---

## 🚀 Key Functional Architectures
1. **API Entry Route (`/api/concierge`)**: Single unified POST orchestrator endpoint taking user prompts and streaming back Markdown completions.
2. **Dynamic Route Selection (`src/lib/modelRouter.ts`)**: Picks the ideal target API node (DeepSeek for low-overhead execution, Gemini for planning and strategic loops, Anthropic Claude 3.5 Sonnet for critical compliance mapping and validation).
3. **Session-Pinning Canary Gates**: Integrates deterministic user-id hashing split to route 10% of total payload triggers consistently to canary checkpoints. Leverages Upstash Redis to pin tenant settings securely for 24h.
4. **Supabase PostgreSQL Schema Mapping**: Out-of-the-box telemetry schemas logging latencies, costs per 1m tokens, Berkeley Function Calling adhesion, and audit logs.
5. **Failsafe Redundancy Wrappers**: Automatic step-down failovers mapped to local offline models if primary endpoints throw rate-limits or 502 Bad Gateway responses.

---

## 🛠️ Local Setup Guide

### 1. Install Dependencies
Navigate into the backend project workspace and run:
```bash
npm install
```

### 2. Configure Environment variables
Rename `.env.example` to `.env.local` and substitute real API credentials managed inside your external panels:
```bash
cp .env.example .env.local
```

| Key | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase database endpoint URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin or bypass service role key for telemetry logging |
| `UPSTASH_REDIS_URL` | Upstash cluster endpoint URL |
| `RESEND_API_KEY` | Resend API key to output reports |
| `DEEPSEEK_API_KEY` | Your DeepSeek authorization bearer token |
| `GEMINI_API_KEY` | Google Generative AI key managed under Settings |
| `CLAUDE_API_KEY` | Anthropic model key |
| `SHOPIFY_STORE_URL` | (https://your-store.myshopify.com) |
| `SHOPIFY_ACCESS_TOKEN` | shpat_your_access_token |

---

## 💾 Database Schema Setup
Run the query contents inside the `/schema.sql` file in your **Supabase SQL Editor** console to create all metrics tables, indexes, capability enums, and default model ELO records.

---

## 🚢 Production Vercel Deployment Instructions

Follow these instructions to deploy claritycommerce.cc to production:

### Step 1: Initialize Git Repository
Make sure you commit the backend files:
```bash
git init
git add .
git commit -m "Initialize ClarityCommerce high-fidelity model routing microservice"
```

### Step 2: Push to GitHub / GitLab
Create a repository on GitHub (e.g. `clarity-commerce-backend`) and push:
```bash
git remote add origin git@github.com:yourusername/clarity-commerce-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import the GitHub repository you just pushed.
3. In **Environment Variables**, select and add all keys declared in `.env.example`.
4. Click **Deploy**. Vercel will bundle and configure the Serverless Edge functions.

### Step 4: Configure the Custom Domain `claritycommerce.cc`
1. Go to your Vercel project's **Settings** > **Domains**.
2. Type `claritycommerce.cc` and click **Add**.
3. Vercel will prompt you to set your Domain Name System (DNS) configurations at your registrar:
   - **Type A Record**: Value `76.76.21.21`
   - **Type CNAME Record** (for www redirects): Point `www.claritycommerce.cc` to `cname.vercel-dns.com`
4. Once DNS propagates, Vercel will generate free automated SSL certificates. Your microservice is live!
