import { dev } from "$app/environment";
import { db } from "../index.js";

export async function logErrorToDatabase(data) {

    const query = `
        INSERT INTO app_errors (id, environment, source, message, stack, url, method, user_agent, cause)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.id || crypto.randomUUID(),
        dev ? "development" : "production",
        data.source,
        data.message,
        data.stack || null,
        data.url || null,
        data.method || null,
        data.userAgent || null,
        data.cause || null,
    ];

    try {
        if (dev) {
            console.error("Logging development environment error:", {
                id: values[0],
                environment: values[1],
                source: values[2],
                message: values[3],
                stack: values[4],
                url: values[5],
                method: values[6],
                userAgent: values[7],
                cause: values[8]
            });
        } else {

            await db.execute(query, values);
        }
    } catch (dbError) {
        // Fallback to standard console logging if the database is down
        console.error("CRITICAL: Database logging failed!", dbError);
        console.error("Original Error:", data);
    }
}
