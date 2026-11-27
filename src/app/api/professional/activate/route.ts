import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "El alta profesional no está disponible." },
    { status: 403 },
  );
}
