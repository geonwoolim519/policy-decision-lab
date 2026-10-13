import { POLICY_CASES } from "../data/cases";
import { CaseCard } from "../components/CaseCard";
import { progressStats } from "../store/progress";
import { Link } from "react-router-dom";
import { APP_ICON } from "../lib/assets";

const FLOW = [
  "사회문제",
  "데이터",
  "정책 대안",
  "예산",
  "결정",
  "집행",
  "반응",
  "결과",
  "평가",
  "수정",
];

export function HomePage() {
  const stats = progressStats();
  const featured = POLICY_CASES.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-10">
          <div>
            <div className="mb-3 md:hidden">
              <img src={APP_ICON} alt="" className="h-14 w-14 object-contain drop-shadow" />
            </div>
            <p className="text-sm font-medium text-sky">체험형 정책 학습</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-navy md:text-4xl">
              당신이라면 어떤 정책을
              <br />
              선택하시겠습니까?
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
              제한된 예산과 복잡한 이해관계 속에서 직접 정책을 결정하고 그 결과를
              경험해보세요. 정답은 없습니다. 선택에 따라 시민 만족, 형평성, 재정
              건전성이 다르게 움직입니다. 가상 시나리오 {POLICY_CASES.length}건을
              이어서 비교할 수 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/simulate/youth-population"
                className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-deep"
              >
                정책 결정 시작하기
              </Link>
              <Link
                to="/cases"
                className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-paper"
              >
                사례 둘러보기
              </Link>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <img
              src={APP_ICON}
              alt="정책의사결정자 아이콘"
              className="h-64 w-64 object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="전체 정책 사례" value={`${POLICY_CASES.length}건`} />
        <Stat label="완료한 사례" value={`${stats.completed}건`} />
        <Stat label="평균 정책 점수" value={stats.completed ? `${stats.average}점` : "-"} />
        <Stat label="많이 선택한 분야" value={stats.topCategoryLabel} />
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 md:p-6">
        <h3 className="text-sm font-semibold text-navy">정책이 지나가는 길</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {FLOW.map((item, index) => (
            <div key={item} className="flex items-center gap-2">
              <span className="whitespace-nowrap rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-navy">
                {item}
              </span>
              {index < FLOW.length - 1 ? (
                <span className="text-slate-300">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-lg font-semibold text-navy">추천 사례</h3>
          <Link to="/cases" className="text-sm font-medium text-sky">
            전체 보기
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-navy">{value}</p>
    </div>
  );
}
