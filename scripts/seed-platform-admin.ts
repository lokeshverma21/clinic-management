import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { platformUsers } from "../db/schema";

interface SeedArgs {
  clerkUserId: string;
  email: string;
  fullName: string;
}

function parseArgs(): SeedArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<SeedArgs> = {};

  for (const arg of args) {
    if (arg.startsWith("--clerk-id=")) {
      parsed.clerkUserId = arg.split("=")[1]?.trim();
    } else if (arg.startsWith("--email=")) {
      parsed.email = arg.split("=")[1]?.trim();
    } else if (arg.startsWith("--name=")) {
      parsed.fullName = arg.split("=")[1]?.trim();
    }
  }

  const clerkUserId = parsed.clerkUserId || process.env.CLERK_USER_ID;
  const email = parsed.email || process.env.ADMIN_EMAIL;
  const fullName = parsed.fullName || process.env.ADMIN_FULL_NAME;

  if (!clerkUserId || !email || !fullName) {
    console.error(`
Error: Missing required arguments.

Usage via CLI flags:
  npx tsx scripts/seed-platform-admin.ts --clerk-id=user_2xxx --email=admin@example.com --name="Admin Name"

Usage via Environment Variables:
  CLERK_USER_ID=user_2xxx ADMIN_EMAIL=admin@example.com ADMIN_FULL_NAME="Admin Name" npx tsx scripts/seed-platform-admin.ts

Missing fields:
  ${!clerkUserId ? "- CLERK_USER_ID / --clerk-id" : ""}
  ${!email ? "- ADMIN_EMAIL / --email" : ""}
  ${!fullName ? "- ADMIN_FULL_NAME / --name" : ""}
`);
    process.exit(1);
  }

  return { clerkUserId, email, fullName };
}

async function main() {
  const { clerkUserId, email, fullName } = parseArgs();

  console.log(`Seeding platform super_admin user:`);
  console.log(`  Clerk User ID : ${clerkUserId}`);
  console.log(`  Email         : ${email}`);
  console.log(`  Full Name     : ${fullName}`);

  // Idempotent lookup by Clerk User ID or Email
  const [existingByClerk] = await db
    .select()
    .from(platformUsers)
    .where(eq(platformUsers.clerkUserId, clerkUserId))
    .limit(1);

  const [existingByEmail] = await db
    .select()
    .from(platformUsers)
    .where(eq(platformUsers.email, email))
    .limit(1);

  if (existingByClerk) {
    const [updated] = await db
      .update(platformUsers)
      .set({
        email,
        fullName,
        role: "super_admin",
        updatedAt: new Date(),
      })
      .where(eq(platformUsers.id, existingByClerk.id))
      .returning();

    console.log(`Successfully updated existing platform user by Clerk ID (${updated.id}):`, updated);
  } else if (existingByEmail) {
    const [updated] = await db
      .update(platformUsers)
      .set({
        clerkUserId,
        fullName,
        role: "super_admin",
        updatedAt: new Date(),
      })
      .where(eq(platformUsers.id, existingByEmail.id))
      .returning();

    console.log(`Successfully updated existing platform user by Email (${updated.id}):`, updated);
  } else {
    const [inserted] = await db
      .insert(platformUsers)
      .values({
        clerkUserId,
        email,
        fullName,
        role: "super_admin",
      })
      .returning();

    console.log(`Successfully created new super_admin platform user (${inserted.id}):`, inserted);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed platform admin user:", error);
  process.exit(1);
});
