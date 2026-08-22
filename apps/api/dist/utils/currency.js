export function formatCurrency(amount, currency = "XOF") {
    const parts = new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
    return `${currency} ${parts}`;
}
export function parseCurrency(value) {
    const cleaned = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) {
        throw new Error("Invalid currency format");
    }
    return Math.round(parsed * 100) / 100;
}
export function toSmallestUnit(amount, currency) {
    if (currency === "XOF" || currency === "XAF" || currency === "USD") {
        return Math.round(amount * 100);
    }
    return Math.round(amount * 100);
}
export function fromSmallestUnit(amount, currency) {
    return amount / 100;
}
//# sourceMappingURL=currency.js.map