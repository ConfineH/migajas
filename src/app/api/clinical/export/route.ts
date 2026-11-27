import { NextResponse } from "next/server";
import { CLINICAL_SUSPENSION_ERRORS } from "@/lib/domain/user-profile";

export const runtime = "nodejs";

export async function GET(_request: Request) {
  void _request;
  return NextResponse.json(
    { error: CLINICAL_SUSPENSION_ERRORS.clinicalReport },
    { status: 403 },
  );
}
