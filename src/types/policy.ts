export type Difficulty = "beginner" | "intermediate" | "advanced";

export type CategoryId =
  | "welfare"
  | "economy"
  | "urban"
  | "environment"
  | "culture"
  | "education"
  | "admin";

export interface ChartPoint {
  year: string;
  value: number;
}

export interface ChartSeries {
  id: string;
  name: string;
  unit: string;
  data: ChartPoint[];
}

export interface Statistic {
  id: string;
  label: string;
  value: string;
  hint?: string;
}

export interface ProblemOption {
  id: string;
  label: string;
  hint: string;
  alignedPolicies: string[];
}

export interface PolicyEffects {
  effectiveness: number;
  satisfaction: number;
  equity: number;
  feasibility: number;
  finance: number;
  sustainability: number;
}

export interface PolicyOption {
  id: string;
  title: string;
  summary: string;
  description: string;
  baseCost: number;
  minCost: number;
  maxCost: number;
  expectedEffects: string[];
  risks: string[];
  effects: PolicyEffects;
  annualCost?: number;
  timeline?: string;
  target?: string;
  equityNote?: string;
  fiscalNote?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  concern: string;
}

export interface PolicyEventRule {
  id: string;
  actor: string;
  emoji: string;
  message: string;
  policyId?: string;
  minShare?: number;
  maxShare?: number;
  unusedMin?: number;
  unusedMax?: number;
  always?: boolean;
}

export interface OutcomeIndicator {
  id: string;
  label: string;
  baseline: number;
  unit: string;
  higherIsBetter: boolean;
  scale: number;
  drivers: Partial<Record<keyof PolicyEffects, number>>;
}

export interface PolicyCase {
  id: string;
  title: string;
  emoji: string;
  category: CategoryId;
  difficulty: Difficulty;
  duration: string;
  cityName: string;
  description: string;
  briefing: string;
  background: string;
  totalBudget: number;
  statistics: Statistic[];
  charts: ChartSeries[];
  problemOptions: ProblemOption[];
  policyOptions: PolicyOption[];
  stakeholders: Stakeholder[];
  events: PolicyEventRule[];
  indicators: OutcomeIndicator[];
  educationalTopics: string[];
  displayNumber?: number;
  estimatedMinutes?: number;
  populationProfile?: string;
  policyObjectives?: string[];
  coreIssue?: string;
  debriefQuestions?: string[];
  scenarioNote?: string;
}

export interface EvaluationScores {
  overall: number;
  effectiveness: number;
  efficiency: number;
  satisfaction: number;
  equity: number;
  feasibility: number;
  fiscal: number;
  sustainability: number;
}

export interface SimulationResult {
  caseId: string;
  completedAt: string;
  problemIds: string[];
  allocations: Record<string, number>;
  scores: EvaluationScores;
  analysis: string;
  indicatorChanges: {
    id: string;
    label: string;
    before: number;
    after: number;
    unit: string;
    higherIsBetter: boolean;
  }[];
  eventIds?: string[];
  strengths?: string[];
  missedRisks?: string[];
  nextSteps?: string[];
  scoreReasons?: Partial<Record<keyof Omit<EvaluationScores, "overall">, string>>;
  attempt?: number;
}

export interface SimulationDraft {
  caseId: string;
  step: number;
  problemIds: string[];
  allocations: Record<string, number>;
  updatedAt: string;
}

export type CaseStatus = "idle" | "draft" | "done";

export interface LearningConcept {
  id: string;
  title: string;
  plain: string;
  academic: string;
  relatedCaseIds: string[];
}
