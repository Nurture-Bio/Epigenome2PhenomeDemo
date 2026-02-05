import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  BaseEdge,
  getStraightPath,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, useSpring, useTransform } from 'framer-motion';
import { baselineChromatin, metabolites } from '../../data';
import { getChromatinColor, useFluxSolver } from '../../hooks';
import { useSelectionStore } from '../../stores';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';

// ============================================================================
// CUSTOM NODE: Metabolite
// ============================================================================
function MetaboliteNode({ data }) {
  const { label, flux, variant } = data;
  
  const variantStyles = {
    input: 'bg-blue-500/15 border-blue-500/40',
    product: 'bg-yellow-500/15 border-yellow-500/40',
    productActive: 'bg-green-500/20 border-green-500/50',
    waste: 'bg-red-500/10 border-red-500/30',
    default: 'bg-slate-800/80 border-white/10',
  };

  return (
    <div className={cn(
      'px-4 py-2 rounded-lg border text-center min-w-[100px]',
      variantStyles[variant] || variantStyles.default
    )}>
      <div className="text-sm font-medium text-slate-200">{label}</div>
      <div className="text-[10px] font-mono text-slate-400">{Math.round(flux * 100)}%</div>
    </div>
  );
}

// ============================================================================
// CUSTOM NODE: Enzyme (clickable pill with chromatin bar)
// ============================================================================
function EnzymeNode({ data }) {
  const { gene, chromatin, intervention, isBottleneck, onToggle } = data;
  const color = getChromatinColor(chromatin);
  
  // Spring animation for chromatin bar
  const springChromatin = useSpring(chromatin, { stiffness: 180, damping: 12 });
  const barWidth = useTransform(springChromatin, v => `${v * 100}%`);

  useEffect(() => {
    springChromatin.set(chromatin);
  }, [chromatin, springChromatin]);

  return (
    <div
      onClick={() => onToggle(gene)}
      className={cn(
        'relative px-3 py-1.5 rounded-full cursor-pointer transition-all',
        'bg-slate-900/90 border-2',
        isBottleneck && 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900 animate-pulse'
      )}
      style={{ borderColor: color }}
    >
      {/* Gene name */}
      <div className="text-[11px] font-mono font-semibold text-center mb-1" style={{ color }}>
        {gene}
      </div>
      
      {/* Chromatin bar */}
      <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ width: barWidth, backgroundColor: color }}
        />
      </div>
      
      {/* Intervention indicator */}
      {intervention !== 'normal' && (
        <div className={cn(
          'absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center',
          intervention === 'activate' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        )}>
          {intervention === 'activate' ? '+' : '−'}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CUSTOM EDGE: Animated flow line
// ============================================================================
function FlowEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const { chromatin } = data;
  const color = getChromatinColor(chromatin);
  
  // Flow speed based on chromatin
  const animationDuration = chromatin > 0.7 ? '0.8s' : chromatin > 0.3 ? '2s' : '4s';
  
  const [edgePath] = getStraightPath({
    sourceX, sourceY, targetX, targetY,
  });

  return (
    <>
      {/* Background track */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={8}
      />
      {/* Animated flow */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray="8 4"
        style={{
          animation: `flowDown ${animationDuration} linear infinite`,
        }}
      />
    </>
  );
}

// Node and edge types for React Flow
const nodeTypes = {
  metabolite: MetaboliteNode,
  enzyme: EnzymeNode,
};

const edgeTypes = {
  flow: FlowEdge,
};

// ============================================================================
// TRISTATE TOGGLE
// ============================================================================
function TriStateToggle({ value, onChange }) {
  return (
    <div className="flex bg-slate-800 rounded-md p-0.5">
      {[
        { val: 'repress', label: '−', color: 'bg-red-500' },
        { val: 'normal', label: '○', color: 'bg-slate-600' },
        { val: 'activate', label: '+', color: 'bg-green-500' },
      ].map(({ val, label, color }) => (
        <button
          key={val}
          onClick={(e) => { e.stopPropagation(); onChange(val); }}
          className={cn(
            'w-7 h-7 rounded text-sm font-semibold transition-all',
            value === val ? `${color} text-white` : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function FluxDynamicsPageReactFlow() {
  const interventions = useSelectionStore((state) => state.interventions);
  const setIntervention = useSelectionStore((state) => state.setIntervention);
  const resetInterventions = useSelectionStore((state) => state.resetInterventions);

  const { geneStates, fluxState, baselineFlux } = useFluxSolver(interventions);

  const toggleIntervention = useCallback((gene) => {
    const current = interventions[gene];
    const next = current === 'normal' ? 'activate' : current === 'activate' ? 'repress' : 'normal';
    setIntervention(gene, next);
  }, [interventions, setIntervention]);

  const genes = ['BAT2', 'ARO10', 'ADH6', 'ATF1'];
  
  const bottleneckGene = genes.reduce((minGene, gene) => {
    if (!minGene) return gene;
    return geneStates[gene].chromatin < geneStates[minGene].chromatin ? gene : minGene;
  }, null);

  const captureRate = fluxState.nodeFlux.iamac / (fluxState.nodeFlux.iamac + fluxState.nodeFlux.waste);
  const foldChange = fluxState.nodeFlux.iamac / baselineFlux.nodeFlux.iamac;
  const fluxToProduct = (fluxState.nodeFlux.iamac || 0) * 100;
  const hasActiveInterventions = genes.some(g => interventions[g] !== 'normal');

  // Spring animations for results
  const springCapture = useSpring(captureRate * 100, { stiffness: 120, damping: 20 });
  const springFluxProduct = useSpring(fluxToProduct, { stiffness: 120, damping: 20 });
  
  useEffect(() => { springCapture.set(captureRate * 100); }, [captureRate, springCapture]);
  useEffect(() => { springFluxProduct.set(fluxToProduct); }, [fluxToProduct, springFluxProduct]);
  
  const captureWidth = useTransform(springCapture, v => `${v}%`);
  const fluxProductWidth = useTransform(springFluxProduct, v => `${v}%`);

  // Build React Flow nodes
  const nodes = useMemo(() => {
    const getVariant = (nodeId) => {
      const meta = metabolites[nodeId];
      if (meta.type === 'input') return 'input';
      if (meta.type === 'product') return interventions.ATF1 === 'activate' ? 'productActive' : 'product';
      if (meta.type === 'waste') return 'waste';
      return 'default';
    };

    const getFlux = (nodeId) => {
      if (nodeId === 'leu') return 1.0;
      return fluxState.nodeFlux[nodeId] || 0;
    };

    // Metabolite positions (vertical layout)
    const metaboliteNodes = [
      { id: 'leu', position: { x: 200, y: 0 }, type: 'metabolite', data: { label: 'Leucine', flux: getFlux('leu'), variant: getVariant('leu') } },
      { id: 'kic', position: { x: 200, y: 150 }, type: 'metabolite', data: { label: 'KIC', flux: getFlux('kic'), variant: getVariant('kic') } },
      { id: 'iamoh', position: { x: 200, y: 300 }, type: 'metabolite', data: { label: 'Isoamyl alcohol', flux: getFlux('iamoh'), variant: getVariant('iamoh') } },
      { id: 'iamac', position: { x: 120, y: 450 }, type: 'metabolite', data: { label: 'Isoamyl acetate', flux: getFlux('iamac'), variant: getVariant('iamac') } },
      { id: 'waste', position: { x: 280, y: 450 }, type: 'metabolite', data: { label: 'Waste', flux: getFlux('waste'), variant: getVariant('waste') } },
    ];

    // Enzyme positions (between metabolites)
    const enzymeNodes = [
      { id: 'enz-BAT2', position: { x: 200, y: 65 }, type: 'enzyme', data: { gene: 'BAT2', chromatin: geneStates.BAT2.chromatin, intervention: interventions.BAT2, isBottleneck: bottleneckGene === 'BAT2', onToggle: toggleIntervention } },
      { id: 'enz-ARO10', position: { x: 200, y: 215 }, type: 'enzyme', data: { gene: 'ARO10', chromatin: geneStates.ARO10.chromatin, intervention: interventions.ARO10, isBottleneck: bottleneckGene === 'ARO10', onToggle: toggleIntervention } },
      { id: 'enz-ADH6', position: { x: 200, y: 365 }, type: 'enzyme', data: { gene: 'ADH6', chromatin: geneStates.ADH6.chromatin, intervention: interventions.ADH6, isBottleneck: bottleneckGene === 'ADH6', onToggle: toggleIntervention } },
      { id: 'enz-ATF1', position: { x: 120, y: 415 }, type: 'enzyme', data: { gene: 'ATF1', chromatin: geneStates.ATF1.chromatin, intervention: interventions.ATF1, isBottleneck: bottleneckGene === 'ATF1', onToggle: toggleIntervention } },
    ];

    return [...metaboliteNodes, ...enzymeNodes];
  }, [geneStates, interventions, fluxState, bottleneckGene, toggleIntervention]);

  // Build React Flow edges
  const edges = useMemo(() => [
    { id: 'e-leu-kic', source: 'leu', target: 'kic', type: 'flow', data: { chromatin: geneStates.BAT2.chromatin } },
    { id: 'e-kic-iamoh', source: 'kic', target: 'iamoh', type: 'flow', data: { chromatin: geneStates.ARO10.chromatin } },
    { id: 'e-iamoh-iamac', source: 'iamoh', target: 'iamac', type: 'flow', data: { chromatin: geneStates.ATF1.chromatin } },
    { id: 'e-iamoh-waste', source: 'iamoh', target: 'waste', type: 'flow', data: { chromatin: 1 - geneStates.ATF1.chromatin } },
  ], [geneStates]);

  return (
    <div className="grid grid-cols-[1fr_340px] gap-4 h-full min-h-0">
      {/* Pathway Visualization */}
      <Card className="p-0 overflow-hidden">
        <div className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e293b" gap={20} />
          </ReactFlow>
        </div>
      </Card>

      {/* Control Panel */}
      <div className="flex flex-col gap-4">
        {/* Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>CRISPR Interventions</CardTitle>
            {hasActiveInterventions && (
              <Button variant="ghost" onClick={resetInterventions} className="text-[10px] px-2 py-1">Reset</Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 mb-4">
              Simulate dCas9-VPR activation (+) or dCas9-KRAB repression (−) to modify chromatin accessibility.
            </p>
            <div className="space-y-2">
              {genes.map(gene => {
                const state = interventions[gene];
                const currentChromatin = geneStates[gene].chromatin;
                const baseline = baselineChromatin[gene];
                const delta = Math.round((currentChromatin - baseline) * 100);
                
                return (
                  <div key={gene} className={cn(
                    'flex items-center justify-between p-2 rounded-lg transition-colors',
                    'hover:bg-white/[0.03]',
                    state !== 'normal' && 'bg-white/[0.04]'
                  )}>
                    <div>
                      <span className="font-mono text-[13px] font-medium" style={{ color: getChromatinColor(currentChromatin) }}>
                        {gene}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        {state === 'normal' 
                          ? `${Math.round(baseline * 100)}% accessible`
                          : (
                            <>
                              {Math.round(baseline * 100)}% → {Math.round(currentChromatin * 100)}%
                              <span className={delta > 0 ? 'text-green-500' : 'text-red-500'}> ({delta > 0 ? '+' : ''}{delta}%)</span>
                            </>
                          )
                        }
                      </span>
                    </div>
                    <TriStateToggle value={state} onChange={(newState) => setIntervention(gene, newState)} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="flex-1 flex flex-col">
          <CardHeader><CardTitle>Flux Output</CardTitle></CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-black/25 rounded-lg text-center">
                <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-1">Capture Rate</div>
                <div className="text-2xl font-semibold font-mono" style={{ color: getChromatinColor(geneStates.ATF1.chromatin) }}>
                  {Math.round(captureRate * 100)}%
                </div>
              </div>
              <div className="p-3 bg-black/25 rounded-lg text-center">
                <div className="text-[9px] uppercase tracking-wide text-slate-500 mb-1">vs Baseline</div>
                <div className={cn('text-2xl font-semibold font-mono', foldChange > 1.1 ? 'text-green-500' : 'text-slate-500')}>
                  {foldChange.toFixed(1)}×
                </div>
              </div>
            </div>

            {/* Progress bars */}
            {[
              { label: 'Product Capture', value: captureRate, width: captureWidth, color: 'from-yellow-600 to-yellow-400' },
              { label: 'Flux to Product', value: fluxToProduct / 100, width: fluxProductWidth, color: 'from-green-600 to-green-400' },
            ].map(({ label, value, width, color }) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{label}</span>
                  <span>{Math.round(value * 100)}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width }} />
                </div>
              </div>
            ))}
          </CardContent>
          
          {/* Insight banner */}
          <div className={cn(
            'px-4 py-3 text-center text-[11px] border-t border-white/[0.04]',
            interventions.ATF1 === 'activate'
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300'
              : 'bg-gradient-to-r from-amber-500/[0.08] to-orange-500/[0.08] text-amber-300'
          )}>
            {interventions.ATF1 === 'activate'
              ? '✓ ATF1 activation redirects flux to product'
              : `⚠ ${bottleneckGene} is the bottleneck — ${Math.round(geneStates[bottleneckGene].chromatin * 100)}% chromatin accessibility`}
          </div>
        </Card>
      </div>
    </div>
  );
}
