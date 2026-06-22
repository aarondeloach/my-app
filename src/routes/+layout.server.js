import { DB_NAME } from "$env/static/private";


export function load() {
    return {
        dbName: DB_NAME,
    }
}