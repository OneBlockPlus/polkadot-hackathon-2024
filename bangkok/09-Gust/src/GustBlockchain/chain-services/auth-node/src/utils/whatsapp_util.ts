import * as venom from 'venom-bot';

let whatsappClient: venom.Whatsapp | null = null;

export const createWhatsAppClient = async () => {
  try {
    whatsappClient = await venom.create({
      session: 'otp-session',
    });
    console.log('WhatsApp session started!');
  } catch (error) {
    console.error('Failed to create WhatsApp client:', error);
    throw new Error('WhatsApp client creation failed');
  }
};

export const sendOtpWhatsApp = async (phoneNumber: string, otp: string) => {
    if (!whatsappClient) {
        throw new Error('No WhatsApp client available to send OTP.');
    }

    const formattedPhoneNumber = `${phoneNumber.replace('0', '27')}@c.us`;

    try {
        await whatsappClient.sendText(formattedPhoneNumber, `Your OTP code is: ${otp}`);
        console.log('OTP sent successfully!');
    } catch (error) {
        console.error('Error sending OTP via WhatsApp:', error);
        throw new Error('Failed to send OTP via WhatsApp');
    }
};

