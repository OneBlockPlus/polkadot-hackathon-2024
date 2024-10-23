import { Request, Response } from 'express';
import crypto from 'crypto';

import { UserService } from '../services/user_service';
import { OTPService } from '../services/otp_service';
import { clearStoredOtp } from './otp_controller';

const userService = new UserService();
const otpService = new OTPService();

export const userSignUp = async (req: Request, res: Response): Promise<any> => {
    const { phone_number } = req.body;

    if (!phone_number) {
        return res.status(400).json({ success: false ,message: 'Phone number is required.' });
    }

    try {
        const existing_user = await userService.findUserByPhoneNumber(phone_number);
        if (existing_user) {
            return res.status(400).json({ success: false ,message: 'Phone number already registered.' });
        }
        
        const user = await userService.createUser(phone_number);
        const otp = await otpService.sendOtp(phone_number);        
        return res.status(201).json({ success: true ,userId: user.id, message: 'OTP sent to WhatsApp.' });
    } catch (error) {
        return res.status(500).json({ success: false ,message: 'Error signing up user', error });
    }
};

export const userLogin = async (req: Request, res: Response): Promise<any>  => {
    console.log('Login route hit');
    const { phone_number } = req.body;

    if (!phone_number) {
        return res.status(400).json({ success: false ,message: 'Phone number is required.' });
    }

    try {
        const user = await userService.findUserByPhoneNumber(phone_number);

        if (!user) {
            return res.status(404).json({ success: false , message: 'User not found.' });
        }

        const { salt, hash_phone_number: storedHashedPhone } = user;
        const hashedPhoneNumber = crypto.pbkdf2Sync(phone_number, salt, 1000, 64, 'sha512').toString('hex');

        if (hashedPhoneNumber !== storedHashedPhone) {
            return res.status(401).json({ success: false , message: 'Invalid phone number.' });
        }

        const otp = await otpService.sendOtp(phone_number);
        return res.status(200).json({ success: true ,message: 'OTP sent to WhatsApp.' });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ success: false ,message: 'Login failed', error });
    }
};

export const verifyOtp = async (req: Request, res: Response): Promise<any>  => {
    console.log('Verify OTP route hit');
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
        return res.status(400).json({ success: false , message: 'Phone number and OTP are required.' });
    }

    try {
        const isValidOtp = await otpService.verifyOtp(phone_number, otp);
        console.log(isValidOtp);
        if (!isValidOtp) {
            return res.status(400).json({ success: false ,message: 'Invalid OTP.' });
        }

        const token = userService.generateJwt(phone_number);
        // res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
        res.cookie('token', token, {
            httpOnly: true,     
            secure: true,        
            sameSite: 'strict',  
            maxAge: 3600000    
        });
        await clearStoredOtp(phone_number);
        return res.status(200).json({ success: true , message: 'OTP verified successfully.', token });
    } catch (error) {
        return res.status(500).json({ success: false , message: 'Failed to verify OTP.', error });
    }
};
