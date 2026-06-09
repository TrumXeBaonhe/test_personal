export function generateAccountNumber(): string {
  const randomDigits = Math.floor(Math.random() * 1000000000000)
    .toString()
    .padStart(12, "0");
  return `VN${randomDigits}`;
}

export function isValidAccountNumber(accountNumber: string): boolean {
  return /^VN\d{12}$/.test(accountNumber);
}
