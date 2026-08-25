import { api } from "./api";

export type PaymentMethodType = "MOBILE_MONEY" | "CARD";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  provider: string | null;
  cardBrand: string | null;
  maskedValue: string;
  createdAt: string;
}

export type CreatePaymentMethodInput =
  | { type: "MOBILE_MONEY"; label: string; provider: string; phone: string }
  | { type: "CARD"; label: string; cardBrand: string; cardNumber: string };

export const paymentMethodService = {
  async list(): Promise<PaymentMethod[]> {
    const response = await api.get<{ paymentMethods: PaymentMethod[] }>("/users/me/payment-methods");
    return response.paymentMethods;
  },

  async create(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    const response = await api.post<{ paymentMethod: PaymentMethod }>(
      "/users/me/payment-methods",
      input
    );
    return response.paymentMethod;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/me/payment-methods/${encodeURIComponent(id)}`);
  },
};