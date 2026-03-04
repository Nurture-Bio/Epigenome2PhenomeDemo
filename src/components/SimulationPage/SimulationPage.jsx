import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { baselineChromatin, metabolites, pathwayEdges } from '../../data';
import { getChromatinColor, useFluxSolver, usePathwayLayout } from '../../hooks';
import { cn } from '../../lib/utils';
import { useSelectionStore } from '../../stores';
import { Button, Card, CardHeader, MetricBar, PlotSurface } from '../ui';
import './SimulationPage.css';

// Returns themed CSS variables — WCAG-compliant on both light and dark surfaces
function getChromatinTextColor(chromatin) {
  if (chromatin >= 0.6) return 'var(--color-success)';
  if (chromatin >= 0.4) return 'var(--color-accent)';
  if (chromatin >= 0.2) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

// Inline enzyme pill with spring-animated bar
function InlineEnzyme({ gene, x, y, chromatin = 0.5, interventions = {}, nodeConfig, chromatinBarConfig, onToggle, isBottleneck }) {
  const springChromatin = useSpring(chromatin, { stiffness: 180, damping: 12 });
  useEffect(() => { springChromatin.set(chromatin); }, [chromatin, springChromatin]);

  const color = getChromatinColor(chromatin);
  const isActive = gene && interventions[gene] && interventions[gene] !== 'normal';
  const { width, height, rx } = nodeConfig?.enzyme || { width: 72, height: 28, rx: 14 };
  const barWidth = chromatinBarConfig?.width || 54;
  const barHeight = chromatinBarConfig?.height || 6;

  const barFillWidth = useTransform(springChromatin, v => barWidth * v);
  const glowOpacity = useTransform(springChromatin, v => Math.min(0.6, v * 0.8));
  const glowSize = useTransform(springChromatin, v => 4 + v * 8);
  const glowFilter = useTransform(glowSize, s => `drop-shadow(0 0 ${s}px ${color})`);

  if (!gene || gene === 'EXPORT') return null;

  return (
    <g className="enzymeInline" onClick={(e) => { e.stopPropagation(); onToggle(gene); }} style={{ cursor: 'pointer' }}>
      {isBottleneck && (
        <rect x={x - width / 2 - 6} y={y - height / 2 - 6} width={width + 12} height={height + 12} rx={rx + 6}
          fill="none" stroke="#ef4444" strokeWidth={2} className="enzymeBottleneckPulse"
          style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' }} />
      )}
      <motion.rect x={x - width / 2 - 3} y={y - height / 2 - 3} width={width + 6} height={height + 6} rx={rx + 3}
        fill="none" stroke={color} strokeWidth={2} opacity={glowOpacity}
        className={chromatin > 0.5 ? 'enzymeGlowPulse' : ''} style={{ filter: glowFilter }} />
      <rect x={x - width / 2} y={y - height / 2} width={width} height={height} rx={rx}
        className={`enzymePill ${isActive ? 'enzymeActive' : ''}`} style={{ stroke: color, strokeWidth: 1.5 }} />
      <text x={x} y={y - 2} className="enzymeLabel" style={{ fill: color }}>{gene}</text>
      <rect x={x - barWidth / 2} y={y + height / 2 - barHeight - 3} width={barWidth} height={barHeight}
        rx={barHeight / 2} fill="var(--alpha-2)" />
      <motion.rect x={x - barWidth / 2} y={y + height / 2 - barHeight - 3} width={barFillWidth}
        height={barHeight} rx={barHeight / 2} fill={color} />
    </g>
  );
}

function getFlowClass(chromatin) {
  if (chromatin > 0.7) return 'flowFast';
  if (chromatin > 0.3) return 'flowMedium';
  return 'flowSlow';
}

function FlowEdge({ edge, positions, geneStates, interventions, nodeConfig, arrowConfig, chromatinBarConfig, onToggle, fluxState, bottleneckGene }) {
  const fromPos = positions[edge.from];
  const toPos = positions[edge.to];
  if (!fromPos || !toPos) return null;

  const chromatin = geneStates[edge.gene]?.chromatin || 0.5;
  let effectiveRate = chromatin;
  let color;
  if (edge.gene === 'EXPORT' && fluxState) {
    const productFlux = fluxState.nodeFlux.iamac || 0;
    const wasteFlux = fluxState.nodeFlux.waste || 0;
    const total = productFlux + wasteFlux;
    const wasteRatio = total > 0 ? wasteFlux / total : 0.5;
    effectiveRate = wasteRatio;
    color = getChromatinColor(wasteRatio);
  } else {
    color = getChromatinColor(chromatin);
  }
  const isActive = interventions[edge.gene] && interventions[edge.gene] !== 'normal';
  const thickness = isActive ? arrowConfig.mainThickness + 2 : arrowConfig.mainThickness;
  const nodeHeight = nodeConfig.metabolite.height;
  const padding = 12;

  if (fromPos.x === toPos.x) {
    const x = fromPos.x;
    const y1 = fromPos.y + nodeHeight / 2 + padding;
    const y2 = toPos.y - nodeHeight / 2 - padding;
    const midY = (y1 + y2) / 2;
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2} stroke="var(--alpha-1)" strokeWidth={thickness + 4} strokeLinecap="round" />
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={arrowConfig.dashArray} className={getFlowClass(effectiveRate)} />
        <polygon points={`${x},${y2 + 6} ${x - 5},${y2} ${x + 5},${y2}`} fill={color} />
        <InlineEnzyme gene={edge.gene} x={x} y={midY} chromatin={chromatin} interventions={interventions}
          nodeConfig={nodeConfig} chromatinBarConfig={chromatinBarConfig} onToggle={onToggle} isBottleneck={edge.gene === bottleneckGene} />
      </g>
    );
  }

  const x1 = fromPos.x;
  const y1 = fromPos.y + nodeHeight / 2 + padding;
  const x2 = toPos.x;
  const y2 = toPos.y - nodeHeight / 2 - padding;
  const midY = (y1 + y2) / 2;
  const enzymeMidX = (x1 + x2) / 2;
  const branchPath = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

  return (
    <g>
      <path d={branchPath} fill="none" stroke="var(--alpha-1)" strokeWidth={thickness + 4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={branchPath} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={arrowConfig.dashArray} className={getFlowClass(effectiveRate)} />
      <polygon points={`${x2},${y2 + 6} ${x2 - 5},${y2} ${x2 + 5},${y2}`} fill={color} />
      {edge.gene !== 'EXPORT' && (
        <InlineEnzyme gene={edge.gene} x={enzymeMidX} y={midY} chromatin={chromatin} interventions={interventions}
          nodeConfig={nodeConfig} chromatinBarConfig={chromatinBarConfig} onToggle={onToggle} isBottleneck={edge.gene === bottleneckGene} />
      )}
    </g>
  );
}

function PathwayDiagram({ geneStates, fluxState, interventions, onToggle }) {
  const { positions, viewBoxWidth, viewBoxHeight, nodeConfig, arrowConfig, chromatinBarConfig, edges } = usePathwayLayout();
  const controllableGenes = ['BAT2', 'ARO10', 'ADH6', 'ATF1'];
  const bottleneckGene = controllableGenes.reduce((min, g) => !min || geneStates[g].chromatin < geneStates[min].chromatin ? g : min, null);

  const getVariant = (nodeId) => {
    const meta = metabolites[nodeId];
    if (meta.type === 'input') return 'input';
    if (meta.type === 'product') return interventions.ATF1 === 'activate' ? 'productActive' : 'product';
    if (meta.type === 'waste') return 'waste';
    return '';
  };

  const getFlux = (nodeId) => {
    if (nodeId === 'leu') return 1.0;
    if (fluxState.nodeFlux[nodeId] !== undefined) return fluxState.nodeFlux[nodeId];
    const edge = pathwayEdges.find(e => e.to === nodeId);
    return edge ? (fluxState.edgeFlux[`${edge.from}-${edge.to}`] || 0) : 0;
  };

  const MetaboliteNode = ({ nodeId }) => {
    const pos = positions[nodeId];
    const meta = metabolites[nodeId];
    const flux = getFlux(nodeId);
    const variant = getVariant(nodeId);
    const { width, height, rx } = nodeConfig.metabolite;
    return (
      <g>
        <rect x={pos.x - width / 2} y={pos.y - height / 2} width={width} height={height} rx={rx}
          className={`metaboliteRect ${variant}`} />
        <text x={pos.x} y={pos.y + 4} className="metaboliteText">{meta.name}</text>
        <text x={pos.x + width / 2 + 8} y={pos.y + 4} className="fluxPercent">{Math.round(flux * 100)}%</text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="pathwaySvg">
      <defs>
        <linearGradient id="inputGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(30, 41, 59, 0.9)" />
        </linearGradient>
        <linearGradient id="productGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={interventions.ATF1 === 'activate' ? "rgba(34, 197, 94, 0.25)" : "rgba(250, 204, 21, 0.2)"} />
          <stop offset="100%" stopColor="rgba(30, 41, 59, 0.9)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text x={viewBoxWidth / 2} y="40" className="diagramTitle">Ehrlich Pathway</text>
      {pathwayEdges.map((edge) => (
        <FlowEdge key={`${edge.from}-${edge.to}`} edge={edge} positions={positions} geneStates={geneStates}
          interventions={interventions} nodeConfig={nodeConfig} arrowConfig={arrowConfig}
          chromatinBarConfig={chromatinBarConfig} onToggle={onToggle} fluxState={fluxState} bottleneckGene={bottleneckGene} />
      ))}
      {Object.keys(positions).map(nodeId => <MetaboliteNode key={nodeId} nodeId={nodeId} />)}
    </svg>
  );
}

function TriStateToggle({ value, onChange }) {
  const activeStyles = {
    repress: { background: 'var(--color-danger)', boxShadow: 'color-mix(in srgb, var(--color-danger) 30%, transparent) 0 2px 8px' },
    normal:  { background: 'var(--alpha-4)' },
    activate:{ background: 'var(--color-success)', boxShadow: 'color-mix(in srgb, var(--color-success) 30%, transparent) 0 2px 8px' },
  };
  return (
    <div className="flex gap-0.5 bg-surface-input rounded-md p-0.5">
      {(['repress', 'normal', 'activate']).map((v) => (
        <button key={v}
          className={cn(
            'w-6 h-5 border-none rounded type-caption font-semibold cursor-pointer transition-all flex items-center justify-center',
            value === v ? 'text-text-on-color' : 'bg-transparent text-text-muted hover:bg-surface-hover hover:text-text-secondary'
          )}
          style={value === v ? activeStyles[v] : undefined}
          onClick={(e) => { e.stopPropagation(); onChange(v); }}
          title={v === 'repress' ? 'Repression' : v === 'activate' ? 'Activation' : 'No Intervention'}
        >{v === 'repress' ? '−' : v === 'activate' ? '+' : '○'}</button>
      ))}
    </div>
  );
}

export function SimulationPage() {
  const interventions = useSelectionStore((state) => state.interventions);
  const setIntervention = useSelectionStore((state) => state.setIntervention);
  const resetInterventions = useSelectionStore((state) => state.resetInterventions);
  const { geneStates, fluxState, baselineFlux } = useFluxSolver(interventions);

  const toggleIntervention = (gene) => {
    const current = interventions[gene];
    const next = current === 'normal' ? 'activate' : current === 'activate' ? 'repress' : 'normal';
    setIntervention(gene, next);
  };

  const captureRate = fluxState.nodeFlux.iamac / (fluxState.nodeFlux.iamac + fluxState.nodeFlux.waste);
  const foldChange = fluxState.nodeFlux.iamac / baselineFlux.nodeFlux.iamac;
  const fluxToProduct = (fluxState.nodeFlux.iamac || 0) * 100;

  const springCapture = useSpring(captureRate * 100, { stiffness: 120, damping: 20 });
  useEffect(() => { springCapture.set(captureRate * 100); }, [captureRate, springCapture]);
  const springFluxProduct = useSpring(fluxToProduct, { stiffness: 120, damping: 20 });
  useEffect(() => { springFluxProduct.set(fluxToProduct); }, [fluxToProduct, springFluxProduct]);
  const captureWidth = useTransform(springCapture, v => `${v}%`);
  const fluxProductWidth = useTransform(springFluxProduct, v => `${v}%`);

  const genes = ['BAT2', 'ARO10', 'ADH6', 'ATF1'];
  const bottleneckGene = genes.reduce((min, g) => !min || geneStates[g].chromatin < geneStates[min].chromatin ? g : min, null);
  const hasActiveInterventions = genes.some(g => interventions[g] !== 'normal');

  return (
    <div className="grid grid-cols-[minmax(400px,500px)_340px] gap-7 h-full justify-center">
      {/* Pathway Visualization */}
      <PlotSurface className="p-4">
        <PathwayDiagram geneStates={geneStates} fluxState={fluxState} interventions={interventions} onToggle={toggleIntervention} />
      </PlotSurface>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 h-full">
        {/* Interventions */}
        <Card className="flex-1">
          <CardHeader>
            <span>Interventions</span>
            <Button
              variant="ghost"
              onClick={resetInterventions}
              style={{ visibility: hasActiveInterventions ? 'visible' : 'hidden' }}
            >Reset</Button>
          </CardHeader>
          <div className="p-5">
            <p className="type-sm text-text-secondary leading-relaxed m-0 mb-3">
              Simulate activation (+) or repression (−) to modify chromatin accessibility and redirect metabolic flux.
            </p>
            <div className="flex flex-col gap-2.5">
              {genes.map(gene => {
                const state = interventions[gene];
                const currentChromatin = geneStates[gene].chromatin;
                const baseline = baselineChromatin[gene];
                const delta = Math.round((currentChromatin - baseline) * 100);
                const deltaSign = delta > 0 ? '+' : '';
                return (
                  <div key={gene}
                    className="flex items-center justify-between py-3 px-3.5 -mx-1 rounded-lg cursor-pointer relative z-[1] transition-all duration-150 hover:bg-surface-hover"
                    style={state === 'activate' ? { background: 'color-mix(in srgb, var(--color-success) 8%, transparent)' }
                      : state === 'repress'   ? { background: 'color-mix(in srgb, var(--color-danger)  8%, transparent)' }
                      : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <span className="type-gene min-w-[55px] transition-colors" style={{ color: getChromatinTextColor(currentChromatin) }}>{gene}</span>
                      <span className="type-body text-text-muted">
                        {state === 'normal'
                          ? `${Math.round(baseline * 100)}% accessible`
                          : <>{Math.round(baseline * 100)}% → {Math.round(currentChromatin * 100)}%
                              <span className="ml-1 font-semibold" style={{ color: delta > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>({deltaSign}{delta}%)</span>
                            </>
                        }
                      </span>
                    </div>
                    <TriStateToggle value={state} onChange={(newState) => setIntervention(gene, newState)} />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>Flux Output</CardHeader>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-surface-input rounded-lg text-center">
                <div className="type-label mb-1">Capture Rate</div>
                <div className="type-metric transition-colors" style={{ color: getChromatinColor(geneStates.ATF1.chromatin) }}>
                  {Math.round(captureRate * 100)}%
                </div>
              </div>
              <div className="p-3 bg-surface-input rounded-lg text-center">
                <div className="type-label mb-1">vs Baseline</div>
                <div className="type-metric transition-colors" style={{ color: foldChange > 1.1 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                  {foldChange.toFixed(1)}×
                </div>
              </div>
            </div>

            {/* Capture bars */}
            <div className="mt-2.5 flex flex-col gap-3">
              <MetricBar value={Math.round(captureRate * 100)} label="Product Capture" unit="%" variant="success" />
              <MetricBar value={Math.round(fluxToProduct)}     label="Flux to Product"  unit="%" variant="neutral" />
            </div>
          </div>
          {/* Insight banner */}
          <div
            className="py-2.5 px-3.5 type-sm text-center border-t border-border-subtle"
            style={{
              background: interventions.ATF1 === 'activate'
                ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
                : 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
              color: interventions.ATF1 === 'activate' ? 'var(--color-success)' : 'var(--text-secondary)',
            }}>
            {interventions.ATF1 === 'activate'
              ? '✓ ATF1 activation redirects flux to product'
              : `⚠ ${bottleneckGene} is the bottleneck — ${Math.round(geneStates[bottleneckGene].chromatin * 100)}% chromatin accessibility`}
          </div>
        </Card>
      </div>
    </div>
  );
}
