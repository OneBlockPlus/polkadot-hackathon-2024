import crypto from 'crypto';

export function hashPhoneNumber(phoneNumber: string) {
    if (!phoneNumber) {
        throw new Error('Phone number is required.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPhoneNumber = crypto.pbkdf2Sync(phoneNumber, salt, 1000, 64, 'sha512').toString('hex');

    return { hashedPhoneNumber, salt };
}
