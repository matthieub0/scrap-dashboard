import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Company, Officer } from "@/lib/types";
import { formatCurrency, employeeLabel, roleLabel } from "@/lib/constants";
import { ScoreBadge } from "@/components/score-badge";
import { pappersCompanyUrl, pappersDirigeantUrl, linkedinSearchUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ siren: string }>;
}) {
  const { siren } = await params;

  const [companyRes, officersRes] = await Promise.all([
    supabase.from("v_companies").select("*").eq("siren", siren).single(),
    supabase.from("v_officers").select("*").eq("siren", siren),
  ]);

  if (companyRes.error || !companyRes.data) {
    return <div className="text-sm text-red-600">Company not found: {companyRes.error?.message}</div>;
  }

  const company: Company = companyRes.data;
  const officers: Officer[] = officersRes.data ?? [];
  const people = officers.filter((o) => o.type_de_personne !== "ENTREPRISE");
  const companies = officers.filter((o) => o.type_de_personne === "ENTREPRISE");

  return (
    <div className="space-y-6 max-w-4xl animate-slide-up">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors group">
        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-heading text-foreground tracking-tight">{company.denomination_sirene}</h2>
          <ScoreBadge score={company.score} variant="full" />
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 tracking-wide">
          {company.naf_label || company.naf_code}
          {" · "}
          <span className="font-mono text-xs">SIREN {company.siren}</span>
          {" · "}{employeeLabel(company.employee_range)} employees
          {company.cp ? ` · Dept ${company.cp.slice(0, 2)}` : ""}
        </p>
        <a
          href={pappersCompanyUrl(company)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View on Pappers
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      {/* AI Assessment */}
      {company.company_summary && (
        <div className="rounded-lg border border-border bg-card p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5 ml-3">AI Assessment</p>
          <p className="text-sm text-foreground/80 leading-relaxed ml-3">{company.company_summary}</p>
          {company.rationale && (
            <p className="text-xs text-muted-foreground mt-3 italic ml-3">{company.rationale}</p>
          )}
        </div>
      )}

      {/* Financials */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Revenue", value: company.chiffre_affaires },
          { label: "Operating Result", value: company.resultat_exploitation },
          { label: "Total Assets", value: company.total_actif },
          { label: "Closing Date", value: company.fin_date_cloture || "\u2014", raw: true },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">{item.label}</p>
            <p className="text-[15px] font-semibold text-foreground mt-1 tabular-nums font-mono">
              {"raw" in item ? item.value : formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Sale Context */}
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">Sale Context</p>
        <div className="space-y-2 text-sm text-foreground/80">
          {company.categorie_vente && (
            <p><span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-2">Type</span>{company.categorie_vente}</p>
          )}
          {company.precedent_proprietaire && (
            <p><span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-2">Prev. owner</span>{company.precedent_proprietaire}</p>
          )}
          {company.descriptif && (
            <p className="text-xs text-muted-foreground leading-relaxed pt-3 mt-3 border-t border-border/60">
              {company.descriptif}
            </p>
          )}
        </div>
      </div>

      {/* People of Interest */}
      {people.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
            People of Interest ({people.length})
          </p>
          <div className="space-y-3">
            {people.map((o) => {
              const name = `${o.prenoms} ${o.nom}`.trim();
              const pappersUrl = pappersDirigeantUrl(o);

              return (
                <div key={`${o.siren}-${o.representant_id}-${o.via_holding_siren}`} className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-gold/20">
                  <div className="flex items-start gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm font-semibold shrink-0">
                      {(o.prenoms?.[0] || "").toUpperCase()}{(o.nom?.[0] || "").toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/companies/${company.siren}/officers/${o.representant_id}`}
                          className="text-sm font-semibold text-foreground hover:text-gold transition-colors"
                        >
                          {name}
                        </Link>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">{roleLabel(o.role_entreprise)}</span>
                        <span className={`inline-block w-2 h-2 rounded-full ${o.actif === "true" ? "bg-emerald-500" : "bg-border"}`} title={o.actif === "true" ? "Active" : "Inactive"} />
                      </div>

                      {(o.headline || o.current_position) && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {o.headline || o.current_position}
                        </p>
                      )}

                      {o.via_holding_siren && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          via {o.via_holding_denomination} <span className="font-mono">({o.via_holding_siren})</span>
                        </p>
                      )}

                      {/* Action links */}
                      <div className="flex items-center gap-3 mt-2">
                        {o.linkedin_url ? (
                          <a href={o.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#0077B5] hover:underline font-medium">
                            <LinkedInIcon className="w-3 h-3" />
                            Profile
                          </a>
                        ) : (
                          <a
                            href={linkedinSearchUrl(o, company.denomination_sirene)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
                          >
                            <LinkedInIcon className="w-3 h-3" />
                            Search
                          </a>
                        )}
                        {pappersUrl && (
                          <a href={pappersUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-gold transition-colors">
                            Pappers
                          </a>
                        )}
                        {o.date_de_naissance && (
                          <span className="text-xs text-muted-foreground/50 font-mono">b. {o.date_de_naissance}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Corporate entities */}
      {companies.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
            Corporate Entities ({companies.length})
          </p>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {companies.map((o) => (
              <div key={`${o.siren}-${o.representant_id}-${o.via_holding_siren}`} className="px-4 py-3 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-sm text-foreground">{o.entreprise_denomination}</span>
                <span className="text-xs text-muted-foreground">{roleLabel(o.role_entreprise)}</span>
                {o.entreprise_siren && (
                  <span className="text-xs text-muted-foreground/50 font-mono ml-auto">{o.entreprise_siren}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outreach Drafts */}
      {officers.some((o) => o.draft_message) && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">Outreach Drafts</p>
          <div className="space-y-3">
            {officers.filter((o) => o.draft_message).map((o) => (
              <div key={`draft-${o.representant_id}`} className="rounded-lg border border-border bg-card p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/60" />
                <div className="flex items-center justify-between mb-2 ml-3">
                  <span className="text-sm font-semibold text-foreground">{o.prenoms} {o.nom}</span>
                  {o.tone_notes && <span className="text-xs text-muted-foreground italic">{o.tone_notes}</span>}
                </div>
                <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed ml-3">{o.draft_message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
