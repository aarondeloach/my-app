import { DB_NAME } from "$env/static/private";
import {db} from "$lib/server/db/db.js";


export async function load() {

    const foo =await db.execute("select 1+1 as result").then(([rows]) => rows[0].result);

    return {
        dbName: DB_NAME,
        foo
    }
}