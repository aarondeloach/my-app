import { db } from "../../db.js";

export async function getActiveOptionalFeatureIds(accountId) {
    const sql = `SELECT
    optional_feature_id
FROM (
    SELECT
        ofh.*,
        ROW_NUMBER() OVER (
            PARTITION BY ofh.optional_feature_id
            ORDER BY ofh.created_at DESC, ofh.id DESC
        ) AS rn
    FROM optional_feature_history ofh
    WHERE ofh.account_id = ?
) ranked
WHERE rn = 1
  AND status = 'active'`;

    const [rows] = await db.execute(sql, [accountId]);

    return rows.map((row) => row.optional_feature_id);
}
