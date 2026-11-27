import { NextResponse } from "next/server";
import { CLINICAL_SUSPENSION_ERRORS } from "@/lib/domain/user-profile";

export async function POST(_request: Request) {
  void _request;
  return NextResponse.json(
    { error: CLINICAL_SUSPENSION_ERRORS.shareLookup },
    { status: 403 },
  );
}
