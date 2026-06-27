import { db, status } from "$lib/server/db";

export async function load({ locals, request, url }) {
    return {
        session: locals.session,
        dbStatus: await status(),
    };
}
