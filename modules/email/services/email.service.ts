import nodemailer from "nodemailer";
import { env } from "@/lib/config/env";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Basic SMTP transporter configuration
    // In production, you would configure this with actual SMTP credentials
    // For development, you can use ethereal.email or a simple SMTP trap
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      if (!process.env.SMTP_HOST) {
        console.log("Mocking email send. Set SMTP_HOST to send real emails.");
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.html}`);
        return;
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Pi Learning" <noreply@pilearning.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Could not send email. Please try again later.");
    }
  }

  async sendParentRequestEmail(studentEmail: string, parentName: string, message?: string) {
    const subject = `Parent Connection Request from ${parentName}`;
    const loginUrl = `${env.NEXT_PUBLIC_APP_URL}/login`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Parent Connection Request</h2>
        <p>Hello,</p>
        <p><strong>${parentName}</strong> has sent you a request to connect on Pi Learning so they can monitor your progress and set milestone rewards.</p>
        ${message ? `<p><em>"${message}"</em></p>` : ""}
        <p>Log in to your dashboard to accept or decline this request:</p>
        <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </div>
    `;

    return this.sendEmail({ to: studentEmail, subject, html });
  }
}

export const emailService = new EmailService();
export default emailService;
