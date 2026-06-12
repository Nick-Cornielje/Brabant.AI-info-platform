import { fetchStakeholders, fetchEvents } from "@/lib/airtable";
import TrainingGrid from "@/components/TrainingGrid";

export const revalidate = 3600;

export const metadata = {
  title: "Trainingen & ondersteuning — brabant.ai",
  description:
    "Vind AI-trainingen, workshops en ondersteuning voor ondernemers in Brabant.",
};

function matchEventToStakeholder(
  eventName: string,
  eventSummary: string,
  eventLink: string,
  stakeholders: Awaited<ReturnType<typeof fetchStakeholders>>
) {
  for (const s of stakeholders) {
    if (!s.url) continue;
    try {
      const domain = new URL(
        s.url.startsWith("http") ? s.url : `https://${s.url}`
      ).hostname.replace("www.", "");
      const linkDomain = eventLink
        ? new URL(
            eventLink.startsWith("http") ? eventLink : `https://${eventLink}`
          ).hostname.replace("www.", "")
        : "";
      if (domain && linkDomain && linkDomain.includes(domain)) return s;
    } catch {
      // ignore
    }
    const combined = `${eventName} ${eventSummary}`.toLowerCase();
    if (combined.includes(s.name.toLowerCase())) return s;
  }
  return null;
}

export default async function TrainingenPage() {
  const [stakeholders, events] = await Promise.all([
    fetchStakeholders().catch(() => []),
    fetchEvents().catch(() => []),
  ]);

  // Training-relevant stakeholders: educatie, incubators, programma's
  const trainingTypes = new Set([
    "Kennisinstelling",
    "Onderzoeksinstituut (RTO)",
    "Programma / Project",
    "Fieldlab / Proeftuin",
    "Incubator / Accelerator",
    "Community / Netwerk",
  ]);

  const trainingStakeholders = stakeholders.filter(
    (s) =>
      trainingTypes.has(s.typeEntiteit) ||
      s.categorieMeerwaarde.some((c) =>
        c.toLowerCase().includes("educatie") ||
        c.toLowerCase().includes("training") ||
        c.toLowerCase().includes("kennis")
      )
  );

  // Build items: events first, then fallback stakeholders without events
  const eventItems = events.map((event) => ({
    event,
    stakeholder: matchEventToStakeholder(
      event.name,
      event.summary,
      event.link,
      stakeholders
    ),
    isFallback: false,
  }));

  const stakeholdersWithEvents = new Set(
    eventItems
      .filter((i) => i.stakeholder)
      .map((i) => i.stakeholder!.id)
  );

  const fallbackItems = trainingStakeholders
    .filter((s) => !stakeholdersWithEvents.has(s.id))
    .map((s) => ({
      event: null,
      stakeholder: s,
      isFallback: true,
    }));

  const allItems = [...eventItems, ...fallbackItems];

  const regios = Array.from(
    new Set(
      stakeholders
        .map((s) => s.vestigingsregio)
        .filter((x): x is string => typeof x === "string" && x.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b, "nl"));

  const doelgroepen = Array.from(
    new Set(events.flatMap((e) => e.doelgroep).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "nl"));

  const sectors = Array.from(
    new Set(events.flatMap((e) => e.sector).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "nl"));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <span className="inline-block bg-brand-muted text-brand text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
          Voor ondernemers
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trainingen & ondersteuning
        </h1>
        <p className="text-gray-500">
          AI-trainingen, workshops en ondersteuningsprogramma&apos;s in Brabant.{" "}
          {events.length > 0 && `${events.length} evenementen gevonden.`}
        </p>
      </div>
      <TrainingGrid
        items={allItems}
        regios={regios}
        doelgroepen={doelgroepen}
        sectors={sectors}
      />
    </div>
  );
}
