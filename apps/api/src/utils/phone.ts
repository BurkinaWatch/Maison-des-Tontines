export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("00")) {
    return "+" + cleaned.substring(2);
  }
  if (!cleaned.startsWith("+")) {
    return "+" + cleaned;
  }
  return cleaned;
}

export function validatePhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const regex = /^\+[1-9]\d{6,14}$/;
  return regex.test(normalized);
}

export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 8) return normalized;
  return normalized.substring(0, 3) + "****" + normalized.substring(normalized.length - 3);
}

export function generateOtp(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}
