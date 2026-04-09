import crypto from "node:crypto";

import { AUTH_CODE_LENGTH } from "@/lib/auth/constants";

export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export function createNumericAuthCode(length = AUTH_CODE_LENGTH): string {
  const min = 10 ** (length - 1);
  const max = (10 ** length) - 1;

  return String(crypto.randomInt(min, max + 1));
}

export function hashAuthCode(rawCode: string): string {
  return crypto.createHash("sha256").update(rawCode).digest("hex");
}

export function isAuthCodeExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export function maskEmail(email: string): string {
  const [localPart, domainPart = ""] = email.split("@");
  if (!localPart || !domainPart) {
    return "***";
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}***@${domainPart}`;
  }

  return `${localPart.slice(0, 2)}***@${domainPart}`;
}
