import nodemailer from "nodemailer";

import { getSmtpEnvRequired } from "@/config/env/server-env";

let transporter: nodemailer.Transporter | null = null;

export function getSmtpTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const env = getSmtpEnvRequired(process.env);

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}
