"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Stakeholder } from "@/lib/airtable";

interface Props {
  stakeholders: Stakeholder[];
  regios: string[];
  categories: string[];
}

export default function StakeholderGrid({
  stakeholders,
  regios,
  categories,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedRegio, setSelectedRegio] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filtered = useMemo(() => {
    return stakeholders.filter((s) => {
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase());
      const matchRegio =
        selectedRegio === "" || s.vestigingsregio === selectedRegio;
      const matchCategory =
        selectedCategory === "" ||
        s.categorieMeerwaarde.some((c) =>
          c.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      return matchSearch && matchRegio && matchCategory;
    });
  }, [stakeholders, search, selectedRegio, selectedCategory]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="search"
          placeholder="Zoek op naam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        <select
          value={selectedRegio}
          onChange={(e) => setSelectedRegio(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle regio&apos;s</option>
          {regios.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-6">
        {filtered.length} van {stakeholders.length} stakeholders
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Geen stakeholders gevonden voor deze filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/stakeholders/${s.slug}`}
              className="group border border-gray-100 rounded-xl p-5 bg-white hover:border-brand/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors leading-snug">
                  {s.name}
                </h3>
                {s.organisatieType && (
                  <span className="shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {s.organisatieType}
                  </span>
                )}
              </div>

              {s.vestigingsplaats && (
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 shrink-0"
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
                  {s.vestigingsplaats}
                  {s.vestigingsregio ? ` · ${s.vestigingsregio}` : ""}
                </p>
              )}

              {s.categorieMeerwaarde.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.categorieMeerwaarde.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="text-xs bg-brand-muted text-brand px-2 py-0.5 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                  {s.categorieMeerwaarde.length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{s.categorieMeerwaarde.length - 2}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
