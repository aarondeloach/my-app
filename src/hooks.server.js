// import { db } from "$lib/server/db";

// export async function handle({ event, resolve }) {
//     const sessionId = event.cookies.get("sid") || null;

//     if (sessionId) {
//         const session = await db.execute("select * from sessions where id = ? limit 1", [sessionId]).then(([rows]) => rows[0] || {});

//         if (session && session.id) {
//             event.locals.session = session;
//         } else {
//             event.locals.session = {};
//         }
//     } else {
//         event.locals.session = {};
//     }

//     return resolve(event);
// }
