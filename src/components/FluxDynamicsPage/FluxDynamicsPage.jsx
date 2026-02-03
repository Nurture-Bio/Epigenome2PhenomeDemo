import { useEffect, useRef, useState } from 'react';
import { baselineChromatin, interventionChromatin, metabolites, pathwayEdges } from '../../data';
import { getChromatinColor, useFluxSolver, usePathwayLayout } from '../../hooks';
import styles from './FluxDynamicsPage.module.css';

// Spring physics for smooth animation
function useSpringValue(target, config = { stiffness: 120, damping: 14 }) {
  const [value, setValue] = useState(target);
  const velocity = useRef(0);
  const currentValue = useRef(target);
  const animationRef = useRef(null);
  const targetRef = useRef(target);
  
  useEffect(() => {
    targetRef.current = target;
    
    const animate = () => {
      const { stiffness, damping } = config;
      const displacement = targetRef.current - currentValue.current;
      const springForce = displacement * stiffness;
      const dampingForce = velocity.current * damping;
      const acceleration = springForce - dampingForce;
      
      velocity.current += acceleration * 0.016; // ~60fps
      currentValue.current += velocity.current * 0.016;
      
      setValue(currentValue.current);
      
      // Continue if not settled
      if (Math.abs(displacement) > 0.001 || Math.abs(velocity.current) > 0.001) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        currentValue.current = targetRef.current;
        setValue(targetRef.current);
      }
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, config.stiffness, config.damping]);
  
  return value;
}

// Inline enzyme pill with spring-animated bar
function InlineEnzyme({ gene, x, y, chromatin, interventions, nodeConfig, chromatinBarConfig, onToggle }) {
  // Spring animate the chromatin value
  const animatedChromatin = useSpringValue(chromatin, { stiffness: 180, damping: 12 });
  
  if (!gene || gene === 'EXPORT') return null;
  
  const color = getChromatinColor(animatedChromatin);
  const isActive = interventions[gene];
  const isBottleneck = !isActive && chromatin < 0.2;
  const { width, height, rx } = nodeConfig.enzyme;
  const barWidth = chromatinBarConfig.width;
  const barHeight = chromatinBarConfig.height;
  
  // Glow intensity based on chromatin
  const glowOpacity = Math.min(0.6, animatedChromatin * 0.8);
  const glowSize = 4 + animatedChromatin * 8;
  
  return (
    <g 
      className={styles.enzymeInline} 
      onClick={(e) => { e.stopPropagation(); onToggle(gene); }}
      style={{ cursor: 'pointer' }}
    >
      {/* Outer glow ring */}
      <rect
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
        style={{ filter: `drop-shadow(0 0 ${glowSize}px ${color})` }}
      />
      
      {/* Pill background */}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={rx}
        className={`${styles.enzymePill} ${isActive ? styles.enzymeActive : ''} ${isBottleneck ? styles.enzymeBottleneck : ''}`}
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
      <rect 
        x={x - barWidth / 2} 
        y={y + height / 2 - barHeight - 3} 
        width={barWidth * animatedChromatin}
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
function FlowEdge({ edge, positions, geneStates, interventions, nodeConfig, arrowConfig, chromatinBarConfig, onToggle }) {
  const fromPos = positions[edge.from];
  const toPos = positions[edge.to];
  if (!fromPos || !toPos) return null;
  
  const chromatin = geneStates[edge.gene]?.chromatin || 0.5;
  const color = getChromatinColor(chromatin);
  const isActive = interventions[edge.gene];
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
          className={getFlowClass(chromatin, styles)}
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
        />
      </g>
    );
  }
  
  // Branch edge (horizontal) - simple L-path
  const x1 = fromPos.x;
  const y1 = fromPos.y + nodeHeight / 2 + padding;
  const midY = fromPos.y + (toPos.y - fromPos.y) * 0.5;
  const x2 = toPos.x;
  const y2 = toPos.y;
  const branchThickness = isActive ? arrowConfig.branchThickness + 2 : arrowConfig.branchThickness;
  const enzymeMidX = (x1 + x2) / 2;
  
  // Determine arrow direction
  const isRight = x2 > x1;
  const arrowHead = isRight
    ? `${x2 - 8},${y2} ${x2 - 14},${y2 - 4} ${x2 - 14},${y2 + 4}`
    : `${x2 + 8},${y2} ${x2 + 14},${y2 - 4} ${x2 + 14},${y2 + 4}`;
  
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
        className={getFlowClass(chromatin, styles)}
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

  // Get variant class for metabolite
  const getVariant = (nodeId) => {
    const meta = metabolites[nodeId];
    if (meta.type === 'input') return 'input';
    if (meta.type === 'product') return interventions.ATF1 ? 'productActive' : 'product';
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
        <text x={pos.x} y={pos.y - 2} className={styles.metaboliteText}>
          {meta.name}
        </text>
        <text x={pos.x} y={pos.y + 14} className={styles.fluxText}>
          {flux.toFixed(3)}
        </text>
      </g>
    );
  };

  // Labels for product/waste
  const EndpointLabel = ({ nodeId, label }) => {
    const pos = positions[nodeId];
    if (!pos) return null;
    const isProduct = metabolites[nodeId]?.type === 'product';
    
    return (
      <text 
        x={pos.x} 
        y={pos.y - nodeConfig.metabolite.height / 2 - 12} 
        className={isProduct ? styles.productLabel : styles.wasteLabel}
      >
        {label}
      </text>
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
          <stop offset="0%" stopColor={interventions.ATF1 ? "rgba(34, 197, 94, 0.25)" : "rgba(250, 204, 21, 0.2)"} />
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
        />
      ))}

      {/* Render all metabolite nodes */}
      {Object.keys(positions).map(nodeId => (
        <MetaboliteNode key={nodeId} nodeId={nodeId} />
      ))}

      {/* Endpoint labels */}
      <EndpointLabel nodeId="iamac" label="PRODUCT" />
      <EndpointLabel nodeId="waste" label="LOSS" />

      {/* Legend */}
      <g transform={`translate(${viewBoxWidth - 120}, 60)`}>
        <text x="0" y="0" className={styles.legendTitle}>Chromatin</text>
        <circle cx="10" cy="18" r="6" fill="#22c55e" />
        <text x="22" y="22" className={styles.legendText}>Open</text>
        <circle cx="10" cy="38" r="6" fill="#f97316" />
        <text x="22" y="42" className={styles.legendText}>Partial</text>
        <circle cx="10" cy="58" r="6" fill="#ef4444" />
        <text x="22" y="62" className={styles.legendText}>Closed</text>
      </g>
    </svg>
  );
}

function Toggle({ isOn }) {
  return (
    <div className={`${styles.toggle} ${isOn ? styles.on : ''}`}>
      <div className={styles.toggleKnob} />
    </div>
  );
}

export function FluxDynamicsPage() {
  const [interventions, setInterventions] = useState({
    BAT2: false,
    ARO10: false,
    ADH6: false,
    ATF1: false,
  });

  const { geneStates, fluxState, baselineFlux } = useFluxSolver(interventions);

  const toggleIntervention = (gene) => {
    setInterventions(prev => ({ ...prev, [gene]: !prev[gene] }));
  };

  const captureRate = fluxState.nodeFlux.iamac / (fluxState.nodeFlux.iamac + fluxState.nodeFlux.waste);
  const foldChange = fluxState.nodeFlux.iamac / baselineFlux.nodeFlux.iamac;

  const genes = ['BAT2', 'ARO10', 'ADH6', 'ATF1'];

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
              <span className={styles.cardTitle}>Interventions</span>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.interventionList}>
                {genes.map(gene => {
                  const delta = Math.round((interventionChromatin[gene] - baselineChromatin[gene]) * 100);
                  return (
                    <div 
                      key={gene}
                      className={`${styles.interventionRow} ${interventions[gene] ? styles.active : ''}`}
                      onClick={() => toggleIntervention(gene)}
                    >
                      <div className={styles.interventionInfo}>
                        <span 
                          className={styles.interventionGene}
                          style={{ color: getChromatinColor(geneStates[gene].chromatin) }}
                        >
                          {gene}
                        </span>
                        <span className={styles.interventionMeta}>
                          {Math.round(baselineChromatin[gene] * 100)}% → <span>{Math.round(interventionChromatin[gene] * 100)}%</span> (+{delta}%)
                        </span>
                      </div>
                      <Toggle isOn={interventions[gene]} />
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
                  <span>Product vs Waste</span>
                  <span>{(fluxState.nodeFlux.iamac || 0).toFixed(3)} : {(fluxState.nodeFlux.waste || 0).toFixed(3)}</span>
                </div>
                <div className={styles.captureBar}>
                  <div 
                    className={styles.captureProduct}
                    style={{ width: `${captureRate * 100}%` }}
                  />
                  <div 
                    className={styles.captureWaste}
                    style={{ width: `${(1 - captureRate) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className={`${styles.insightBanner} ${interventions.ATF1 ? styles.success : ''}`}>
              {interventions.ATF1 
                ? '✓ ATF1 activation redirects flux to product'
                : '⚠ ATF1 is the bottleneck — most flux lost to waste'}
            </div>
          </div>
        </div>
      </div>
  );
}
