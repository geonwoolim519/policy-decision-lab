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

export function generateInsights(
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
  const funded = policyCase.policyOptions.filter(
    (option) => (allocations[option.id] ?? 0) > 0,
  );
  const skipped = policyCase.policyOptions.filter(
    (option) => (allocations[option.id] ?? 0) === 0,
  );
  const aligned = alignmentHits(policyCase, allocations, problemIds);

  const strengths: string[] = [];
  if (aligned > 0) {
    strengths.push("문제 인식과 예산 배분이 같은 방향을 보고 있어 정책의 설득력이 커졌습니다.");
  }
  if (funded.length >= 3) {
    strengths.push("여러 수단을 함께 써서 한 사업에만 기대지 않았습니다.");
  }
  if (strongest.value >= 70) {
    strengths.push(`${strongest.label}은 ${strongest.value}점으로 비교적 안정적입니다.`);
  }
  if (leftover >= policyCase.totalBudget * 0.05 && leftover <= policyCase.totalBudget * 0.18) {
    strengths.push("예비비 성격의 잔여 재원을 남겨 집행 중 변수에 대응할 여지가 있습니다.");
  }
  if (strengths.length === 0) {
    strengths.push("제한된 예산 안에서 우선순위를 분명히 한 선택이었습니다.");
  }

  const missedRisks: string[] = [];
  if (weakest.value < 62) {
    missedRisks.push(`${weakest.label}(${weakest.value}점)이 상대적으로 낮아 다음 설계에서 보완이 필요합니다.`);
  }
  if (skipped.length > 0) {
    missedRisks.push(
      `채택하지 않은 「${skipped[0].title}」 공백이 ${skipped[0].risks[0] ?? "다른 가치"}와 맞물릴 수 있습니다.`,
    );
  }
  if (leftover < policyCase.totalBudget * 0.03) {
    missedRisks.push("예산을 거의 소진해 수요 급증이나 공사 지연 때 추가 재원 압박이 커질 수 있습니다.");
  }
  if (leftover > policyCase.totalBudget * 0.28) {
    missedRisks.push("집행액이 적어 현장에서는 대응 의지가 약하다는 평가를 받을 수 있습니다.");
  }
  if (funded.length === 1) {
    missedRisks.push("단일 수단에 집중하면 부작용이 커졌을 때 대체 경로가 없습니다.");
  }
  if (missedRisks.length === 0) {
    missedRisks.push("눈에 띄는 공백은 작지만, 이해관계자 반응은 점수 밖에 남아 있습니다.");
  }

  const nextSteps: string[] = [
    `${weakest.label}을 보완하는 방향으로 예산을 5~15억 재배분해 보세요.`,
    skipped[0]
      ? `「${skipped[0].title}」을 소규모라도 시범 도입하면 균형이 달라질 수 있습니다.`
      : "적용 대상을 좁히거나 넓혀 형평성과 효율의 조합을 다시 시험해 보세요.",
    "운영비가 큰 사업은 연간 부담을 낮추고, 인프라 사업은 단계 시행을 검토할 수 있습니다.",
  ];

  const scoreReasons: Partial<Record<(typeof SCORE_LABELS)[number]["key"], string>> = {
    effectiveness:
      funded[0] != null
        ? `주력 사업 「${funded[0].title}」의 투입 규모가 효과 점수에 크게 반영되었습니다.`
        : "집행된 사업이 없어 효과 측정이 어렵습니다.",
    efficiency:
      leftover > policyCase.totalBudget * 0.22
        ? "잔여 예산이 많아 투입 대비 성과가 아쉽게 보일 수 있습니다."
        : "배분 집중도와 잔여 재원의 균형이 효율 점수에 영향을 주었습니다.",
    satisfaction: "체감이 빠른 지원일수록 만족도는 오르고, 공사·규제 중심이면 단기 체감은 낮아집니다.",
    equity:
      funded.length >= 3
        ? "혜택이 여러 집단에 나뉘도록 배분해 형평 점수가 보정되었습니다."
        : "특정 사업 편중이 형평 체감에 부담을 줄 수 있습니다.",
    feasibility: "동시에 추진하는 사업 수와 난이도가 실행 가능성에 반영되었습니다.",
    fiscal: "당해 지출과 연간 운영비, 잔여 재원이 재정 건전성 점수에 함께 들어갔습니다.",
    sustainability: "구조 개선형 투자 비중이 클수록 장기 지속 가능성 점수가 올라갑니다.",
  };

  return { strengths: strengths.slice(0, 3), missedRisks: missedRisks.slice(0, 3), nextSteps, scoreReasons };
}

function alignmentHits(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
  problemIds: string[],
) {
  let hits = 0;
  for (const problemId of problemIds) {
    const problem = policyCase.problemOptions.find((item) => item.id === problemId);
    if (!problem) continue;
    if (problem.alignedPolicies.some((policyId) => (allocations[policyId] ?? 0) > 0)) {
      hits += 1;
    }
  }
  return hits;
}
