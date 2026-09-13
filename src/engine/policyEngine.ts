import type { PolicyCase, SimulationResult } from "../types/policy";
import { evaluatePolicy } from "./evaluationEngine";
import { generateAnalysis } from "./narrativeEngine";
import { projectIndicators } from "./outcomeEngine";
import { selectEvents } from "./eventEngine";

export function runSimulation(
  policyCase: PolicyCase,
  allocations: Record<string, number>,
  problemIds: string[],
): { result: SimulationResult; events: ReturnType<typeof selectEvents> } {
  const scores = evaluatePolicy(policyCase, allocations, problemIds);
  const analysis = generateAnalysis(policyCase, allocations, scores, problemIds);
  const indicatorChanges = projectIndicators(policyCase, allocations);
  return {
    events: selectEvents(policyCase, allocations),
    result: {
      caseId: policyCase.id,
      completedAt: new Date().toISOString(),
      problemIds,
      allocations: { ...allocations },
      scores,
      analysis,
      indicatorChanges,
    },
  };
}
