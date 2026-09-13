import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CONCEPTS } from "../data/concepts";
import { getCaseById } from "../data/cases";
import { progressStats } from "../store/progress";

export function LearningPage() {
  const stats = progressStats();
  const last = stats.results[0];
  const lastCase = last ? getCaseById(last.caseId) : undefined;
  const highlightedIds = lastCase?.educationalTopics ?? [];
  const highlighted = new Set(highlightedIds);
  const [openId, setOpenId] = useState<string | null>(highlightedIds[0] ?? CONCEPTS[0].id);

  const ordered = useMemo(() => {
    return [...CONCEPTS].sort((a, b) => {
      const ah = highlightedIds.includes(a.id) ? 0 : 1;
      const bh = highlightedIds.includes(b.id) ? 0 : 1;
      return ah - bh;
    });
  }, [highlightedIds]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">정책학습</h2>
        <p className="mt-1 text-sm text-muted">
          어려운 용어를 먼저 외우지 않아도 됩니다. 시뮬레이션에서 겪은 뒤, 그 경험에
          이름을 붙여 보세요.
        </p>
      </div>

      {lastCase ? (
        <section className="rounded-3xl border border-line bg-white p-5">
          <p className="text-xs font-medium text-sky">이번 사례에서 경험한 개념</p>
          <p className="mt-1 font-semibold text-navy">
            {lastCase.emoji} {lastCase.title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONCEPTS.filter((item) => highlighted.has(item.id)).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenId(item.id)}
                className="rounded-full bg-navy px-3 py-1 text-xs font-medium text-white"
              >
                {item.title}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-line bg-white p-6 text-sm text-muted">
          사례를 하나 진행하면, 그 결정과 연결된 개념이 여기에 모입니다.{" "}
          <Link to="/cases" className="font-semibold text-sky">
            먼저 결정해보기
          </Link>
        </section>
      )}

      <section className="space-y-3">
        {ordered.map((item) => {
          const open = openId === item.id;
          return (
            <article key={item.id} className="rounded-2xl border border-line bg-white">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <span className="font-semibold text-navy">{item.title}</span>
                {highlighted.has(item.id) ? (
                  <span className="text-xs text-sky">경험함</span>
                ) : (
                  <span className="text-xs text-muted">개념</span>
                )}
              </button>
              {open ? (
                <div className="space-y-3 border-t border-line px-4 py-4 text-sm leading-7 text-muted">
                  <p>
                    <span className="font-medium text-navy">쉽게 보면. </span>
                    {item.plain}
                  </p>
                  <p>
                    <span className="font-medium text-navy">행정학에서는. </span>
                    {item.academic}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.relatedCaseIds.map((caseId) => {
                      const related = getCaseById(caseId);
                      if (!related) return null;
                      return (
                        <Link
                          key={caseId}
                          to={`/simulate/${caseId}`}
                          className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-navy"
                        >
                          {related.title} 시뮬레이션
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
