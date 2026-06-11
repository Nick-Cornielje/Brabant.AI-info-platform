export interface Stakeholder {
  id: string;
  slug: string;
  name: string;
  url: string;
  vestigingsplaats: string;
  vestigingsregio: string;
  reachGeografisch: string;
  pijlers: string[];
  randvoorwaarden: string[];
  categorieMeerwaarde: string[];
  aiWaardekettenRol: string[];
  interessantVoor: string[];
  fundingType: string;
  organisatieType: string;
}

interface AirtableRecord {
  id: string;
  fields: {
    Stakeholder?: string;
    url?: string;
    Vestigingsplaats?: string;
    Vestigingsregio?: string;
    "reach geografisch"?: string;
    "Draagt bij aan Pijlers:"?: string[];
    "Draagt bij aan Randvoorwaarden:"?: string[];
    "Categorie meerwaarde"?: string[];
    "AI Waardeketen rol"?: string[];
    "Interessant voor"?: string[];
    "Funding type"?: string;
    "Organisatie type"?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function mapRecord(record: AirtableRecord): Stakeholder {
  const f = record.fields;
  const name = f["Stakeholder"] ?? "";
  return {
    id: record.id,
    slug: toSlug(name),
    name,
    url: f["url"] ?? "",
    vestigingsplaats: f["Vestigingsplaats"] ?? "",
    vestigingsregio: f["Vestigingsregio"] ?? "",
    reachGeografisch: f["reach geografisch"] ?? "",
    pijlers: f["Draagt bij aan Pijlers:"] ?? [],
    randvoorwaarden: f["Draagt bij aan Randvoorwaarden:"] ?? [],
    categorieMeerwaarde: f["Categorie meerwaarde"] ?? [],
    aiWaardekettenRol: f["AI Waardeketen rol"] ?? [],
    interessantVoor: f["Interessant voor"] ?? [],
    fundingType: f["Funding type"] ?? "",
    organisatieType: f["Organisatie type"] ?? "",
  };
}

export async function fetchStakeholders(): Promise<Stakeholder[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_STAKEHOLDERS_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    throw new Error("Missing Airtable environment variables");
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${tableId}`
    );
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Airtable API error: ${res.status} ${res.statusText}`);
    }

    const data: AirtableResponse = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records
    .filter((r) => r.fields["Stakeholder"])
    .map(mapRecord)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

export async function fetchStakeholderBySlug(
  slug: string
): Promise<Stakeholder | null> {
  const all = await fetchStakeholders();
  return all.find((s) => s.slug === slug) ?? null;
}
