export interface StakeholderRef {
  id: string;
  name: string;
  slug: string;
}

export interface Stakeholder {
  id: string;
  slug: string;
  name: string;
  url: string;
  beschrijving: string;
  typeEntiteit: string;
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
  onderdeelVanIds: string[];
  bevatOnderdelenIds: string[];
  samenwerktMetIds: string[];
  onderdeelVan: StakeholderRef[];
  bevatOnderdelen: StakeholderRef[];
  samenwerktMet: StakeholderRef[];
}

export interface AirtableEvent {
  id: string;
  name: string;
  address: string;
  date: string;
  time: string;
  cost: string;
  doelgroep: string[];
  goal: string[];
  language: string;
  summary: string;
  sector: string[];
  specialisation: string[];
  link: string;
  registration: string;
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
    return val.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function idArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string");
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
    beschrijving: str(f["Beschrijving"]),
    typeEntiteit: str(f["Type entiteit"]),
    vestigingsplaats: str(f["Vestigingsplaats"]),
    vestigingsregio: str(f["Vestigingsregio"]),
    reachGeografisch: str(f["reach geografisch"]),
    pijlers: strArray(f["Draagt bij aan Pijlers:"]),
    randvoorwaarden: strArray(f["Draagt bij aan Randvoorwaarden:"]),
    categorieMeerwaarde: strArray(f["Categorie meerwaarde"]),
    aiWaardekettenRol: strArray(f["AI Waardeketen rol"]),
    interessantVoor: strArray(f["Interessant voor (doelgroepen)"]),
    fundingType: str(f["Funding type"]),
    organisatieType: str(f["Organisatie type"]),
    onderdeelVanIds: idArray(f["Onderdeel van"]),
    bevatOnderdelenIds: idArray(f["From field: Onderdeel van"]),
    samenwerktMetIds: idArray(f["Samenwerkt met"]),
    onderdeelVan: [],
    bevatOnderdelen: [],
    samenwerktMet: [],
  };
}

function resolveRelations(stakeholders: Stakeholder[]): Stakeholder[] {
  const byId = new Map<string, Stakeholder>(stakeholders.map((s) => [s.id, s]));

  function toRef(id: string): StakeholderRef | null {
    const s = byId.get(id);
    if (!s) return null;
    return { id: s.id, name: s.name, slug: s.slug };
  }

  return stakeholders.map((s) => ({
    ...s,
    onderdeelVan: s.onderdeelVanIds
      .map(toRef)
      .filter((r): r is StakeholderRef => r !== null),
    bevatOnderdelen: s.bevatOnderdelenIds
      .map(toRef)
      .filter((r): r is StakeholderRef => r !== null),
    samenwerktMet: s.samenwerktMetIds
      .map(toRef)
      .filter((r): r is StakeholderRef => r !== null),
  }));
}

async function fetchAllRecords(
  apiKey: string,
  baseId: string,
  tableId: string
): Promise<AirtableRecord[]> {
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

  return records;
}

export async function fetchStakeholders(): Promise<Stakeholder[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_STAKEHOLDERS_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    throw new Error("Missing Airtable environment variables");
  }

  const records = await fetchAllRecords(apiKey, baseId, tableId);

  const stakeholders = records
    .filter((r) => r.fields["Stakeholder"])
    .map(mapRecord)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));

  return resolveRelations(stakeholders);
}

export async function fetchStakeholderBySlug(
  slug: string
): Promise<Stakeholder | null> {
  const all = await fetchStakeholders();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function fetchEvents(): Promise<AirtableEvent[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_EVENTS_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    throw new Error("Missing Airtable events environment variables");
  }

  const records = await fetchAllRecords(apiKey, baseId, tableId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return records
    .filter((r) => r.fields["event_name"])
    .map((r) => {
      const f = r.fields;
      return {
        id: r.id,
        name: str(f["event_name"]),
        address: str(f["event_adress"]),
        date: str(f["event_date"]),
        time: str(f["event_time"]),
        cost: str(f["event_cost"]),
        doelgroep: strArray(f["event_doelgroep"]),
        goal: strArray(f["event_goal"]),
        language: str(f["event_language"]),
        summary: str(f["event_summary"]),
        sector: strArray(f["event_sector"]),
        specialisation: strArray(f["event_specialisation"]),
        link: str(f["event_link"]),
        registration: str(f["event_registration"]),
      };
    })
    .filter((e) => {
      if (!e.date) return true;
      return new Date(e.date) >= today;
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
}
