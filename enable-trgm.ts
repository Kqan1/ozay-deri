import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import db from './lib/db';

async function main() {
    console.log("pg_trgm eklentisi etkinleştiriliyor...");
    await db.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    console.log("✅ pg_trgm başarıyla etkinleştirildi!");
}

main()
    .catch((e) => {
        console.error("Hata oluştu:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
