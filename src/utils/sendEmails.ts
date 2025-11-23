// import nodemailer from "nodemailer";

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
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";
dotenv.config();

// إعداد Brevo API
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY!;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async (to: string, subject: string, text: string) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL!,
    name: "Online Library",
  };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.textContent = text;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent via Brevo:", data.messageId);
  } catch (error: any) {
    console.error("❌ Email error:", error.response?.body || error.message);
    throw new Error("Email sending failed");
  }
};
