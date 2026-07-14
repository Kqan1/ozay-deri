import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { UTApi } from "uploadthing/server";
const utapi = new UTApi();
async function run() {
    try {
        const files = await utapi.listFiles({ limit: 2, offset: 0 });
        console.log(files);
    } catch(e) {
        console.error(e);
    }
}
run();
