import { fetchStakeholders } from "@/lib/airtable";
import StakeholderGrid from "@/components/StakeholderGrid";

export const revalidate = 3600;

export const metadata = {
  title: "Stakeholders — brabant.ai",
  description:
    "Overzicht van alle organisaties in het Brabantse AI-ecosysteem.",
};

export default async function StakeholdersPage() {
  const stakeholders = await fetchStakeholders().catch(() => []);

  const regios = Array.from(
    new Set(stakeholders.map((s) => s.vestigingsregio).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "nl"));

  const categories = Array.from(
    new Set(stakeholders.flatMap((s) => s.categorieMeerwaarde).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "nl"));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stakeholders</h1>
        <p className="text-gray-500">
          {stakeholders.length} organisaties in het Brabantse AI-ecosysteem
        </p>
      </div>
      <StakeholderGrid
        stakeholders={stakeholders}
        regios={regios}
        categories={categories}
      />
    </div>
  );
}
