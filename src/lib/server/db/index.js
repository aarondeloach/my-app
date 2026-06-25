import mysql from 'mysql2/promise';
import { runMigrations } from './migrate.js';
import { env } from "$env/dynamic/private";

import { logErrorToDatabase } from "$lib/server/db/queries/logErrorToDatabase.js";

const rawPool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: Number(env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Centralized stats and performance reporter
function reportQueryStats(sqlString, values, durationMs, result) {
    // 1. Calculate metrics
    let rowCount = 0;
    let affectedRows = null;

    if (Array.isArray(result) && Array.isArray(result[0])) {
        // SELECT statements return an array of row objects as the first element
        rowCount = result[0].length;
    } else if (result && result[0] && typeof result[0] === 'object') {
        // INSERT/UPDATE statements return a ResultSetHeader object
        affectedRows = result[0].affectedRows;
    }

    // 2. Format query string for readability (collapsing white space)
    const cleanSql = sqlString.trim().replace(/\s+/g, ' ');

    // 3. Print high-utility metrics console log
    /*
    console.log(`📊 [MySQL Stat] [${new Date().toISOString()}]`);
    console.log(`Query:    ${cleanSql}`);
    if (values && values.length > 0) {
        console.log(`Values:   `, values);
    }
    console.log(`Duration: ${durationMs.toFixed(2)} ms`);
    if (affectedRows !== null) {
        console.log(`Impact:   ${affectedRows} rows affected`);
    } else {
        console.log(`Returned: ${rowCount} rows`);
    }
    */
    // Highlight slow queries (anything over 100ms)
    
    if (durationMs > 100) {
        console.warn(`⚠️  WARNING: Slow query detected (>100ms)`);
    }
    // console.log('--------------------------------------------------');
}

// Global error logger
function logSqlError(error, sqlString, values = []) {

    // console.error(`❌ [MySQL Error] [${new Date().toISOString()}]`);
    // console.error(`Message:  ${error.message}`);
    // console.error(`Code:     ${error.code}`);
    // console.error(`Query:    ${sqlString.trim().replace(/\s+/g, ' ')}`);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;

    logErrorToDatabase({
        source: 'database',
        message: errorMessage,
        stack: errorStack,
        url: null,
        method: null,
        userAgent: null
    });
    // console.error('--------------------------------------------------');
}



// Enhanced interceptor wrapper to handle time performance tracking
function wrapMethodWithStats(methodName) {
    const originalMethod = rawPool[methodName].bind(rawPool);

    rawPool[methodName] = async function(sql, values) {
        // Start high-resolution timer before query execution
        const startTime = process.hrtime.bigint();
        
        try {
            const result = await originalMethod(sql, values);
            
            // End timer right after completion
            const endTime = process.hrtime.bigint();
            // Convert nanoseconds to floating-point milliseconds
            const durationMs = Number(endTime - startTime) / 1000000;

            // Report the statistics automatically
            reportQueryStats(sql, values, durationMs, result);
            
            return result;
        } catch (error) {
            logSqlError(error, sql, values);
            throw error; 
        }
    };
}

// Wrap both executors
wrapMethodWithStats('execute');
wrapMethodWithStats('query');


/**
 * Pings the database to verify credentials and network availability.
 * This runs asynchronously right after the module is evaluated.
 */
async function pingDatabase() {
    console.log(`📡 [MySQL] Connecting to ${env.DB_HOST} / database: ${env.DB_NAME}...`);
    try {
        // Attempt to grab one quick connection from the pool
        const connection = await rawPool.getConnection();
        
        // Run a lightweight baseline ping query
        await connection.ping();
        
        // console.log('✅ [MySQL] Connection established successfully!');
        
        // Instantly release the connection slot back to the pool
        connection.release();

        // 🚀 TRIGGER MIGRATIONS IMMEDIATELY UPON SUCCESSFUL CONNECTION PING
        await runMigrations();

    } catch (error) {
        // console.error('❌ [MySQL] CRITICAL: Connection failed on startup!');
        // console.error(`Reason:  ${error.message}`);
        // console.error(`Code:    ${error.code} (${error.errno})`);
        // console.error('--------------------------------------------------');

            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : null;

            logErrorToDatabase({
                source: 'database',
                message: errorMessage,
                stack: errorStack,
                url: null,
                method: null,
                userAgent: null
            });
    }
}

// Execute the self-running ping immediately on module load
pingDatabase();

// Export the wrapped pool
export const db = rawPool;
