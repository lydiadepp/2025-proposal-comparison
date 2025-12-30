import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, Calculator } from 'lucide-react';

const WageComparison = () => {
  const [startWage, setStartWage] = useState(50);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [projectionYears, setProjectionYears] = useState(30);

  // Constants
  const HOURS_PER_YEAR = weeklyHours * 52;
  const HOURS_PER_MONTH = HOURS_PER_YEAR / 12;
  const START_DATE = new Date('2025-10-01');

  // Helper to format currency
  const formatMoney = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Calculation Engine
  const calculationData = useMemo(() => {
    let currentAllianceRate = startWage;
    let currentKpRate = startWage;
    
    let cumulativeAlliance = 0;
    let cumulativeKp = 0;
    
    const dataPoints = [];
    const monthlyData = [];

    // Loop through months for the projection period
    // We start Oct 1, 2025.
    
    let currentDate = new Date(START_DATE);
    
    for (let i = 0; i <= projectionYears * 12; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 1-12
      
      // --- ALLIANCE RAISE LOGIC ---
      // 9.0% on 10/1/25
      // 5.0% on 10/1/26
      // 3.0% on 4/1/27
      // 4.0% on 10/1/27
      // 4.0% on 10/1/28
      // Thereafter 3% annually on Oct 1
      
      if (month === 10 && year === 2025) currentAllianceRate *= 1.09;
      else if (month === 10 && year === 2026) currentAllianceRate *= 1.05;
      else if (month === 4 && year === 2027) currentAllianceRate *= 1.03;
      else if (month === 10 && year === 2027) currentAllianceRate *= 1.04;
      else if (month === 10 && year === 2028) currentAllianceRate *= 1.04;
      else if (month === 10 && year > 2028) currentAllianceRate *= 1.03; // Projected 3%

      // --- KP RAISE LOGIC ---
      // 6.5% on 10/1/25
      // 6.5% on 10/1/26
      // 3.0% on 8/1/27
      // 2.5% on 10/1/27
      // 3.0% on 10/1/28
      // Thereafter 3% annually on Oct 1
      
      if (month === 10 && year === 2025) currentKpRate *= 1.065;
      else if (month === 10 && year === 2026) currentKpRate *= 1.065;
      else if (month === 8 && year === 2027) currentKpRate *= 1.03;
      else if (month === 10 && year === 2027) currentKpRate *= 1.025;
      else if (month === 10 && year === 2028) currentKpRate *= 1.03;
      else if (month === 10 && year > 2028) currentKpRate *= 1.03; // Projected 3%

      // Add monthly earnings to cumulative total
      cumulativeAlliance += currentAllianceRate * HOURS_PER_MONTH;
      cumulativeKp += currentKpRate * HOURS_PER_MONTH;

      // Record data for chart (every Oct to keep chart clean, or monthly?)
      // We'll do monthly calculation but push to chart array quarterly to smooth it out visually without overloading DOM
      if (i % 3 === 0) {
        dataPoints.push({
          date: `${month}/${year}`,
          displayDate: year,
          rawDate: currentDate,
          allianceRate: parseFloat(currentAllianceRate.toFixed(2)),
          kpRate: parseFloat(currentKpRate.toFixed(2)),
          gap: parseFloat((currentAllianceRate - currentKpRate).toFixed(2)),
          cumulativeDiff: cumulativeAlliance - cumulativeKp
        });
      }

      monthlyData.push({
         year,
         month,
         cumulativeAlliance,
         cumulativeKp
      });

      // Advance one month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Helper to get cumulative loss at specific year markers
    const getLossAtYear = (targetYearOffset) => {
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
  }, [startWage, projectionYears, weeklyHours]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="bg-white rounded-xl shadow-sm p-6 border-l-8 border-blue-600">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calculator className="h-8 w-8 text-blue-600 shrink-0" />
            2025 Proposal Comparison Tool For UNAC DASH members
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            See how the difference between the Alliance proposal and the KP proposal impacts your wallet today, and for the rest of your career.
          </p>
        </header>

        {/* Controls Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wage Control */}
            <div>
              <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Set Current Hourly Wage
              </label>
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <input 
                    type="range" 
                    min="40" 
                    max="70" 
                    step="0.5" 
                    value={startWage} 
                    onChange={(e) => setStartWage(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                    <span>$40/hr</span>
                    <span>$55/hr</span>
                    <span>$70/hr</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-center border-2 border-slate-200">
                  <span className="block text-sm text-slate-500 mb-1">Hourly Rate</span>
                  <span className="text-2xl font-extrabold text-slate-900">${startWage.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Hours Control */}
            <div>
              <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Set Weekly Hours
              </label>
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <input 
                    type="range" 
                    min="20" 
                    max="40" 
                    step="4" 
                    value={weeklyHours} 
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                    <span>20h</span>
                    <span>30h</span>
                    <span>40h</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-center border-2 border-slate-200">
                  <span className="block text-sm text-slate-500 mb-1">Weekly Hours</span>
                  <span className="text-2xl font-extrabold text-slate-900">{weeklyHours} hrs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Big Numbers / Key Findings */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                End of 4-Year Contract
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-1">Money permanently lost under KP proposal:</p>
              <p className="text-4xl font-black text-red-600">
                {formatMoney(calculationData.stats.loss4Year)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                *Comparison of cumulative earnings by Oct 2029
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-100 p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Lifetime Impact (30 Years)
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total lost earnings over career:</p>
              <p className="text-4xl font-black text-red-600">
                {formatMoney(calculationData.stats.loss30Year)}
              </p>
              <div className="mt-3 flex items-start gap-2 bg-amber-50 p-2 rounded text-amber-800 text-xs md:text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>Even if raise percentages match later, money not earned in the early years is never recovered.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Wage Growth Projection</h2>
              <p className="text-slate-500 text-sm">Visualizing the hourly rate gap over time</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Alliance Proposal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span>KP Proposal</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={calculationData.chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="displayDate" 
                  tickFormatter={(val, index) => {
                     // Show tick every 4 years to avoid clutter
                     return index % 16 === 0 ? val : '';
                  }}
                  stroke="#94a3b8"
                  tick={{fontSize: 12}}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tickFormatter={(val) => `$${val}`}
                  stroke="#94a3b8"
                  width={60}
                  tick={{fontSize: 12}}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-xl border border-slate-200">
                          <p className="font-bold text-slate-700 mb-2 border-b pb-1">{data.date}</p>
                          <div className="space-y-2">
                            <p className="text-blue-600 font-semibold flex justify-between gap-4">
                              <span>Alliance Rate:</span>
                              <span>${data.allianceRate}</span>
                            </p>
                            <p className="text-slate-500 font-semibold flex justify-between gap-4">
                              <span>KP Rate:</span>
                              <span>${data.kpRate}</span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-slate-100">
                                <p className="text-red-600 font-bold text-sm">
                                    Hourly Gap: -${data.gap}
                                </p>
                                <p className="text-slate-400 text-xs">
                                    (Money lost every hour worked)
                                </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="allianceRate" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fill="#dbeafe" 
                  fillOpacity={1}
                />
                <Area 
                  type="monotone" 
                  dataKey="kpRate" 
                  stroke="#64748b" 
                  strokeWidth={3}
                  fill="#f8fafc" // Matches background color
                  fillOpacity={1}
                />
                {/* Reference line for end of contract */}
                <ReferenceLine x="10/2029" stroke="red" strokeDasharray="3 3" label={{ value: "Contract Ends", position: 'insideTopRight', fill: 'red', fontSize: 12 }} />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Overlay Text for the shaded area */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-30 hidden md:block">
              <span className="text-blue-800 font-bold text-xl block">THE WAGE GAP</span>
              <span className="text-sm text-blue-800">Permanently Lost Earnings</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500 italic">
              *The shaded blue area represents the difference in hourly pay. This gap compounds every year because future raises are based on this lower rate.
            </p>
          </div>
        </section>

        {/* Detailed Breakdown Table */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">The "Snowball Effect" of Lost Wages</h2>
            <p className="text-slate-500 text-sm mt-1">
              Small gaps early on turn into huge losses over time. This is why "front-loading" raises (getting money sooner) is critical.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Timeline</th>
                  <th className="p-4">Cumulative Loss</th>
                  <th className="p-4 hidden md:table-cell">What this could buy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-medium text-slate-900">End of Contract (4 Years)</td>
                  <td className="p-4 text-red-600 font-bold">{formatMoney(calculationData.stats.loss4Year)}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500">A nice family vacation or major appliance upgrades</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">10 Years</td>
                  <td className="p-4 text-red-600 font-bold">{formatMoney(calculationData.stats.loss10Year)}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500">A reliable used car or significant down payment</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">20 Years</td>
                  <td className="p-4 text-red-600 font-bold">{formatMoney(calculationData.stats.loss20Year)}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500">A year of college tuition or major home renovation</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">30 Years (Career)</td>
                  <td className="p-4 text-red-600 font-black text-lg">{formatMoney(calculationData.stats.loss30Year)}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500 font-medium">Significant impact on retirement savings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <footer className="text-center text-slate-400 text-sm pb-8">
            <p>
                Assumptions: Employment based on {weeklyHours} hours/week ({HOURS_PER_YEAR} hours/year). 
                Projections assume a standard 3% annual raise after the initial 4-year contract period for both scenarios. 
                Taxes not included.
            </p>
        </footer>

      </div>
    </div>
  );
};

export default WageComparison;