import type { CategoryId, SimulationResult } from "../types/policy";
import { getCaseById } from "../data/cases";
import { CATEGORIES } from "../data/categories";

const STORAGE_KEY = "policy-decision-maker-v1";

interface StoreShape {
  results: SimulationResult[];
}

function emptyStore(): StoreShape {
  return { results: [] };
}

export function loadStore(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StoreShape;
    if (!Array.isArray(parsed.results)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

function saveStore(store: StoreShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveResult(result: SimulationResult) {
  const store = loadStore();
  const withoutSame = store.results.filter((item) => item.caseId !== result.caseId);
  saveStore({ results: [result, ...withoutSame] });
}

export function getResult(caseId: string) {
  return loadStore().results.find((item) => item.caseId === caseId);
}

export function progressStats() {
  const results = loadStore().results;
  const completed = results.length;
  const average =
    completed === 0
      ? 0
      : Math.round(
          results.reduce((sum, item) => sum + item.scores.overall, 0) / completed,
        );
  const best =
    completed === 0 ? 0 : Math.max(...results.map((item) => item.scores.overall));
  const avgEfficiency =
    completed === 0
      ? 0
      : Math.round(
          results.reduce((sum, item) => sum + item.scores.efficiency, 0) / completed,
        );
  const avgSatisfaction =
    completed === 0
      ? 0
      : Math.round(
          results.reduce((sum, item) => sum + item.scores.satisfaction, 0) /
            completed,
        );

  const categoryCounts = new Map<CategoryId, number>();
  for (const result of results) {
    const policyCase = getCaseById(result.caseId);
    if (!policyCase) continue;
    categoryCounts.set(
      policyCase.category,
      (categoryCounts.get(policyCase.category) ?? 0) + 1,
    );
  }

  const topCategory =
    [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    completed,
    average,
    best,
    avgEfficiency,
    avgSatisfaction,
    topCategory,
    topCategoryLabel: topCategory
      ? (CATEGORIES.find((item) => item.id === topCategory)?.label ?? topCategory)
      : "아직 없음",
    tendencies: deriveTendencies(results),
    results,
  };
}

function deriveTendencies(results: SimulationResult[]) {
  if (results.length === 0) return [] as { id: string; label: string; detail: string }[];
  const avg = {
    fiscal: 0,
    satisfaction: 0,
    equity: 0,
    effectiveness: 0,
    sustainability: 0,
  };
  for (const result of results) {
    avg.fiscal += result.scores.fiscal;
    avg.satisfaction += result.scores.satisfaction;
    avg.equity += result.scores.equity;
    avg.effectiveness += result.scores.effectiveness;
    avg.sustainability += result.scores.sustainability;
  }
  const n = results.length;
  (Object.keys(avg) as (keyof typeof avg)[]).forEach((key) => {
    avg[key] = avg[key] / n;
  });

  const items: { id: string; label: string; detail: string }[] = [];
  if (avg.satisfaction >= avg.fiscal + 4) {
    items.push({
      id: "welfare",
      label: "복지·체감 중심 경향",
      detail: "시민이 바로 느끼는 변화에 예산을 더 두는 선택이 많았습니다.",
    });
  }
  if (avg.fiscal >= avg.satisfaction + 3) {
    items.push({
      id: "fiscal",
      label: "재정 여력 중시 경향",
      detail: "지출 확대보다 재정 부담을 관리하는 쪽에 가까운 선택이 많았습니다.",
    });
  }
  if (avg.sustainability >= 72) {
    items.push({
      id: "green",
      label: "지속가능성 중시 경향",
      detail: "단기 성과보다 구조적 변화와 장기 효과에 무게를 둔 편입니다.",
    });
  }
  if (avg.effectiveness >= 74) {
    items.push({
      id: "growth",
      label: "성과·성장 중심 경향",
      detail: "가시적인 정책 효과를 만드는 사업에 자원을 모으는 선택이 많았습니다.",
    });
  }
  if (avg.equity >= 72) {
    items.push({
      id: "equity",
      label: "형평 배려 경향",
      detail: "특정 집단만이 아니라 혜택의 분포를 함께 고려한 편입니다.",
    });
  }
  if (items.length === 0) {
    items.push({
      id: "balanced",
      label: "균형 탐색 경향",
      detail: "아직 한쪽으로 기울기보다 여러 가치를 시험하는 단계로 보입니다.",
    });
  }
  return items.slice(0, 4);
}
