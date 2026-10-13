import type { CategoryId, PolicyCase } from "../../types/policy";
import { aging } from "./aging";
import { afterschoolCare } from "./afterschoolCare";
import { aiAdmin } from "./aiAdmin";
import { complaintInnovation } from "./complaintInnovation";
import { crimePrivacy } from "./crimePrivacy";
import { digitalExclusion } from "./digitalExclusion";
import { educationGap } from "./educationGap";
import { festival } from "./festival";
import { fineDust } from "./fineDust";
import { foodAssistance } from "./foodAssistance";
import { libraryAccess } from "./libraryAccess";
import { lowBirth } from "./lowBirth";
import { mobilityRights } from "./mobilityRights";
import { parking } from "./parking";
import { publicEnergy } from "./publicEnergy";
import { publicTransit } from "./publicTransit";
import { redevelopmentConflict } from "./redevelopmentConflict";
import { regionalEconomy } from "./regionalEconomy";
import { regionalHealthcare } from "./regionalHealthcare";
import { smeLaborShortage } from "./smeLaborShortage";
import { tourism } from "./tourism";
import { traditionalMarket } from "./traditionalMarket";
import { urbanFlood } from "./urbanFlood";
import { urbanRegen } from "./urbanRegen";
import { waste } from "./waste";
import { waterInfrastructure } from "./waterInfrastructure";
import { youthHousingCost } from "./youthHousingCost";
import { youthJobs } from "./youthJobs";
import { youthPopulation } from "./youthPopulation";
import { youthSettlement } from "./youthSettlement";

const RAW_CASES: PolicyCase[] = [
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
  youthHousingCost,
  smeLaborShortage,
  regionalHealthcare,
  urbanFlood,
  libraryAccess,
  mobilityRights,
  redevelopmentConflict,
  digitalExclusion,
  foodAssistance,
  youthSettlement,
  waterInfrastructure,
  crimePrivacy,
  afterschoolCare,
  complaintInnovation,
  publicEnergy,
];

export const POLICY_CASES: PolicyCase[] = RAW_CASES.map((item, index) => ({
  ...item,
  displayNumber: item.displayNumber ?? index + 1,
}));

export function getCaseById(id: string) {
  return POLICY_CASES.find((item) => item.id === id);
}

export function casesByCategory(category: CategoryId | "all") {
  if (category === "all") return POLICY_CASES;
  return POLICY_CASES.filter((item) => item.category === category);
}
