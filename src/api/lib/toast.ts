"use client";

import { toast } from "sonner";

import type { ApiRequestResult } from "@/api/lib/api";

export interface RequestToastOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function showRequestResultToast<TData>(
  result: ApiRequestResult<TData>,
  options: RequestToastOptions = {},
): void {
  if (result.success) {
    if (options.successMessage) {
      toast.success(options.successMessage);
    }

    return;
  }

  toast.error(options.errorMessage ?? result.message);
}
