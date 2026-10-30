import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { loadChildCompanionData } from "@/lib/parent-companion";

/**
 * GET /api/parent/companion?childId=...
 *
 * Returns the full ChildCompanionData for a linked child.
 * Only accessible by the authenticated parent who owns the ParentChild link.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  // loadChildCompanionData performs the ParentChild link check internally
  const data = await loadChildCompanionData(session.user.id, childId);
  if (!data) {
    return NextResponse.json({ error: "Not found or not authorised" }, { status: 404 });
  }

  return NextResponse.json(data);
}
