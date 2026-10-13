import type { ChartSeries, PolicyEffects, PolicyOption } from "../../types/policy";

export const SCENARIO_NOTE =
  "지역명·인구·통계는 교육용 가상 시나리오이며, 실제 행정통계가 아닙니다.";

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

export function option(
  input: Omit<PolicyOption, "minCost" | "maxCost"> & {
    minCost?: number;
    maxCost?: number;
  },
): PolicyOption {
  const equity = input.effects.equity;
  const finance = input.effects.finance;
  return {
    ...input,
    minCost: input.minCost ?? Math.max(4, Math.round(input.baseCost * 0.4)),
    maxCost: input.maxCost ?? Math.round(input.baseCost * 1.7),
    equityNote:
      input.equityNote ??
      (equity >= 7
        ? "혜택이 취약·소외 집단에 비교적 잘 닿습니다."
        : equity <= 3
          ? "혜택이 특정 집단에 편중되거나 사각이 남을 수 있습니다."
          : "집단 간 혜택 차이가 중간 수준입니다."),
    fiscalNote:
      input.fiscalNote ??
      ((input.annualCost ?? 0) >= 8 || finance <= -5
        ? "연간 운영비·초기 투자가 커서 재정 지속성에 부담이 됩니다."
        : finance >= 0
          ? "당해 재정 부담이 상대적으로 작습니다."
          : "초기 투자와 운영비를 함께 봐야 합니다."),
  };
}
