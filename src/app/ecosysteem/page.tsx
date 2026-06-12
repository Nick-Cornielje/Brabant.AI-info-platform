import { fetchStakeholders } from "@/lib/airtable";
import EcosysteemGraph from "@/components/EcosysteemGraph";

export const revalidate = 3600;

export const metadata = {
  title: "Ecosysteem — brabant.ai",
  description:
    "Inzicht in het Brabantse AI-ecosysteem: relaties, clusters en verhoudingen tussen partijen.",
};

export default async function EcosysteemPage() {
  const stakeholders = await fetchStakeholders().catch(() => []);

  const nodes = stakeholders.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    typeEntiteit: s.typeEntiteit,
    vestigingsregio: s.vestigingsregio,
    pijlers: s.pijlers,
    fundingType: s.fundingType,
    color: "#9CA3AF",
  }));

  const links: { source: string; target: string; type: "hierarchy" | "partner" }[] = [];
  const addedLinks = new Set<string>();

  for (const s of stakeholders) {
    for (const ref of s.onderdeelVan) {
      const key = `${s.id}->${ref.id}:hierarchy`;
      if (!addedLinks.has(key)) {
        links.push({ source: s.id, target: ref.id, type: "hierarchy" });
        addedLinks.add(key);
      }
    }
    for (const ref of s.samenwerktMet) {
      const key = [s.id, ref.id].sort().join("<>") + ":partner";
      if (!addedLinks.has(key)) {
        links.push({ source: s.id, target: ref.id, type: "partner" });
        addedLinks.add(key);
      }
    }
  }

  const typeCounts: Record<string, number> = {};
  const regioCounts: Record<string, number> = {};
  const pijlerCounts: Record<string, number> = {};

  for (const s of stakeholders) {
    if (s.typeEntiteit) typeCounts[s.typeEntiteit] = (typeCounts[s.typeEntiteit] || 0) + 1;
    if (s.vestigingsregio) regioCounts[s.vestigingsregio] = (regioCounts[s.vestigingsregio] || 0) + 1;
    for (const p of s.pijlers) {
      pijlerCounts[p] = (pijlerCounts[p] || 0) + 1;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <span className="inline-block bg-brand-muted text-brand text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
          Voor bedrijven
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inzicht in het ecosysteem
        </h1>
        <p className="text-gray-500">
          {stakeholders.length} partijen · {links.length} relaties in kaart gebracht.
          Klik op een partij om de detailpagina te openen.
        </p>
      </div>
      <EcosysteemGraph
        nodes={nodes}
        links={links}
        typeCounts={typeCounts}
        regioCounts={regioCounts}
        pijlerCounts={pijlerCounts}
      />
    </div>
  );
}
