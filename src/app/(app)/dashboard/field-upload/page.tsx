import { redirect } from "next/navigation";

import { FieldUploadClient } from "./field-upload-client";
import { requireUser } from "@/lib/auth/session";
import { getProfileWithLibraries } from "@/services/repositories/profiles.repository";

export default async function FieldUploadPage() {
  const user = await requireUser();
  const { profile } = await getProfileWithLibraries(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const display = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  const workerName = display || profile.business_name;

  return (
    <div>
      <FieldUploadClient userId={user.id} workerName={workerName} />
    </div>
  );
}
