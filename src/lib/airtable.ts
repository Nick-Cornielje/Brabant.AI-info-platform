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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: Record<string, any>;
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

function str(val: unknown): string {
  if (typeof val === "string") return val;
  if (val == null) return "";
  return String(val);
}

function strArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(str).filter(Boolean);
  if (typeof val === "string" && val.length > 0)
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapRecord(record: AirtableRecord): Stakeholder {
  const f = record.fields;
  const name = str(f["Stakeholder"]);
  return {
    id: record.id,
    slug: toSlug(name),
    name,
    url: str(f["url"]),
    vestigingsplaats: str(f["Vestigingsplaats"]),
    vestigingsregio: str(f["Vestigingsregio"]),
    reachGeografisch: str(f["reach geografisch"]),
    pijlers: strArray(f["Draagt bij aan Pijlers:"]),
    randvoorwaarden: strArray(f["Draagt bij aan Randvoorwaarden:"]),
    categorieMeerwaarde: strArray(f["Categorie meerwaarde"]),
    aiWaardekettenRol: strArray(f["AI Waardeketen rol"]),
    interessantVoor: strArray(f["Interessant voor"]),
    fundingType: str(f["Funding type"]),
    organisatieType: str(f["Organisatie type"]),
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
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
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
