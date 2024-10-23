import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

export const generateJwt = (phone_number:string) => {
    return jwt.sign({ phone_number }, process.env.JWT_SECRET as string || 'the-fallback-secret', { expiresIn: '1h' });
}