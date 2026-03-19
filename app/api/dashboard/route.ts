import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/server-data";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return NextResponse.json(snapshot);
}
