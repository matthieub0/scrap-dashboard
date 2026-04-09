import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { OfficerProfileView } from "@/components/officer-profile";
import type { Company, Officer, OfficerProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OfficerDetailPage({
  params,
}: {
  params: Promise<{ siren: string; representant_id: string }>;
}) {
  const { siren, representant_id } = await params;

  const [companyRes, officerRes, profileRes] = await Promise.all([
    supabase.from("v_companies").select("*").eq("siren", siren).single(),
    supabase
      .from("v_officers")
      .select("*")
      .eq("siren", siren)
      .eq("representant_id", representant_id)
      .single(),
    supabase
      .from("officer_profiles")
      .select("*")
      .eq("representant_id", representant_id)
      .maybeSingle(),
  ]);

  if (officerRes.error || !officerRes.data) {
    return (
      <div className="text-sm text-red-600">
        Officer not found: {officerRes.error?.message}
      </div>
    );
  }

  const company: Company = companyRes.data!;
  const officer: Officer = officerRes.data;
  const profile: OfficerProfile | null = profileRes.data
    ? {
        ...profileRes.data,
        education: profileRes.data.education ?? [],
        experience: profileRes.data.experience ?? [],
      }
    : null;

  return (
    <div className="max-w-3xl animate-slide-up">
      <Link
        href={`/companies/${siren}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors group mb-6"
      >
        <svg
          className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to {company.denomination_sirene}
      </Link>

      <OfficerProfileView
        officer={officer}
        company={company}
        initialProfile={profile}
      />
    </div>
  );
}
