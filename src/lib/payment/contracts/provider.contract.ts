import type {
	PaymentProviderName,
	PaymentRefund,
	PaymentTransaction,
	PaymentTransactionStatus,
} from "@/lib/payment/contracts/transaction.contract";
import type { PaymentWebhookEvent } from "@/lib/payment/contracts/webhook.contract";

export const PAYMENT_PROVIDER_NAMES = ["stripe", "bkash", "nagad"] as const;

export interface CreateCheckoutSessionInput {
	amount: number;
	currency: string;
	customerId: string;
	referenceId: string;
	returnUrl: string;
	cancelUrl?: string;
	description?: string;
	metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionResult {
	provider: PaymentProviderName;
	transactionId: string;
	checkoutUrl: string;
	status: PaymentTransactionStatus;
	raw?: unknown;
}

export interface RefundTransactionInput {
	transactionId: string;
	amount?: number;
	reason?: string;
	metadata?: Record<string, string>;
}

export interface PaymentProviderAdapter {
	readonly name: PaymentProviderName;
	createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult>;
	verifyTransaction(transactionId: string): Promise<PaymentTransaction>;
	refundTransaction(input: RefundTransactionInput): Promise<PaymentRefund>;
	parseWebhook(request: Request, rawBody: string): Promise<PaymentWebhookEvent>;
}
