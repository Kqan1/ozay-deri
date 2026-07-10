import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log("Connected to DB");

    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    console.log("Extension pg_trgm ensured.");

    await client.end();
}

run().catch(console.error);
