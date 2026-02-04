import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { baselineChromatin, metabolites, pathwayEdges } from '../../data';
import { getChromatinColor, useFluxSolver, usePathwayLayout } from '../../hooks';
import { useSelectionStore } from '../../stores';
import sharedStyles from '../../styles/shared.module.css';
import styles from './FluxDynamicsPage.module.css';

// Inline enzyme pill with spring-animated bar
function InlineEnzyme({ gene, x, y, chromatin = 0.5, interventions = {}, nodeConfig, chromatinBarConfig, onToggle, isBottleneck }) {
  // Spring animate the chromatin value
  const springChromatin = useSpring(chromatin, { stiffness: 180, damping: 12 });
  
  // Update spring target when chromatin prop changes
  useEffect(() => {
    springChromatin.set(chromatin);
  }, [chromatin, springChromatin]);
  
  // Color always reflects chromatin state
  const color = getChromatinColor(chromatin);
  const isActive = gene && interventions[gene] && interventions[gene] !== 'normal';
  const { width, height, rx } = nodeConfig?.enzyme || { width: 72, height: 28, rx: 14 };
  const barWidth = chromatinBarConfig?.width || 54;
  const barHeight = chromatinBarConfig?.height || 6;
  
  // Derived values from spring
  const barFillWidth = useTransform(springChromatin, v => barWidth * v);
  const glowOpacity = useTransform(springChromatin, v => Math.min(0.6, v * 0.8));
  const glowSize = useTransform(springChromatin, v => 4 + v * 8);
  const glowFilter = useTransform(glowSize, s => `drop-shadow(0 0 ${s}px ${color})`);
  
  // Early return AFTER all hooks
  if (!gene || gene === 'EXPORT') return null;
  
  return (
    <g 
      className={styles.enzymeInline} 
      onClick={(e) => { e.stopPropagation(); onToggle(gene); }}
      style={{ cursor: 'pointer' }}
    >
      {/* Bottleneck indicator - separate red outer ring */}
      {isBottleneck && (
        <rect
          x={x - width / 2 - 6}
          y={y - height / 2 - 6}
          width={width + 12}
          height={height + 12}
          rx={rx + 6}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          className={styles.enzymeBottleneckPulse}
          style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' }}
        />
      )}
      
      {/* Chromatin glow ring */}
      <motion.rect
        x={x - width / 2 - 3}
        y={y - height / 2 - 3}
        width={width + 6}
        height={height + 6}
        rx={rx + 3}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={glowOpacity}
        className={chromatin > 0.5 ? styles.enzymeGlowPulse : ''}
        style={{ filter: glowFilter }}
      />
      
      {/* Pill background */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={rx}
        className={`${styles.enzymePill} ${isActive ? styles.enzymeActive : ''}`}
        style={{ stroke: color, strokeWidth: 1.5 }}
      />
      
      {/* Gene name */}
      <text x={x} y={y - 2} className={styles.enzymeLabel} style={{ fill: color }}>
        {gene}
      </text>
      
      {/* Chromatin bar background */}
      <rect 
        x={x - barWidth / 2} 
        y={y + height / 2 - barHeight - 3} 
        width={barWidth} 
        height={barHeight} 
        rx={barHeight / 2} 
        fill="rgba(255,255,255,0.08)" 
      />
      {/* Chromatin bar fill - animated via spring */}
      <motion.rect 
        x={x - barWidth / 2} 
        y={y + height / 2 - barHeight - 3} 
        width={barFillWidth}
        height={barHeight} 
        rx={barHeight / 2} 
        fill={color}
      />
    </g>
  );
}

// Flow speed helper
function getFlowClass(chromatin, styles) {
  if (chromatin > 0.7) return styles.flowFast;
  if (chromatin > 0.3) return styles.flowMedium;
  return styles.flowSlow;
}

// Flow edge with inline enzyme - MUST be outside PathwayDiagram to preserve InlineEnzyme state
function FlowEdge({ edge, positions, geneStates, interventions, nodeConfig, arrowConfig, chromatinBarConfig, onToggle, fluxState, bottleneckGene }) {
  const fromPos = positions[edge.from];
  const toPos = positions[edge.to];
  if (!fromPos || !toPos) return null;
  
  const chromatin = geneStates[edge.gene]?.chromatin || 0.5;
  
  // For EXPORT edge: use inverse of capture rate for color AND animation
  // High waste = fast/green, low waste = slow/red
  let effectiveRate = chromatin;
  let color;
  if (edge.gene === 'EXPORT' && fluxState) {
    const productFlux = fluxState.nodeFlux.iamac || 0;
    const wasteFlux = fluxState.nodeFlux.waste || 0;
    const total = productFlux + wasteFlux;
    const wasteRatio = total > 0 ? wasteFlux / total : 0.5;
    // wasteRatio is how much goes to waste - this drives EXPORT edge
    effectiveRate = wasteRatio;
    color = getChromatinColor(wasteRatio);
  } else {
    color = getChromatinColor(chromatin);
  }
  const isActive = interventions[edge.gene] && interventions[edge.gene] !== 'normal';
  const thickness = isActive ? arrowConfig.mainThickness + 2 : arrowConfig.mainThickness;
  const nodeHeight = nodeConfig.metabolite.height;
  const padding = 12;
  
  // Vertical edge (main path) - straight through enzyme
  if (fromPos.x === toPos.x) {
    const x = fromPos.x;
    const y1 = fromPos.y + nodeHeight / 2 + padding;
    const y2 = toPos.y - nodeHeight / 2 - padding;
    const midY = (y1 + y2) / 2;
    
    return (
      <g>
        {/* Background track */}
        <line
          x1={x} y1={y1} x2={x} y2={y2}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={thickness + 4}
          strokeLinecap="round"
        />
        {/* Animated flow line */}
        <line
          x1={x} y1={y1} x2={x} y2={y2}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={arrowConfig.dashArray}
          className={getFlowClass(effectiveRate, styles)}
        />
        {/* Arrow head */}
        <polygon
          points={`${x},${y2 + 6} ${x - 5},${y2} ${x + 5},${y2}`}
          fill={color}
        />
        {/* Inline enzyme - rendered on top of flow */}
        <InlineEnzyme 
          gene={edge.gene} 
          x={x} 
          y={midY} 
          chromatin={chromatin}
          interventions={interventions}
          nodeConfig={nodeConfig}
          chromatinBarConfig={chromatinBarConfig}
          onToggle={onToggle}
          isBottleneck={edge.gene === bottleneckGene}
        />
      </g>
    );
  }
  
  // Branch edge - L-path: down, horizontal, then down into top of target
  const x1 = fromPos.x;
  const y1 = fromPos.y + nodeHeight / 2 + padding;
  const x2 = toPos.x;
  const y2 = toPos.y - nodeHeight / 2 - padding; // stop at TOP edge of target
  const midY = (y1 + y2) / 2; // horizontal segment at midpoint
  // Use same thickness as main path for consistent look
  const branchThickness = thickness;
  const enzymeMidX = (x1 + x2) / 2;
  
  // Arrow head pointing DOWN into the node
  const arrowHead = `${x2},${y2 + 6} ${x2 - 5},${y2} ${x2 + 5},${y2}`;
  
  const branchPath = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  
  return (
    <g>
      {/* L-shaped path background */}
      <path
        d={branchPath}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={branchThickness + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Animated branch line */}
      <path
        d={branchPath}
        fill="none"
        stroke={color}
        strokeWidth={branchThickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={arrowConfig.dashArray}
        className={getFlowClass(effectiveRate, styles)}
      />
      {/* Arrow head */}
      <polygon points={arrowHead} fill={color} />
      {/* Inline enzyme for branch */}
      {edge.gene !== 'EXPORT' && (
        <InlineEnzyme 
          gene={edge.gene} 
          x={enzymeMidX} 
          y={midY}
          chromatin={chromatin}
          interventions={interventions}
          nodeConfig={nodeConfig}
          chromatinBarConfig={chromatinBarConfig}
          onToggle={onToggle}
          isBottleneck={edge.gene === bottleneckGene}
        />
      )}
    </g>
  );
}

// SVG Pathway Diagram Component - Data-driven layout
function PathwayDiagram({ geneStates, fluxState, interventions, onToggle }) {
  const { 
    positions, 
    viewBoxWidth, 
    viewBoxHeight, 
    nodeConfig, 
    arrowConfig, 
    chromatinBarConfig,
    edges 
  } = usePathwayLayout();

  // Calculate bottleneck gene (lowest chromatin among controllable genes)
  const controllableGenes = ['BAT2', 'ARO10', 'ADH6', 'ATF1'];
  const bottleneckGene = controllableGenes.reduce((minGene, gene) => {
    if (!minGene) return gene;
    return geneStates[gene].chromatin < geneStates[minGene].chromatin ? gene : minGene;
  }, null);

  // Get variant class for metabolite
  const getVariant = (nodeId) => {
    const meta = metabolites[nodeId];
    if (meta.type === 'input') return 'input';
    if (meta.type === 'product') return interventions.ATF1 === 'activate' ? 'productActive' : 'product';
    if (meta.type === 'waste') return 'waste';
    return 'default';
  };

  // Get flux value for a node
  const getFlux = (nodeId) => {
    if (nodeId === 'leu') return 1.0;
    if (fluxState.nodeFlux[nodeId] !== undefined) return fluxState.nodeFlux[nodeId];
    // Find edge leading to this node
    const edge = pathwayEdges.find(e => e.to === nodeId);
    if (edge) {
      return fluxState.edgeFlux[`${edge.from}-${edge.to}`] || 0;
    }
    return 0;
  };

  // Metabolite node component
  const MetaboliteNode = ({ nodeId }) => {
    const pos = positions[nodeId];
    const meta = metabolites[nodeId];
    const flux = getFlux(nodeId);
    const variant = getVariant(nodeId);
    const { width, height, rx } = nodeConfig.metabolite;
    
    // Format flux as percentage of input
    const fluxPercent = Math.round(flux * 100);
    
    return (
      <g>
        <rect
          x={pos.x - width / 2}
          y={pos.y - height / 2}
          width={width}
          height={height}
          rx={rx}
          className={`${styles.metaboliteRect} ${styles[variant] || ''}`}
        />
        <text x={pos.x} y={pos.y + 4} className={styles.metaboliteText}>
          {meta.name}
        </text>
        {/* Flux percentage on the right side */}
        <text 
          x={pos.x + width / 2 + 8} 
          y={pos.y + 4} 
          className={styles.fluxPercent}
        >
          {fluxPercent}%
        </text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className={styles.pathwaySvg}>
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
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Title */}
      <text x={viewBoxWidth / 2} y="40" className={styles.diagramTitle}>Ehrlich Pathway</text>

      {/* Render all edges with inline enzymes */}
      {pathwayEdges.map((edge, i) => (
        <FlowEdge 
          key={`${edge.from}-${edge.to}`} 
          edge={edge}
          positions={positions}
          geneStates={geneStates}
          interventions={interventions}
          nodeConfig={nodeConfig}
          arrowConfig={arrowConfig}
          chromatinBarConfig={chromatinBarConfig}
          onToggle={onToggle}
          fluxState={fluxState}
          bottleneckGene={bottleneckGene}
        />
      ))}

      {/* Render all metabolite nodes */}
      {Object.keys(positions).map(nodeId => (
        <MetaboliteNode key={nodeId} nodeId={nodeId} />
      ))}
    </svg>
  );
}

// 3-position segmented control: repress | normal | activate
function TriStateToggle({ value, onChange }) {
  return (
    <div className={styles.triToggle}>
      <button 
        className={`${styles.triToggleBtn} ${value === 'repress' ? `${styles.triToggleActive} ${styles.triToggleRepress}` : ''}`}
        onClick={(e) => { e.stopPropagation(); onChange('repress'); }}
        title="Repression"
      >
        −
      </button>
      <button 
        className={`${styles.triToggleBtn} ${value === 'normal' ? `${styles.triToggleActive} ${styles.triToggleNormal}` : ''}`}
        onClick={(e) => { e.stopPropagation(); onChange('normal'); }}
        title="No Intervention"
      >
        ○
      </button>
      <button 
        className={`${styles.triToggleBtn} ${value === 'activate' ? `${styles.triToggleActive} ${styles.triToggleActivate}` : ''}`}
        onClick={(e) => { e.stopPropagation(); onChange('activate'); }}
        title="Activation"
      >
        +
      </button>
    </div>
  );
}

export function FluxDynamicsPage() {
  // Get interventions from global store
  const interventions = useSelectionStore((state) => state.interventions);
  const setIntervention = useSelectionStore((state) => state.setIntervention);
  const resetInterventions = useSelectionStore((state) => state.resetInterventions);

  const { geneStates, fluxState, baselineFlux } = useFluxSolver(interventions);

  // Legacy toggle for pathway diagram clicks - cycles through states
  const toggleIntervention = (gene) => {
    const current = interventions[gene];
    const next = current === 'normal' ? 'activate' : current === 'activate' ? 'repress' : 'normal';
    setIntervention(gene, next);
  };

  const captureRate = fluxState.nodeFlux.iamac / (fluxState.nodeFlux.iamac + fluxState.nodeFlux.waste);
  const foldChange = fluxState.nodeFlux.iamac / baselineFlux.nodeFlux.iamac;
  
  // Flux to product as % of input (leucine = 1.0)
  const fluxToProduct = (fluxState.nodeFlux.iamac || 0) * 100;

  // Spring animate the capture rate for smooth bar transitions
  const springCapture = useSpring(captureRate * 100, { stiffness: 120, damping: 20 });
  useEffect(() => {
    springCapture.set(captureRate * 100);
  }, [captureRate, springCapture]);
  
  // Spring animate flux to product
  const springFluxProduct = useSpring(fluxToProduct, { stiffness: 120, damping: 20 });
  useEffect(() => {
    springFluxProduct.set(fluxToProduct);
  }, [fluxToProduct, springFluxProduct]);
  
  // Transform spring values to CSS width strings
  const captureWidth = useTransform(springCapture, v => `${v}%`);
  const fluxProductWidth = useTransform(springFluxProduct, v => `${v}%`);

  const genes = ['BAT2', 'ARO10', 'ADH6', 'ATF1'];

  // Calculate bottleneck gene (lowest chromatin)
  const bottleneckGene = genes.reduce((minGene, gene) => {
    if (!minGene) return gene;
    return geneStates[gene].chromatin < geneStates[minGene].chromatin ? gene : minGene;
  }, null);

  // Check if any interventions are active
  const hasActiveInterventions = genes.some(g => interventions[g] !== 'normal');

  return (
    <div className={styles.container}>
        {/* Pathway Visualization */}
        <div className={`${styles.card} ${styles.pathwayCard}`}>
          <PathwayDiagram
            geneStates={geneStates}
            fluxState={fluxState}
            interventions={interventions}
            onToggle={toggleIntervention}
          />
        </div>

        {/* Control Panel */}
        <div className={styles.controlStack}>
          {/* Interventions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>CRISPR Interventions</span>
              <button 
                className={styles.resetBtn} 
                onClick={resetInterventions}
                style={{ visibility: hasActiveInterventions ? 'visible' : 'hidden' }}
              >
                Reset
              </button>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardDescription}>
                Simulate activation (+) or repression (−) 
                to modify chromatin accessibility and redirect metabolic flux.
              </p>
              <div className={styles.interventionList}>
                {genes.map(gene => {
                  const state = interventions[gene];
                  const currentChromatin = geneStates[gene].chromatin;
                  const baseline = baselineChromatin[gene];
                  const delta = Math.round((currentChromatin - baseline) * 100);
                  const deltaSign = delta > 0 ? '+' : '';
                  
                  return (
                    <div 
                      key={gene}
                      className={`${styles.interventionRow} ${sharedStyles.selectable} ${state !== 'normal' ? styles.active : ''}`}
                    >
                      <div className={styles.interventionInfo}>
                        <span 
                          className={styles.interventionGene}
                          style={{ color: getChromatinColor(currentChromatin) }}
                        >
                          {gene}
                        </span>
                        <span className={styles.interventionMeta}>
                          {state === 'normal' 
                            ? `${Math.round(baseline * 100)}% accessible`
                            : (
                              <>
                                {Math.round(baseline * 100)}% → {Math.round(currentChromatin * 100)}%
                                <span style={{ color: delta > 0 ? '#22c55e' : '#ef4444', marginLeft: 4 }}>
                                  ({deltaSign}{delta}%)
                                </span>
                              </>
                            )
                          }
                        </span>
                      </div>
                      <TriStateToggle 
                        value={state} 
                        onChange={(newState) => setIntervention(gene, newState)} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Flux Output</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.resultsGrid}>
                <div className={styles.resultCard}>
                  <div className={styles.resultLabel}>Capture Rate</div>
                  <div 
                    className={styles.resultValue}
                    style={{ color: getChromatinColor(geneStates.ATF1.chromatin) }}
                  >
                    {Math.round(captureRate * 100)}%
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.resultLabel}>vs Baseline</div>
                  <div 
                    className={styles.resultValue}
                    style={{ color: foldChange > 1.1 ? '#22c55e' : '#64748b' }}
                  >
                    {foldChange.toFixed(1)}×
                  </div>
                </div>
              </div>

              <div className={styles.captureSection}>
                <div className={styles.captureHeader}>
                  <span>Product Capture</span>
                  <span>{Math.round(captureRate * 100)}%</span>
                </div>
                <div className={styles.captureBar}>
                  <motion.div 
                    className={styles.captureProduct}
                    style={{ width: captureWidth }}
                  />
                </div>
                <div className={styles.captureLabels}>
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className={styles.captureSection}>
                <div className={styles.captureHeader}>
                  <span>Flux to Product</span>
                  <span>{Math.round(fluxToProduct)}%</span>
                </div>
                <div className={styles.captureBar}>
                  <motion.div 
                    className={styles.fluxProductBar}
                    style={{ width: fluxProductWidth }}
                  />
                </div>
                <div className={styles.captureLabels}>
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div className={`${styles.insightBanner} ${interventions.ATF1 === 'activate' ? styles.success : ''}`}>
              {interventions.ATF1 === 'activate'
                ? '✓ ATF1 activation redirects flux to product'
                : `⚠ ${bottleneckGene} is the bottleneck — ${Math.round(geneStates[bottleneckGene].chromatin * 100)}% chromatin accessibility`}
            </div>
          </div>
        </div>
      </div>
  );
}
