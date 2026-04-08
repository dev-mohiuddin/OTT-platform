export type PaymentProviderName = "stripe" | "bkash" | "nagad";

export type PaymentMethodType = "card" | "mobile-banking" | "wallet";

export type PaymentTransactionStatus =
	| "initialized"
	| "pending"
	| "authorized"
	| "succeeded"
	| "failed"
	| "cancelled"
	| "refunded";

export interface PaymentTransaction {
	id: string;
	provider: PaymentProviderName;
	amount: number;
	currency: string;
	status: PaymentTransactionStatus;
	customerId: string;
	referenceId: string;
	providerReference?: string;
	methodType?: PaymentMethodType;
	failureReason?: string;
	metadata?: Record<string, string>;
	createdAt: string;
	updatedAt: string;
}

export interface PaymentRefund {
	id: string;
	transactionId: string;
	provider: PaymentProviderName;
	amount: number;
	currency: string;
	reason?: string;
	status: "pending" | "succeeded" | "failed";
	createdAt: string;
	updatedAt: string;
}
