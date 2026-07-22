import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exportAuthenticatedUserData } from "@/lib/supabase/account-lifecycle";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const exportData = await exportAuthenticatedUserData(user.id, {
    email: user.email,
  });
  const filename = `migajas-export-${user.id}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
