import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchStakeholders, fetchStakeholderBySlug } from "@/lib/airtable";

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
    description: `${stakeholder.name} maakt deel uit van het Brabantse AI-ecosysteem.`,
  };
}

function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "brand";
}) {
  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
        variant === "brand"
          ? "bg-brand-muted text-brand"
          : "bg-gray-100 text-gray-600"
      }`}
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

export default async function StakeholderPage({
  params,
}: {
  params: { slug: string };
}) {
  const stakeholder = await fetchStakeholderBySlug(params.slug);
  if (!stakeholder) notFound();

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
          {stakeholder.organisatieType && (
            <Badge label={stakeholder.organisatieType} />
          )}
          {stakeholder.fundingType && (
            <Badge label={stakeholder.fundingType} />
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {stakeholder.name}
        </h1>

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
      </div>
    </div>
  );
}
