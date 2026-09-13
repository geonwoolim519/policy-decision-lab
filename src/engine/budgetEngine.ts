import type { PolicyCase } from "../types/policy";
import { sumValues } from "./math";

export function remainingBudget(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
) {
  return policyCase.totalBudget - sumValues(allocations);
}

export function isBudgetValid(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
) {
  const used = sumValues(allocations);
  if (used <= 0) return false;
  if (used > policyCase.totalBudget) return false;
  return policyCase.policyOptions.every((option) => {
    const amount = allocations[option.id] ?? 0;
    if (amount === 0) return true;
    return amount >= option.minCost && amount <= option.maxCost;
  });
}

export function allocationShare(
  allocations: Record<string, number>,
  policyId: string,
  totalBudget: number,
) {
  if (totalBudget <= 0) return 0;
  return (allocations[policyId] ?? 0) / totalBudget;
}
