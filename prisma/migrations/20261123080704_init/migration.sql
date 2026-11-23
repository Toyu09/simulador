-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('COMMERCE', 'SERVICE', 'PRODUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "ScenarioType" AS ENUM ('OPTIMISTIC', 'CONSERVATIVE', 'PESSIMISTIC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BusinessType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialInvestment" DECIMAL(16,2) NOT NULL,
    "monthlyFixedCosts" DECIMAL(16,2) NOT NULL,
    "variableCostPerUnit" DECIMAL(16,2) NOT NULL,
    "salePricePerUnit" DECIMAL(16,2) NOT NULL,
    "estimatedMonthlyUnits" INTEGER NOT NULL,
    "projectionMonths" INTEGER NOT NULL DEFAULT 12,
    "annualDiscountRate" DECIMAL(8,4) NOT NULL DEFAULT 12,
    "productionCapacityUnits" INTEGER,
    "machineryDescription" TEXT,
    "monthlyMaintenanceCost" DECIMAL(16,2),
    "monthlyEnergyKwh" DECIMAL(16,2),
    "energyCostPerKwh" DECIMAL(16,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "type" "ScenarioType" NOT NULL,
    "priceChangePercent" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "demandChangePercent" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "variableCostChangePercent" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "monthlyRevenue" DECIMAL(16,2),
    "monthlyTotalCosts" DECIMAL(16,2),
    "monthlyProfit" DECIMAL(16,2),
    "profitabilityPercent" DECIMAL(8,4),
    "breakEvenUnits" DECIMAL(16,2),
    "npv" DECIMAL(16,2),
    "irrPercent" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projection" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "revenue" DECIMAL(16,2) NOT NULL,
    "fixedCosts" DECIMAL(16,2) NOT NULL,
    "variableCosts" DECIMAL(16,2) NOT NULL,
    "totalCosts" DECIMAL(16,2) NOT NULL,
    "profit" DECIMAL(16,2) NOT NULL,
    "netCashFlow" DECIMAL(16,2) NOT NULL,
    "cumulativeCashFlow" DECIMAL(16,2) NOT NULL,

    CONSTRAINT "Projection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");

-- CreateIndex
CREATE INDEX "Business_type_idx" ON "Business"("type");

-- CreateIndex
CREATE INDEX "Simulation_businessId_idx" ON "Simulation"("businessId");

-- CreateIndex
CREATE INDEX "Simulation_createdAt_idx" ON "Simulation"("createdAt");

-- CreateIndex
CREATE INDEX "Scenario_simulationId_idx" ON "Scenario"("simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_simulationId_type_key" ON "Scenario"("simulationId", "type");

-- CreateIndex
CREATE INDEX "Projection_scenarioId_idx" ON "Projection"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Projection_scenarioId_month_key" ON "Projection"("scenarioId", "month");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projection" ADD CONSTRAINT "Projection_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
