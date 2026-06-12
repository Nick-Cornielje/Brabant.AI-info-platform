"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(
  () => import("react-force-graph").then((m) => m.ForceGraph2D),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-gray-400">Graf laden…</div> }
);

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

export default function EcosysteemGraph({
  nodes,
  links,
  typeCounts,
  regioCounts,
  pijlerCounts,
}: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedRegio, setSelectedRegio] = useState("");
  const [selectedPijler, setSelectedPijler] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFunding, setSelectedFunding] = useState("");
  const [tab, setTab] = useState<"graph" | "stats">("graph");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.max(width, 300), height: Math.max(height, 500) });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [mounted]);

  const filteredNodeIds = new Set(
    nodes
      .filter((n) => {
        if (selectedRegio && n.vestigingsregio !== selectedRegio) return false;
        if (selectedPijler && !n.pijlers.includes(selectedPijler)) return false;
        if (selectedType && n.typeEntiteit !== selectedType) return false;
        if (selectedFunding && n.fundingType !== selectedFunding) return false;
        return true;
      })
      .map((n) => n.id)
  );

  const graphData = {
    nodes: nodes
      .filter((n) => filteredNodeIds.has(n.id))
      .map((n) => ({ ...n, color: getColor(n.typeEntiteit) })),
    links: links.filter(
      (l) => filteredNodeIds.has(l.source as string) && filteredNodeIds.has(l.target as string)
    ),
  };

  const handleNodeClick = useCallback(
    (node: NodeData) => {
      router.push(`/stakeholders/${node.slug}`);
    },
    [router]
  );

  const regios = Object.keys(regioCounts).sort();
  const pijlers = Object.keys(pijlerCounts).sort();
  const types = Object.keys(typeCounts).sort();
  const fundings = Array.from(new Set(nodes.map((n) => n.fundingType).filter(Boolean))).sort();

  const hasFilter = selectedRegio || selectedPijler || selectedType || selectedFunding;

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
        {graphData.nodes.length} partijen · {graphData.links.length} relaties
      </p>

      {tab === "graph" ? (
        <div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
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

          <div
            ref={containerRef}
            className="w-full rounded-xl border border-gray-100 overflow-hidden bg-gray-50"
            style={{ height: 600 }}
          >
            {mounted && (
              <ForceGraph2D
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                nodeLabel="name"
                nodeColor={(node) => (node as NodeData).color}
                nodeRelSize={5}
                linkColor={(link) =>
                  (link as LinkData).type === "hierarchy" ? "#94A3B8" : "#CBD5E1"
                }
                linkWidth={(link) =>
                  (link as LinkData).type === "hierarchy" ? 1.5 : 1
                }
                linkDirectionalArrowLength={(link) =>
                  (link as LinkData).type === "hierarchy" ? 4 : 0
                }
                linkDirectionalArrowRelPos={1}
                onNodeClick={(node) => handleNodeClick(node as NodeData)}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const n = node as NodeData & { x?: number; y?: number };
                  if (n.x == null || n.y == null) return;
                  const fontSize = Math.max(10 / globalScale, 2);
                  ctx.beginPath();
                  ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI);
                  ctx.fillStyle = n.color || "#9CA3AF";
                  ctx.fill();
                  if (globalScale > 1.5) {
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.fillStyle = "#374151";
                    ctx.textAlign = "center";
                    ctx.fillText(n.name, n.x, n.y + 9);
                  }
                }}
              />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Klik op een knoop om de partijpagina te openen. Zoom en sleep om te navigeren.
            Pijlen = hiërarchie · Lijnen = samenwerking.
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
