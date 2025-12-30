
import { WageDataPoint, CalculationResult } from '../types';
import { START_DATE, ALLIANCE_SCHEDULE, KP_SCHEDULE, POST_CONTRACT_RAISE } from '../constants';

export const calculateWageImpact = (
  startWage: number,
  weeklyHours: number,
  projectionYears: number
): CalculationResult => {
  const HOURS_PER_YEAR = weeklyHours * 52;
  const HOURS_PER_MONTH = HOURS_PER_YEAR / 12;

  let currentAllianceRate = startWage;
  let currentKpRate = startWage;
  let cumulativeAlliance = 0;
  let cumulativeKp = 0;

  const dataPoints: WageDataPoint[] = [];
  const monthlyData: { cumulativeAlliance: number; cumulativeKp: number }[] = [];

  let currentDate = new Date(START_DATE);

  for (let i = 0; i <= projectionYears * 12; i++) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Apply Alliance Schedule
    const allianceRaise = ALLIANCE_SCHEDULE.find(r => r.month === month && r.year === year);
    if (allianceRaise) {
      currentAllianceRate *= allianceRaise.rate;
    } else if (month === 10 && year > 2028) {
      currentAllianceRate *= POST_CONTRACT_RAISE;
    }

    // Apply KP Schedule
    const kpRaise = KP_SCHEDULE.find(r => r.month === month && r.year === year);
    if (kpRaise) {
      currentKpRate *= kpRaise.rate;
    } else if (month === 10 && year > 2028) {
      currentKpRate *= POST_CONTRACT_RAISE;
    }

    cumulativeAlliance += currentAllianceRate * HOURS_PER_MONTH;
    cumulativeKp += currentKpRate * HOURS_PER_MONTH;

    if (i % 3 === 0) {
      dataPoints.push({
        date: `${month}/${year}`,
        displayDate: year,
        rawDate: new Date(currentDate),
        allianceRate: parseFloat(currentAllianceRate.toFixed(2)),
        kpRate: parseFloat(currentKpRate.toFixed(2)),
        gap: parseFloat((currentAllianceRate - currentKpRate).toFixed(2)),
        cumulativeDiff: cumulativeAlliance - cumulativeKp
      });
    }

    monthlyData.push({
      cumulativeAlliance,
      cumulativeKp
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const getLossAtYear = (targetYearOffset: number) => {
    const targetIndex = (targetYearOffset * 12) - 1;
    if (targetIndex < monthlyData.length && targetIndex >= 0) {
      const data = monthlyData[targetIndex];
      return data.cumulativeAlliance - data.cumulativeKp;
    }
    return 0;
  };

  return {
    chartData: dataPoints,
    stats: {
      loss4Year: getLossAtYear(4),
      loss10Year: getLossAtYear(10),
      loss20Year: getLossAtYear(20),
      loss30Year: getLossAtYear(30),
    }
  };
};

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
