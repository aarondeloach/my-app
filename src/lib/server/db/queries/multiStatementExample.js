// src/lib/server/queries/orderQueries.js
import { db } from '$lib/server/db/db.js';

/**
 * Creates an order and subtracts product stock atomically
 */
export async function checkoutOrder(userId, items, totalAmount) {
    // 1. Get a single dedicated connection from the pool
    const connection = await db.getConnection();

    try {
        // 2. Start the transaction
        await connection.beginTransaction();

        // 3. Statement A: Insert the main order record
        const insertOrderSql = `
            INSERT INTO orders (user_id, total_amount, status) 
            VALUES (?, ?, 'pending')
        `;
        const [orderResult] = await connection.execute(insertOrderSql, [userId, totalAmount]);
        const orderId = orderResult.insertId;

        // 4. Statement B: Insert line items & update stock sequentially
        const insertItemSql = `
            INSERT INTO order_items (order_id, product_id, quantity) 
            VALUES (?, ?, ?)
        `;
        const updateStockSql = `
            UPDATE products 
            SET stock = stock - ? 
            WHERE id = ? AND stock >= ?
        `;

        for (const item of items) {
            // Add item record
            await connection.execute(insertItemSql, [orderId, item.productId, item.quantity]);

            // Deduct inventory
            const [stockResult] = await connection.execute(updateStockSql, [item.quantity, item.productId, item.quantity]);
            
            // Critical Check: If zero rows updated, we ran out of stock during the loop!
            if (stockResult.affectedRows === 0) {
                throw new Error(`Insufficient stock for product ID: ${item.productId}`);
            }
        }

        // 5. Commit all changes if everything succeeded
        await connection.commit();
        return { success: true, orderId };

    } catch (error) {
        // 6. Roll back EVERY statement if any error occurs
        await connection.rollback();
        console.error('Transaction failed, rolled back changes:', error.message);
        throw error; // Re-throw so your SvelteKit route can handle the user message

    } finally {
        // 7. ALWAYS release the connection back to the pool
        connection.release();
    }
}
