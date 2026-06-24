import { db } from "$lib/server/db";

export async function load({ locals }) {
    // Provide session from hooks.server.js to +layout.svelte (or any other component) via the `data.session` prop.

    async function getDbStatus() {
        try {
            const status = await db.execute("SHOW STATUS WHERE Variable_name IN ('Uptime', 'Threads_connected', 'Threads_running', 'Max_used_connections')").then(([rows]) =>
                rows.reduce((acc, row) => {
                    acc[row.Variable_name] = row.Value;
                    return acc;
                }, {}),
            );
            return status;
        } catch (error) {
            console.error("Error fetching database status:", error);
            return {error: error.message};
        }
    }

    async function getDbTables() {
        try {
            const tables = await db.execute("SHOW TABLES").then(([rows]) => rows.map((row) => Object.values(row)[0] || []));
            return tables;
        } catch (error) {
            console.error("Error fetching database tables:", error);
            return {error: error.message};
        }
    }

    return {
        session: locals.session,
        dbStatus: await getDbStatus(),
        dbTables: await getDbTables(),
        // geth the current environment variables for debugging purposes (excluding sensitive information)
        processEnv: process.env.NODE_ENV, 
        //dbUsers: await db.execute("SELECT id, uuid, name, email, account_id, status, roles FROM users").then(([rows]) => rows || []),
        //dbAccounts: await db.execute("SELECT id, uuid, title FROM accounts").then(([rows]) => rows || []),
    };
}
