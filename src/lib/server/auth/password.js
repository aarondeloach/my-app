import crypto from 'crypto';

const HASH_ALGORITHM = 'scrypt';
const KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

function scryptBuffer(password, salt) {
    return crypto.scryptSync(password, salt, KEY_LENGTH, {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
    });
}

export function hashPassword(password) {
    const normalizedPassword = `${password || ''}`;

    if (!normalizedPassword) {
        throw new Error('Password is required.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = scryptBuffer(normalizedPassword, salt).toString('hex');

    return `${HASH_ALGORITHM}$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
    if (!password || !storedHash) {
        return false;
    }

    const [algorithm, n, r, p, salt, hash] = `${storedHash}`.split('$');

    if (!algorithm || !n || !r || !p || !salt || !hash) {
        return false;
    }

    if (algorithm !== HASH_ALGORITHM) {
        return false;
    }

    const expectedHashBuffer = Buffer.from(hash, 'hex');
    const computedHashBuffer = crypto.scryptSync(`${password}`, salt, expectedHashBuffer.length, {
        N: Number(n),
        r: Number(r),
        p: Number(p),
    });

    if (expectedHashBuffer.length !== computedHashBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedHashBuffer, computedHashBuffer);
}
