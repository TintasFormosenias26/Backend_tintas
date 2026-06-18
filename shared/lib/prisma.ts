import { PrismaClient } from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg"; import dotenv from "dotenv";

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
    log: ['query', 'info', 'warn', 'error'],
});

export { prisma };