import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/onboarding",
  "/generator",
  "/profile",
  "/results",
  "/history",
];
const authPaths = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

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
            request.cookies.set(cookie.name, cookie.value);
          }
          response = NextResponse.next({
            request,
          });
          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    },
  );

  const { pathname } = request.nextUrl;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  // AUTH BYPASSED FOR DEV — re-enable before shipping
  // if (!user && isProtected) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // if (user && isAuthPage) { ... }
  // if (user && profileRestrictedPaths...) { ... }
  // if (user && pathname.startsWith("/onboarding")) { ... }

  return response;
}
