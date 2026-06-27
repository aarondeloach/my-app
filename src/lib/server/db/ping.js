/**
 * Pings the database to verify credentials and network availability.
 * Use this for startup checks or health monitoring. If the ping fails,
 * the process will exit with a non-zero status code.
 */

import mysql from "mysql2/promise";
import process from "node:process";

async function ping() {
    console.log(`📡 [Ping] Beginning database ping check...`);

    // Try loading files fluidly. If they don't exist, it skips without breaking.
    try {
        process.loadEnvFile(".env.development");
        console.log("ℹ️ [Ping] Loaded config from .env.development");
    } catch {
        try {
            process.loadEnvFile(".env.production");
            console.log("ℹ️ [Ping] Loaded config from .env.production");
        } catch {
            console.log("ℹ️ [Ping] No env files found. Using pre-injected environment variables.");
        }
    }

    console.log(`📡 [Ping] Connecting to ${process.env.DB_HOST} / database: ${process.env.DB_NAME}...`);
    try {
        // const connection = await rawPool.getConnection();

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT) || 3306
        });
        await connection.ping();
        console.log("✅ [Ping] Database ping was successful!");
        await connection.end();
    } catch (error) {
        console.error("❌ [Ping] CRITICAL: Database ping failed!");
        console.error(`Reason:  ${error.message}`);
        console.error(`Code:    ${error.code} (${error.errno})`);
        process.exit(1);
    }
}

ping(); // Immediately ping the database on module load
