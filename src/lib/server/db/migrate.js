import fs from "fs";
import path from "path";
import { db } from "./index.js";
import { validateEmail, hashPassword } from "$lib/utils";
import { env } from "$env/dynamic/private";

const SETUP_USER_EMAIL = env.SETUP_USER_EMAIL;
const SETUP_USER_PASSWORD = env.SETUP_USER_PASSWORD;
const SETUP_ACCOUNT_TITLE = env.SETUP_ACCOUNT_TITLE;
const SETUP_USER_NAME = env.SETUP_USER_NAME;

const DEFAULT_ACCOUNT_TITLE = "Primary Account";
const DEFAULT_USER_NAME = "Owner";

function normalizeSetupEmail(value) {
    return (value || "").trim().toLowerCase();
}

async function bootstrapFirstAccountAndUser(connection) {
    const [userCountRows] = await connection.execute("SELECT COUNT(*) AS total FROM users");
    const hasUsers = Number(userCountRows?.[0]?.total || 0) > 0;

    if (hasUsers) {
        console.log("ℹ️ Bootstrap skipped: users already exist.");
        return;
    }

    const setupEmail = normalizeSetupEmail(SETUP_USER_EMAIL);
    const setupPassword = (SETUP_USER_PASSWORD || "").trim();

    if ((setupEmail && !setupPassword) || (!setupEmail && setupPassword)) {
        throw new Error("Bootstrap config error: SETUP_USER_EMAIL and SETUP_USER_PASSWORD must be provided together.");
    }

    if (!setupEmail || !setupPassword) {
        console.warn("⚠️ Bootstrap skipped: no users exist and SETUP_USER_EMAIL/SETUP_USER_PASSWORD are missing.");
        return;
    }

    if (!validateEmail(setupEmail)) {
        throw new Error("Bootstrap config error: SETUP_USER_EMAIL is not a valid email address.");
    }

    if (setupPassword.length < 8) {
        throw new Error("Bootstrap config error: SETUP_USER_PASSWORD must be at least 8 characters.");
    }

    await connection.beginTransaction();

    try {
        const [accountCountRows] = await connection.execute("SELECT COUNT(*) AS total FROM accounts");
        const hasAccounts = Number(accountCountRows?.[0]?.total || 0) > 0;

        if (hasAccounts) {
            await connection.execute("DELETE FROM accounts");
            console.warn("⚠️ Bootstrap reset: removed existing accounts because users are empty.");
        }

        const accountTitle = SETUP_ACCOUNT_TITLE || DEFAULT_ACCOUNT_TITLE;
        const [insertAccountResult] = await connection.execute("INSERT INTO accounts (title) VALUES (?)", [accountTitle]);
        const accountId = insertAccountResult.insertId;

        const passwordHash = hashPassword(setupPassword);

        await connection.execute("INSERT INTO users (name, email, password_hash, account_id, status, roles) VALUES (?, ?, ?, ?, ?, ?)", [
            SETUP_USER_NAME || DEFAULT_USER_NAME,
            setupEmail,
            passwordHash,
            accountId,
            "active",
            "[1]",
        ]);

        await connection.commit();
        console.log(`✅ Bootstrap complete: created first account (${accountTitle}) and first user (${SETUP_USER_NAME || DEFAULT_USER_NAME}) from SETUP_* environment variables.`);
    } catch (error) {
        await connection.rollback();
        throw error;
    }
}

/**
 * Automatically applies pending SQL migrations sequentially
 */
export async function runMigrations() {
    console.log("🔄 Checking database schema migrations...");
    const connection = await db.getConnection();

    try {
        // 1. Create a tracking table if it doesn't exist yet
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            )
        `);

        // 2. Fetch the list of already executed migrations
        const [rows] = await connection.execute("SELECT filename FROM _migrations");
        const executedMigrations = new Set(rows.map((r) => r.filename));

        // 3. Read the migration SQL files from disk
        // Note: Using process.cwd() ensures paths work during production builds
        const migrationsDir = path.join(process.cwd(), "src/lib/server/db/migrations");

        if (!fs.existsSync(migrationsDir)) {
            console.log("⚠️ No migrations directory found. Skipping.");
            return;
        }

        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith(".sql"))
            .sort(); // Ensures sequential execution (0001, 0002...)

        // 4. Run any file that hasn't been executed yet
        for (const file of files) {
            if (!executedMigrations.has(file)) {
                console.log(`🚀 Applying migration: ${file}`);

                const filePath = path.join(migrationsDir, file);
                const rawSql = fs.readFileSync(filePath, "utf-8");

                // Start an isolated transaction per migration file for safety
                await connection.beginTransaction();

                try {
                    // mysql2 requires multipleStatements: true to run a batch,
                    // but splitting by semicolon allows safer standard pool execution.
                    const statements = rawSql
                        .split(";")
                        .map((stmt) => stmt.trim())
                        .filter((stmt) => stmt.length > 0);

                    for (const statement of statements) {
                        await connection.execute(statement);
                    }

                    // Record that this file has successfully finished
                    await connection.execute("INSERT INTO _migrations (filename) VALUES (?)", [file]);

                    await connection.commit();
                    console.log(`✅ Successfully applied: ${file}`);
                } catch (migrationError) {
                    await connection.rollback();
                    throw new Error(`Migration ${file} failed! Rolling back. Reason: ${migrationError.message}`);
                }
            }
        }

        await bootstrapFirstAccountAndUser(connection);

        console.log("🏁 Schema migration check complete. Database is up to date.");
    } catch (error) {
        // Do not crash the server container entirely, but alert the engineer loudly
        console.error("❌ CRITICAL: Migration runner crashed!");
        console.error(error.message);
        //todo: log error to database
    } finally {
        connection.release();
    }
}
