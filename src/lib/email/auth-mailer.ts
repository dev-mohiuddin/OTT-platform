import { getSmtpEnvRequired } from "@/config/env/server-env";
import { getSmtpTransporter } from "@/lib/email/smtp-client";

interface SendAuthCodeEmailInput {
  to: string;
  code: string;
  title: string;
  subtitle: string;
  expiresInMinutes: number;
}

export function buildAuthEmailHtml(input: SendAuthCodeEmailInput): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0f0a1a; color: #f8f7ff; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <h2 style="margin: 0 0 8px; font-size: 22px; letter-spacing: 0.2px;">${input.title}</h2>
      <p style="margin: 0 0 20px; color: #c4bedf; line-height: 1.5;">${input.subtitle}</p>
      <div style="display: inline-block; padding: 14px 18px; border-radius: 12px; background: #7300ff; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
        ${input.code}
      </div>
      <p style="margin: 20px 0 0; color: #b0a9ce; font-size: 14px;">
        This code expires in ${input.expiresInMinutes} minutes.
      </p>
      <p style="margin: 10px 0 0; color: #8b84a9; font-size: 13px; line-height: 1.45;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `;
}

export async function sendAuthCodeEmail(input: SendAuthCodeEmailInput): Promise<void> {
  const env = getSmtpEnvRequired(process.env);

  const smtp = getSmtpTransporter();

  await smtp.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: `${input.title} - Dristy OTT`,
    html: buildAuthEmailHtml(input),
  });
}
