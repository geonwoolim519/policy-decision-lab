import type { EvaluationScores, PolicyCase } from "../types/policy";
import { categoryLabel } from "../data/categories";
import { sumValues } from "./math";

const SCORE_LABELS: { key: keyof Omit<EvaluationScores, "overall">; label: string }[] =
  [
    { key: "effectiveness", label: "정책 효과" },
    { key: "efficiency", label: "예산 효율성" },
    { key: "satisfaction", label: "시민 만족도" },
    { key: "equity", label: "형평성" },
    { key: "feasibility", label: "실행 가능성" },
    { key: "fiscal", label: "재정 건전성" },
    { key: "sustainability", label: "지속 가능성" },
  ];

export function generateAnalysis(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
  scores: EvaluationScores,
  problemIds: string[],
) {
  const ranked = SCORE_LABELS.map((item) => ({
    ...item,
    value: scores[item.key],
  })).sort((a, b) => b.value - a.value);

  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const used = sumValues(allocations);
  const leftover = policyCase.totalBudget - used;
  const funded = policyCase.policyOptions
    .map((option) => ({
      title: option.title,
      amount: allocations[option.id] ?? 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const top = funded[0];
  const second = funded[1];
  const problems = policyCase.problemOptions
    .filter((item) => problemIds.includes(item.id))
    .map((item) => item.label);

  const lines: string[] = [];

  lines.push(
    `이번 정책안은 ${categoryLabel(policyCase.category)} 분야의 「${policyCase.title}」 사례에서 ${scores.overall}점으로 평가되었습니다. 정답은 없으며, 선택한 조합이 만들어낸 균형의 결과입니다.`,
  );

  if (top) {
    lines.push(
      `가장 많은 예산(${top.amount}억 원)이 배분된 「${top.title}」은 ${strongest.label}을(를) 끌어올리는 데 기여했습니다. ${
        second ? `이어서 「${second.title}」(${second.amount}억 원)이 보완책으로 작동했습니다.` : "다만 한 사업에 재원이 집중되어 다른 정책 수단의 역할은 제한적이었습니다."
      }`,
    );
  }

  if (problems.length > 0) {
    lines.push(
      `담당자가 핵심 원인으로 본 지점은 ${problems.join(", ")}입니다. 예산이 이 문제 인식과 맞물릴수록 정책의 설득력은 높아지고, 어긋나면 집행 단계에서 우선순위 논란이 생길 수 있습니다.`,
    );
  }

  if (leftover > policyCase.totalBudget * 0.22) {
    lines.push(
      `총예산 중 ${leftover}억 원이 남았습니다. 재정 여력은 남을 수 있지만, 의회와 주민은 왜 필요한 사업을 충분히 추진하지 않았는지 물을 수 있습니다.`,
    );
  } else if (leftover < policyCase.totalBudget * 0.03) {
    lines.push(
      `예산을 거의 모두 집행하는 안입니다. 단기 대응력은 높아 보이지만, 예상 수요 증가나 추가 민원에 대응할 예비비 성격의 여력은 줄어듭니다.`,
    );
  }

  lines.push(
    `상대적으로 강한 지표는 ${strongest.label}(${strongest.value}점), 취약한 지표는 ${weakest.label}(${weakest.value}점)입니다. 다음 설계에서는 ${weakest.label}을(를) 보완하면서도 ${strongest.label}의 성과를 유지할 수 있는 배분을 검토해볼 수 있습니다.`,
  );

  if (scores.overall >= 82) {
    lines.push(
      "여러 가치 사이의 긴장을 비교적 안정적으로 관리한 안에 가깝습니다. 다만 높은 점수가 모든 이해관계자의 동의를 의미하지는 않습니다.",
    );
  } else if (scores.overall < 62) {
    lines.push(
      "현재 안은 특정 목표에 치우치거나 집행·재정 여건을 충분히 반영하지 못했을 가능성이 큽니다. 정책을 다시 설계해 결과를 비교해 보시기 바랍니다.",
    );
  }

  return lines.join("\n\n");
}
