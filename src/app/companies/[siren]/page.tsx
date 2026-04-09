import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Company, Officer } from "@/lib/types";
import { formatCurrency, employeeLabel, roleLabel } from "@/lib/constants";
import { ScoreBadge } from "@/components/score-badge";
import { pappersCompanyUrl, pappersDirigeantUrl, linkedinSearchUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-6 max-w-3xl animate-slide-up">
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
          { label: "Closing Date", value: company.fin_date_cloture || "—", raw: true },
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

      {/* Officers */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-3">
          People of Interest ({officers.length})
        </p>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Role</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-12">Active</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Via Holding</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-28">LinkedIn</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-24">Pappers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((o) => {
                const isCompany = o.type_de_personne === "ENTREPRISE";
                const name = isCompany
                  ? o.entreprise_denomination
                  : `${o.prenoms} ${o.nom}`.trim();
                return (
                  <TableRow key={`${o.siren}-${o.representant_id}`} className="hover:bg-muted/30">
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCompany ? "bg-blue-500" : "bg-gold"}`} />
                        {isCompany ? (
                          <span className="text-sm text-foreground">{name}</span>
                        ) : (
                          <Link
                            href={`/companies/${company.siren}/officers/${o.representant_id}`}
                            className="text-sm text-foreground hover:text-gold transition-colors"
                          >
                            {name}
                          </Link>
                        )}
                        {o.date_de_naissance && (
                          <span className="text-xs text-muted-foreground/60 font-mono">b. {o.date_de_naissance}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                      {roleLabel(o.role_entreprise)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${o.actif === "true" ? "bg-emerald-500" : "bg-border"}`} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      {o.via_holding_siren ? (
                        <Collapsible>
                          <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                            <span>via {o.via_holding_denomination}</span>
                            <svg className="w-3 h-3 transition-transform [[data-state=open]_&]:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <p className="text-xs text-muted-foreground mt-1 pl-3 border-l border-border">
                              {o.via_holding_denomination} · <span className="font-mono">SIREN {o.via_holding_siren}</span>
                            </p>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      {o.linkedin_url ? (
                        <a href={o.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline font-medium">
                          View profile
                        </a>
                      ) : !isCompany && name ? (
                        <a
                          href={linkedinSearchUrl(o, company.denomination_sirene)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-gold transition-colors"
                        >
                          Search LinkedIn
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      {(() => {
                        const url = pappersDirigeantUrl(o);
                        return url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-gold transition-colors">
                            Pappers
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {officers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    No officers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
