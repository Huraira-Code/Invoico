import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export const sendOtpSMS = async (phone, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your verification OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });

        console.log("OTP SENT SID:", message.sid);

        return {
            success: true,
            sid: message.sid,
        };

    } catch (error) {
        console.error("SMS ERROR:", error);

        return {
            success: false,
            error: error.message,
        };
    }
};