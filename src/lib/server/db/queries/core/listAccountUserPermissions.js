import {sqlite} from "$lib/server/sqlite/db.js";
import {getActiveOptionalFeatureIds} from "$lib/server/db/queries/core/getActiveOptionalFeatureIds.js";
import {getEnvironmentFeatureIds} from "$lib/server/sqlite/queries/getEnvironmentFeatureIds.js";



export async function listAccountUserPermissions({accountId, environmentId, environmentVersionId, cursor, search, access, featureAccess}) {
    const pageSize = 40;

    const activeOptionalFeatureIds = await getActiveOptionalFeatureIds(accountId);

    const envFeatureIds = await getEnvironmentFeatureIds(environmentId, environmentVersionId, activeOptionalFeatureIds);

    const allFeatures = await sqlite.prepare(`select id, title, description from features order by title`).all();

    const availableFeatures = Object.fromEntries(
        Object.entries(allFeatures)
            .filter(([, feature]) => envFeatureIds.includes(feature.id))
            .map(([featureId, feature]) => [
                feature.id,
                {
                    id: feature.id,
                    title: feature.title,
                    description: feature.description,
                    access: featureAccess[feature.id] || null,
                },
            ]),
    );

    // sort the features alphabetically by title
    const sortedFeatures = Object.fromEntries(Object.entries(availableFeatures).sort((a, b) => a[1].title.localeCompare(b[1].title)));

    let rows = Object.values(sortedFeatures);

    const lastId = cursor;
    // start the rows after the last id
    if (lastId) {
        const lastIndex = rows.findIndex((row) => row.id === lastId);
        if (lastIndex === -1) {
            return { message: "Invalid cursor.", status: 400 };
        }
        rows = rows.slice(lastIndex + 1);
    }

    if (search) {
        // filter the rows based on the search term matching the title or description
        rows = rows.filter((row) => row.title.toLowerCase().includes(search.toLowerCase()) || row.description.toLowerCase().includes(search.toLowerCase()));
    }


    if (access === "create") {
        // filter the rows based on the access level
        rows = rows.filter((row) => row.access?.includes("c"));
    } else if (access === "read") {
        rows = rows.filter((row) => row.access?.includes("r"));
    } else if (access === "update") {
        rows = rows.filter((row) => row.access?.includes("u"));
    } else if (access === "delete") {
        rows = rows.filter((row) => row.access?.includes("d"));
    } else if (access === "none") {
        // filter the rows to include only those with no access
        rows = rows.filter((row) => !row.access);
    }


    // Fetch one extra record to determine if there are more records after the current page.
    rows = rows.slice(0, pageSize + 1);

    const hasMore = rows.length > pageSize;
    const records = hasMore ? rows.slice(0, pageSize) : rows;
    const lastRecord = records[records.length - 1] || null;
    const nextCursor = hasMore && lastRecord ? lastRecord.id : null;

    return { records, nextCursor, hasMore };
}
