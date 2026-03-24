import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_EVENT_TYPES, DEFAULT_SERVICE_CATEGORIES } from "@/lib/constants/default-libraries";

export async function hasProfile(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .maybeSingle();
  return Boolean(data?.id);
}

type ProfileUpsertInput = {
  profileId: string;
  businessName: string;
  city: string;
  stateRegion?: string;
  timezone?: string;
  brandNotes?: string;
  // New API: submit the full desired selection (defaults + custom).
  selectedEventTypes?: string[];
  selectedServiceCategories?: string[];

  // Backwards compatibility (used by onboarding route originally).
  customEventTypes?: string[];
  customServiceCategories?: string[];
};

export async function getProfileWithLibraries(profileId: string) {
  const supabase = await createSupabaseServerClient();

  const [{ data: profile }, { data: eventTypes }, { data: serviceCategories }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
      supabase
        .from("profile_event_types")
        .select("name,is_default")
        .eq("profile_id", profileId)
        .order("name", { ascending: true }),
      supabase
        .from("profile_service_categories")
        .select("name,is_default")
        .eq("profile_id", profileId)
        .order("name", { ascending: true }),
    ]);

  return {
    profile: profile ?? null,
    eventTypes: (eventTypes ?? []).map((row) => row.name),
    serviceCategories: (serviceCategories ?? []).map((row) => row.name),
  };
}

/**
 * Profile + libraries for the business whose content should drive generation.
 * Field workers use their employer's profile (service role; bypasses RLS).
 */
export async function getProfileWithLibrariesForSessionUser(sessionUserId: string) {
  const admin = createSupabaseAdminClient();
  const { data: sessionProfile } = await admin
    .from("profiles")
    .select("account_role, employer_profile_id")
    .eq("id", sessionUserId)
    .maybeSingle();

  const contentProfileId =
    sessionProfile?.account_role === "worker" && sessionProfile.employer_profile_id
      ? sessionProfile.employer_profile_id
      : sessionUserId;

  const [{ data: profile }, { data: eventTypes }, { data: serviceCategories }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", contentProfileId).maybeSingle(),
    admin
      .from("profile_event_types")
      .select("name,is_default")
      .eq("profile_id", contentProfileId)
      .order("name", { ascending: true }),
    admin
      .from("profile_service_categories")
      .select("name,is_default")
      .eq("profile_id", contentProfileId)
      .order("name", { ascending: true }),
  ]);

  return {
    contentProfileId,
    sessionAccountRole: (sessionProfile?.account_role as "owner" | "worker" | undefined) ?? "owner",
    sessionEmployerProfileId: sessionProfile?.employer_profile_id ?? null,
    profile: profile ?? null,
    eventTypes: (eventTypes ?? []).map((row) => row.name),
    serviceCategories: (serviceCategories ?? []).map((row) => row.name),
  };
}

function normalizeItems(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export async function upsertProfileAndLibraries(input: ProfileUpsertInput) {
  const supabase = await createSupabaseServerClient();

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: input.profileId,
      business_name: input.businessName,
      city: input.city,
      state_region: input.stateRegion || null,
      timezone: input.timezone || "America/Chicago",
      brand_notes: input.brandNotes || null,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  const selectedEventTypes = normalizeItems(
    input.selectedEventTypes ?? input.customEventTypes ?? [],
  );
  const selectedServiceCategories = normalizeItems(
    input.selectedServiceCategories ?? input.customServiceCategories ?? [],
  );

  const defaultEventMapLowerToCanonical = new Map<string, string>(
    DEFAULT_EVENT_TYPES.map((name) => [name.toLowerCase(), name]),
  );
  const defaultServiceMapLowerToCanonical = new Map<string, string>(
    DEFAULT_SERVICE_CATEGORIES.map((name) => [name.toLowerCase(), name]),
  );

  const canonicalizeSelection = (
    items: string[],
    defaultMap: Map<string, string>,
  ): string[] => {
    const map = new Map<string, string>();
    for (const raw of items) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();
      const canonical = defaultMap.get(lower) ?? trimmed;
      map.set(lower, canonical);
    }
    return Array.from(map.values());
  };

  const canonicalEventTypes = canonicalizeSelection(
    selectedEventTypes,
    defaultEventMapLowerToCanonical,
  );
  const canonicalServiceCategories = canonicalizeSelection(
    selectedServiceCategories,
    defaultServiceMapLowerToCanonical,
  );

  const [{ data: existingEvents }, { data: existingServices }] = await Promise.all([
    supabase
      .from("profile_event_types")
      .select("name,is_default")
      .eq("profile_id", input.profileId),
    supabase
      .from("profile_service_categories")
      .select("name,is_default")
      .eq("profile_id", input.profileId),
  ]);

  // ----- Sync event types -----
  const existingEventsRows = existingEvents ?? [];
  const selectedEventLowerSet = new Set(canonicalEventTypes.map((s) => s.toLowerCase()));

  const existingEventsByLower = new Map<
    string,
    { name: string; is_default: boolean }
  >();
  const duplicateEventNamesToDelete: string[] = [];

  for (const row of existingEventsRows) {
    const lower = row.name.toLowerCase();
    if (existingEventsByLower.has(lower)) {
      duplicateEventNamesToDelete.push(row.name);
    } else {
      existingEventsByLower.set(lower, { name: row.name, is_default: row.is_default });
    }
  }

  const eventNamesToDelete = [
    ...duplicateEventNamesToDelete,
    ...existingEventsRows
      .filter((row) => !selectedEventLowerSet.has(row.name.toLowerCase()))
      .map((row) => row.name),
  ];

  if (eventNamesToDelete.length) {
    const { error } = await supabase
      .from("profile_event_types")
      .delete()
      .in("name", eventNamesToDelete)
      .eq("profile_id", input.profileId);
    if (error) throw error;
  }

  const selectedEventsByLower = new Map(
    canonicalEventTypes.map((name) => [name.toLowerCase(), name]),
  );
  for (const [lower, desiredName] of selectedEventsByLower) {
    const desiredIsDefault = defaultEventMapLowerToCanonical.has(lower);
    const existing = existingEventsByLower.get(lower);

    if (existing) {
      if (existing.name !== desiredName || existing.is_default !== desiredIsDefault) {
        const { error } = await supabase
          .from("profile_event_types")
          .update({ name: desiredName, is_default: desiredIsDefault })
          .eq("profile_id", input.profileId)
          .eq("name", existing.name);
        if (error) throw error;
      }
    } else {
      const { error } = await supabase.from("profile_event_types").insert({
        profile_id: input.profileId,
        name: desiredName,
        is_default: desiredIsDefault,
      });
      if (error) throw error;
    }
  }

  // ----- Sync service categories -----
  const existingServicesRows = existingServices ?? [];
  const selectedServiceLowerSet = new Set(
    canonicalServiceCategories.map((s) => s.toLowerCase()),
  );

  const existingServicesByLower = new Map<
    string,
    { name: string; is_default: boolean }
  >();
  const duplicateServiceNamesToDelete: string[] = [];

  for (const row of existingServicesRows) {
    const lower = row.name.toLowerCase();
    if (existingServicesByLower.has(lower)) {
      duplicateServiceNamesToDelete.push(row.name);
    } else {
      existingServicesByLower.set(lower, { name: row.name, is_default: row.is_default });
    }
  }

  const serviceNamesToDelete = [
    ...duplicateServiceNamesToDelete,
    ...existingServicesRows
      .filter((row) => !selectedServiceLowerSet.has(row.name.toLowerCase()))
      .map((row) => row.name),
  ];

  if (serviceNamesToDelete.length) {
    const { error } = await supabase
      .from("profile_service_categories")
      .delete()
      .in("name", serviceNamesToDelete)
      .eq("profile_id", input.profileId);
    if (error) throw error;
  }

  const selectedServicesByLower = new Map(
    canonicalServiceCategories.map((name) => [name.toLowerCase(), name]),
  );
  for (const [lower, desiredName] of selectedServicesByLower) {
    const desiredIsDefault = defaultServiceMapLowerToCanonical.has(lower);
    const existing = existingServicesByLower.get(lower);

    if (existing) {
      if (existing.name !== desiredName || existing.is_default !== desiredIsDefault) {
        const { error } = await supabase
          .from("profile_service_categories")
          .update({ name: desiredName, is_default: desiredIsDefault })
          .eq("profile_id", input.profileId)
          .eq("name", existing.name);
        if (error) throw error;
      }
    } else {
      const { error } = await supabase.from("profile_service_categories").insert({
        profile_id: input.profileId,
        name: desiredName,
        is_default: desiredIsDefault,
      });
      if (error) throw error;
    }
  }
}
