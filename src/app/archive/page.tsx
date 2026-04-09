import { fetchCompaniesWithOfficers } from "@/lib/data";
import { CompanyList } from "@/components/companies-table";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const { companies, officersBySiren, error } = await fetchCompaniesWithOfficers("archive");

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-foreground tracking-tight">Archive</h2>
        <p className="text-sm text-muted-foreground mt-1">Historical exits from previous pipeline runs</p>
      </div>
      {companies.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No archived companies.</p>
        </div>
      ) : (
        <CompanyList companies={companies} officersBySiren={officersBySiren} />
      )}
    </div>
  );
}
