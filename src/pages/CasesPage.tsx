import { useMemo, useState } from "react";
import { POLICY_CASES } from "../data/cases";
import { CATEGORIES } from "../data/categories";
import { CaseCard } from "../components/CaseCard";
import { STATUS_LABEL, coreIssueOf } from "../lib/caseMeta";
import { getCaseStatus, progressStats } from "../store/progress";
import type { CaseStatus, CategoryId, Difficulty } from "../types/policy";

export function CasesPage() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<CaseStatus | "all">("all");
  const [query, setQuery] = useState("");
  const stats = progressStats();

  const filtered = useMemo(() => {
    return POLICY_CASES.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (difficulty !== "all" && item.difficulty !== difficulty) return false;
      if (status !== "all" && getCaseStatus(item.id) !== status) return false;
      if (query.trim()) {
        const hay = `${item.title} ${item.description} ${item.cityName} ${coreIssueOf(item)}`;
        if (!hay.includes(query.trim())) return false;
      }
      return true;
    });
  }, [category, difficulty, query, status]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-navy">정책사례</h2>
        <p className="mt-1 text-sm text-muted">
          분야를 고르고, 가상의 정책 담당자가 되어 의사결정을 시작해 보세요. 기존 15개와
          신규 15개를 합쳐 모두 {POLICY_CASES.length}개입니다.
        </p>
        <p className="mt-2 text-sm text-navy">
          진행 {stats.completed}/{POLICY_CASES.length} 완료
        </p>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="제목, 도시, 쟁점으로 검색"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none ring-sky/30 focus:ring-2"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          전체
        </Chip>
        {CATEGORIES.map((item) => (
          <Chip
            key={item.id}
            active={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "beginner", "intermediate", "advanced"] as const).map((item) => (
          <Chip key={item} active={difficulty === item} onClick={() => setDifficulty(item)}>
            {item === "all"
              ? "모든 난이도"
              : item === "beginner"
                ? "기초"
                : item === "intermediate"
                  ? "중급"
                  : "심화"}
          </Chip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={status === "all"} onClick={() => setStatus("all")}>
          모든 상태
        </Chip>
        {(["idle", "draft", "done"] as const).map((item) => (
          <Chip key={item} active={status === item} onClick={() => setStatus(item)}>
            {STATUS_LABEL[item]}
          </Chip>
        ))}
      </div>

      <p className="text-sm text-muted">{filtered.length}개의 사례</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
        active ? "bg-navy text-white" : "bg-white text-muted ring-1 ring-line"
      }`}
    >
      {children}
    </button>
  );
}
