export function getUserInitials(
  name: string | null | undefined,
  maxLength: number = 2,
): string {
  const normalizedName = name?.trim() ?? "";
  const safeMaxLength = Math.max(1, maxLength);

  if (!normalizedName) {
    return "U";
  }

  const initials = normalizedName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, safeMaxLength);

  return initials || "U";
}
