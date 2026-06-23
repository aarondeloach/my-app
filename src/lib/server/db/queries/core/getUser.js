import { db } from "../../db.js";


export async function getUser(accountId, userUuid) {
    return await db.execute("select id, uuid, name, email, roles from users where uuid = ? and account_id = ? limit 1", [uuid, locals.session.account.id])
        .then(([rows]) => rows[0]);
}