import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
	throw new Error("DATABASE_URL must be set to a reachable Supabase Postgres connection string.");
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

