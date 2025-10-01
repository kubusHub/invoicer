# Invoice Dashboard

A responsive Vue 3 dashboard for managing invoices with Supabase backend.

## Features

- User authentication with Supabase Auth
- Invoice CRUD operations
- Filtering, sorting, pagination
- CSV export
- Inline editing
- Responsive design
- Secure webhook for n8n integration

## Setup

1. Clone the repo and install dependencies:

   ```sh
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. Set up Supabase:
   - Create a project
   - Run the provided SQL to create the `invoices` table
   - Enable Row Level Security (RLS) and create policies for authenticated users
   - Create a user in auth.users

4. For webhook: Run the server separately:
   ```sh
   node server.js
   ```
   Configure n8n to POST to `http://localhost:3001/webhook/invoices` with invoice data.

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

## Security Notes

- Ensure RLS is enabled in Supabase
- Use service role key only server-side
- Validate webhook payloads
