/* SVG topology canvas — animated-beam style wires with gradient pulse */

import { useMemo, memo } from 'react';
import { NODE_META, EDGE_DEF, RING_RADII } from '../constants/nodes';
import { STATUS_PALETTE } from '../constants/theme';
import { lerp, bezierMidpoint } from '../utils/helpers';

/* Animated beam edge — gradient pulse travelling along a curved path */
function BeamEdge({ edgeId, pathD, color, isActive, isHoverHL, hot, idx }) {
  const baseAlpha = isHoverHL ? 0.7 : isActive ? 0.46 : Math.max(0.13, 0.08 + hot / 14);
  const sw = isHoverHL ? 2.35 : isActive ? 1.95 : lerp(0.7, 1.45, hot / 10);
  const beamDur = isActive ? (2.2 + (idx % 4) * 0.3) : (5 + (idx % 5) * 0.6);
  const gradId = `bg-${edgeId}`;

  return (
    <g>
      {/* Base wire — subtle static path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(1.05, sw * 1.2)}
        strokeOpacity={isHoverHL ? 0.15 : isActive ? 0.12 : 0.08}
        strokeLinecap="round"
        filter="url(#glowF)"
        style={{ transition: 'stroke-opacity 220ms ease, stroke-width 220ms ease' }}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeOpacity={baseAlpha}
        strokeLinecap="round"
        style={{ transition: 'stroke-opacity 220ms ease, stroke-width 220ms ease' }}
      />

      {/* Animated beam gradient — short bright pulse that travels the path */}
      <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={color} stopOpacity="0" />
        <stop offset="0%" stopColor={color} stopOpacity="0">
          <animate attributeName="offset" values="0;1" dur={`${beamDur}s`}
            repeatCount="indefinite" begin={`${(idx % 7) * 0.4}s`} />
        </stop>
        <stop offset="0%" stopColor={color} stopOpacity={isActive ? 0.9 : 0.5}>
          <animate attributeName="offset" values="0;1" dur={`${beamDur}s`}
            repeatCount="indefinite" begin={`${(idx % 7) * 0.4}s`} />
        </stop>
        <stop offset="0%" stopColor={color} stopOpacity="0">
          <animate attributeName="offset" values="0.08;1.08" dur={`${beamDur}s`}
            repeatCount="indefinite" begin={`${(idx % 7) * 0.4}s`} />
        </stop>
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>

      {/* Beam path — the travelling gradient */}
      <path d={pathD} fill="none" stroke={`url(#${gradId})`}
        strokeWidth={isActive ? 3.0 : isHoverHL ? 2.5 : 1.75}
        strokeLinecap="round"
        style={{ transition: 'stroke-width 220ms ease' }} />

      {/* Active shimmer dash */}
      {(isActive || isHoverHL) && (
        <path d={pathD} fill="none" stroke={color}
          strokeWidth={sw * 0.6} strokeOpacity={isHoverHL ? 0.36 : 0.2}
          strokeLinecap="round" strokeDasharray="2 16">
          <animate attributeName="stroke-dashoffset" from="0" to="-72"
            dur={`${isActive ? 1.5 : 3}s`} repeatCount="indefinite" />
        </path>
      )}
    </g>
  );
}

const TopologyCanvas = memo(function TopologyCanvas({
  positions, activeNodes, activeEdges, edgeHotness, nodeStatuses,
  selectedNode, onNodeClick, hoveredNode, onNodeHover, onNodeLeave,
  cx, cy, layerColors, T,
}) {
  const nodeEntries = useMemo(() => Object.entries(NODE_META), []);
  const edgeEntries = useMemo(() => Object.entries(EDGE_DEF), []);
  const activeNodeSet = useMemo(() => new Set(activeNodes || []), [activeNodes]);
  const activeEdgeSet = useMemo(() => new Set(activeEdges || []), [activeEdges]);

  const hoveredEdgeSet = useMemo(() => {
    if (!hoveredNode) return new Set();
    const s = new Set();
    edgeEntries.forEach(([edgeId, { from, to }]) => {
      if (from === hoveredNode || to === hoveredNode) s.add(edgeId);
    });
    return s;
  }, [hoveredNode, edgeEntries]);

  const hoveredConnectedSet = useMemo(() => {
    if (!hoveredNode) return new Set();
    const s = new Set([hoveredNode]);
    edgeEntries.forEach(([, { from, to }]) => {
      if (from === hoveredNode) s.add(to);
      if (to === hoveredNode) s.add(from);
    });
    return s;
  }, [hoveredNode, edgeEntries]);

  return (
    <svg viewBox="0 0 1000 1000" className="topology-svg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={layerColors.hub.glow} stopOpacity="0.25" />
          <stop offset="100%" stopColor={layerColors.hub.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aiStageLightA" cx="26%" cy="18%" r="56%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aiStageLightB" cx="78%" cy="20%" r="58%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <pattern id="aiPrismPattern" width="72" height="72" patternUnits="userSpaceOnUse">
          <g stroke="rgba(255,255,255,0.22)" strokeWidth="0.7" fill="none">
            <polygon points="36,2 68,18 68,54 36,70 4,54 4,18" />
            <line x1="36" y1="2" x2="36" y2="70" />
            <line x1="4" y1="18" x2="68" y2="54" />
            <line x1="68" y1="18" x2="4" y2="54" />
          </g>
        </pattern>
        <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x="20" y="20" width="960" height="960" rx="28"
        fill="rgba(7,6,25,0.10)" opacity="0.9" />
      <rect x="20" y="20" width="960" height="960" rx="28"
        fill="url(#aiPrismPattern)" opacity="0.08" />
      <rect x="20" y="20" width="960" height="960" rx="28" fill="url(#aiStageLightA)" />
      <rect x="20" y="20" width="960" height="960" rx="28" fill="url(#aiStageLightB)" />

      {/* Concentric ring guides */}
      {RING_RADII.slice(1).map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={T.svgRingStroke} strokeWidth="1" strokeDasharray="4 8" />
      ))}

      {/* Ring labels */}
      {['AI MODELS', 'BACKEND SERVICES', 'DATA STORES', 'FRONTEND PAGES'].map((label, i) => (
        <text key={label} x={cx} y={cy - RING_RADII[i + 1] - 8} textAnchor="middle"
          fill={T.textMuted} fontSize="7.5" fontWeight="600" letterSpacing="1.4"
          fontFamily="'Inter',system-ui,sans-serif" opacity="0.5">{label}</text>
      ))}

      <circle cx={cx} cy={cy} r={90} fill="url(#hubGlow)" />

      {/* Animated beam edges */}
      {edgeEntries.map(([edgeId, { from, to }], idx) => {
        const p1 = positions[from], p2 = positions[to];
        if (!p1 || !p2) return null;
        const hot = edgeHotness?.[edgeId] || 0;
        const isActive = activeEdgeSet.has(edgeId);
        const isHoverHL = hoveredEdgeSet.has(edgeId);
        const { cpx, cpy } = bezierMidpoint(p1.x, p1.y, p2.x, p2.y, cx, cy);
        const fromMeta = NODE_META[from], toMeta = NODE_META[to];
        const layerColor = fromMeta?.ring < (toMeta?.ring || 0)
          ? layerColors[fromMeta?.layer]?.glow : layerColors[toMeta?.layer]?.glow;
        const pathD = `M ${p1.x} ${p1.y} Q ${cpx} ${cpy} ${p2.x} ${p2.y}`;

        return (
          <BeamEdge key={edgeId} edgeId={edgeId} pathD={pathD}
            color={layerColor || T.textMuted}
            isActive={isActive} isHoverHL={isHoverHL} hot={hot} idx={idx} />
        );
      })}

      {/* Nodes */}
      {nodeEntries.map(([nodeId, meta]) => {
        const pos = positions[nodeId];
        if (!pos) return null;
        const layer = layerColors[meta.layer];
        const status = nodeStatuses?.[nodeId] || 'idle';
        const isActive = activeNodeSet.has(nodeId);
        const isSelected = selectedNode === nodeId;
        const isHovered = hoveredNode === nodeId;
        const isHub = meta.ring === 0;
        const nodeR = isHub ? 42 : meta.layer === 'ai' ? 30 : 24;
        const statusColor = STATUS_PALETTE[status] || STATUS_PALETTE.idle;
        const isDimmed = hoveredNode && !hoveredConnectedSet.has(nodeId);
        const scale = isHovered ? 1.15 : isSelected ? 1.045 : 1;

        return (
          <g key={nodeId}
            onClick={() => onNodeClick(nodeId)}
            onMouseEnter={() => onNodeHover(nodeId)}
            onMouseLeave={onNodeLeave}
            style={{ cursor: 'pointer', opacity: isDimmed ? 0.24 : 1, transition: 'opacity 260ms ease' }}
            transform={`translate(${pos.x},${pos.y})`}
          >
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform: `scale(${scale})`,
              transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
              willChange: 'transform',
            }}>
              {isActive && (
                <circle r={nodeR + 8} fill="none" stroke={layer.glow}
                  strokeWidth="1.2" strokeOpacity="0.25" filter="url(#glowF)"
                  style={{ transition: 'stroke-opacity 220ms ease' }} />
              )}
              {isSelected && (
                <circle r={nodeR + 11} fill="none" stroke={T.textPrimary}
                  strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4">
                  <animateTransform attributeName="transform" type="rotate"
                    from="0" to="360" dur="10s" repeatCount="indefinite" />
                </circle>
              )}
              {isHovered && (
                <circle r={nodeR + 12} fill="none" stroke={layer.glow}
                  strokeWidth="1.5" strokeOpacity="0.4" filter="url(#glowF)">
                  <animate attributeName="r" values={`${nodeR + 10};${nodeR + 16};${nodeR + 10}`}
                    dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r={nodeR} fill={layer.bg}
                stroke={isActive ? statusColor : layer.border}
                strokeWidth={isActive ? 2.1 : 1.3}
                strokeOpacity={isActive ? 1 : 0.55}
                style={{ transition: 'stroke 220ms ease, stroke-width 220ms ease, stroke-opacity 220ms ease' }} />
              <circle cx={nodeR - 3.4} cy={-(nodeR - 3.4)} r={isHub ? 4.2 : 3.8}
                fill={statusColor} stroke={T.statusDotBorder} strokeWidth="1.2"
                style={{ transition: 'fill 220ms ease' }} />
              <text y={isHub ? 1 : -1} textAnchor="middle" fill={layer.text}
                fontSize={isHub ? 12.5 : 9.2} fontWeight="700"
                fontFamily="'Inter','SF Pro',system-ui,sans-serif"
                style={{ pointerEvents: 'none', transition: 'opacity 220ms ease' }}>{meta.short}</text>
              {!isHub && (
                <text y={nodeR + 15.5} textAnchor="middle" fill={layer.accent}
                  fontSize="7.4" fontFamily="'Inter',system-ui,sans-serif"
                  opacity={isHovered ? 0.95 : 0.7}
                  style={{ pointerEvents: 'none', transition: 'opacity 220ms ease' }}>
                  {meta.label.length > 20 ? meta.label.slice(0, 18) + '…' : meta.label}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
});

export default TopologyCanvas;
