import { EcoLogEntry } from "@/types";

export interface EcoImpactSummary {
  totalCo2SavedKg: number;
  treesEquivalent: number;
  activeCommuteMinutes: number;
  paperlessHours: number;
  streakDays: number;
  ecoScore: number; // 0 - 100
}

export const ECO_ACTIVITY_FACTORS: Record<
  EcoLogEntry["activity"],
  { name: string; co2PerUnit: number; unitLabel: string; icon: string }
> = {
  cycle_commute: {
    name: "Bicycle / Active Commute",
    co2PerUnit: 25, // grams per minute (~750g for 30m)
    unitLabel: "minutes",
    icon: "bike",
  },
  walk_commute: {
    name: "Walking Commute",
    co2PerUnit: 20, // grams per minute
    unitLabel: "minutes",
    icon: "footprints",
  },
  paperless_study: {
    name: "Paperless Study / Digital Notes",
    co2PerUnit: 15, // grams per hour
    unitLabel: "minutes",
    icon: "tablet",
  },
  screen_power_down: {
    name: "Screen Power Down Hour",
    co2PerUnit: 30, // grams per hour
    unitLabel: "minutes",
    icon: "moon",
  },
  plant_meal: {
    name: "Plant-Based Fuel Meal",
    co2PerUnit: 1200, // grams per meal
    unitLabel: "meals",
    icon: "leaf",
  },
};

export function calculateEcoImpact(entries: EcoLogEntry[]): EcoImpactSummary {
  let totalCo2Grams = 0;
  let activeCommuteMinutes = 0;
  let paperlessMinutes = 0;

  for (const entry of entries) {
    totalCo2Grams += entry.co2SavedGrams;
    if (entry.activity === "cycle_commute" || entry.activity === "walk_commute") {
      activeCommuteMinutes += entry.minutes;
    }
    if (entry.activity === "paperless_study") {
      paperlessMinutes += entry.minutes;
    }
  }

  const totalCo2SavedKg = Math.round((totalCo2Grams / 1000) * 10) / 10;
  // 1 tree absorbs ~21.77 kg CO2/year (~60g/day)
  const treesEquivalent = Math.round((totalCo2Grams / 2000) * 10) / 10;
  const paperlessHours = Math.round((paperlessMinutes / 60) * 10) / 10;

  // Eco score 0 - 100 based on consistency
  const ecoScore = Math.min(100, Math.round((entries.length * 15) + (totalCo2SavedKg * 4)));

  return {
    totalCo2SavedKg,
    treesEquivalent,
    activeCommuteMinutes,
    paperlessHours,
    streakDays: Math.min(entries.length, 14),
    ecoScore: ecoScore || 45,
  };
}

export const sampleEcoEntries: EcoLogEntry[] = [
  {
    id: "eco-1",
    date: "2026-11-02",
    activity: "cycle_commute",
    minutes: 30,
    co2SavedGrams: 750,
  },
  {
    id: "eco-2",
    date: "2026-11-02",
    activity: "paperless_study",
    minutes: 90,
    co2SavedGrams: 45,
  },
  {
    id: "eco-3",
    date: "2026-11-01",
    activity: "plant_meal",
    minutes: 1,
    co2SavedGrams: 1200,
  },
  {
    id: "eco-4",
    date: "2026-10-31",
    activity: "walk_commute",
    minutes: 25,
    co2SavedGrams: 500,
  },
];
