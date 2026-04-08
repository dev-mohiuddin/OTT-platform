import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

export type SubscriptionTier = "free" | "basic" | "standard" | "premium";

const TIER_PRIORITY: Record<SubscriptionTier, number> = {
	free: 0,
	basic: 1,
	standard: 2,
	premium: 3,
};

export interface SubscriptionGuardInput {
	isActive?: boolean;
	tier?: SubscriptionTier;
	expiresAt?: Date | string | null;
}

function parseDate(value: Date | string | null | undefined): Date | undefined {
	if (!value) {
		return undefined;
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date;
}

export function isSubscriptionActive(
	input: SubscriptionGuardInput,
	now: Date = new Date(),
): boolean {
	if (input.isActive === false) {
		return false;
	}

	const expiration = parseDate(input.expiresAt);
	if (expiration && expiration.getTime() <= now.getTime()) {
		return false;
	}

	return Boolean(input.isActive ?? input.tier) && input.tier !== "free";
}

export function hasMinimumSubscriptionTier(
	input: SubscriptionGuardInput,
	minimumTier: SubscriptionTier,
): boolean {
	const currentTier = input.tier ?? "free";
	return TIER_PRIORITY[currentTier] >= TIER_PRIORITY[minimumTier];
}

export function assertActiveSubscription(
	input: SubscriptionGuardInput,
	message = "An active subscription is required.",
): void {
	if (!isSubscriptionActive(input)) {
		throw new AppError(message, {
			code: API_ERROR_CODES.SUBSCRIPTION_INACTIVE,
			statusCode: HTTP_STATUS.FORBIDDEN,
			expose: true,
		});
	}
}

export function assertMinimumSubscriptionTier(
	input: SubscriptionGuardInput,
	minimumTier: SubscriptionTier,
	message = "Your current subscription tier does not allow this operation.",
): void {
	assertActiveSubscription(input);

	if (!hasMinimumSubscriptionTier(input, minimumTier)) {
		throw new AppError(message, {
			code: API_ERROR_CODES.SUBSCRIPTION_INACTIVE,
			statusCode: HTTP_STATUS.FORBIDDEN,
			expose: true,
			details: {
				minimumTier,
				currentTier: input.tier ?? "free",
			},
		});
	}
}
