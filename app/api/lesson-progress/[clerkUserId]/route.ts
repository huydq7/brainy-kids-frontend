// api/lesson-progress/[clerkUserId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { api } from "../../config";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { clerkUserId: string } }
) {
  try {
    const token = (await cookies()).get("token")?.value;
    const clerkUserId = params.clerkUserId;
    if (!clerkUserId) {
      // Changed condition from if(userId) to if(!clerkUserId)
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const response = await fetch(api.getLessonProgress(clerkUserId), {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user ${clerkUserId}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch clerkUser" },
      { status: 500 }
    );
  }
}
