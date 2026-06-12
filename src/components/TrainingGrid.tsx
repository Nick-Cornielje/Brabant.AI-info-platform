"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { AirtableEvent, Stakeholder } from "@/lib/airtable";

interface TrainingItem {
  event: AirtableEvent | null;
  stakeholder: Stakeholder | null;
  isFallback: boolean;
}

interface Props {
  items: TrainingItem[];
  regios: string[];
  doelgroepen: string[];
  sectors: string[];
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

function isSubsidised(fundingType: string): boolean {
  const lower = (fundingType || "").toLowerCase();
  return (
    lower.includes("subsidie") ||
    lower.includes("publiek") ||
    lower.includes("overheid") ||
    lower.includes("eu") ||
    lower.includes("gesubsidieerd")
  );
}

export default function TrainingGrid({ items, regios, doelgroepen, sectors }: Props) {
  const [selectedRegio, setSelectedRegio] = useState("");
  const [selectedDoelgroep, setSelectedDoelgroep] = useState("");
  const [selectedKosten, setSelectedKosten] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (selectedRegio) {
        const regio = item.stakeholder?.vestigingsregio || "";
        const adres = item.event?.address || "";
        if (!regio.toLowerCase().includes(selectedRegio.toLowerCase()) &&
            !adres.toLowerCase().includes(selectedRegio.toLowerCase())) {
          return false;
        }
      }
      if (selectedDoelgroep && item.event) {
        if (!item.event.doelgroep.some((d) =>
          d.toLowerCase().includes(selectedDoelgroep.toLowerCase())
        )) return false;
      }
      if (selectedKosten) {
        const cost = item.event?.cost || "";
        const funding = item.stakeholder?.fundingType || "";
        const free = isFree(cost) || isSubsidised(funding);
        if (selectedKosten === "gratis" && !free) return false;
        if (selectedKosten === "betaald" && free) return false;
      }
      if (selectedSector && item.event) {
        if (!item.event.sector.some((s) =>
          s.toLowerCase().includes(selectedSector.toLowerCase())
        )) return false;
      }
      return true;
    });
  }, [items, selectedRegio, selectedDoelgroep, selectedKosten, selectedSector]);

  const hasActiveFilter = selectedRegio || selectedDoelgroep || selectedKosten || selectedSector;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <select
          value={selectedRegio}
          onChange={(e) => setSelectedRegio(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle regio&apos;s</option>
          {regios.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={selectedDoelgroep}
          onChange={(e) => setSelectedDoelgroep(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle doelgroepen</option>
          {doelgroepen.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={selectedKosten}
          onChange={(e) => setSelectedKosten(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle kosten</option>
          <option value="gratis">Gratis / gesubsidieerd</option>
          <option value="betaald">Betaald</option>
        </select>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle sectoren</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {filtered.length} van {items.length} aanbod
        </p>
        {hasActiveFilter && (
          <button
            onClick={() => {
              setSelectedRegio("");
              setSelectedDoelgroep("");
              setSelectedKosten("");
              setSelectedSector("");
            }}
            className="text-xs text-gray-400 hover:text-brand transition-colors"
          >
            Filters wissen
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Geen aanbod gevonden voor deze filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const free = isFree(item.event?.cost || "");
            const subsidised = isSubsidised(item.stakeholder?.fundingType || "");
            const showFreeBadge = free || subsidised;

            if (item.isFallback && item.stakeholder) {
              return (
                <div
                  key={item.stakeholder.id}
                  className="border border-gray-100 rounded-xl p-5 bg-white"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      href={`/stakeholders/${item.stakeholder.slug}`}
                      className="font-semibold text-gray-900 hover:text-brand transition-colors text-sm leading-snug"
                    >
                      {item.stakeholder.name}
                    </Link>
                    {showFreeBadge && (
                      <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {subsidised ? "Gesubsidieerd" : "Gratis"}
                      </span>
                    )}
                  </div>
                  {item.stakeholder.typeEntiteit && (
                    <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full font-medium">
                      {item.stakeholder.typeEntiteit}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-2 mb-3 line-clamp-2">
                    {item.stakeholder.beschrijving || "Bekijk hun website voor actueel aanbod."}
                  </p>
                  {item.stakeholder.url && (
                    <a
                      href={
                        item.stakeholder.url.startsWith("http")
                          ? item.stakeholder.url
                          : `https://${item.stakeholder.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand hover:underline font-medium"
                    >
                      Bekijk aanbod →
                    </a>
                  )}
                </div>
              );
            }

            if (!item.event) return null;
            const event = item.event;
            const dateStr = event.date
              ? new Date(event.date).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={event.id}
                className="border border-gray-100 rounded-xl p-5 bg-white hover:border-brand/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {event.name}
                  </h3>
                  {showFreeBadge && (
                    <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {subsidised && !free ? "Gesubsidieerd" : "Gratis"}
                    </span>
                  )}
                </div>

                {item.stakeholder && (
                  <Link
                    href={`/stakeholders/${item.stakeholder.slug}`}
                    className="text-xs text-brand hover:underline mb-2 inline-block"
                  >
                    {item.stakeholder.name}
                  </Link>
                )}

                {event.summary && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {event.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                  {dateStr && (
                    <span>{dateStr}{event.time ? ` · ${event.time}` : ""}</span>
                  )}
                  {event.address && <span>{event.address}</span>}
                  {!free && event.cost && <span>{event.cost}</span>}
                </div>

                {event.doelgroep.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {event.doelgroep.slice(0, 3).map((d) => (
                      <span
                        key={d}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                      >
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
                        href={
                          event.registration.startsWith("http")
                            ? event.registration
                            : `https://${event.registration}`
                        }
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
          })}
        </div>
      )}
    </div>
  );
}
