export type FinancialInput = {
  initialInvestment: number;
  monthlyFixedCosts: number;
  variableCostPerUnit: number;
  salePricePerUnit: number;
  estimatedMonthlyUnits: number;
  projectionMonths: number;
  annualDiscountRate: number;
  monthlyMaintenanceCost?: number | null;
  monthlyEnergyKwh?: number | null;
  energyCostPerKwh?: number | null;
};

export type ScenarioAdjustment = {
  type: "OPTIMISTIC" | "CONSERVATIVE" | "PESSIMISTIC";
  priceChangePercent: number;
  demandChangePercent: number;
  variableCostChangePercent: number;
};

function npv(rate: number, flows: number[]) {
  return flows.reduce((sum, flow, index) => sum + flow / Math.pow(1 + rate, index), 0);
}

function irr(flows: number[]): number | null {
  let low = -0.99;
  let high = 10;
  let lowValue = npv(low, flows);
  let highValue = npv(high, flows);
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || lowValue * highValue > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const value = npv(mid, flows);
    if (Math.abs(value) < 1e-7) return mid * 100;
    if (lowValue * value <= 0) {
      high = mid;
      highValue = value;
    } else {
      low = mid;
      lowValue = value;
    }
  }
  return ((low + high) / 2) * 100;
}

export function calculateScenario(input: FinancialInput, adjustment: ScenarioAdjustment) {
  const price = input.salePricePerUnit * (1 + adjustment.priceChangePercent / 100);
  const units = Math.max(0, Math.round(input.estimatedMonthlyUnits * (1 + adjustment.demandChangePercent / 100)));
  const variableCost = input.variableCostPerUnit * (1 + adjustment.variableCostChangePercent / 100);
  const energy = (input.monthlyEnergyKwh ?? 0) * (input.energyCostPerKwh ?? 0);
  const fixed = input.monthlyFixedCosts + (input.monthlyMaintenanceCost ?? 0) + energy;
  const revenue = price * units;
  const variableCosts = variableCost * units;
  const totalCosts = fixed + variableCosts;
  const profit = revenue - totalCosts;
  const contribution = price - variableCost;
  const breakEvenUnits = contribution > 0 ? fixed / contribution : null;
  const profitabilityPercent = revenue > 0 ? (profit / revenue) * 100 : null;
  const monthlyRate = Math.pow(1 + input.annualDiscountRate / 100, 1 / 12) - 1;
  const projections = [];
  let cumulative = -input.initialInvestment;
  const cashFlows = [-input.initialInvestment];
  for (let month = 1; month <= input.projectionMonths; month++) {
    cumulative += profit;
    cashFlows.push(profit);
    projections.push({
      month,
      revenue,
      fixedCosts: fixed,
      variableCosts,
      totalCosts,
      profit,
      netCashFlow: profit,
      cumulativeCashFlow: cumulative,
    });
  }
  const presentValue = npv(monthlyRate, cashFlows);
  const paybackMonth = profit > 0 ? Math.ceil(input.initialInvestment / profit) : null;
  return {
    type: adjustment.type,
    priceChangePercent: adjustment.priceChangePercent,
    demandChangePercent: adjustment.demandChangePercent,
    variableCostChangePercent: adjustment.variableCostChangePercent,
    monthlyRevenue: revenue,
    monthlyTotalCosts: totalCosts,
    monthlyProfit: profit,
    profitabilityPercent,
    breakEvenUnits,
    npv: presentValue,
    irrPercent: irr(cashFlows),
    paybackMonth,
    projections,
  };
}

export function buildScenarios(input: FinancialInput) {
  return [
    calculateScenario(input, { type: "OPTIMISTIC", priceChangePercent: 5, demandChangePercent: 15, variableCostChangePercent: -5 }),
    calculateScenario(input, { type: "CONSERVATIVE", priceChangePercent: 0, demandChangePercent: 0, variableCostChangePercent: 0 }),
    calculateScenario(input, { type: "PESSIMISTIC", priceChangePercent: -5, demandChangePercent: -15, variableCostChangePercent: 10 }),
  ];
}
