import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchStakeholders,
  fetchStakeholderBySlug,
  fetchEvents,
} from "@/lib/airtable";
import type { StakeholderRef, AirtableEvent } from "@/lib/airtable";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const stakeholders = await fetchStakeholders();
    return stakeholders.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const stakeholder = await fetchStakeholderBySlug(params.slug);
  if (!stakeholder) return {};
  return {
    title: `${stakeholder.name} — brabant.ai`,
    description:
      stakeholder.beschrijving ||
      `${stakeholder.name} maakt deel uit van het Brabantse AI-ecosysteem.`,
  };
}

function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "brand" | "entity";
}) {
  const styles = {
    default: "bg-gray-100 text-gray-600",
    brand: "bg-brand-muted text-brand",
    entity: "bg-brand text-white",
  };
  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

function Section({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: "default" | "brand";
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} label={item} variant={variant} />
        ))}
      </div>
    </div>
  );
}

function RelationSection({
  title,
  refs,
}: {
  title: string;
  refs: StakeholderRef[];
}) {
  if (refs.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {refs.map((ref) => (
          <Link
            key={ref.id}
            href={`/stakeholders/${ref.slug}`}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-brand-muted hover:text-brand transition-colors"
          >
            {ref.name}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

function isFree(cost: string): boolean {
  if (!cost) return false;
  const lower = cost.toLowerCase().trim();
  return (
    lower === "" ||
    lower === "gratis" ||
    lower === "free" ||
    lower === "0" ||
    lower === "€0" ||
    lower.startsWith("gratis") ||
    lower.startsWith("free")
  );
}

function EventCard({ event }: { event: AirtableEvent }) {
  const free = isFree(event.cost);
  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white hover:border-brand/30 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-snug">
          {event.name}
        </h4>
        {free && (
          <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Gratis
          </span>
        )}
      </div>
      {event.summary && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{event.summary}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
        {dateStr && <span>{dateStr}{event.time ? ` · ${event.time}` : ""}</span>}
        {event.address && <span>{event.address}</span>}
        {!free && event.cost && <span>{event.cost}</span>}
      </div>
      {event.doelgroep.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {event.doelgroep.map((d) => (
            <span key={d} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {d}
            </span>
          ))}
        </div>
      )}
      {(event.link || event.registration) && (
        <div className="flex gap-3">
          {event.link && (
            <a
              href={event.link.startsWith("http") ? event.link : `https://${event.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand hover:underline font-medium"
            >
              Meer info →
            </a>
          )}
          {event.registration && event.registration !== event.link && (
            <a
              href={event.registration.startsWith("http") ? event.registration : `https://${event.registration}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand hover:underline font-medium"
            >
              Aanmelden →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function matchesStakeholder(
  event: AirtableEvent,
  name: string,
  url: string
): boolean {
  const eventText = `${event.name} ${event.summary} ${event.goal}`.toLowerCase();
  const nameLower = name.toLowerCase();
  if (eventText.includes(nameLower)) return true;
  if (url) {
    try {
      const domain = new URL(
        url.startsWith("http") ? url : `https://${url}`
      ).hostname.replace("www.", "");
      const eventLinkDomain = event.link
        ? new URL(
            event.link.startsWith("http") ? event.link : `https://${event.link}`
          ).hostname.replace("www.", "")
        : "";
      if (domain && eventLinkDomain && eventLinkDomain.includes(domain))
        return true;
    } catch {
      // ignore URL parse errors
    }
  }
  return false;
}

export default async function StakeholderPage({
  params,
}: {
  params: { slug: string };
}) {
  const [stakeholder, allEvents] = await Promise.all([
    fetchStakeholderBySlug(params.slug),
    fetchEvents().catch(() => []),
  ]);

  if (!stakeholder) notFound();

  const relatedEvents = allEvents.filter((e) =>
    matchesStakeholder(e, stakeholder.name, stakeholder.url)
  );

  const hasRelations =
    stakeholder.onderdeelVan.length > 0 ||
    stakeholder.bevatOnderdelen.length > 0 ||
    stakeholder.samenwerktMet.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/stakeholders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand transition-colors mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Alle stakeholders
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {stakeholder.typeEntiteit && (
            <Badge label={stakeholder.typeEntiteit} variant="entity" />
          )}
          {stakeholder.organisatieType &&
            stakeholder.organisatieType !== stakeholder.typeEntiteit && (
              <Badge label={stakeholder.organisatieType} />
            )}
          {stakeholder.fundingType && (
            <Badge label={stakeholder.fundingType} />
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {stakeholder.name}
        </h1>

        {stakeholder.beschrijving && (
          <p className="text-base text-gray-600 leading-relaxed mb-4">
            {stakeholder.beschrijving}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {(stakeholder.vestigingsplaats || stakeholder.vestigingsregio) && (
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-brand"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {[stakeholder.vestigingsplaats, stakeholder.vestigingsregio]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
          {stakeholder.reachGeografisch && (
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-brand"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                />
              </svg>
              {stakeholder.reachGeografisch}
            </span>
          )}
          {stakeholder.url && (
            <a
              href={
                stakeholder.url.startsWith("http")
                  ? stakeholder.url
                  : `https://${stakeholder.url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Website
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 grid gap-6">
        <Section
          title="Categorie meerwaarde"
          items={stakeholder.categorieMeerwaarde}
          variant="brand"
        />
        <Section
          title="Draagt bij aan pijlers"
          items={stakeholder.pijlers}
          variant="brand"
        />
        <Section
          title="Draagt bij aan randvoorwaarden"
          items={stakeholder.randvoorwaarden}
        />
        <Section
          title="AI Waardeketen rol"
          items={stakeholder.aiWaardekettenRol}
        />
        <Section
          title="Interessant voor"
          items={stakeholder.interessantVoor}
        />

        {hasRelations && (
          <div className="border-t border-gray-100 pt-6 grid gap-4">
            <h2 className="text-sm font-semibold text-gray-700">Relaties</h2>
            <RelationSection
              title="Onderdeel van"
              refs={stakeholder.onderdeelVan}
            />
            <RelationSection
              title="Bevat / onderdelen"
              refs={stakeholder.bevatOnderdelen}
            />
            <RelationSection
              title="Samenwerkt met"
              refs={stakeholder.samenwerktMet}
            />
          </div>
        )}

        {relatedEvents.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Events & trainingen
            </h2>
            <div className="grid gap-3">
              {relatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
