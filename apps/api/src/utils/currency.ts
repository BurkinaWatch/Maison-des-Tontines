export function formatCurrency(amount: number, currency: string = "XOF"): string {
  const parts = new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace(/\u202f/g, " ");

  return `${currency} ${parts}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.,-]/g, "").trim();
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";
  const hasDecimalPart =
    decimalSeparator !== "." || lastDot !== -1
      ? cleaned.length - Math.max(lastComma, lastDot) - 1 <= 2
      : false;
  const normalized = hasDecimalPart
    ? cleaned
        .replace(decimalSeparator === "," ? /\./g : /,/g, "")
        .replace(decimalSeparator, ".")
    : cleaned.replace(/[.,]/g, "");
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) {
    throw new Error("Invalid currency format");
  }
  return Math.round(parsed * 100) / 100;
}

export function toSmallestUnit(amount: number, currency: string): number {
  if (currency === "XOF" || currency === "XAF" || currency === "USD") {
    return Math.round(amount * 100);
  }
  return Math.round(amount * 100);
}

export function fromSmallestUnit(amount: number, currency: string): number {
  return amount / 100;
}
