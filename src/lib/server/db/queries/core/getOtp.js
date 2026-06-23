import { db } from "../../db.js";


export async function getOtp(userId) {

    // create a otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // store it in the database with an expiration time of 5 minutes
    await db.execute("insert into otps (user_id, otp, expires_at, created_at) values (?, ?, date_add(now(), interval 5 minute), now())", [userId, otp]);


    return otp;
}