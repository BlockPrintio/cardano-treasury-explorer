"use client";

import { useEffect, useRef } from "react";

import type { PsscContract, TreasuryData, TrscContract } from "@/types/treasury";

import { cn } from "@/lib/cn";

interface TreasuryNetworkGraphProps {
  data?: TreasuryData;
  className?: string;
}

interface PositionedTrsc {
  contract: TrscContract;
  x: number;
  y: number;
}

const TRSC_COLOR = "#4f46e5";
const PSSC_COLOR = "#0ea5e9";

type SigmaConstructor = typeof import("sigma").default;
type SigmaInstance = InstanceType<SigmaConstructor>;
type GraphologyConstructor = typeof import("graphology").default;
type GraphInstance = InstanceType<GraphologyConstructor>;

export function TreasuryNetworkGraph({ data, className }: TreasuryNetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<SigmaInstance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let destroyed = false;
    let renderer: SigmaInstance | null = null;

    const mount = async () => {
      const [{ default: GraphCtor }, { default: SigmaCtor }] = await Promise.all([
        import("graphology"),
        import("sigma"),
      ]);

      if (destroyed || !containerRef.current) return;

      const graphInstance = buildGraph(data, GraphCtor);

      renderer = new SigmaCtor(graphInstance, containerRef.current, {
        renderLabels: true,
        labelDensity: 0.9,
        labelFont: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      });

      renderer.setSetting("nodeReducer", (_node, attributes) => {
        switch (attributes.kind) {
          case "trsc":
            return { ...attributes, color: TRSC_COLOR, type: "default" };
          case "pssc":
            return { ...attributes, color: attributes.color ?? PSSC_COLOR, type: "default" };
          default:
            return attributes;
        }
      });

      const camera = renderer.getCamera();
      const currentState = camera.getState();
      camera.setState({ ...currentState, ratio: 2.1, angle: 0 });
      sigmaRef.current = renderer;
    };

    void mount();

    return () => {
      destroyed = true;
      renderer?.kill();
      sigmaRef.current = null;
    };
  }, [data]);

  if (!data) {
    return (
      <div className={cn(networkContainerClasses, className)}>
        <Header />
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-indigo-200/60 bg-white/60 px-6 text-sm text-zinc-500 dark:border-indigo-500/40 dark:bg-white/5 dark:text-zinc-400">
          Network data not available yet.
        </div>
      </div>
    );
  }

  return (
    <div className={cn(networkContainerClasses, className)}>
      <Header />
      <div
        ref={containerRef}
        className="relative z-10 h-full w-full overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/70 shadow-inner dark:border-white/10 dark:bg-white/5"
      />
    </div>
  );
}

const networkContainerClasses = cn(
  "relative flex h-[420px] w-full flex-col overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10",
  "transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg",
);

function Header() {
  return (
    <div className="relative z-10 mb-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500/80">
        Network Flow
      </p>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        TRSC → PSSC Relationship Graph
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Nodes scale with allocated ADA; edges connect routing contracts to their funded projects.
      </p>
    </div>
  );
}

function buildGraph(data: TreasuryData | undefined, GraphCtor: GraphologyConstructor): GraphInstance {
  const graph = new GraphCtor();
  if (!data) return graph;

  const { trsc, pssc } = data;

  const trscPositions = positionTrscNodes(trsc);
  const psscByFundTx = new Map<string, PsscContract>(pssc.map((contract) => [contract.fund_tx, contract]));

  trscPositions.forEach(({ contract, x, y }, index) => {
    if (graph.hasNode(contract.id)) return;
    const size = nodeSizeFromAda(contract.balance ?? contract.incomingToTRSC ?? 0, 12, 18);
    graph.addNode(contract.id, {
      x,
      y,
      label: contract.name,
      size,
      color: TRSC_COLOR,
      kind: "trsc",
      type: "default",
      highlighted: index === 0,
    });
  });

  trscPositions.forEach(({ contract, x: parentX, y: parentY }) => {
    const children = contract.children ?? [];
    const childCount = children.length || 1;

    children.forEach((child, childIndex) => {
      const angle = (2 * Math.PI * childIndex) / childCount;
      const spread = 3 + Math.min(6, childCount * 0.45);
      const distance = 4 + spread;
      const childX = parentX + Math.cos(angle) * distance;
      const childY = parentY + Math.sin(angle) * distance;

      const nodeId = child.id;
      if (!nodeId || graph.hasNode(nodeId)) return;

      const psscRecord = psscByFundTx.get(nodeId);
      const label = (child.vendor ?? psscRecord?.project ?? "Project").replace("Authentic ", "");
      const budgetAda = child.budgetAda ?? psscRecord?.budget ?? child.balance ?? 0;
      const claimedAda = child.claimedAda ?? psscRecord?.claimed ?? 0;

      const size = nodeSizeFromAda(budgetAda, 5, 12);
      const color = budgetAda === 0 ? "#94a3b8" : PSSC_COLOR;

      graph.addNode(nodeId, {
        x: childX,
        y: childY,
        label,
        size,
        color,
        kind: "pssc",
        type: "default",
        budget: budgetAda,
        claimed: claimedAda,
        progress: budgetAda > 0 ? Math.round((claimedAda / budgetAda) * 100) : 0,
      });

      if (!graph.hasEdge(contract.id, nodeId)) {
        graph.addEdge(contract.id, nodeId, {
          size: 0.8 + Math.min(2.5, nodeSizeFromAda(budgetAda, 0, 4) / 4),
          color: "rgba(79,70,229,0.25)",
          weight: budgetAda,
        });
      }
    });
  });

  const orphanPssc = pssc.filter((contract) => !graph.hasNode(contract.fund_tx));
  if (orphanPssc.length) {
    const originX = 0;
    const originY = 0;
    orphanPssc.forEach((contract, index) => {
      const angle = (2 * Math.PI * index) / orphanPssc.length;
      const distance = 6 + index * 0.4;
      const nodeId = contract.fund_tx;

      if (graph.hasNode(nodeId)) return;

      graph.addNode(nodeId, {
        x: originX + Math.cos(angle) * distance,
        y: originY + Math.sin(angle) * distance,
        label: contract.project ?? "Unknown project",
        size: nodeSizeFromAda(contract.budget ?? 0, 4, 10),
        color: "#38bdf8",
        kind: "pssc",
        type: "default",
      });
    });
  }

  return graph;
}

function positionTrscNodes(trsc: TrscContract[]): PositionedTrsc[] {
  if (!trsc.length) return [];

  const radius = Math.max(12, trsc.length * 6);

  return trsc.map((contract, index) => {
    const angle = (2 * Math.PI * index) / trsc.length;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { contract, x, y } satisfies PositionedTrsc;
  });
}

function nodeSizeFromAda(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value <= 0) return min;
  const size = Math.log10(value + 10);
  return Math.min(max, Math.max(min, size * (min / 1.4)));
}

