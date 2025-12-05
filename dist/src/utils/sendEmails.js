"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = sib_api_v3_sdk_1.default.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
const sendEmail = async (to, subject, text, html) => {
    const sendSmtpEmail = new sib_api_v3_sdk_1.default.SendSmtpEmail();
    sendSmtpEmail.sender = {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "Online Library",
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = text;
    if (html) {
        sendSmtpEmail.htmlContent = html;
    }
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
