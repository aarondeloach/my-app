import { DB_NAME, DB_PORT } from "$env/static/private";


export function load() {
    return {
        dbName: DB_NAME,
        dbPort: DB_PORT
    }
}