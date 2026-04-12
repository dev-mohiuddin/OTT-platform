"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export interface UserSubscription {
  id: string;
  userId: string;
  plan: string;
  status: "active" | "cancelled" | "past_due" | "paused";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

export interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: string;
  description: string;
}

export async function getUserSubscriptions(): Promise<UserSubscription[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  try {
    // TODO: Implement subscription fetching from database
    // For now, return empty array as placeholder
    // In future, fetch from subscriptions collection with filters
    const collections = (db as any).collections;
    if (!collections?.subscriptions) {
      return [];
    }

    const subscriptions = await collections.subscriptions
      .find({ userId: session.user.id })
      .toArray();

    return subscriptions || [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
}

export async function getUserPaymentHistory(): Promise<PaymentHistory[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  try {
    // TODO: Implement payment history fetching from database
    // For now, return empty array as placeholder
    // In future, fetch from transactions collection with filters
    const collections = (db as any).collections;
    if (!collections?.transactions) {
      return [];
    }

    const transactions = await collections.transactions
      .find({ customerId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return (
      transactions?.map((t: any) => ({
        id: t.id,
        date: new Date(t.createdAt),
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        description: `Payment - ${t.provider}`,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return [];
  }
}
