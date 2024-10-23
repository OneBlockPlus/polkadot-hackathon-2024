import { clearStoredOtp, isOtpExpired } from '../controller/otp_controller';
import { OTPModel } from '../model/otp_model';
import { generateOtp, verifyOtp } from '../utils/otp_util';
import { createWhatsAppClient, sendOtpWhatsApp } from '../utils/whatsapp_util';
import bcrypt from 'bcrypt';

createWhatsAppClient().catch(console.error);

export class OTPService {
    private otpModel = new OTPModel();

    async sendOtp(phone_number: string) {
        const otp = generateOtp();
        const expiry = Date.now() + 300 * 1000;

        await this.otpModel.createOTP(phone_number, otp, expiry);
        await sendOtpWhatsApp(phone_number, otp);
        return otp;
    }
    async verifyOtp(phone_number: string, otp: string): Promise<boolean> {
        const storedOtp = await this.otpModel.getOtp(phone_number);
    
        console.log('Stored OTP:', storedOtp.otp);
        console.log('Input OTP:', otp);

        if (await isOtpExpired(storedOtp)) {
            await clearStoredOtp(phone_number);
            return false;
        }
    
        const isOTPValid = await bcrypt.compare(otp, storedOtp.otp);
        console.log(`OTP valid: ${isOTPValid}`);

        if (!storedOtp) return false;    
        if (Date.now() > storedOtp.expiry) {
            return false; 
        }    
        // return otp.trim() === storedOtp.otp.trim();
        return isOTPValid;
    }
    

    // async verifyOtp(phone_number: string, otp: string): Promise<boolean> {
    //     const storedOtp = await this.otpModel.getOtp(phone_number);

    //     if (!storedOtp) return false;
    //     return verifyOtp(otp, storedOtp.otp);
    // }
}
