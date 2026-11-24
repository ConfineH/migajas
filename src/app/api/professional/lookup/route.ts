import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    { error: "La comprobación de códigos profesionales no está disponible." },
    { status: 403 },
  );
}
