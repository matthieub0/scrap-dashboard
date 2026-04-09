"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Company, Officer } from "@/lib/types";
import { formatCurrency, employeeLabel, roleLabel } from "@/lib/constants";
import { ScoreBadge } from "@/components/score-badge";

function OfficerName({ officer }: { officer: Officer }) {
  const isCompany = officer.type_de_personne === "ENTREPRISE";
  const name = isCompany
    ? officer.entreprise_denomination
    : `${officer.prenoms} ${officer.nom}`.trim();

  if (isCompany) {
    return <span className="text-sm text-foreground">{name}</span>;
  }

  return (
    <Link
      href={`/companies/${officer.siren}/officers/${officer.representant_id}`}
      className="text-sm text-foreground hover:text-gold transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </Link>
  );
}

function OfficerRow({ officer }: { officer: Officer }) {
  const hasHolding = !!officer.via_holding_siren;
  const isCompany = officer.type_de_personne === "ENTREPRISE";

  if (hasHolding) {
    return (
      <Collapsible>
        <div className="flex items-center gap-2 py-0.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCompany ? "bg-blue-500" : "bg-gold"}`} />
          <OfficerName officer={officer} />
          <span className="text-xs text-muted-foreground">{roleLabel(officer.role_entreprise)}</span>
          <CollapsibleTrigger
            className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>via {officer.via_holding_denomination}</span>
            <svg className="w-3 h-3 transition-transform [[data-state=open]_&]:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="ml-4 pl-3 border-l border-border py-1 mb-0.5">
            <span className="text-xs text-muted-foreground">{officer.via_holding_denomination}</span>
            <span className="text-xs text-muted-foreground/60 ml-2 font-mono">SIREN {officer.via_holding_siren}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCompany ? "bg-blue-500" : "bg-gold"}`} />
      <OfficerName officer={officer} />
      <span className="text-xs text-muted-foreground">{roleLabel(officer.role_entreprise)}</span>
    </div>
  );
}

function CompanyCard({ company, officers }: { company: Company; officers: Officer[] }) {
  return (
    <Link href={`/companies/${company.siren}`} className="block group">
      <div className="rounded-lg border border-border bg-card p-5 transition-all duration-200 group-hover:border-gold/30 group-hover:shadow-md group-hover:shadow-gold/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-[15px] font-semibold text-foreground truncate tracking-tight">{company.denomination_sirene}</h3>
            <ScoreBadge score={company.score} />
          </div>
          <span className="text-xs text-muted-foreground/60 tabular-nums shrink-0 ml-4 font-mono">{company.siren}</span>
        </div>

        <p className="text-xs text-muted-foreground mt-1.5 tracking-wide">
          {company.naf_label || company.naf_code}
          {company.cp ? ` · Dept ${company.cp.slice(0, 2)}` : ""}
          {` · ${employeeLabel(company.employee_range)} emp.`}
          {company.chiffre_affaires ? ` · CA ${formatCurrency(company.chiffre_affaires)}` : ""}
          {company.resultat_exploitation ? ` · Result ${formatCurrency(company.resultat_exploitation)}` : ""}
        </p>

        {company.rationale && (
          <p className="text-xs text-foreground/70 mt-3 leading-relaxed line-clamp-2 italic">{company.rationale}</p>
        )}

        {officers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1.5">People of interest</p>
            {officers.map((o) => (
              <OfficerRow key={`${o.siren}-${o.representant_id}`} officer={o} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

type SortKey = "score" | "denomination_sirene" | "chiffre_affaires";

export function CompanyList({
  companies,
  officersBySiren,
}: {
  companies: Company[];
  officersBySiren: Record<string, Officer[]>;
}) {
  const [search, setSearch] = useState("");
  const [hideRestructuring, setHideRestructuring] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = companies;
    if (hideRestructuring) {
      result = result.filter((c) => c.likely_restructuring !== "1");
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.denomination_sirene?.toLowerCase().includes(q) ||
          c.siren?.includes(q) ||
          c.naf_label?.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortKey === "score") {
        return sortAsc ? (a.score ?? -1) - (b.score ?? -1) : (b.score ?? -1) - (a.score ?? -1);
      } else if (sortKey === "chiffre_affaires") {
        return sortAsc
          ? (parseFloat(a.chiffre_affaires) || 0) - (parseFloat(b.chiffre_affaires) || 0)
          : (parseFloat(b.chiffre_affaires) || 0) - (parseFloat(a.chiffre_affaires) || 0);
      } else {
        return sortAsc
          ? (a.denomination_sirene ?? "").localeCompare(b.denomination_sirene ?? "")
          : (b.denomination_sirene ?? "").localeCompare(a.denomination_sirene ?? "");
      }
    });
    return result;
  }, [companies, search, hideRestructuring, sortKey, sortAsc]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-60 h-9 text-sm bg-card border-border placeholder:text-muted-foreground/50"
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
          <input
            type="checkbox"
            checked={hideRestructuring}
            onChange={(e) => setHideRestructuring(e.target.checked)}
            className="rounded accent-gold"
          />
          Hide restructurings
        </label>
        <div className="ml-auto flex items-center gap-1">
          {(["score", "denomination_sirene", "chiffre_affaires"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (sortKey === key) setSortAsc(!sortAsc);
                else { setSortKey(key); setSortAsc(false); }
              }}
              className={`text-xs px-2.5 py-1 rounded-md transition-all duration-150 ${
                sortKey === key
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {key === "score" ? "Score" : key === "denomination_sirene" ? "Name" : "Revenue"}
              {sortKey === key && (sortAsc ? " ↑" : " ↓")}
            </button>
          ))}
          <span className="text-xs text-muted-foreground tabular-nums ml-3 font-mono">{filtered.length}</span>
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-3 card-list">
        {filtered.map((c) => (
          <CompanyCard key={c.siren} company={c} officers={officersBySiren[c.siren] ?? []} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No companies match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
