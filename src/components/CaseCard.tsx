import { Link } from "react-router-dom";
import { categoryLabel, DIFFICULTY_META } from "../data/categories";
import type { PolicyCase } from "../types/policy";
import { getResult } from "../store/progress";

export function CaseCard({ item }: { item: PolicyCase }) {
  const difficulty = DIFFICULTY_META[item.difficulty];
  const result = getResult(item.id);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-paper text-xl">
          {item.emoji}
        </div>
        <span className={`text-xs font-semibold ${difficulty.tone}`}>
          {difficulty.stars} {difficulty.label}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">
        {item.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-paper px-2.5 py-1">
          {categoryLabel(item.category)}
        </span>
        <span className="rounded-full bg-paper px-2.5 py-1">{item.duration}</span>
        {result ? (
          <span className="rounded-full bg-navy/10 px-2.5 py-1 font-medium text-navy">
            완료 {result.scores.overall}점
          </span>
        ) : null}
      </div>
      <Link
        to={`/simulate/${item.id}`}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
      >
        정책 결정하기
      </Link>
    </article>
  );
}
