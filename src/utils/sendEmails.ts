import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY!;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL!,
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
  } catch (error: any) {
    console.error("❌ Email error:", error.response?.body || error.message);
    throw new Error("Email sending failed");
  }
};
