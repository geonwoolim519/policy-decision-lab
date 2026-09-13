import type { LearningConcept } from "../types/policy";

export const CONCEPTS: LearningConcept[] = [
  {
    id: "agenda",
    title: "사회문제와 의제설정",
    plain: "많은 문제 가운데 어떤 것을 정부가 먼저 다룰지 정하는 단계입니다.",
    academic:
      "의제설정은 사회문제가 정책 문제로 전환되는 과정입니다. 모든 문제가 동시에 다뤄질 수 없기 때문에 우선순위 판단이 필요합니다.",
    relatedCaseIds: ["youth-population", "low-birth", "aging"],
  },
  {
    id: "problem-definition",
    title: "문제 정의",
    plain: "같은 현상도 원인을 어떻게 보느냐에 따라 다른 정책이 됩니다.",
    academic:
      "문제 정의는 정책대안의 범위를 규정합니다. 원인을 일자리로 보면 고용정책이, 주거비로 보면 주거정책이 중심에 놓입니다.",
    relatedCaseIds: ["youth-population", "youth-jobs", "education-gap"],
  },
  {
    id: "alternatives",
    title: "정책 대안",
    plain: "하나의 문제에 대해 정부가 고를 수 있는 여러 가지 해법입니다.",
    academic:
      "정책대안은 목표 달성을 위한 수단의 집합입니다. 대안 비교에서는 효과, 비용, 형평성, 실행 가능성을 함께 봅니다.",
    relatedCaseIds: ["regional-economy", "urban-regen", "ai-admin"],
  },
  {
    id: "budget",
    title: "예산 배분",
    plain: "쓸 수 있는 돈이 정해져 있으므로, 어디에 얼마나 쓸지가 곧 정책입니다.",
    academic:
      "예산은 정책 우선순위의 가장 구체적인 표현입니다. 한정된 재원을 배분하는 과정이 재무행정의 핵심입니다.",
    relatedCaseIds: ["low-birth", "public-transit", "waste"],
  },
  {
    id: "decision",
    title: "정책 결정",
    plain: "여러 안을 비교한 뒤 실제로 추진할 방향을 고르는 순간입니다.",
    academic:
      "정책결정은 합리적 분석뿐 아니라 이해관계, 정치적 수용성, 시간 제약의 영향을 받습니다.",
    relatedCaseIds: ["parking", "festival", "traditional-market"],
  },
  {
    id: "implementation",
    title: "정책 집행",
    plain: "결정한 정책을 현장에서 실제로 실행하는 단계입니다. 예상과 다른 일이 자주 생깁니다.",
    academic:
      "정책집행은 조직, 인력, 법, 협력 기관이 맞물리는 과정입니다. 집행 격차로 인해 의도한 효과와 실제 효과가 달라질 수 있습니다.",
    relatedCaseIds: ["ai-admin", "fine-dust", "urban-regen"],
  },
  {
    id: "stakeholders",
    title: "이해관계자",
    plain: "정책에 영향을 받거나 영향을 주는 시민, 기업, 의회, 단체들입니다.",
    academic:
      "이해관계자 분석은 지지와 저항의 지점을 파악하는 작업입니다. 지방자치에서 의회·언론·주민 반응은 집행 환경 그 자체입니다.",
    relatedCaseIds: ["traditional-market", "tourism", "parking"],
  },
  {
    id: "equity",
    title: "형평성",
    plain: "혜택과 부담이 특정 집단에만 몰리지 않는지를 보는 기준입니다.",
    academic:
      "형평성은 수평적 형평(같은 상황은 같게)과 수직적 형평(다른 상황은 다르게)으로 나뉩니다. 효율성과 긴장 관계에 있는 경우가 많습니다.",
    relatedCaseIds: ["education-gap", "aging", "public-transit"],
  },
  {
    id: "efficiency",
    title: "효율성과 비용-편익",
    plain: "들인 예산에 비해 얼마나 의미 있는 변화가 있었는지를 봅니다.",
    academic:
      "효율성은 투입 대비 산출입니다. 비용-편익 분석은 화폐 단위로 비교하지만, 돌봄·안전·신뢰처럼 금액으로 잡히지 않는 가치도 있습니다.",
    relatedCaseIds: ["youth-jobs", "waste", "ai-admin"],
  },
  {
    id: "evaluation",
    title: "정책 평가",
    plain: "정책이 끝난 뒤, 또는 진행 중에 효과가 있었는지 되돌아보는 과정입니다.",
    academic:
      "정책평가는 효과성, 능률성, 형평성, 대응성, 적절성을 종합합니다. 평가 결과는 다음 정책 수정의 근거가 됩니다.",
    relatedCaseIds: ["low-birth", "fine-dust", "urban-regen"],
  },
  {
    id: "revision",
    title: "정책 수정과 환류",
    plain: "결과를 보고 예산을 다시 나누거나 사업 내용을 고치는 일입니다.",
    academic:
      "정책순환모형에서 평가는 종착점이 아니라 환류입니다. 지방정부는 매년 예산 편성과 성과관리를 통해 정책을 조정합니다.",
    relatedCaseIds: ["youth-population", "regional-economy", "tourism"],
  },
  {
    id: "fiscal",
    title: "재정 건전성",
    plain: "지금 쓰기 좋은 정책이 나중의 재정 여력을 해치지 않는지 살피는 일입니다.",
    academic:
      "재정의 지속가능성은 단기 지출 확대와 장기 채무·의무지출 증가를 구분해서 봐야 합니다. 복지지출은 효과와 재정 부담이 동시에 나타날 수 있습니다.",
    relatedCaseIds: ["aging", "low-birth", "youth-population"],
  },
  {
    id: "local-gov",
    title: "지방자치와 지역 여건",
    plain: "같은 정책이라도 지역의 인구, 산업, 재정 여력에 따라 결과가 달라집니다.",
    academic:
      "지방자치는 주민 근접성과 지역 실정에 맞는 정책 실험을 가능하게 합니다. 동시에 재정 격차와 광역 협력의 과제를 남깁니다.",
    relatedCaseIds: ["regional-economy", "festival", "education-gap"],
  },
  {
    id: "digital-gov",
    title: "디지털 정부",
    plain: "민원과 행정을 데이터와 온라인 서비스로 바꾸는 흐름입니다.",
    academic:
      "전자정부와 디지털 전환은 접근성, 개인정보, 디지털 격차, 알고리즘 책임을 함께 설계해야 합니다. 기술 도입 자체가 행정 개혁은 아닙니다.",
    relatedCaseIds: ["ai-admin"],
  },
];
