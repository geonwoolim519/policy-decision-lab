import type { ChartSeries, PolicyEffects } from "../../types/policy";

export function trend(
  id: string,
  name: string,
  unit: string,
  values: number[],
  startYear = 2021,
): ChartSeries {
  return {
    id,
    name,
    unit,
    data: values.map((value, index) => ({
      year: String(startYear + index),
      value,
    })),
  };
}

export function effects(
  values: Partial<PolicyEffects> & Pick<PolicyEffects, "effectiveness">,
): PolicyEffects {
  return {
    effectiveness: values.effectiveness,
    satisfaction: values.satisfaction ?? 0,
    equity: values.equity ?? 0,
    feasibility: values.feasibility ?? 0,
    finance: values.finance ?? -2,
    sustainability: values.sustainability ?? 0,
  };
}
