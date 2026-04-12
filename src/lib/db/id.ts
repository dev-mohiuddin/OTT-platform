import crypto from "node:crypto";

export function createDatabaseId(): string {
  return crypto.randomUUID();
}
