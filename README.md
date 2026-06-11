# brabant.ai — Informatie Platform

Publiek informatieplatform voor het brabant.ai AI-ecosysteem in Brabant.

## Tech stack

- **Next.js 14** met App Router
- **TypeScript**
- **Tailwind CSS**
- **Airtable REST API** met ISR (revalidate: 3600)
- **Vercel** hosting

## Lokale setup

### 1. Dependencies installeren

```bash
npm install
```

### 2. Omgevingsvariabelen instellen

Kopieer `.env.local` en vul de waarden in:

```bash
cp .env.local .env.local
```

Vul in:

| Variabele | Waar te vinden |
|-----------|---------------|
| `AIRTABLE_API_KEY` | [airtable.com/create/tokens](https://airtable.com/create/tokens) — maak een Personal Access Token met `data.records:read` scope |
| `AIRTABLE_BASE_ID` | URL van je Airtable base: `airtable.com/appXXXXXXXXXX/...` |
| `AIRTABLE_STAKEHOLDERS_TABLE_ID` | URL van de tabel: `airtable.com/.../tblXXXXXXXXXX/...` |

### 3. Dev server starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment op Vercel

### Vereiste environment variables in Vercel

Voeg toe via **Vercel Dashboard → Project → Settings → Environment Variables**:

| Naam | Waarde |
|------|--------|
| `AIRTABLE_API_KEY` | jouw Personal Access Token |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXX` |
| `AIRTABLE_STAKEHOLDERS_TABLE_ID` | `tblXXXXXXXXXX` |

### GitHub koppelen

1. Push repo naar GitHub
2. Importeer in Vercel: [vercel.com/new](https://vercel.com/new)
3. Stel env vars in
4. Deploy

## ISR (Incremental Static Regeneration)

Pagina's worden elke **3600 seconden** (1 uur) automatisch ververst vanuit Airtable. Geen rebuild nodig na Airtable-wijzigingen.

## Structuur

```
src/
  app/
    page.tsx                    # Homepage
    layout.tsx                  # Root layout + navigatie
    globals.css
    stakeholders/
      page.tsx                  # Overzichtspagina met filters
      [slug]/
        page.tsx                # Profielpagina per stakeholder
  components/
    StakeholderGrid.tsx         # Client-side filter component
  lib/
    airtable.ts                 # API client + TypeScript types
```
