import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { admins, invoiceCategories } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL or POSTGRES_URL must be set");
  process.exit(1);
}

const conn = postgres(DATABASE_URL);
const db = drizzle(conn);

async function seed() {
  console.log("Seeding database...");

  // Seed initial admin - update this email to your admin email
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  console.log(`Adding admin: ${adminEmail}`);

  await db
    .insert(admins)
    .values({ email: adminEmail.toLowerCase() })
    .onConflictDoNothing();

  // Seed default invoice categories
  const categories = [
    { name: "Electricity", icon: "zap", sortOrder: 1 },
    { name: "Gas", icon: "flame", sortOrder: 2 },
    { name: "Water", icon: "droplets", sortOrder: 3 },
    { name: "Internet", icon: "wifi", sortOrder: 4 },
    { name: "Rates", icon: "landmark", sortOrder: 5 },
  ];

  console.log("Adding default invoice categories...");

  for (const category of categories) {
    await db.insert(invoiceCategories).values(category).onConflictDoNothing();
  }

  console.log("Seed complete!");
  await conn.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
