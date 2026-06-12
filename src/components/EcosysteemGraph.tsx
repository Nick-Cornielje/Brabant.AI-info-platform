"use client";

import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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

const TYPE_COLORS: Record<string, string> = {
  "Kennisinstelling": "#1B5E35",
  "Onderzoeksinstituut (RTO)": "#2D7A4A",
  "Overheid & ontwikkelingsmij": "#4A90D9",
  "Programma / Project": "#F59E0B",
  "Fieldlab / Proeftuin": "#10B981",
  "Community / Netwerk": "#8B5CF6",
  "Incubator / Accelerator": "#EF4444",
  "Investeerder / Fonds": "#06B6D4",
  "Bedrijf / Dienstverlener": "#6B7280",
  "Campus / Hub": "#EC4899",
};

function getColor(typeEntiteit: string): string {
  return TYPE_COLORS[typeEntiteit] || "#9CA3AF";
}

interface PositionedNode extends NodeData {
  x: number;
  y: number;
}

function layoutNodes(nodes: NodeData[]): PositionedNode[] {
  // Group by typeEntiteit
  const groups: Record<string, NodeData[]> = {};
  for (const n of nodes) {
    const key = n.typeEntiteit || "Overig";
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }

  const groupKeys = Object.keys(groups);
  const totalGroups = groupKeys.length;
  const W = 900;
  const H = 600;
  const cx = W / 2;
  const cy = H / 2;
  const groupRadius = Math.min(cx, cy) * 0.72;

  const result: PositionedNode[] = [];

  groupKeys.forEach((key, gi) => {
    const angle = (gi / totalGroups) * 2 * Math.PI - Math.PI / 2;
    const gx = cx + groupRadius * Math.cos(angle);
    const gy = cy + groupRadius * Math.sin(angle);

    const members = groups[key];
    const count = members.length;
    const nodeSpread = Math.min(80, 20 + count * 6);

    members.forEach((n, ni) => {
      const na = count === 1 ? 0 : (ni / count) * 2 * Math.PI;
      const nr = count === 1 ? 0 : nodeSpread;
      result.push({
        ...n,
        x: gx + nr * Math.cos(na),
        y: gy + nr * Math.sin(na),
      });
    });
  });

  return result;
}

export default function EcosysteemGraph({
  nodes,
  links,
  typeCounts,
  regioCounts,
  pijlerCounts,
}: Props) {
  const router = useRouter();
  const [selectedRegio, setSelectedRegio] = useState("");
  const [selectedPijler, setSelectedPijler] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFunding, setSelectedFunding] = useState("");
  const [tab, setTab] = useState<"graph" | "stats">("graph");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredNodeIds = useMemo(
    () =>
      new Set(
        nodes
          .filter((n) => {
            if (selectedRegio && n.vestigingsregio !== selectedRegio) return false;
            if (selectedPijler && !n.pijlers.includes(selectedPijler)) return false;
            if (selectedType && n.typeEntiteit !== selectedType) return false;
            if (selectedFunding && n.fundingType !== selectedFunding) return false;
            return true;
          })
          .map((n) => n.id)
      ),
    [nodes, selectedRegio, selectedPijler, selectedType, selectedFunding]
  );

  const visibleNodes = useMemo(
    () => nodes.filter((n) => filteredNodeIds.has(n.id)),
    [nodes, filteredNodeIds]
  );

  const visibleLinks = useMemo(
    () =>
      links.filter(
        (l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
      ),
    [links, filteredNodeIds]
  );

  const positioned = useMemo(() => layoutNodes(visibleNodes), [visibleNodes]);
  const posMap = useMemo(
    () => new Map(positioned.map((n) => [n.id, n])),
    [positioned]
  );

  const handleNodeClick = useCallback(
    (slug: string) => {
      router.push(`/stakeholders/${slug}`);
    },
    [router]
  );

  const regios = Object.keys(regioCounts).sort();
  const pijlers = Object.keys(pijlerCounts).sort();
  const types = Object.keys(typeCounts).sort();
  const fundings = Array.from(
    new Set(nodes.map((n) => n.fundingType).filter(Boolean))
  ).sort();

  const hasFilter = selectedRegio || selectedPijler || selectedType || selectedFunding;

  const hoveredNode = hoveredId ? posMap.get(hoveredId) : null;

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("graph")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "graph"
              ? "bg-brand text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Netwerkkaart
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "stats"
              ? "bg-brand text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Overzicht
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <select
          value={selectedRegio}
          onChange={(e) => setSelectedRegio(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle regio&apos;s</option>
          {regios.map((r) => (
            <option key={r} value={r}>{r} ({regioCounts[r]})</option>
          ))}
        </select>
        <select
          value={selectedPijler}
          onChange={(e) => setSelectedPijler(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle pijlers</option>
          {pijlers.map((p) => (
            <option key={p} value={p}>{p} ({pijlerCounts[p]})</option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle typen</option>
          {types.map((t) => (
            <option key={t} value={t}>{t} ({typeCounts[t]})</option>
          ))}
        </select>
        <select
          value={selectedFunding}
          onChange={(e) => setSelectedFunding(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        >
          <option value="">Alle funding</option>
          {fundings.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {hasFilter && (
          <button
            onClick={() => {
              setSelectedRegio("");
              setSelectedPijler("");
              setSelectedType("");
              setSelectedFunding("");
            }}
            className="text-xs text-gray-400 hover:text-brand transition-colors self-center"
          >
            Filters wissen
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {visibleNodes.length} partijen · {visibleLinks.length} relaties
      </p>

      {tab === "graph" ? (
        <div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(TYPE_COLORS).map(([type, color]) => {
              if (!typeCounts[type]) return null;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? "" : type)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedType === type
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {type}
                </button>
              );
            })}
          </div>

          <div className="relative w-full rounded-xl border border-gray-100 overflow-hidden bg-gray-50" style={{ paddingBottom: "66%" }}>
            <svg
              viewBox="0 0 900 600"
              className="absolute inset-0 w-full h-full"
              style={{ display: "block" }}
            >
              {/* Links */}
              {visibleLinks.map((link, i) => {
                const src = posMap.get(link.source);
                const tgt = posMap.get(link.target);
                if (!src || !tgt) return null;
                const isHierarchy = link.type === "hierarchy";
                return (
                  <line
                    key={i}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHierarchy ? "#94A3B8" : "#CBD5E1"}
                    strokeWidth={isHierarchy ? 1.5 : 1}
                    strokeDasharray={isHierarchy ? undefined : "4 3"}
                    opacity={hoveredId && hoveredId !== src.id && hoveredId !== tgt.id ? 0.15 : 0.6}
                  />
                );
              })}

              {/* Nodes */}
              {positioned.map((node) => {
                const isHovered = hoveredId === node.id;
                const isDimmed = hoveredId !== null && !isHovered;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x},${node.y})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleNodeClick(node.slug)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <circle
                      r={isHovered ? 8 : 5}
                      fill={getColor(node.typeEntiteit)}
                      opacity={isDimmed ? 0.2 : 1}
                      style={{ transition: "r 0.1s, opacity 0.1s" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredNode && (
              <div className="absolute bottom-3 left-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs pointer-events-none max-w-xs">
                <p className="font-semibold text-gray-900">{hoveredNode.name}</p>
                {hoveredNode.typeEntiteit && (
                  <p className="text-gray-500 mt-0.5">{hoveredNode.typeEntiteit}</p>
                )}
                {hoveredNode.vestigingsregio && (
                  <p className="text-gray-400">{hoveredNode.vestigingsregio}</p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Klik op een knoop om de partijpagina te openen. Hover voor naam.
            Gestippeld = samenwerking · Doorgetrokken = hiërarchie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Per type entiteit
            </h3>
            <div className="space-y-2">
              {Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: getColor(type) }}
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Per regio
            </h3>
            <div className="space-y-2">
              {Object.entries(regioCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([regio, count]) => (
                  <div key={regio} className="flex items-center justify-between">
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
            <div className="space-y-2">
              {Object.entries(pijlerCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([pijler, count]) => (
                  <div key={pijler} className="flex items-center justify-between">
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
