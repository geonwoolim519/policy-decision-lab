import { Link } from "react-router-dom";
import { POLICY_CASES, getCaseById } from "../data/cases";
import { ScoreBars } from "../components/ScoreChart";
import { caseNumber } from "../lib/caseMeta";
import { progressStats } from "../store/progress";

export function MyPolicyPage() {
  const stats = progressStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">나의 정책</h2>
        <p className="mt-1 text-sm text-muted">
          지금까지의 결정은 성격 유형이 아니라, 이 시뮬레이션 안의 경향입니다. 완료{" "}
          {stats.completed}/{POLICY_CASES.length}.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Mini label="완료한 사례" value={`${stats.completed}`} />
        <Mini label="평균 점수" value={stats.completed ? `${stats.average}` : "-"} />
        <Mini label="최고 점수" value={stats.completed ? `${stats.best}` : "-"} />
        <Mini label="평균 예산 효율성" value={stats.completed ? `${stats.avgEfficiency}` : "-"} />
      </section>

      <section className="rounded-3xl border border-line bg-white p-5">
        <h3 className="font-semibold text-navy">의사결정 경향</h3>
        {stats.tendencies.length === 0 ? (
          <p className="mt-3 text-sm text-muted">사례를 하나 완료하면 경향이 표시됩니다.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {stats.tendencies.map((item) => (
              <div key={item.id} className="rounded-2xl bg-paper p-4">
                <p className="font-semibold text-navy">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {stats.results[0] ? (
        <section className="rounded-3xl border border-line bg-white p-5">
          <h3 className="font-semibold text-navy">최근 평가 프로필</h3>
          <p className="mt-1 text-sm text-muted">
            평균 시민 만족도 {stats.avgSatisfaction}점 · 주 선택 분야 {stats.topCategoryLabel}
          </p>
          <div className="mt-4">
            <ScoreBars scores={stats.results[0].scores} />
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 font-semibold text-navy">완료한 정책</h3>
        {stats.results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-white p-8 text-center">
            <p className="text-sm text-muted">아직 완료한 사례가 없습니다.</p>
            <Link to="/cases" className="mt-3 inline-block text-sm font-semibold text-sky">
              사례 선택하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.results.map((result) => {
              const policyCase = getCaseById(result.caseId);
              if (!policyCase) return null;
              return (
                <div
                  key={result.caseId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4"
                >
                  <div>
                    <p className="font-semibold text-navy">
                      {policyCase.emoji} 사례 {String(caseNumber(policyCase)).padStart(2, "0")}{" "}
                      {policyCase.title}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(result.completedAt).toLocaleString("ko-KR")}
                      {result.attempt ? ` · ${result.attempt}번째 시도` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-navy">{result.scores.overall}</p>
                    <Link
                      to={`/simulate/${result.caseId}?view=result`}
                      className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-navy"
                    >
                      결과 다시 보기
                    </Link>
                    <Link
                      to={`/simulate/${result.caseId}?revise=1`}
                      className="rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white"
                    >
                      재설계
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {stats.completed < POLICY_CASES.length ? (
        <p className="text-center text-sm text-muted">
          {POLICY_CASES.length - stats.completed}개 사례가 남아 있습니다.
        </p>
      ) : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-navy">{value}</p>
    </div>
  );
}
