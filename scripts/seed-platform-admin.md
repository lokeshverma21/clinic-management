# Seeding the First Platform Super Admin

This guide explains how to provision the initial `super_admin` in the `platform_users` table.

---

## Prerequisites

1. Ensure the PostgreSQL database is migrated and accessible via `DATABASE_URL` in `.env.local`.
2. Ensure you have created your platform admin account in Clerk (or locate your existing user in the [Clerk Dashboard](https://dashboard.clerk.com) under **Users**).
3. Copy your Clerk User ID (it starts with `user_...`).

---

## Method 1: Using the TypeScript Seed Script (`tsx`)

The project has `tsx` installed in `node_modules/.bin`. You can run the idempotent seed script directly:

### Using CLI Arguments:
```bash
npx tsx scripts/seed-platform-admin.ts --clerk-id=user_2xxx --email=admin@yourdomain.com --name="Super Admin"
```

### Using Environment Variables:
```bash
# In PowerShell:
$env:CLERK_USER_ID="user_2xxx"; $env:ADMIN_EMAIL="admin@yourdomain.com"; $env:ADMIN_FULL_NAME="Super Admin"; npx tsx scripts/seed-platform-admin.ts

# In Bash / macOS / Linux:
CLERK_USER_ID=user_2xxx ADMIN_EMAIL=admin@yourdomain.com ADMIN_FULL_NAME="Super Admin" npx tsx scripts/seed-platform-admin.ts
```

The script is idempotent: if a user with that Clerk ID or Email already exists in `platform_users`, it updates their role to `super_admin`; otherwise, it inserts a new row.

---

## Method 2: Direct SQL Query (Neon Console / psql)

If you prefer to run raw SQL in your database console:

```sql
INSERT INTO platform_users (
  id,
  clerk_user_id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'user_REPLACE_WITH_CLERK_ID',
  'admin@yourdomain.com',
  'Super Admin',
  'super_admin',
  NOW(),
  NOW()
)
ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = 'super_admin',
  updated_at = NOW();
```

---

## Verification

After seeding:
1. Start the dev server (`npm run dev`).
2. Sign in with the seeded Clerk user account.
3. Visit `http://localhost:3000/admin`. You should see the **ClinicSeva Admin** shell with your name and the **Super Admin** badge.
4. Visit `http://localhost:3000/api/admin/me` in your browser. You should receive a `200 OK` JSON response:
   ```json
   {
     "success": true,
     "data": {
       "admin": {
         "platformUserId": "...",
         "clerkUserId": "user_...",
         "email": "admin@yourdomain.com",
         "fullName": "Super Admin",
         "role": "super_admin"
       }
     }
   }
   ```
