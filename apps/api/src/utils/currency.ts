export function formatCurrency(amount: number, currency: string = "XOF"): string {
  const parts = new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency} ${parts}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
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
