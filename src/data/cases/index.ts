import type { CategoryId, PolicyCase } from "../../types/policy";
import { aging } from "./aging";
import { aiAdmin } from "./aiAdmin";
import { educationGap } from "./educationGap";
import { festival } from "./festival";
import { fineDust } from "./fineDust";
import { lowBirth } from "./lowBirth";
import { parking } from "./parking";
import { publicTransit } from "./publicTransit";
import { regionalEconomy } from "./regionalEconomy";
import { tourism } from "./tourism";
import { traditionalMarket } from "./traditionalMarket";
import { urbanRegen } from "./urbanRegen";
import { waste } from "./waste";
import { youthJobs } from "./youthJobs";
import { youthPopulation } from "./youthPopulation";

export const POLICY_CASES: PolicyCase[] = [
  youthPopulation,
  lowBirth,
  aging,
  youthJobs,
  regionalEconomy,
  traditionalMarket,
  publicTransit,
  parking,
  urbanRegen,
  waste,
  fineDust,
  festival,
  tourism,
  educationGap,
  aiAdmin,
];

export function getCaseById(id: string) {
  return POLICY_CASES.find((item) => item.id === id);
}

export function casesByCategory(category: CategoryId | "all") {
  if (category === "all") return POLICY_CASES;
  return POLICY_CASES.filter((item) => item.category === category);
}
