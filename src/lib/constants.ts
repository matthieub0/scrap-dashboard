export const EMPLOYEE_RANGE_LABELS: Record<string, string> = {
  NN: "Unknown",
  "00": "0",
  "01": "1-2",
  "02": "3-5",
  "03": "6-9",
  "11": "10-19",
  "12": "20-49",
  "21": "50-99",
  "22": "100-199",
  "31": "200-249",
  "32": "250-499",
  "41": "500-999",
  "42": "1,000-1,999",
  "51": "2,000-4,999",
  "52": "5,000-9,999",
  "53": "10,000+",
};

export const PSC_ROLE_LABELS: Record<string, string> = {
  "28": "Gerant & associe solidaire",
  "29": "Gerant & associe",
  "30": "Gerant",
  "41": "Associe unique",
  "51": "President du CA",
  "52": "President du directoire",
  "53": "Directeur general",
  "60": "President-DG",
  "69": "DG unique",
  "70": "DG delegue",
  "73": "President de SAS",
  "100": "Repreneur",
  "101": "Entrepreneur",
  "130": "Associe unique (patrimoine)",
  "131": "Associe commandite",
  "132": "Associe commanditaire",
  "201": "Dirigeant",
  "205": "President",
  "206": "Directeur",
};

export const NAF_LABELS: Record<string, string> = {
  "62.01Z": "Computer programming",
  "62.02A": "IT consulting",
  "62.02B": "Other IT consulting",
  "62.03Z": "Computer facility management",
  "62.09Z": "Other IT services",
  "63.11Z": "Data processing, hosting",
  "63.12Z": "Web portals",
  "58.21Z": "Video game publishing",
  "58.29A": "Software publishing (packaged)",
  "58.29B": "Software publishing (custom)",
  "58.29C": "Software publishing (other)",
  "71.12B": "Engineering & technical studies",
  "72.11Z": "R&D biotechnology",
  "72.19Z": "R&D natural sciences",
  "72.20Z": "R&D social sciences",
  "46.51Z": "Wholesale IT equipment",
  "46.52Z": "Wholesale electronic equipment",
  "26.20Z": "Computer manufacturing",
  "26.11Z": "Electronic components",
  "26.30Z": "Telecom equipment manufacturing",
  "26.51Z": "Measuring instruments manufacturing",
  "61.10Z": "Wired telecoms",
  "61.20Z": "Wireless telecoms",
  "61.90Z": "Other telecoms",
  "64.20Z": "Holdings & investment vehicles",
  "70.10Z": "Head offices",
  "70.22Z": "Management consulting",
  "73.11Z": "Advertising agencies",
  "74.10Z": "Specialized design activities",
  "74.90B": "Other professional/scientific activities",
  "82.20Z": "Call center activities",
};

const currencyFmt = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: string | null): string {
  if (!value || value === "") return "N/A";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return currencyFmt.format(num);
}

export function employeeLabel(code: string | null): string {
  if (!code) return "Unknown";
  return EMPLOYEE_RANGE_LABELS[code] ?? code;
}

export function roleLabel(code: string | null): string {
  if (!code) return "Unknown";
  return PSC_ROLE_LABELS[code] ?? code;
}

export function formatDateField(d: { day?: number | null; month?: number | null; year?: number | null } | null | undefined): string {
  if (!d || !d.year) return "";
  if (d.month) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.month - 1]} ${d.year}`;
  }
  return String(d.year);
}

export function formatDateRange(
  startsAt: { day?: number | null; month?: number | null; year?: number | null } | null | undefined,
  endsAt: { day?: number | null; month?: number | null; year?: number | null } | null | undefined,
  startFallback?: string,
  endFallback?: string,
): string {
  const start = formatDateField(startsAt) || startFallback || "";
  const end = formatDateField(endsAt) || endFallback || "";
  if (!start && !end) return "";
  if (start && !end) return `${start} - Present`;
  if (!start && end) return `Until ${end}`;
  return `${start} - ${end}`;
}
