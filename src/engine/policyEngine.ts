import type { PolicyCase, SimulationResult } from "../types/policy";
import { evaluatePolicy } from "./evaluationEngine";
import { generateAnalysis, generateInsights } from "./narrativeEngine";
import { projectIndicators } from "./outcomeEngine";
import { selectEvents } from "./eventEngine";

export function runSimulation(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
  problemIds: string[],
): { result: SimulationResult; events: ReturnType<typeof selectEvents> } {
  const scores = evaluatePolicy(policyCase, allocations, problemIds);
  const analysis = generateAnalysis(policyCase, allocations, scores, problemIds);
  const insights = generateInsights(policyCase, allocations, scores, problemIds);
  const indicatorChanges = projectIndicators(policyCase, allocations);
  const events = selectEvents(policyCase, allocations);
  return {
    events,
    result: {
      caseId: policyCase.id,
      completedAt: new Date().toISOString(),
      problemIds,
      allocations: { ...allocations },
      scores,
      analysis,
      indicatorChanges,
      eventIds: events.map((event) => event.id),
      strengths: insights.strengths,
      missedRisks: insights.missedRisks,
      nextSteps: insights.nextSteps,
      scoreReasons: insights.scoreReasons,
    },
  };
}
