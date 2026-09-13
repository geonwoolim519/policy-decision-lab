import type { EvaluationScores, PolicyCase } from "../types/policy";
import { weightedEffects } from "./outcomeEngine";
import { clamp, sumValues } from "./math";

export function evaluatePolicy(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
  problemIds: string[],
): EvaluationScores {
  const effects = weightedEffects(policyCase, allocations);
  const used = sumValues(allocations);
  const unusedShare = (policyCase.totalBudget - used) / policyCase.totalBudget;
  const active = policyCase.policyOptions.filter(
    (option) => (allocations[option.id] ?? 0) > 0,
  );
  const topShare = Math.max(
    0,
    ...policyCase.policyOptions.map(
      (option) => (allocations[option.id] ?? 0) / policyCase.totalBudget,
    ),
  );

  const alignmentBonus = alignmentScore(policyCase, allocations, problemIds);

  const effectiveness = clamp(52 + effects.effectiveness * 3.2 + alignmentBonus);
  const satisfaction = clamp(50 + effects.satisfaction * 3.1 + alignmentBonus * 0.6);
  const equity = clamp(
    54 + effects.equity * 3 - (topShare > 0.55 ? 8 : 0) + (active.length >= 3 ? 4 : -2),
  );
  const feasibility = clamp(
    58 +
      effects.feasibility * 2.4 -
      (active.length >= 5 ? 6 : 0) -
      (policyCase.difficulty === "advanced" ? 4 : 0),
  );
  const fiscal = clamp(
    62 +
      effects.finance * 3.4 +
      unusedShare * 18 -
      (unusedShare < 0.02 ? 4 : 0) -
      (unusedShare > 0.35 ? 10 : 0),
  );
  const sustainability = clamp(53 + effects.sustainability * 3.1 - (unusedShare > 0.4 ? 6 : 0));
  const efficiency = clamp(
    48 +
      (effectiveness + satisfaction) / 8 +
      (unusedShare >= 0.05 && unusedShare <= 0.18 ? 8 : 0) -
      Math.abs(unusedShare - 0.08) * 20 +
      (used / policyCase.totalBudget) * 6,
  );

  const overall = Math.round(
    effectiveness * 0.2 +
      efficiency * 0.15 +
      satisfaction * 0.18 +
      equity * 0.12 +
      feasibility * 0.12 +
      fiscal * 0.13 +
      sustainability * 0.1,
  );

  return {
    overall: clamp(overall),
    effectiveness: Math.round(effectiveness),
    efficiency: Math.round(efficiency),
    satisfaction: Math.round(satisfaction),
    equity: Math.round(equity),
    feasibility: Math.round(feasibility),
    fiscal: Math.round(fiscal),
    sustainability: Math.round(sustainability),
  };
}

function alignmentScore(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
  problemIds: string[],
) {
  if (problemIds.length === 0) return 0;
  let hits = 0;
  for (const problemId of problemIds) {
    const problem = policyCase.problemOptions.find((item) => item.id === problemId);
    if (!problem) continue;
    const supported = problem.alignedPolicies.some(
      (policyId) => (allocations[policyId] ?? 0) > 0,
    );
    if (supported) hits += 1;
  }
  return (hits / problemIds.length) * 6;
}
