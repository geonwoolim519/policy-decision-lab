import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { SCENARIO_NOTE } from "../data/cases/shared";
import {
  isBudgetValid,
  remainingBudget,
  simultaneousFunding,
} from "../engine/budgetEngine";
import { runSimulation } from "../engine/policyEngine";
import { ScoreBars, ScoreRadar } from "../components/ScoreChart";
import { caseDuration, caseNumber, debriefQuestions } from "../lib/caseMeta";
import {
  getDraft,
  getPreviousResult,
  getResult,
  saveDraft,
  saveResult,
} from "../store/progress";
import type {
  EvaluationScores,
  PolicyCase,
  PolicyEventRule,
  SimulationResult,
} from "../types/policy";
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

const SCORE_LABELS: { key: keyof Omit<EvaluationScores, "overall">; label: string }[] = [
  { key: "effectiveness", label: "정책 효과성" },
  { key: "efficiency", label: "예산 효율성" },
  { key: "satisfaction", label: "시민 만족도" },
  { key: "equity", label: "형평성" },
  { key: "feasibility", label: "실행 가능성" },
  { key: "fiscal", label: "재정 건전성" },
  { key: "sustainability", label: "장기 지속 가능성" },
];

export function SimulationPage() {
  const { caseId = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const policyCase = getCaseById(caseId);
  const [step, setStep] = useState(0);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<PolicyEventRule[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [baseline, setBaseline] = useState<SimulationResult | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const viewResult = searchParams.get("view") === "result";
  const reviseFlag = searchParams.get("revise") === "1";

  useEffect(() => {
    if (!policyCase) return;
    const saved = getResult(policyCase.id);
    const draft = getDraft(policyCase.id);

    setEvents([]);
    setResult(null);
    setBaseline(null);
    setNotes({});

    if (viewResult && saved) {
      setProblemIds(saved.problemIds);
      setAllocations(saved.allocations);
      setResult(saved);
      setEvents(eventsFrom(policyCase, saved));
      setBaseline(getPreviousResult(policyCase.id) ?? null);
      setStep(7);
      return;
    }

    if (reviseFlag && saved) {
      setProblemIds(saved.problemIds);
      setAllocations({ ...saved.allocations });
      setBaseline(saved);
      setStep(4);
      return;
    }

    if (draft) {
      setProblemIds(draft.problemIds);
      setAllocations(draft.allocations);
      setStep(Math.min(Math.max(draft.step, 0), 5));
      return;
    }

    setStep(0);
    setProblemIds([]);
    setAllocations({});
  }, [policyCase, viewResult, reviseFlag]);

  useEffect(() => {
    if (!policyCase || viewResult || step >= 7) return;
    const dirty = step > 0 || problemIds.length > 0 || sumValues(allocations) > 0;
    if (!dirty) return;
    saveDraft({
      caseId: policyCase.id,
      step,
      problemIds,
      allocations,
      updatedAt: new Date().toISOString(),
    });
  }, [policyCase, step, problemIds, allocations, viewResult]);

  const budgetOk = policyCase ? isBudgetValid(policyCase, allocations) : false;
  const funding = policyCase ? simultaneousFunding(policyCase) : null;

  const comparison = useMemo(() => {
    if (!result) return null;
    const previous = baseline && baseline.completedAt !== result.completedAt ? baseline : null;
    return previous;
  }, [result, baseline]);

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
  const number = caseNumber(policyCase);

  function toggleProblem(id: string) {
    setProblemIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function setAmount(id: string, value: number) {
    setAllocations((current) => ({ ...current, [id]: Math.max(0, value) }));
  }

  function goNext() {
    if (step === 2 && problemIds.length === 0) return;
    if (step === 4 && !budgetOk) return;
    if (step === 5 && policyCase) {
      const ran = runSimulation(policyCase, allocations, problemIds);
      setEvents(ran.events);
      setResult(saveResult(ran.result));
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function revise() {
    if (result) setBaseline(result);
    navigate(`/simulate/${caseId}?revise=1`, { replace: true });
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
              사례 {number > 0 ? String(number).padStart(2, "0") : "--"} · {policyCase.cityName} ·{" "}
              {categoryLabel(policyCase.category)} · {DIFFICULTY_META[policyCase.difficulty].label} ·{" "}
              {caseDuration(policyCase)}
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
          {policyCase.populationProfile ? (
            <p className="text-sm text-muted">가상 여건 · {policyCase.populationProfile}</p>
          ) : null}
          {policyCase.policyObjectives && policyCase.policyObjectives.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-navy">정책 목표</p>
              <div className="flex flex-wrap gap-2">
                {policyCase.policyObjectives.map((item) => (
                  <span key={item} className="rounded-full bg-paper px-3 py-1 text-xs text-navy">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
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
          <p className="text-xs leading-5 text-muted">{policyCase.scenarioNote ?? SCENARIO_NOTE}</p>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <p className="text-xs text-muted">{policyCase.scenarioNote ?? SCENARIO_NOTE}</p>
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
                  초기 {option.baseCost}억
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{option.summary}</p>
              <p className="mt-3 text-sm leading-6">{option.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                {option.annualCost != null ? (
                  <div>
                    <dt className="font-semibold text-navy">연간 운영비</dt>
                    <dd>{option.annualCost}억</dd>
                  </div>
                ) : null}
                {option.timeline ? (
                  <div>
                    <dt className="font-semibold text-navy">소요 시간</dt>
                    <dd>{option.timeline}</dd>
                  </div>
                ) : null}
                {option.target ? (
                  <div className="col-span-2">
                    <dt className="font-semibold text-navy">적용 대상</dt>
                    <dd>{option.target}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-3 text-xs font-semibold text-leaf">예상 효과</p>
              <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                {option.expectedEffects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-semibold text-rose">위험·부작용</p>
              <ul className="mt-1 list-disc pl-4 text-sm text-muted">
                {option.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {option.equityNote ? (
                <p className="mt-3 text-xs leading-5 text-muted">형평 · {option.equityNote}</p>
              ) : null}
              {option.fiscalNote ? (
                <p className="mt-1 text-xs leading-5 text-muted">재정 · {option.fiscalNote}</p>
              ) : null}
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
          {funding?.cannotAtBase ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              모든 대안을 기준 규모로 동시에 시행할 수는 없습니다. 기준 비용 합계{" "}
              {funding.baseSum}억이 총예산 {policyCase.totalBudget}억을 넘습니다.
              {funding.cannotAtMin
                ? ` 최소 집행액 합계(${funding.minSum}억)도 예산을 초과하므로 일부 사업은 포기해야 합니다.`
                : " 우선순위를 정해 배분하세요."}
            </p>
          ) : null}
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
                    {option.annualCost != null ? ` · 연간 운영비 약 ${option.annualCost}억` : ""}
                  </p>
                </div>
              );
            })}
          </div>
          {!budgetOk ? (
            <p className="mt-4 rounded-xl bg-rose/10 px-3 py-2 text-sm text-rose">
              {remaining < 0
                ? "예산을 초과했습니다. 배분을 줄여 주세요. 음수 배분은 할 수 없습니다."
                : used <= 0
                  ? "하나 이상의 정책에 예산을 배분해야 합니다. 선택 없이 결과로 갈 수 없습니다."
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
          {events.length === 0 ? (
            <article className="rounded-3xl border border-line bg-white p-5">
              <p className="text-sm leading-7 text-muted">
                눈에 띄는 돌발 반응은 없었지만, 침묵이 곧 지지는 아닙니다.
              </p>
            </article>
          ) : (
            events.map((event) => (
              <article key={event.id} className="rounded-3xl border border-line bg-white p-5">
                <p className="text-sm font-semibold text-navy">
                  {event.emoji} {event.actor}
                </p>
                <p className="mt-2 leading-7">{event.message}</p>
              </article>
            ))
          )}
        </section>
      ) : null}

      {step === 7 && result ? (
        <ResultPanel
          policyCase={policyCase}
          result={result}
          previous={comparison}
          notes={notes}
          setNotes={setNotes}
          onRevise={revise}
          onCases={() => navigate("/cases")}
        />
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

function eventsFrom(policyCase: PolicyCase, result: SimulationResult) {
  return (result.eventIds ?? [])
    .map((id) => policyCase.events.find((event) => event.id === id))
    .filter((item): item is PolicyEventRule => Boolean(item));
}

function ResultPanel({
  policyCase,
  result,
  previous,
  notes,
  setNotes,
  onRevise,
  onCases,
}: {
  policyCase: PolicyCase;
  result: SimulationResult;
  previous: SimulationResult | null;
  notes: Record<string, string>;
  setNotes: (value: Record<string, string>) => void;
  onRevise: () => void;
  onCases: () => void;
}) {
  const questions = debriefQuestions(policyCase);
  const funded = policyCase.policyOptions.filter(
    (option) => (result.allocations[option.id] ?? 0) > 0,
  );
  const used = sumValues(result.allocations);
  const reactions = stakeholderReactions(policyCase, result.allocations);
  const events = eventsFrom(policyCase, result);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-line bg-white p-6 text-center">
        <p className="text-sm text-muted">정책 종합평가</p>
        <p className="mt-1 text-5xl font-bold text-navy">{result.scores.overall}</p>
        <p className="mt-2 text-sm text-muted">
          100점 만점 · 정답/오답이 아닙니다
          {result.attempt ? ` · ${result.attempt}번째 시도` : ""}
        </p>
      </div>

      {previous ? (
        <CompareBlock policyCase={policyCase} previous={previous} current={result} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-5">
          <h3 className="font-semibold text-navy">세부 점수</h3>
          <div className="mt-4">
            <ScoreBars scores={result.scores} />
          </div>
          {result.scoreReasons ? (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-muted">
              {SCORE_LABELS.map((item) => {
                const reason = result.scoreReasons?.[item.key];
                if (!reason) return null;
                return (
                  <li key={item.key}>
                    <span className="font-semibold text-navy">{item.label}</span> · {reason}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <div className="rounded-3xl border border-line bg-white p-5">
          <h3 className="font-semibold text-navy">균형 프로필</h3>
          <ScoreRadar scores={result.scores} />
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">정책 시행 전후 지표</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {result.indicatorChanges.map((item) => {
            const delta = round1(item.after - item.before);
            const improved = item.higherIsBetter ? delta >= 0 : delta <= 0;
            return (
              <div key={item.id} className="rounded-2xl bg-paper p-4">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-navy">
                  {item.before}
                  {item.unit ? ` ${item.unit}` : ""} → {item.after}
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

      <div className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">예산 집행 내역</h3>
        <ul className="mt-3 divide-y divide-line">
          {policyCase.policyOptions.map((option) => (
            <li key={option.id} className="flex justify-between py-2 text-sm">
              <span className={(result.allocations[option.id] ?? 0) > 0 ? "text-navy" : "text-muted"}>
                {option.title}
              </span>
              <span className="font-semibold">{result.allocations[option.id] ?? 0}억</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right text-sm font-semibold">
          {used}억 / {policyCase.totalBudget}억
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">대안별 성과</h3>
        <div className="mt-3 space-y-3">
          {funded.map((option) => (
            <div key={option.id} className="rounded-2xl bg-paper p-4">
              <p className="font-semibold text-navy">
                {option.title} · {result.allocations[option.id]}억
              </p>
              <p className="mt-1 text-sm text-muted">{option.expectedEffects.join(" · ")}</p>
              <p className="mt-1 text-xs text-rose">위험 · {option.risks[0]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">이해관계자 반응</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {reactions.map((item) => (
            <div key={item.name} className="rounded-2xl border border-line p-3">
              <p className="text-sm font-semibold text-navy">{item.name}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {events.length > 0 ? (
        <div className="rounded-3xl border border-line bg-white p-5">
          <h3 className="font-semibold text-navy">예상치 못한 부작용·변수</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {events.map((event) => (
              <li key={event.id}>
                {event.emoji} {event.actor} · {event.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard title="잘한 의사결정" items={result.strengths ?? []} tone="leaf" />
        <InsightCard title="놓친 위험 요소" items={result.missedRisks ?? []} tone="rose" />
        <InsightCard title="다음 단계 제안" items={result.nextSteps ?? []} tone="navy" />
      </div>

      <div className="rounded-3xl border border-line bg-white p-6">
        <h3 className="font-semibold text-navy">AI 정책분석</h3>
        <div className="mt-3 space-y-3 whitespace-pre-line text-sm leading-7 text-muted">
          {result.analysis}
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">성찰 질문</h3>
        <p className="mt-1 text-sm text-muted">정답을 채점하지 않습니다. 짧게 적어 보세요.</p>
        <div className="mt-4 space-y-4">
          {questions.map((question, index) => (
            <label key={question} className="block">
              <span className="text-sm font-medium text-navy">
                {index + 1}. {question}
              </span>
              <textarea
                value={notes[question] ?? ""}
                onChange={(event) =>
                  setNotes({ ...notes, [question]: event.target.value })
                }
                rows={2}
                className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none ring-sky/30 focus:ring-2"
                placeholder="메모 (선택)"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">이 경험과 연결된 개념</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONCEPTS.filter((item) => policyCase.educationalTopics.includes(item.id)).map(
            (item) => (
              <Link
                key={item.id}
                to="/learn"
                className="rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-navy"
              >
                {item.title}
              </Link>
            ),
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRevise}
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
          onClick={onCases}
          className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-navy"
        >
          다른 사례
        </button>
      </div>
    </section>
  );
}

function CompareBlock({
  policyCase,
  previous,
  current,
}: {
  policyCase: PolicyCase;
  previous: SimulationResult;
  current: SimulationResult;
}) {
  const scoreChanges = SCORE_LABELS.map((item) => ({
    ...item,
    before: previous.scores[item.key],
    after: current.scores[item.key],
    delta: current.scores[item.key] - previous.scores[item.key],
  }));
  const allocChanges = policyCase.policyOptions
    .map((option) => ({
      title: option.title,
      before: previous.allocations[option.id] ?? 0,
      after: current.allocations[option.id] ?? 0,
    }))
    .filter((item) => item.before !== item.after);

  return (
    <div className="rounded-3xl border border-navy/20 bg-navy/5 p-5">
      <h3 className="font-semibold text-navy">이전 결과와 나란히 비교</h3>
      <p className="mt-1 text-sm text-muted">
        어떤 배분을 바꿨는지, 그 선택이 어떤 지표를 움직였는지 봅니다.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs text-muted">이전 종합</p>
          <p className="text-3xl font-bold text-navy">{previous.scores.overall}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs text-muted">이번 종합</p>
          <p className="text-3xl font-bold text-navy">{current.scores.overall}</p>
          <p className="text-sm text-muted">
            {current.scores.overall - previous.scores.overall > 0 ? "+" : ""}
            {current.scores.overall - previous.scores.overall}점
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {scoreChanges.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
            <span>{item.label}</span>
            <span className={item.delta > 0 ? "text-leaf" : item.delta < 0 ? "text-rose" : "text-muted"}>
              {item.before} → {item.after} ({item.delta > 0 ? "+" : ""}
              {item.delta})
            </span>
          </div>
        ))}
      </div>
      {allocChanges.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-navy">바뀐 예산 배분</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {allocChanges.map((item) => (
              <li key={item.title}>
                {item.title} · {item.before}억 → {item.after}억
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">예산 배분은 같았고, 문제 정의나 시점만 달랐을 수 있습니다.</p>
      )}
    </div>
  );
}

function InsightCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "leaf" | "rose" | "navy";
}) {
  const color =
    tone === "leaf" ? "text-leaf" : tone === "rose" ? "text-rose" : "text-navy";
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <h3 className={`font-semibold ${color}`}>{title}</h3>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-6 text-muted">
        {(items.length > 0 ? items : ["기록이 충분하지 않습니다."]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function stakeholderReactions(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
) {
  const funded = policyCase.policyOptions.filter(
    (option) => (allocations[option.id] ?? 0) > 0,
  );
  const skipped = policyCase.policyOptions.filter(
    (option) => (allocations[option.id] ?? 0) === 0,
  );
  return policyCase.stakeholders.map((stakeholder, index) => {
    const focus = funded[index % Math.max(funded.length, 1)];
    const miss = skipped[index % Math.max(skipped.length, 1)];
    const text =
      funded.length === 0
        ? `${stakeholder.concern} 관련 사업이 보이지 않아 관망합니다.`
        : miss && skipped.length > 0
          ? `${stakeholder.concern} 관점에서 「${focus?.title ?? "배분된 사업"}」은 주목하지만, 「${miss.title}」 공백을 걱정합니다.`
          : `${stakeholder.concern} 관점에서 이번 배분을 지켜봅니다.`;
    return { name: stakeholder.name, text };
  });
}
