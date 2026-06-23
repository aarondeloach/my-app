import { db } from "../../db.js";
import { decodeCursorPayload, encodeCursorPayload } from "$lib/utils/cursor.js";

function decodeCursor(cursor) {
    const payload = decodeCursorPayload(cursor);
    const id = Number(payload?.id);

    if (typeof payload?.name !== "string" || !Number.isFinite(id)) {
        return null;
    }

    return {
        name: payload.name,
        id,
    };
}

export async function listAccountUsers({accountId, cursor, search, status}) {
    const pageSize = 40;

    let sql = "";
    let paramsArray = [accountId];
    const where = [];

    // await new Promise((resolve) => setTimeout(resolve, 2000));

    const cursorValues = decodeCursor(cursor);

    if (cursorValues) {
        where.push("(name, id) > (?, ?)");
        paramsArray.push(cursorValues.name, cursorValues.id);
    }

    if (search) {
        where.push("name like ?");
        paramsArray.push(`%${search}%`);
    }

    if (status?.toLowerCase() === "active" || status?.toLowerCase() === "pending") {
        where.push("status = ?");
        paramsArray.push(status);
    }

    if (where.length > 0) {
        sql += " and " + where.join(" and ");
    }

    paramsArray.push(`${pageSize + 1}`); // Fetch one extra record to determine if there are more records after the current page.

    const rows = await db.execute(`select * from users where account_id = ? ${sql} order by name, id limit ?`, paramsArray).then(([result]) => result || []);

    const hasMore = rows.length > pageSize;
    const records = hasMore ? rows.slice(0, pageSize) : rows;
    const lastRecord = records[records.length - 1] || null;
    const nextCursor = hasMore && lastRecord ? encodeCursorPayload({ name: lastRecord.name, id: lastRecord.id }) : null;

    return { records, nextCursor, hasMore };
}
