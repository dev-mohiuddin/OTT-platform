import type {
	PaymentProviderName,
	PaymentTransactionStatus,
} from "@/lib/payment/contracts/transaction.contract";

export interface PaymentWebhookEvent {
	provider: PaymentProviderName;
	eventId: string;
	eventType: string;
	occurredAt: string;
	transactionId?: string;
	referenceId?: string;
	status?: PaymentTransactionStatus;
	signature?: string;
	rawPayload: unknown;
}

export interface PaymentWebhookVerificationResult {
	isValid: boolean;
	event?: PaymentWebhookEvent;
	reason?: string;
}
