import { supabase } from "./supabase";
import type { Company, Officer } from "./types";


export function groupOfficersBySiren(officers: Officer[]): Record<string, Officer[]> {
  const map: Record<string, Officer[]> = {};
  for (const o of officers) {
    if (!map[o.siren]) map[o.siren] = [];
    map[o.siren].push(o);
  }
  return map;
}

export async function fetchCompaniesWithOfficers(
  scope: "current" | "archive" | "prospects"
): Promise<{
  companies: Company[];
  officersBySiren: Record<string, Officer[]>;
  error?: string;
}> {
  if (scope === "prospects") {
    const companiesRes = await supabase
      .from("v_companies")
      .select("*")
      .gte("score", 7)
      .order("score", { ascending: false });

    if (companiesRes.error) return { companies: [], officersBySiren: {}, error: companiesRes.error.message };

    const companies: Company[] = companiesRes.data ?? [];
    const sirens = companies.map((c) => c.siren);

    const officersRes = sirens.length > 0
      ? await supabase.from("v_officers").select("*").in("siren", sirens)
      : { data: [] };

    return { companies, officersBySiren: groupOfficersBySiren(officersRes.data ?? []) };
  }

  // current + archive both need psc_report to split
  const [currentRes, companiesRes] = await Promise.all([
    supabase.from("psc_report").select("siren"),
    supabase.from("v_companies").select("*").order("score", { ascending: false, nullsFirst: false }),
  ]);

  if (companiesRes.error) return { companies: [], officersBySiren: {}, error: companiesRes.error.message };

  const currentSirens = new Set((currentRes.data ?? []).map((r) => r.siren));
  const companies: Company[] = (companiesRes.data ?? []).filter((c) =>
    scope === "current" ? currentSirens.has(c.siren) : !currentSirens.has(c.siren)
  );

  const sirens = companies.map((c) => c.siren);
  const officersRes = sirens.length > 0
    ? await supabase.from("v_officers").select("*").in("siren", sirens)
    : { data: [] };

  return { companies, officersBySiren: groupOfficersBySiren(officersRes.data ?? []) };
}
