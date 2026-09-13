import type { CategoryId, Difficulty } from "../types/policy";

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: "welfare",
    label: "사회·복지",
    shortLabel: "복지",
    description: "인구, 돌봄, 주거, 복지 사각지대",
  },
  {
    id: "economy",
    label: "경제·산업",
    shortLabel: "경제",
    description: "일자리, 소상공인, 지역경제",
  },
  {
    id: "urban",
    label: "도시·교통",
    shortLabel: "도시",
    description: "교통, 주차, 도시재생",
  },
  {
    id: "environment",
    label: "환경",
    shortLabel: "환경",
    description: "폐기물, 대기, 기후적응",
  },
  {
    id: "culture",
    label: "문화·관광",
    shortLabel: "문화",
    description: "축제, 관광, 지역 브랜드",
  },
  {
    id: "education",
    label: "교육",
    shortLabel: "교육",
    description: "교육격차, 진로, 평생교육",
  },
  {
    id: "admin",
    label: "행정·공공서비스",
    shortLabel: "행정",
    description: "디지털 정부, 민원, 참여",
  },
];

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; stars: string; tone: string }
> = {
  beginner: { label: "기초", stars: "★☆☆", tone: "text-leaf" },
  intermediate: { label: "중급", stars: "★★☆", tone: "text-gold" },
  advanced: { label: "심화", stars: "★★★", tone: "text-rose" },
};

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((item) => item.id === id)?.label ?? id;
}
