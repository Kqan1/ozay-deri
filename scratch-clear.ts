import { PrismaClient } from './app/generated/prisma/client/index.js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envFile.match(/^DATABASE_URL=(.*)$/m);
if (dbUrlMatch) {
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrlMatch[1] } } });
    prisma.searchLog.deleteMany({}).then(() => {
        console.log('SearchLog cleared');
        process.exit(0);
    }).catch(console.error);
} else {
    console.error("DATABASE_URL not found in .env");
}
