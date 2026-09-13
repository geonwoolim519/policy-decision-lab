import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCaseById } from "../data/cases";
import { categoryLabel, DIFFICULTY_META } from "../data/categories";
import { CONCEPTS } from "../data/concepts";
import { isBudgetValid, remainingBudget } from "../engine/budgetEngine";
import { runSimulation } from "../engine/policyEngine";
import { ScoreBars, ScoreRadar } from "../components/ScoreChart";
import { saveResult } from "../store/progress";
import type { PolicyEventRule, SimulationResult } from "../types/policy";
import { round1, sumValues } from "../engine/math";

const STEPS = [
  "문제 상황",
  "데이터",
  "문제 정의",
  "정책 대안",
  "예산 배분",
  "최종 결정",
  "정책 집행",
  "결과·평가",
];

export function SimulationPage() {
  const { caseId = "" } = useParams();
  const navigate = useNavigate();
  const policyCase = getCaseById(caseId);
  const [step, setStep] = useState(0);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<PolicyEventRule[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    setStep(0);
    setProblemIds([]);
    setAllocations({});
    setEvents([]);
    setResult(null);
  }, [caseId]);

  const budgetOk = policyCase ? isBudgetValid(policyCase, allocations) : false;

  if (!policyCase) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center">
        <p className="text-muted">해당 사례를 찾을 수 없습니다.</p>
        <Link to="/cases" className="mt-3 inline-block text-sm font-semibold text-sky">
          사례 목록으로
        </Link>
      </div>
    );
  }

  const used = sumValues(allocations);
  const remaining = remainingBudget(policyCase, allocations);

  function toggleProblem(id: string) {
    setProblemIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function setAmount(id: string, value: number) {
    setAllocations((current) => ({ ...current, [id]: value }));
  }

  function goNext() {
    if (step === 2 && problemIds.length === 0) return;
    if (step === 4 && !budgetOk) return;
    if (step === 5 && policyCase) {
      const ran = runSimulation(policyCase, allocations, problemIds);
      setEvents(ran.events);
      setResult(ran.result);
      saveResult(ran.result);
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function revise() {
    setStep(4);
  }

  const canNext =
    (step !== 2 || problemIds.length > 0) && (step !== 4 || budgetOk) && step < 7;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-sky">
              {policyCase.cityName} · {categoryLabel(policyCase.category)} ·{" "}
              {DIFFICULTY_META[policyCase.difficulty].label}
            </p>
            <h2 className="mt-1 text-xl font-bold text-navy">
              {policyCase.emoji} {policyCase.title}
            </h2>
          </div>
          <p className="text-sm text-muted">
            {step + 1} / {STEPS.length} · {STEPS[step]}
          </p>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-navy transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 ? (
        <section className="space-y-4 rounded-3xl border border-line bg-white p-6">
          <h3 className="text-lg font-semibold text-navy">정책 브리핑</h3>
          <p className="leading-7 text-ink">{policyCase.briefing}</p>
          <p className="rounded-2xl bg-paper p-4 text-sm leading-7 text-muted">
            {policyCase.background}
          </p>
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">주요 이해관계자</p>
            <div className="grid gap-3 md:grid-cols-3">
              {policyCase.stakeholders.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line p-3">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{item.concern}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {policyCase.statistics.map((item) => (
              <div key={item.id} className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-navy">{item.value}</p>
                {item.hint ? <p className="text-xs text-muted">{item.hint}</p> : null}
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {policyCase.charts.map((series, index) => (
              <div key={series.id} className="rounded-3xl border border-line bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-navy">
                  {series.name}
                  {series.unit ? ` (${series.unit})` : ""}
                </p>
                <div className="h-56">
                  <ResponsiveContainer>
                    <LineChart data={series.data}>
                      <CartesianGrid stroke="#e8eef5" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} width={40} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={series.name}
                        stroke={index === 0 ? "#1d4f91" : "#d0891f"}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-3xl border border-line bg-white p-6">
          <h3 className="text-lg font-semibold text-navy">
            현재 {policyCase.cityName}의 가장 중요한 문제는 무엇이라고 판단합니까?
          </h3>
          <p className="mt-1 text-sm text-muted">
            복수 선택이 가능합니다. 하나의 정답을 고르는 문항이 아닙니다.
          </p>
          <div className="mt-4 space-y-2">
            {policyCase.problemOptions.map((item) => {
              const on = problemIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleProblem(item.id)}
                  className={`w-full rounded-2xl border p-4 text-left ${
                    on ? "border-navy bg-navy/5" : "border-line bg-white"
                  }`}
                >
                  <p className="font-medium text-navy">{item.label}</p>
                  <p className="text-sm text-muted">{item.hint}</p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {policyCase.policyOptions.map((option) => (
            <article key={option.id} className="rounded-3xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-navy">{option.title}</h3>
                <span className="rounded-full bg-paper px-2.5 py-1 text-xs text-muted">
                  기준 {option.baseCost}억
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{option.summary}</p>
              <p className="mt-3 text-sm leading-6">{option.description}</p>
              <p className="mt-3 text-xs font-semibold text-leaf">예상 효과</p>
              <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                {option.expectedEffects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-semibold text-rose">위험</p>
              <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                {option.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="rounded-3xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-navy">예산 배분</h3>
              <p className="text-sm text-muted">총 예산 {policyCase.totalBudget}억 원</p>
            </div>
            <p className={`text-lg font-bold ${remaining < 0 ? "text-rose" : "text-navy"}`}>
              {used} / {policyCase.totalBudget}억
            </p>
          </div>
          <div className="mt-5 space-y-5">
            {policyCase.policyOptions.map((option) => {
              const value = allocations[option.id] ?? 0;
              return (
                <div key={option.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-navy">{option.title}</span>
                    <span className="text-muted">{value}억</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={option.maxCost}
                    step={1}
                    value={value}
                    onChange={(event) => setAmount(option.id, Number(event.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted">
                    최소 집행 {option.minCost}억 · 상한 {option.maxCost}억 · 0은 미채택
                  </p>
                </div>
              );
            })}
          </div>
          {!budgetOk ? (
            <p className="mt-4 rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">
              {remaining < 0
                ? "예산을 초과했습니다. 배분을 줄여 주세요."
                : used <= 0
                  ? "하나 이상의 정책에 예산을 배분해야 합니다."
                  : "예산을 배분한 사업은 최소 집행액 이상이어야 합니다."}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">잔여 예산 {remaining}억 원</p>
          )}
        </section>
      ) : null}

      {step === 5 ? (
        <section className="rounded-3xl border border-line bg-white p-6">
          <h3 className="text-lg font-semibold text-navy">당신의 정책안</h3>
          <p className="mt-1 text-sm text-muted">
            선택한 문제:{" "}
            {policyCase.problemOptions
              .filter((item) => problemIds.includes(item.id))
              .map((item) => item.label)
              .join(", ") || "없음"}
          </p>
          <ul className="mt-4 divide-y divide-line">
            {policyCase.policyOptions
              .filter((option) => (allocations[option.id] ?? 0) > 0)
              .map((option) => (
                <li key={option.id} className="flex justify-between py-3 text-sm">
                  <span>{option.title}</span>
                  <span className="font-semibold text-navy">{allocations[option.id]}억</span>
                </li>
              ))}
          </ul>
          <p className="mt-3 text-right text-sm font-semibold">
            총 예산 {used}억 / {policyCase.totalBudget}억
          </p>
        </section>
      ) : null}

      {step === 6 ? (
        <section className="space-y-3">
          <p className="text-sm text-muted">
            정책이 현장에 나가면, 계획서에 없던 반응이 따라옵니다.
          </p>
          {events.map((event) => (
            <article key={event.id} className="rounded-3xl border border-line bg-white p-5">
              <p className="text-sm font-semibold text-navy">
                {event.emoji} {event.actor}
              </p>
              <p className="mt-2 leading-7">{event.message}</p>
            </article>
          ))}
        </section>
      ) : null}

      {step === 7 && result ? (
        <section className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-6 text-center">
            <p className="text-sm text-muted">정책 종합평가</p>
            <p className="mt-1 text-5xl font-bold text-navy">{result.scores.overall}</p>
            <p className="mt-2 text-sm text-muted">100점 만점 · 정답/오답이 아닙니다</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white p-5">
              <h3 className="font-semibold text-navy">세부 점수</h3>
              <div className="mt-4">
                <ScoreBars scores={result.scores} />
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-white p-5">
              <h3 className="font-semibold text-navy">균형 프로필</h3>
              <ScoreRadar scores={result.scores} />
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-5">
            <h3 className="font-semibold text-navy">정책 시행 이후 지표</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {result.indicatorChanges.map((item) => {
                const delta = round1(item.after - item.before);
                const improved = item.higherIsBetter ? delta >= 0 : delta <= 0;
                return (
                  <div key={item.id} className="rounded-2xl bg-paper p-4">
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-navy">
                      {item.after}
                      {item.unit ? ` ${item.unit}` : ""}
                    </p>
                    <p className={`text-sm ${improved ? "text-leaf" : "text-rose"}`}>
                      {delta > 0 ? "+" : ""}
                      {delta}
                      {item.unit ? ` ${item.unit}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6">
            <h3 className="font-semibold text-navy">AI 정책분석</h3>
            <div className="mt-3 space-y-3 whitespace-pre-line text-sm leading-7 text-muted">
              {result.analysis}
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-5">
            <h3 className="font-semibold text-navy">이 경험과 연결된 개념</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {CONCEPTS.filter((item) =>
                policyCase.educationalTopics.includes(item.id),
              ).map((item) => (
                <Link
                  key={item.id}
                  to="/learn"
                  className="rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-navy"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={revise}
              className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white"
            >
              정책을 다시 설계하시겠습니까?
            </button>
            <Link
              to="/my-policy"
              className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-navy"
            >
              나의 정책 보기
            </Link>
            <button
              type="button"
              onClick={() => navigate("/cases")}
              className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-navy"
            >
              다른 사례
            </button>
          </div>
        </section>
      ) : null}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy disabled:opacity-40"
        >
          이전
        </button>
        {step < 7 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {step === 5 ? "정책 시행하기" : step === 6 ? "결과 보기" : "다음"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
