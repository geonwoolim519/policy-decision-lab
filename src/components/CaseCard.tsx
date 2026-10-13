import { Link } from "react-router-dom";
import { categoryLabel, DIFFICULTY_META } from "../data/categories";
import {
  STATUS_LABEL,
  STATUS_TONE,
  caseDuration,
  caseNumber,
  coreIssueOf,
} from "../lib/caseMeta";
import { getCaseStatus, getResult } from "../store/progress";
import type { PolicyCase } from "../types/policy";

export function CaseCard({ item }: { item: PolicyCase }) {
  const difficulty = DIFFICULTY_META[item.difficulty];
  const status = getCaseStatus(item.id);
  const result = getResult(item.id);
  const number = caseNumber(item);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-paper text-xl">
            {item.emoji}
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-sky">
              사례 {number > 0 ? String(number).padStart(2, "0") : "--"}
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
        <span className={`text-xs font-semibold ${difficulty.tone}`}>
          {difficulty.stars} {difficulty.label}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted line-clamp-2">{item.description}</p>
      <p className="mt-3 rounded-xl bg-paper px-3 py-2 text-xs leading-5 text-navy">
        핵심 쟁점 · {coreIssueOf(item)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-paper px-2.5 py-1">
          {categoryLabel(item.category)}
        </span>
        <span className="rounded-full bg-paper px-2.5 py-1">{caseDuration(item)}</span>
        {result ? (
          <span className="rounded-full bg-navy/10 px-2.5 py-1 font-medium text-navy">
            최근 {result.scores.overall}점
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/simulate/${item.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          {status === "done" ? "다시 결정하기" : status === "draft" ? "이어서 하기" : "정책 결정하기"}
        </Link>
        {status === "done" ? (
          <>
            <Link
              to={`/simulate/${item.id}?view=result`}
              className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-navy"
            >
              결과 보기
            </Link>
            <Link
              to={`/simulate/${item.id}?revise=1`}
              className="inline-flex items-center justify-center rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-navy"
            >
              재도전
            </Link>
          </>
        ) : null}
      </div>
    </article>
  );
}
