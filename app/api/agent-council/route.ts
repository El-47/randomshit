import { NextResponse } from "next/server";
import { mockAgentResponse } from "@/utils/mockAgentResponse";

export async function GET() {
  return NextResponse.json(mockAgentResponse);
}
