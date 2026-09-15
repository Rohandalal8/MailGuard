import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
	console.warn("DATABASE_URL is missing or still uses YOUR_PASSWORD; database requests will fail until backend/.env is configured.");
}

const adapter = new PrismaPg({ connectionString: connectionString ?? "postgresql://postgres:password@localhost:5432/mailguard" });
export const prisma = new PrismaClient({ adapter });

