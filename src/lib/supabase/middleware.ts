import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { workerMayAccessApiPath, workerMayAccessAppPath } from "@/lib/auth/worker-access";

const protectedPaths = [
  "/dashboard",
  "/onboarding",
  "/generator",
  "/profile",
  "/results",
  "/history",
  "/admin",
];
const authPaths = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  // If env vars are missing, pass through silently rather than crashing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const cookie of cookiesToSet) {
              request.cookies.set(cookie.name, cookie.value);
            }
            response = NextResponse.next({ request });
            for (const cookie of cookiesToSet) {
              response.cookies.set(cookie.name, cookie.value, cookie.options);
            }
          },
        },
      },
    );

    const { pathname } = request.nextUrl;
    const { data: { user } } = await supabase.auth.getUser();

    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (!user && isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user) {
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("account_role")
        .eq("id", user.id)
        .maybeSingle();

      const isWorker = !profileError && profileRow?.account_role === "worker";

      if (isWorker) {
        if (pathname.startsWith("/api/")) {
          if (!workerMayAccessApiPath(pathname)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
        } else if (isProtected && !workerMayAccessAppPath(pathname)) {
          return NextResponse.redirect(new URL("/dashboard/field-upload", request.url));
        }
      }
    }
  } catch {
    // Never crash the middleware — just pass through
  }

  return response;
}
