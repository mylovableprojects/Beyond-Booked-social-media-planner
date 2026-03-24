import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("account_role").eq("id", user.id).maybeSingle();
      if (prof?.account_role === "worker") {
        return NextResponse.redirect(new URL("/dashboard/field-upload", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
