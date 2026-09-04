import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { PrismaClient } from "../../prisma/generated/client";

dotenv.config();


if (!process.env.DATABASE_URL) {
    console.error(" DATABASE_URL no está definida en .env");
    process.exit(1);
}



const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production" ? ['warn', 'error'] : ['info', 'warn', 'error'],
});

export { prisma };
