# Project Agents Documentation

## Project Overview

This is a **Next.js + Supabase + Groq AI** chatbot platform designed for autonomous sales. The application receives webhook events from messaging platforms (Facebook, WhatsApp, UChat), processes them through a Groq-powered AI agent, and manages conversations with leads.

### Core Purpose
- Receive incoming messages via webhook from Meta/Facebook
- Process messages using Groq AI with configurable system prompts
- Manage chat history and bot configurations in Supabase
- Provide a dashboard for monitoring and configuration
- Autonomous sales AI with tool calling for service pricing

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| Database | Supabase (PostgreSQL) |
| AI | Groq (llama-3.3-70b-versatile) |
| Styling | Tailwind CSS v4 + Radix UI |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
webhook-receiver/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts       # Main webhook handler (Groq AI)
│   │   ├── services/route.ts      # Services CRUD API
│   │   ├── bot-configs/route.ts   # Bot configs CRUD API
│   │   ├── messages/route.ts       # Messages API
│   │   └── analytics/route.ts      # Analytics data API
│   ├── client/
│   │   └── [orderId]/page.tsx     # Client order portal (dynamic)
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout with navigation
│   │   ├── page.tsx                # Mission Control (analytics)
│   │   ├── chats/page.tsx          # Chat conversations
│   │   ├── configs/page.tsx       # Neural Networks (bot configs)
│   │   └── services/page.tsx       # Service Packages management
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── components/
│   └── ui/                         # Radix UI components
├── lib/
│   ├── supabase.ts                 # Supabase client (anon key)
│   ├── groq.ts                     # Groq client helper
│   ├── telegram.ts                 # Telegram notification utility
│   └── utils.ts                    # Utility functions (cn)
├── migrations/
│   ├── 001_create_services_table.sql
│   └── 002_create_orders_table.sql
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Database Schema

### Tables

**messages**
- `id` (serial, primary key)
- `sender_id` (text)
- `message_text` (text)
- `role` (text) - 'user' or 'assistant'
- `platform` (text)
- `lead_score` (numeric, optional)
- `created_at` (timestamp)

**bot_configs**
- `id` (serial, primary key)
- `page_id` (text, unique)
- `page_name` (text)
- `system_prompt` (text)
- `access_token` (text)
- `is_active` (boolean)
- `created_at` (timestamp)

**services**
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `price` (text)
- `is_active` (boolean, default true)
- `created_at` (timestamp)

**orders**
- `id` (uuid, primary key)
- `client_name` (text)
- `client_contact` (text)
- `service_name` (text)
- `agreed_price` (text)
- `status` (text) - 'Pending Configuration', 'In Progress', 'Awaiting Client Review', 'Completed', 'Cancelled'
- `created_at` (timestamp)

---

## API Routes

### `/api/webhook` (POST)
- **Purpose**: Main message webhook handler
- **Input**: JSON from Meta/UChat webhook
- **Process**: 
  1. Parse message and sender info
  2. Fetch bot config by page_id
  3. Get chat history from Supabase
  4. Call Groq with tool calling support
  5. If tool called, execute and make second call
  6. Save messages to database
- **Output**: `{ reply: string }`

### `/api/services` (GET, POST, PUT, DELETE)
- **Purpose**: Services CRUD operations
- **GET**: List all services
- **POST**: Create new service
- **PUT**: Update service (id required)
- **DELETE**: Remove service (id in query params)

### `/api/bot-configs` (GET, PUT)
- **Purpose**: Bot configuration management
- **GET**: List all bot configs
- **PUT**: Update config (id required)

### `/api/messages` (GET)
- **Purpose**: Fetch chat history
- **Query params**: sender_id, limit

### `/api/analytics` (GET)
- **Purpose**: Dashboard statistics

---

## Groq Tool Calling

The webhook implements two Groq function calling tools:

### 1. get_active_services
```typescript
{
  type: "function",
  function: {
    name: "get_active_services",
    description: "Get current pricing and service packages...",
    parameters: { type: "object", properties: {}, required: [] }
  }
}
```

### 2. create_order
```typescript
{
  type: "function",
  function: {
    name: "create_order",
    description: "Create a new order when the client explicitly agrees...",
    parameters: {
      type: "object",
      properties: {
        clientName: { type: "string" },
        clientContact: { type: "string" },
        serviceName: { type: "string" },
        agreedPrice: { type: "string" }
      },
      required: ["clientName", "clientContact", "serviceName", "agreedPrice"]
    }
  }
}
```

When the AI determines the user is asking about pricing/services:
1. First Groq call returns `tool_calls`
2. Execute `fetchServicesFromDB()` to get active services
3. Make second Groq call with tool result
4. AI formats the response naturally

When the client agrees to proceed:
1. First Groq call returns `tool_calls` with `create_order`
2. Execute `executeOrderCreation()` to save order and send Telegram notification
3. Make second Groq call with order result (orderId, portalUrl)
4. AI gives user their tracking link

---

## Agent Rules

- **Always commit and push after any change**: After completing any task or making any changes to the codebase, always commit the changes with a descriptive message and push to the remote repository. Do not leave changes uncommitted.

---

## Coding Conventions

### Frontend (React/Next.js)
- Use `"use client"` for client-side components
- Use Tailwind CSS with CSS variables (e.g., `var(--accent-cyan)`)
- Follow existing component patterns in `components/ui/`
- Use `fetch()` for API calls (not Supabase client directly in components)
- State management: React useState/useEffect

### Backend (API Routes)
- Use `NextRequest`/`NextResponse` from `next/server`
- Create server-side Supabase client with anon key
- Return proper error codes (400, 500)
- Log errors with console.error

### Database
- Use Supabase client with RLS policies
- Public read for services (for webhook tool calls)
- Authenticated write for admin operations

### Styling
- Use existing CSS variables from `globals.css`
- Follow the dark theme pattern (bg-void, bg-surface, etc.)
- Use lucide-react icons

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/api/webhook/route.ts` | Main AI webhook with tool calling |
| `app/client/[orderId]/page.tsx` | Client order portal (dynamic) |
| `app/dashboard/services/page.tsx` | Service packages admin |
| `app/dashboard/configs/page.tsx` | Bot configurations admin |
| `lib/supabase.ts` | Client-side Supabase instance |
| `lib/telegram.ts` | Telegram notification utility |
| `migrations/001_create_services_table.sql` | Services table schema |
| `migrations/002_create_orders_table.sql` | Orders table schema |

---

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GROQ_API_KEY=your_groq_key
META_VERIFY_TOKEN=your_verify_token
META_PAGE_ACCESS_TOKEN=your_page_token
```
