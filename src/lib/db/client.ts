import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createDatabaseClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return new Proxy(
      {},
      {
        get() {
          throw new Error("DATABASE_URL is required to use Prisma client.");
        },
      },
    ) as PrismaClient;
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

export const db =
  globalForPrisma.prisma ??
  createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
