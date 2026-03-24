/** API routes a field worker may call (session required). Everything else returns 403 from middleware. */
export function workerMayAccessApiPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname === "/api/field-upload/save") return true;
  if (pathname === "/api/generate-field-post") return true;
  return false;
}

export function workerMayAccessAppPath(pathname: string): boolean {
  return pathname === "/dashboard/field-upload" || pathname.startsWith("/dashboard/field-upload/");
}
