"use strict";
// import nodemailer from "nodemailer";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
// export const sendEmail = async (to: string, subject: string, text: string) => {
//   console.log("Email user:", process.env.EMAIL_USER);
//   console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   try {
//     const info = await transporter.sendMail({
//       from: `"Online_Library" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//     });
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Email error:", error);
//   }
// };
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// إعداد Brevo API
const client = sib_api_v3_sdk_1.default.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
const sendEmail = async (to, subject, text) => {
    const sendSmtpEmail = new sib_api_v3_sdk_1.default.SendSmtpEmail();
    sendSmtpEmail.sender = {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "Online Library",
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = text;
    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("✅ Email sent via Brevo:", data.messageId);
    }
    catch (error) {
        console.error("❌ Email error:", error.response?.body || error.message);
        throw new Error("Email sending failed");
    }
};
exports.sendEmail = sendEmail;
