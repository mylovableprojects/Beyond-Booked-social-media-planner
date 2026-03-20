import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing_fields", request.url));
  }

  const redirectTo = next && next.startsWith("/") ? next : "/dashboard";
  const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));

  // Build the client so cookies are written directly onto the redirect response,
  // not via next/headers — otherwise the session cookies are dropped on redirect.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  return redirectResponse;
}
