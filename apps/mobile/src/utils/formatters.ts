import { Currency, PaymentMethod } from "../types/contribution";

export const formatCurrency = (amount: number, currency: Currency = "XOF"): string => {
  const symbols: Record<string, string> = {
    XOF: "FCFA",
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    GHS: "₵",
    XAF: "FCFA",
  };

  const symbol = symbols[currency] || currency;
  const formatted = amount.toLocaleString("en-US");

  if (currency === "XOF" || currency === "XAF") {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return formatDate(dateString);
};

export const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith("+")) {
    return phone;
  }
  if (phone.length === 10 && phone.startsWith("0")) {
    return `+225${phone.slice(1)}`;
  }
  return phone;
};

export const maskPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 7) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(-3)}`;
  }
  return cleaned;
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    card: "Card",
  };
  return labels[method];
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "#d4a574",
    paid: "#4a9d6e",
    late: "#d4a574",
    missed: "#c45c5c",
    active: "#4a9d6e",
    completed: "#4a9d6e",
    suspended: "#c45c5c",
    draft: "#d4a574",
    open: "#d4a574",
    under_review: "#d4a574",
    resolved: "#4a9d6e",
    closed: "#8585a0",
    processing: "#d4a574",
    failed: "#c45c5c",
    upcoming: "#8585a0",
    current: "#d4a574",
    skipped: "#c45c5c",
  };
  return colors[status.toLowerCase()] || "#8585a0";
};
