import type { CaseStatus, PolicyCase } from "../types/policy";

export const DEFAULT_DEBRIEF = [
  "선택하지 않은 대안의 장점은 무엇이었는가?",
  "정책의 혜택과 비용은 누구에게 돌아갔는가?",
  "예산이 20% 줄었다면 어떤 정책을 우선했을 것인가?",
  "단기 성과와 장기 지속 가능성 중 무엇을 우선했는가?",
];

export function caseNumber(item: PolicyCase) {
  return item.displayNumber ?? 0;
}

export function caseDuration(item: PolicyCase) {
  return item.estimatedMinutes ? `약 ${item.estimatedMinutes}분` : item.duration;
}

export function coreIssueOf(item: PolicyCase) {
  if (item.coreIssue) return item.coreIssue;
  const first = item.description.split(/\.\s+/)[0]?.trim();
  return first || item.description;
}

export function debriefQuestions(item: PolicyCase) {
  return item.debriefQuestions && item.debriefQuestions.length > 0
    ? item.debriefQuestions
    : DEFAULT_DEBRIEF;
}

export const STATUS_LABEL: Record<CaseStatus, string> = {
  idle: "미시작",
  draft: "진행 중",
  done: "완료",
};

export const STATUS_TONE: Record<CaseStatus, string> = {
  idle: "bg-slate-100 text-muted",
  draft: "bg-amber-50 text-amber-900",
  done: "bg-navy/10 text-navy",
};
