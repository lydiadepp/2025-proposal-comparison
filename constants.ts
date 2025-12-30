
import { RaiseConfig } from './types';

export const START_DATE = new Date('2025-10-01');

export const ALLIANCE_SCHEDULE: RaiseConfig[] = [
  { month: 10, year: 2025, rate: 1.09, description: "9.0% First Year" },
  { month: 10, year: 2026, rate: 1.05, description: "5.0% Second Year" },
  { month: 4, year: 2027, rate: 1.03, description: "3.0% Mid-Term" },
  { month: 10, year: 2027, rate: 1.04, description: "4.0% Third Year" },
  { month: 10, year: 2028, rate: 1.04, description: "4.0% Final Year" },
];

export const KP_SCHEDULE: RaiseConfig[] = [
  { month: 10, year: 2025, rate: 1.065, description: "6.5% Initial" },
  { month: 10, year: 2026, rate: 1.065, description: "6.5% Second" },
  { month: 8, year: 2027, rate: 1.03, description: "3.0% Retention" },
  { month: 10, year: 2027, rate: 1.025, description: "2.5% Third Year" },
  { month: 10, year: 2028, rate: 1.03, description: "3.0% Final Year" },
];

export const POST_CONTRACT_RAISE = 1.03; // Projected 3% annually thereafter
