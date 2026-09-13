import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { EvaluationScores } from "../types/policy";

const LABELS: { key: keyof Omit<EvaluationScores, "overall">; label: string }[] = [
  { key: "effectiveness", label: "정책 효과" },
  { key: "efficiency", label: "예산 효율" },
  { key: "satisfaction", label: "시민 만족" },
  { key: "equity", label: "형평성" },
  { key: "feasibility", label: "실행 가능" },
  { key: "fiscal", label: "재정 건전" },
  { key: "sustainability", label: "지속 가능" },
];

export function ScoreBars({ scores }: { scores: EvaluationScores }) {
  return (
    <div className="space-y-3">
      {LABELS.map((item) => {
        const value = scores[item.key];
        return (
          <div key={item.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted">{item.label}</span>
              <span className="font-semibold text-navy">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScoreRadar({ scores }: { scores: EvaluationScores }) {
  const data = LABELS.map((item) => ({
    subject: item.label,
    value: scores[item.key],
    fullMark: 100,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#dbe3ee" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#5b6b7c" }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="평가"
            dataKey="value"
            stroke="#1d4f91"
            strokeWidth={2}
            fill="#2b6cb0"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
