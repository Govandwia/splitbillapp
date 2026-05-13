import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Item = {
  id: string;
  name: string;
  price: number;
  amount: number;
  claims: Record<string, number>;
};

export type ParticipantSummary = {
  name: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  isPaid?: boolean;
};

/**
 * Calculates the split bill proportionally.
 */
export function calculateSplit(
  items: Record<string, Item>,
  taxPercentage: number,
  serviceCharge: number,
  participants: string[],
  paidStatus: Record<string, boolean> = {}
): ParticipantSummary[] {
  const summaries: Record<string, ParticipantSummary> = {};
  
  // Initialize summaries
  participants.forEach(p => {
    summaries[p] = {
      name: p,
      subtotal: 0,
      tax: 0,
      serviceCharge: 0,
      total: 0,
      isPaid: paidStatus[p] || false
    };
  });

  let totalItemsPrice = 0;

  // Calculate subtotals
  Object.values(items).forEach(item => {
    if (item.claims) {
      Object.entries(item.claims).forEach(([p, count]) => {
        if (count > 0 && summaries[p]) {
          summaries[p].subtotal += item.price * count;
        }
      });
    }
    // We base the total bill ratio on the actual total value of all items, or just the claimed items?
    // If the goal is that tax is distributed based on what is claimed, we should only sum the price of claimed quantities.
    // Wait, usually the total receipt tax is fixed, but here we calculate it proportionally to the claimed subtotal.
    // The totalItemsPrice here should be the sum of the total receipt, which is item.price * item.amount.
    totalItemsPrice += item.price * (item.amount || 1);
  });

  const totalTax = totalItemsPrice * (taxPercentage / 100);

  // Calculate proportional tax, service charge, and grand total
  participants.forEach(p => {
    const summary = summaries[p];
    if (totalItemsPrice > 0) {
      const ratio = summary.subtotal / totalItemsPrice;
      summary.tax = totalTax * ratio;
      summary.serviceCharge = serviceCharge * ratio;
    }
    summary.total = summary.subtotal + summary.tax + summary.serviceCharge;
  });

  return Object.values(summaries);
}
