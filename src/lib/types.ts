export interface Company {
  siren: string;
  denomination_sirene: string;
  naf_code: string;
  naf_label: string;
  employee_range: string;
  cp: string;
  forme_juridique: string;
  precedent_proprietaire: string;
  categorie_vente: string;
  descriptif: string;
  chiffre_affaires: string;
  resultat_exploitation: string;
  total_actif: string;
  fin_date_cloture: string;
  likely_restructuring: string;
  officer_count: number;
  score: number | null;
  rationale: string | null;
  company_summary: string | null;
}

export interface Officer {
  siren: string;
  representant_id: string;
  type_de_personne: string;
  role_entreprise: string;
  actif: string;
  nom: string;
  prenoms: string;
  date_de_naissance: string;
  genre: string;
  entreprise_denomination: string;
  entreprise_siren: string;
  via_holding_siren: string;
  via_holding_denomination: string;
  linkedin_url: string | null;
  headline: string | null;
  current_position: string | null;
  draft_message: string | null;
  tone_notes: string | null;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  start_year: string;
  end_year: string;
}

export interface Experience {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface OfficerProfile {
  representant_id: string;
  linkedin_url: string | null;
  headline: string | null;
  current_position: string | null;
  education: Education[];
  experience: Experience[];
  notes: string | null;
  draft_message: string | null;
  tone_notes: string | null;
}
