import type { Company, Officer } from "./types";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function pappersCompanyUrl(company: Company): string {
  return `https://www.pappers.fr/entreprise/${slugify(company.denomination_sirene)}-${company.siren}`;
}

export function pappersDirigeantUrl(officer: Officer): string | null {
  if (officer.type_de_personne === "ENTREPRISE" || !officer.prenoms || !officer.nom || !officer.date_de_naissance) return null;
  const firstName = slugify(officer.prenoms.split(" ")[0]);
  const lastName = slugify(officer.nom);
  const [year, month] = officer.date_de_naissance.split("-");
  if (!year || !month) return null;
  return `https://www.pappers.fr/dirigeant/${firstName}_${lastName}_${year}-${month}`;
}

export function linkedinSearchUrl(officer: Officer, companyName: string): string {
  const firstName = officer.prenoms?.split(" ")[0] ?? "";
  const keywords = `${firstName} ${officer.nom}`.trim();
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}&origin=FACETED_SEARCH&geoUrn=%5B%22105015875%22%5D`;
}
