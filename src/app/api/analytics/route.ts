import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Calculate Eco-Impact Tracker
    const completedReservations = await prisma.reservation.findMany({
      where: { status: "COMPLETED" },
    });
    
    // Each item is approx 0.5kg of food and saves 1.25kg of CO2.
    const totalItemsSaved = completedReservations.reduce((acc, res) => acc + res.quantity, 0);
    const kgFoodSaved = totalItemsSaved * 0.5;
    const kgCO2Reduced = totalItemsSaved * 1.25;

    // 2. Waste Analytics (Top 3 wasted items)
    const expiredItems = await prisma.clearanceItem.findMany({
      where: {
        expiresAt: { lt: new Date() },
        currentQuantity: { gt: 0 }
      }
    });

    const wasteMap: Record<string, number> = {};
    expiredItems.forEach(item => {
      wasteMap[item.name] = (wasteMap[item.name] || 0) + item.currentQuantity;
    });

    const topWastedItems = Object.entries(wasteMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    // 3. Clearance Speed (Average time to sell out)
    const soldOutItems = await prisma.clearanceItem.findMany({
      where: { currentQuantity: 0 }
    });

    let avgClearanceSpeedMinutes = 0;
    if (soldOutItems.length > 0) {
      const totalMinutes = soldOutItems.reduce((acc, item) => {
        const diffMs = item.updatedAt.getTime() - item.createdAt.getTime();
        return acc + diffMs / (1000 * 60);
      }, 0);
      avgClearanceSpeedMinutes = Math.round(totalMinutes / soldOutItems.length);
    }

    return NextResponse.json({
      impact: {
        kgFoodSaved: kgFoodSaved.toFixed(1),
        kgCO2Reduced: kgCO2Reduced.toFixed(1)
      },
      topWastedItems,
      avgClearanceSpeedMinutes
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
