"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamisk import av ForceGraph2D för att undvika SSR-problem
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphNode {
  id: string;
  text: string;
  type: 'query' | 'memory';
  val: number;
  timestamp?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  similarity: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const INITIAL_DATA: GraphData = {
  nodes: [
    { id: 'system-core', text: 'NEURAL CORE: Ready to accept memories', type: 'memory', val: 30 }
  ],
  links: []
};

export function NeuralGraph({ data = INITIAL_DATA }: { data?: GraphData }) {
  const graphRef = useRef<any>();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
      const updateDim = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
      window.addEventListener('resize', updateDim);
      return () => window.removeEventListener('resize', updateDim);
    }
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      setTimeout(() => {
        graphRef.current.zoomToFit(600, 70);
      }, 200);
    }
  }, [data]);

  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isQuery = node.type === 'query';
    const isHover = node === hoverNode;

    const baseRadius = node.val ? node.val : 12;
    const pulse = Math.sin(Date.now() / (isQuery ? 400 : 800)) * 2;
    const r = (baseRadius + pulse) / globalScale;

    // Ljusa färger istället för neon
    const coreColor = isQuery ? '#3b82f6' : '#8b5cf6'; // blue-500 / purple-500
    const innerGlow = isQuery ? '#60a5fa' : '#a78bfa'; // blue-400 / purple-400
    const outerHalo = isQuery ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)';

    const x = node.x || 0;
    const y = node.y || 0;

    // Yttre halo
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, 2 * Math.PI, false);
    const gradientHalo = ctx.createRadialGradient(x, y, r, x, y, r * 3.5);
    gradientHalo.addColorStop(0, outerHalo);
    gradientHalo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradientHalo;
    ctx.fill();

    // Inre glöd
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI, false);
    ctx.fillStyle = innerGlow;
    ctx.shadowColor = innerGlow;
    ctx.shadowBlur = 15 / globalScale;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Kärna
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, 2 * Math.PI, false);
    ctx.fillStyle = coreColor;
    ctx.fill();

    // Hover-ring
    if (isHover) {
      ctx.beginPath();
      ctx.arc(x, y, r * 4, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 1.5 / globalScale;
      ctx.setLineDash([5 / globalScale, 5 / globalScale]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Text label
    if (isHover && globalScale > 1.5) {
      const label = node.type.toUpperCase();
      ctx.font = `${10 / globalScale}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = coreColor;
      ctx.fillText(label, x, y + r * 4.5);
    }
  }, [hoverNode]);

  const paintLink = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const source = link.source as GraphNode;
    const target = link.target as GraphNode;

    if (typeof source === 'string' || typeof target === 'string') return;

    const score = link.similarity || 0;

    let linkColor, glowWidth;
    if (score > 0.85) {
      linkColor = '#10b981'; // green-500
      glowWidth = 4;
    } else if (score > 0.70) {
      linkColor = '#3b82f6'; // blue-500
      glowWidth = 2;
    } else {
      linkColor = '#6366f1'; // indigo-500
      glowWidth = 1;
    }

    const baseWidth = (glowWidth / globalScale) / 2;

    // Glöd
    ctx.beginPath();
    ctx.moveTo(source.x || 0, source.y || 0);
    ctx.lineTo(target.x || 0, target.y || 0);
    ctx.strokeStyle = linkColor;
    ctx.lineWidth = baseWidth * 4;
    ctx.globalAlpha = 0.2 * score;
    ctx.stroke();

    // Kärna
    ctx.beginPath();
    ctx.moveTo(source.x || 0, source.y || 0);
    ctx.lineTo(target.x || 0, target.y || 0);
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = baseWidth;
    ctx.globalAlpha = 0.6 * score;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      {hoverNode && (
        <div 
          className="absolute top-[15%] left-1/2 -translate-x-1/2 z-[2000] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-2xl p-4 max-w-md"
        >
          <div className="text-xs font-bold text-blue-600 uppercase mb-2">
            {hoverNode.type === 'query' ? '→ Active Query' : '→ Memory Node'}
          </div>
          <div className="text-sm text-slate-800 font-medium mb-1">
            "{hoverNode.text}"
          </div>
          {hoverNode.timestamp && (
            <div className="text-xs text-slate-500 mt-2">
              {hoverNode.timestamp}
            </div>
          )}
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={dimensions.w}
        height={dimensions.h}
        backgroundColor="transparent"
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => 'replace'}
        onNodeHover={(node: any) => {
          setHoverNode(node || null);
          if (typeof document !== 'undefined') {
            document.body.style.cursor = node ? 'pointer' : 'default';
          }
        }}
        linkDirectionalParticles={(link: any) => link.similarity > 0.8 ? 4 : link.similarity > 0.5 ? 2 : 0}
        linkDirectionalParticleSpeed={(link: any) => link.similarity * 0.01}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleColor={() => '#3b82f6'}
      />
    </div>
  );
}
