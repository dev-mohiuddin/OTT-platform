export type UserRole = string;
export type SubscriptionTier = "free" | "basic" | "standard" | "premium";

export interface AuthContext {
	isAuthenticated: boolean;
	userId?: string;
	profileId?: string;
	roles: readonly UserRole[];
	permissions: readonly string[];
	subscriptionTier?: SubscriptionTier;
}

export const ANONYMOUS_AUTH_CONTEXT: AuthContext = {
	isAuthenticated: false,
	roles: [],
	permissions: [],
};

export interface CreateAuthContextInput {
	userId?: string | null;
	profileId?: string | null;
	roles?: readonly UserRole[];
	permissions?: readonly string[];
	subscriptionTier?: SubscriptionTier;
}

export function createAuthContext(input: CreateAuthContextInput): AuthContext {
	const userId = input.userId ?? undefined;

	return {
		isAuthenticated: Boolean(userId),
		userId,
		profileId: input.profileId ?? undefined,
		roles: input.roles ?? [],
		permissions: input.permissions ?? [],
		subscriptionTier: input.subscriptionTier,
	};
}

export function hasRole(context: AuthContext, role: UserRole): boolean {
	return context.roles.includes(role);
}

export function hasAnyRole(context: AuthContext, roles: readonly UserRole[]): boolean {
	return roles.some((role) => context.roles.includes(role));
}

export function hasPermission(context: AuthContext, permission: string): boolean {
	return context.permissions.includes(permission);
}
