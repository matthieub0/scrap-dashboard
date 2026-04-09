import { fetchCompaniesWithOfficers } from "@/lib/data";
import { CompanyList } from "@/components/companies-table";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const { companies, officersBySiren, error } = await fetchCompaniesWithOfficers("prospects");

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-foreground tracking-tight">Top Prospects</h2>
        <p className="text-sm text-muted-foreground mt-1">Companies with exit score 7 or above</p>
      </div>
      {companies.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No high-scoring companies yet.</p>
        </div>
      ) : (
        <CompanyList companies={companies} officersBySiren={officersBySiren} />
      )}
    </div>
  );
}
