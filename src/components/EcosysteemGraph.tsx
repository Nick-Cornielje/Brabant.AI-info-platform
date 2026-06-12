"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface NodeData {
  id: string;
  name: string;
  slug: string;
  typeEntiteit: string;
  vestigingsregio: string;
  pijlers: string[];
  fundingType: string;
  color: string;
}

interface LinkData {
  source: string;
  target: string;
  type: "hierarchy" | "partner";
}

interface Props {
  nodes: NodeData[];
  links: LinkData[];
  typeCounts: Record<string, number>;
  regioCounts: Record<string, number>;
  pijlerCounts: Record<string, number>;
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "Kennisinstelling":           { bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-800", dot: "#1B5E35" },
  "Onderzoeksinstituut (RTO)":  { bg: "bg-green-50",    border: "border-green-200",   text: "text-green-800",  dot: "#2D7A4A" },
  "Overheid & ontwikkelingsmij":{ bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-800",   dot: "#4A90D9" },
  "Programma / Project":        { bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-800",  dot: "#F59E0B" },
  "Fieldlab / Proeftuin":       { bg: "bg-teal-50",     border: "border-teal-200",    text: "text-teal-800",   dot: "#10B981" },
  "Community / Netwerk":        { bg: "bg-purple-50",   border: "border-purple-200",  text: "text-purple-800", dot: "#8B5CF6" },
  "Incubator / Accelerator":    { bg: "bg-red-50",      border: "border-red-200",     text: "text-red-800",    dot: "#EF4444" },
  "Investeerder / Fonds":       { bg: "bg-cyan-50",     border: "border-cyan-200",    text: "text-cyan-800",   dot: "#06B6D4" },
  "Bedrijf / Dienstverlener":   { bg: "bg-gray-50",     border: "border-gray-200",    text: "text-gray-700",   dot: "#6B7280" },
  "Campus / Hub":               { bg: "bg-pink-50",     border: "border-pink-200",    text: "text-pink-800",   dot: "#EC4899" },
};

function fallbackColors() {
  return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "#9CA3AF" };
}

export default function EcosysteemGraph({
  nodes,
  links,
  typeCounts,
  regioCounts,
  pijlerCounts,
}: Props) {
  const [selectedRegio, setSelectedRegio] = useState("");
  const [selectedPijler, setSelectedPijler] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFunding, setSelectedFunding] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tab, setTab] = useState<"kaart" | "relaties" | "stats">("kaart");

  const filteredNodes = useMemo(
    () =>
      nodes.filter((n) => {
        if (selectedRegio && n.vestigingsregio !== selectedRegio) return false;
        if (selectedPijler && !n.pijlers.includes(selectedPijler)) return false;
        if (selectedType && n.typeEntiteit !== selectedType) return false;
        if (selectedFunding && n.fundingType !== selectedFunding) return false;
        return true;
      }),
    [nodes, selectedRegio, selectedPijler, selectedType, selectedFunding]
  );

  const filteredIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredLinks = useMemo(
    () => links.filter((l) => filteredIds.has(l.source) && filteredIds.has(l.target)),
    [links, filteredIds]
  );

  // Build adjacency for hover highlight
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of filteredLinks) {
      if (!map.has(l.source)) map.set(l.source, new Set());
      if (!map.has(l.target)) map.set(l.target, new Set());
      map.get(l.source)!.add(l.target);
      map.get(l.target)!.add(l.source);
    }
    return map;
  }, [filteredLinks]);

  const connectedToHovered = hoveredId ? (adjacency.get(hoveredId) ?? new Set<string>()) : new Set<string>();

  // Group by type
  const groups = useMemo(() => {
    const g: Record<string, NodeData[]> = {};
    for (const n of filteredNodes) {
      const key = n.typeEntiteit || "Overig";
      if (!g[key]) g[key] = [];
      g[key].push(n);
    }
    return g;
  }, [filteredNodes]);

  const regios = Object.keys(regioCounts).sort();
  const pijlers = Object.keys(pijlerCounts).sort();
  const types = Object.keys(typeCounts).sort();
  const fundings = Array.from(new Set(nodes.map((n) => n.fundingType).filter(Boolean))).sort();
  const hasFilter = selectedRegio || selectedPijler || selectedType || selectedFunding;

  // Relation map for relaties tab
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
        {(["kaart", "relaties", "stats"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-brand text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t === "kaart" ? "Kaart" : t === "relaties" ? "Relaties" : "Statistieken"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
        <select value={selectedRegio} onChange={(e) => setSelectedRegio(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">Alle regio&apos;s</option>
          {regios.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={selectedPijler} onChange={(e) => setSelectedPijler(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">Alle pijlers</option>
          {pijlers.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">Alle typen</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selectedFunding} onChange={(e) => setSelectedFunding(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30">
          <option value="">Alle funding</option>
          {fundings.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {hasFilter && (
          <button onClick={() => { setSelectedRegio(""); setSelectedPijler(""); setSelectedType(""); setSelectedFunding(""); }}
            className="text-xs text-gray-400 hover:text-brand transition-colors self-center">
            Wis filters
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-5">
        {filteredNodes.length} partijen · {filteredLinks.length} relaties zichtbaar
      </p>

      {/* KAART TAB */}
      {tab === "kaart" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groups)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([type, members]) => {
              const c = TYPE_COLORS[type] ?? fallbackColors();
              return (
                <div
                  key={type}
                  className={`rounded-xl border ${c.border} ${c.bg} p-4`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.dot }}
                    />
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
                      {type}
                    </h3>
                    <span className={`ml-auto text-xs font-medium ${c.text} opacity-60`}>
                      {members.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {members.map((node) => {
                      const isHovered = hoveredId === node.id;
                      const isConnected = connectedToHovered.has(node.id);
                      const isDimmed = hoveredId !== null && !isHovered && !isConnected;
                      return (
                        <Link
                          key={node.id}
                          href={`/stakeholders/${node.slug}`}
                          onMouseEnter={() => setHoveredId(node.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all ${
                            isHovered
                              ? "bg-white shadow-sm font-medium text-gray-900"
                              : isConnected
                              ? "bg-white/70 text-gray-800"
                              : isDimmed
                              ? "opacity-30 text-gray-600"
                              : "hover:bg-white/60 text-gray-700"
                          }`}
                        >
                          {isConnected && !isHovered && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                          )}
                          <span className="truncate">{node.name}</span>
                          {adjacency.get(node.id)?.size ? (
                            <span className="ml-auto shrink-0 text-xs text-gray-400">
                              {adjacency.get(node.id)!.size}↔
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* RELATIES TAB */}
      {tab === "relaties" && (
        <div className="space-y-3">
          {filteredNodes
            .filter((n) => (adjacency.get(n.id)?.size ?? 0) > 0)
            .sort((a, b) => (adjacency.get(b.id)?.size ?? 0) - (adjacency.get(a.id)?.size ?? 0))
            .map((node) => {
              const connected = Array.from(adjacency.get(node.id) ?? [])
                .map((id) => nodeMap.get(id))
                .filter(Boolean) as NodeData[];
              const hierarchyLinks = filteredLinks.filter(
                (l) => l.type === "hierarchy" && (l.source === node.id || l.target === node.id)
              );
              const isParent = hierarchyLinks.some((l) => l.target === node.id);
              const hasChildren = hierarchyLinks.some((l) => l.source === node.id);

              return (
                <div key={node.id} className="border border-gray-100 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: TYPE_COLORS[node.typeEntiteit]?.dot ?? "#9CA3AF" }}
                    />
                    <Link
                      href={`/stakeholders/${node.slug}`}
                      className="font-semibold text-sm text-gray-900 hover:text-brand transition-colors"
                    >
                      {node.name}
                    </Link>
                    <span className="text-xs text-gray-400 ml-1">{node.typeEntiteit}</span>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {connected.length} relatie{connected.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {connected.map((c) => {
                      const link = filteredLinks.find(
                        (l) =>
                          (l.source === node.id && l.target === c.id) ||
                          (l.target === node.id && l.source === c.id)
                      );
                      const isHier = link?.type === "hierarchy";
                      return (
                        <Link
                          key={c.id}
                          href={`/stakeholders/${c.slug}`}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors hover:border-brand/40 hover:text-brand ${
                            isHier
                              ? "border-gray-300 bg-gray-50 text-gray-700"
                              : "border-brand/20 bg-brand-muted text-brand"
                          }`}
                        >
                          {isHier ? (isParent && !hasChildren ? "↑" : "↓") : "↔"} {c.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          {filteredNodes.filter((n) => (adjacency.get(n.id)?.size ?? 0) > 0).length === 0 && (
            <p className="text-center py-12 text-gray-400 text-sm">
              Geen relaties gevonden voor deze selectie.
            </p>
          )}
        </div>
      )}

      {/* STATS TAB */}
      {tab === "stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Per type entiteit
            </h3>
            <div className="space-y-2">
              {Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? "" : type)}
                    className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors text-left ${
                      selectedType === type ? "bg-brand-muted" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: TYPE_COLORS[type]?.dot ?? "#9CA3AF" }}
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </button>
                ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Per regio
            </h3>
            <div className="space-y-1">
              {Object.entries(regioCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([regio, count]) => (
                  <div key={regio} className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm text-gray-700">{regio}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Per pijler
            </h3>
            <div className="space-y-1">
              {Object.entries(pijlerCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([pijler, count]) => (
                  <div key={pijler} className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm text-gray-700">{pijler}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
