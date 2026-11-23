import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { buildScenarios, type FinancialInput } from "@/lib/financial";

function numberValue(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const access = await requireUser();
  if (access.error) return access.error;
  const businessId = request.nextUrl.searchParams.get("businessId");
  const where = businessId
    ? { businessId, business: { ownerId: access.user.id } }
    : { business: { ownerId: access.user.id } };
  const simulations = await prisma.simulation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { business: { select: { id: true, name: true } }, scenarios: true },
  });
  return NextResponse.json(simulations);
}

export async function POST(request: NextRequest) {
  const access = await requireUser();
  if (access.error) return access.error;
  const body = await request.json();
  const businessId = typeof body.businessId === "string" ? body.businessId : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const business = await prisma.business.findFirst({ where: { id: businessId, ownerId: access.user.id }, select: { id: true } });
  if (!business) return NextResponse.json({ error: "Emprendimiento no válido." }, { status: 404 });
  const input: FinancialInput = {
    initialInvestment: numberValue(body.initialInvestment),
    monthlyFixedCosts: numberValue(body.monthlyFixedCosts),
    variableCostPerUnit: numberValue(body.variableCostPerUnit),
    salePricePerUnit: numberValue(body.salePricePerUnit),
    estimatedMonthlyUnits: numberValue(body.estimatedMonthlyUnits),
    projectionMonths: numberValue(body.projectionMonths, 12),
    annualDiscountRate: numberValue(body.annualDiscountRate, 12),
    monthlyMaintenanceCost: numberValue(body.monthlyMaintenanceCost),
    monthlyEnergyKwh: numberValue(body.monthlyEnergyKwh),
    energyCostPerKwh: numberValue(body.energyCostPerKwh),
  };
  const numeric = [input.initialInvestment, input.monthlyFixedCosts, input.variableCostPerUnit, input.salePricePerUnit, input.estimatedMonthlyUnits, input.projectionMonths, input.annualDiscountRate, input.monthlyMaintenanceCost ?? 0, input.monthlyEnergyKwh ?? 0, input.energyCostPerKwh ?? 0];
  if (!name || name.length > 100 || numeric.some((n) => !Number.isFinite(n) || n < 0) ||
      input.initialInvestment <= 0 || input.salePricePerUnit <= 0 || input.estimatedMonthlyUnits <= 0 ||
      !Number.isInteger(input.estimatedMonthlyUnits) || !Number.isInteger(input.projectionMonths) ||
      input.projectionMonths < 1 || input.projectionMonths > 60 || input.variableCostPerUnit >= input.salePricePerUnit ||
      input.annualDiscountRate > 100) {
    return NextResponse.json({ error: "Revisa los datos. La proyección debe estar entre 1 y 60 meses, el precio debe superar el costo variable y las ventas deben ser mayores que cero." }, { status: 400 });
  }
  const scenarios = buildScenarios(input);
  const simulation = await prisma.simulation.create({
    data: {
      businessId, name,
      initialInvestment: input.initialInvestment,
      monthlyFixedCosts: input.monthlyFixedCosts,
      variableCostPerUnit: input.variableCostPerUnit,
      salePricePerUnit: input.salePricePerUnit,
      estimatedMonthlyUnits: input.estimatedMonthlyUnits,
      projectionMonths: input.projectionMonths,
      annualDiscountRate: input.annualDiscountRate,
      monthlyMaintenanceCost: input.monthlyMaintenanceCost || null,
      monthlyEnergyKwh: input.monthlyEnergyKwh || null,
      energyCostPerKwh: input.energyCostPerKwh || null,
      productionCapacityUnits: body.productionCapacityUnits ? numberValue(body.productionCapacityUnits) : null,
      machineryDescription: typeof body.machineryDescription === "string" ? body.machineryDescription.trim().slice(0, 500) || null : null,
      scenarios: {
        create: scenarios.map((scenario) => ({
          type: scenario.type,
          priceChangePercent: scenario.priceChangePercent,
          demandChangePercent: scenario.demandChangePercent,
          variableCostChangePercent: scenario.variableCostChangePercent,
          monthlyRevenue: scenario.monthlyRevenue,
          monthlyTotalCosts: scenario.monthlyTotalCosts,
          monthlyProfit: scenario.monthlyProfit,
          profitabilityPercent: scenario.profitabilityPercent,
          breakEvenUnits: scenario.breakEvenUnits,
          npv: scenario.npv,
          irrPercent: scenario.irrPercent,
          projections: { create: scenario.projections },
        })),
      },
    },
    include: { business: { select: { id: true, name: true } }, scenarios: { include: { projections: { orderBy: { month: "asc" } } } } },
  });
  return NextResponse.json(simulation, { status: 201 });
}
