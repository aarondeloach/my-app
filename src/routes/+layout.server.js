import { db } from "$lib/server/db";

export async function load({ locals }) {

    // Provide session from hooks.server.js to +layout.svelte (or any other component) via the `data.session` prop.

    return {
        session: locals.session,
        dbStatus: await db.execute("SHOW STATUS WHERE Variable_name IN ('Uptime', 'Threads_connected', 'Threads_running', 'Max_used_connections')").then(([rows]) => rows.reduce((acc, row) => {
            acc[row.Variable_name] = row.Value;
            return acc;
        }, {}))
    };
}
