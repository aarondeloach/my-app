import fs from 'fs';
import path from 'path';
import { db } from './db.js';

/**
 * Automatically applies pending SQL migrations sequentially
 */
export async function runMigrations() {
    console.log('🔄 Checking database schema migrations...');
    const connection = await db.getConnection();

    try {
        // 1. Create a tracking table if it doesn't exist yet
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Fetch the list of already executed migrations
        const [rows] = await connection.execute('SELECT filename FROM _migrations');
        const executedMigrations = new Set(rows.map(r => r.filename));

        // 3. Read the migration SQL files from disk
        // Note: Using process.cwd() ensures paths work during production builds
        const migrationsDir = path.join(process.cwd(), 'src/lib/server/db/migrations');
        
        if (!fs.existsSync(migrationsDir)) {
            console.log('⚠️ No migrations directory found. Skipping.');
            return;
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensures sequential execution (0001, 0002...)

        // 4. Run any file that hasn't been executed yet
        for (const file of files) {
            if (!executedMigrations.has(file)) {
                console.log(`🚀 Applying migration: ${file}`);
                
                const filePath = path.join(migrationsDir, file);
                const rawSql = fs.readFileSync(filePath, 'utf-8');

                // Start an isolated transaction per migration file for safety
                await connection.beginTransaction();

                try {
                    // mysql2 requires multipleStatements: true to run a batch, 
                    // but splitting by semicolon allows safer standard pool execution.
                    const statements = rawSql
                        .split(';')
                        .map(stmt => stmt.trim())
                        .filter(stmt => stmt.length > 0);

                    for (const statement of statements) {
                        await connection.execute(statement);
                    }

                    // Record that this file has successfully finished
                    await connection.execute('INSERT INTO _migrations (filename) VALUES (?)', [file]);
                    
                    await connection.commit();
                    console.log(`✅ Successfully applied: ${file}`);
                } catch (migrationError) {
                    await connection.rollback();
                    throw new Error(`Migration ${file} failed! Rolling back. Reason: ${migrationError.message}`);
                }
            }
        }

        console.log('🏁 Schema migration check complete. Database is up to date.');

    } catch (error) {
        console.error('❌ CRITICAL: Migration runner crashed!');
        console.error(error.message);
        // Do not crash the server container entirely, but alert the engineer loudly
    } finally {
        connection.release();
    }
}
