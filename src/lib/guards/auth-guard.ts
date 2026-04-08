import { HTTP_STATUS } from "@/server/common/constants/http-status";
import { AppError } from "@/server/common/errors/app-error";
import { API_ERROR_CODES } from "@/server/common/errors/error-codes";

export interface AuthGuardInput {
	isAuthenticated?: boolean;
	userId?: string | null;
	roles?: readonly string[];
}

export function isAuthenticated(input: AuthGuardInput): boolean {
	if (typeof input.isAuthenticated === "boolean") {
		return input.isAuthenticated;
	}

	return Boolean(input.userId);
}

export function hasRole(input: AuthGuardInput, role: string): boolean {
	if (!input.roles || input.roles.length === 0) {
		return false;
	}

	return input.roles.includes(role);
}

export function assertAuthenticated(
	input: AuthGuardInput,
	message = "Authentication is required.",
): asserts input is AuthGuardInput & { userId: string } {
	if (!isAuthenticated(input)) {
		throw new AppError(message, {
			code: API_ERROR_CODES.UNAUTHORIZED,
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			expose: true,
		});
	}
}

export function assertAnyRole(
	input: AuthGuardInput,
	roles: readonly string[],
	message = "You do not have permission to access this resource.",
): void {
	if (roles.length === 0) {
		return;
	}

	const hasAccess = roles.some((role) => hasRole(input, role));
	if (!hasAccess) {
		throw new AppError(message, {
			code: API_ERROR_CODES.FORBIDDEN,
			statusCode: HTTP_STATUS.FORBIDDEN,
			expose: true,
			details: {
				requiredRoles: roles,
			},
		});
	}
}
