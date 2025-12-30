
export interface WageDataPoint {
  date: string;
  displayDate: number;
  rawDate: Date;
  allianceRate: number;
  kpRate: number;
  gap: number;
  cumulativeDiff: number;
}

export interface CalculationStats {
  loss4Year: number;
  loss10Year: number;
  loss20Year: number;
  loss30Year: number;
}

export interface CalculationResult {
  chartData: WageDataPoint[];
  stats: CalculationStats;
}

export interface RaiseConfig {
  month: number;
  year: number;
  rate: number;
  description: string;
}
