import type { OutcomeIndicator, PolicyCase, PolicyEffects } from "../types/policy";
import { intensity, round1 } from "./math";

function weightedEffects(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
): PolicyEffects {
  const totals: PolicyEffects = {
    effectiveness: 0,
    satisfaction: 0,
    equity: 0,
    feasibility: 0,
    finance: 0,
    sustainability: 0,
  };

  let weight = 0;
  for (const option of policyCase.policyOptions) {
    const amount = allocations[option.id] ?? 0;
    const factor = intensity(amount, option.baseCost);
    if (factor <= 0) continue;
    weight += factor;
    (Object.keys(totals) as (keyof PolicyEffects)[]).forEach((key) => {
      totals[key] += option.effects[key] * factor;
    });
  }

  if (weight > 0) {
    (Object.keys(totals) as (keyof PolicyEffects)[]).forEach((key) => {
      totals[key] = totals[key] / weight;
    });
  }

  return totals;
}

export function projectIndicators(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
) {
  const effects = weightedEffects(policyCase, allocations);
  return policyCase.indicators.map((indicator) => {
    const after = applyIndicator(indicator, effects);
    return {
      id: indicator.id,
      label: indicator.label,
      before: indicator.baseline,
      after,
      unit: indicator.unit,
      higherIsBetter: indicator.higherIsBetter,
    };
  });
}

function applyIndicator(indicator: OutcomeIndicator, effects: PolicyEffects) {
  let delta = 0;
  (Object.entries(indicator.drivers) as [keyof PolicyEffects, number][]).forEach(
    ([key, weight]) => {
      delta += effects[key] * weight;
    },
  );
  return round1(indicator.baseline + delta * indicator.scale);
}

export { weightedEffects };
