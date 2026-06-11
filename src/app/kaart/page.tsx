import dynamic from "next/dynamic";
import { fetchStakeholders } from "@/lib/airtable";
import { buildCityMarkers } from "@/lib/geocode";

export const revalidate = 3600;

export const metadata = {
  title: "Kaart — brabant.ai",
  description: "Geografisch overzicht van het Brabantse AI-ecosysteem.",
};

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 text-sm">
      Kaart laden…
    </div>
  ),
});

export default async function KaartPage() {
  const stakeholders = await fetchStakeholders().catch(() => []);
  const markers = buildCityMarkers(stakeholders);
  const mapped = markers.reduce((sum, m) => sum + m.stakeholders.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kaart</h1>
        <p className="text-gray-500">
          {mapped} van {stakeholders.length} stakeholders op kaart ·{" "}
          {markers.length} locaties
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: "600px" }}>
        <MapClient markers={markers} />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {markers
          .sort((a, b) => b.stakeholders.length - a.stakeholders.length)
          .map((m) => (
            <div
              key={m.city}
              className="border border-gray-100 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 text-sm">{m.city}</p>
                <span className="text-xs bg-brand-muted text-brand px-2 py-0.5 rounded-full">
                  {m.stakeholders.length}
                </span>
              </div>
              <ul className="space-y-0.5">
                {m.stakeholders.map((s) => (
                  <li key={s.slug}>
                    <a
                      href={`/stakeholders/${s.slug}`}
                      className="text-xs text-gray-500 hover:text-brand transition-colors"
                    >
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
