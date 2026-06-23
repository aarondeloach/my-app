import { db } from "../../db.js";


export async function validateOtp(userId, otp) {
	const connection = await db.getConnection();

	try {
		await connection.beginTransaction();

		const [rows] = await connection.execute(
			`select id, otp, attempts, expires_at
			from otps
			where user_id = ?
			  and is_verified = 0
			order by created_at desc
			limit 1
			for update`,
			[userId],
		);

		const activeOtp = rows[0];

		if (!activeOtp) {
			await connection.commit();
			return "NO_ACTIVE_OTP";
		}

		if (activeOtp.expires_at < new Date()) {
			await connection.commit();
			return "EXPIRED";
		}

		if (activeOtp.attempts >= 3) {
			await connection.commit();
			return "TOO_MANY_ATTEMPTS";
		}

		if (activeOtp.otp === otp) {
			await connection.execute("update otps set is_verified = 1 where id = ?", [activeOtp.id]);
			await connection.commit();
			return "SUCCESS";
		}

		await connection.execute("update otps set attempts = attempts + 1 where id = ?", [activeOtp.id]);
		await connection.commit();
		return "INVALID_CODE";
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
}