import { db } from "$lib/server/db";

export async function status() {
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
