import type { PolicyCase, PolicyEventRule } from "../types/policy";
import { allocationShare } from "./budgetEngine";
import { sumValues } from "./math";

export function selectEvents(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
): PolicyEventRule[] {
  const unusedShare =
    (policyCase.totalBudget - sumValues(allocations)) / policyCase.totalBudget;

  const matched = policyCase.events.filter((event) => {
    if (event.always) return true;
    if (event.unusedMin != null && unusedShare < event.unusedMin) return false;
    if (event.unusedMax != null && unusedShare > event.unusedMax) return false;
    if (event.policyId) {
      const share = allocationShare(
        allocations,
        event.policyId,
        policyCase.totalBudget,
      );
      if (event.minShare != null && share < event.minShare) return false;
      if (event.maxShare != null && share > event.maxShare) return false;
    }
    return !event.policyId && event.unusedMin == null && event.unusedMax == null
      ? false
      : true;
  });

  const unique = new Map(matched.map((event) => [event.id, event]));
  const picked = [...unique.values()].slice(0, 4);
  if (picked.length > 0) return picked;

  return [
    {
      id: "fallback",
      actor: "행정기관",
      emoji: "🏛️",
      message: "사업 착수는 되었지만, 현장 수요를 다시 점검할 필요가 있습니다.",
      always: true,
    },
  ];
}
