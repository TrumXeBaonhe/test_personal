import { randomInt } from "crypto";

export function generateAccountNumber(): string {
  const randomDigits = randomInt(0, 1_000_000_000_000).toString().padStart(12, "0");
  return `VN${randomDigits}`;
}

export function isValidAccountNumber(accountNumber: string): boolean {
  return /^VN\d{12}$/.test(accountNumber);
}
