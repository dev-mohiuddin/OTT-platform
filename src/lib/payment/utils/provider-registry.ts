import type { PaymentProviderAdapter } from "@/lib/payment/contracts/provider.contract";
import type { PaymentProviderName } from "@/lib/payment/contracts/transaction.contract";

export class PaymentProviderRegistry {
	private readonly providers = new Map<PaymentProviderName, PaymentProviderAdapter>();

	register(provider: PaymentProviderAdapter, options: { overwrite?: boolean } = {}): void {
		if (this.providers.has(provider.name) && !options.overwrite) {
			throw new Error(`Payment provider '${provider.name}' is already registered.`);
		}

		this.providers.set(provider.name, provider);
	}

	get(providerName: PaymentProviderName): PaymentProviderAdapter {
		const provider = this.providers.get(providerName);
		if (!provider) {
			throw new Error(`Payment provider '${providerName}' is not registered.`);
		}

		return provider;
	}

	has(providerName: PaymentProviderName): boolean {
		return this.providers.has(providerName);
	}

	list(): PaymentProviderName[] {
		return Array.from(this.providers.keys());
	}

	clear(): void {
		this.providers.clear();
	}
}

export const paymentProviderRegistry = new PaymentProviderRegistry();
