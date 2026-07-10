import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prismaClientSingleton = () => {
  const raw = process.env.DATABASE_URL;
  if (!raw?.trim()) {
    throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  }
  // Bağlantı zaman aşımı (saniye) — uzun beklemeyi önler
  const separator = raw.includes("?") ? "&" : "?";
  const connectionString = `${raw}${separator}connect_timeout=15`;

  // Prisma Postgres/PostgreSQL için pg Pool kullanımı
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 20_000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Global instance'ı 'db' değişkenine atıyoruz
const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;
