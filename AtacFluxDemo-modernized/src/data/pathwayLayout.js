/**
 * Layout configuration for pathway visualization
 * All positions are computed from these configs + data
 */

export const layoutConfig = {
  // SVG dimensions
  viewBox: {
    width: 420,
    baseHeight: 650,
    padding: { top: 70, bottom: 50, left: 40, right: 40 }
  },
  
  // Column positions as fractions of width
  columns: {
    main: 0.5,      // center column for main pathway
    product: 0.82,  // right side for product
    waste: 0.18     // left side for waste
  },
  
  // Node dimensions
  nodes: {
    metabolite: {
      width: 130,
      height: 42,
      rx: 8
    },
    enzyme: {
      width: 72,
      height: 28,
      rx: 14  // pill shape
    }
  },
  
  // Spacing
  spacing: {
    nodeGap: 130,           // vertical gap between metabolite nodes (increased for inline enzymes)
    branchGap: 60,          // additional gap before branch nodes
    arrowPadding: 14,       // padding between node edge and arrow
    enzymeOverlap: 0        // enzyme sits on the arrow
  },
  
  // Flow arrows
  arrows: {
    mainThickness: 4,
    branchThickness: 3,
    dashArray: '6 5',
    arrowHeadSize: 5
  },
  
  // Chromatin bar
  chromatinBar: {
    width: 54,
    height: 6
  }
};

/**
 * Compute layout positions from pathway data
 * @param {Object} metabolites - metabolite definitions
 * @param {Array} edges - pathway edges
 * @param {Object} config - layout config
 */
export function computeLayout(metabolites, edges, config = layoutConfig) {
  const { viewBox, columns, nodes, spacing } = config;
  
  // Build adjacency for traversal
  const outgoing = {};
  const incoming = {};
  edges.forEach(e => {
    if (!outgoing[e.from]) outgoing[e.from] = [];
    if (!incoming[e.to]) incoming[e.to] = [];
    outgoing[e.from].push(e);
    incoming[e.to].push(e);
  });
  
  // Find main path (nodes with single in/out, or start/end)
  const mainPath = [];
  const visited = new Set();
  
  // Find input node (no incoming)
  const inputNode = Object.keys(metabolites).find(
    id => metabolites[id].type === 'input'
  );
  
  // Walk main path until branch
  let current = inputNode;
  while (current && !visited.has(current)) {
    visited.add(current);
    mainPath.push(current);
    
    const exits = outgoing[current] || [];
    if (exits.length === 1) {
      current = exits[0].to;
    } else if (exits.length > 1) {
      // Branch point - add it but stop main path traversal
      break;
    } else {
      current = null;
    }
  }
  
  // Find branch nodes (product/waste that aren't in main path)
  const branchNodes = Object.keys(metabolites).filter(
    id => !mainPath.includes(id)
  );
  
  // Compute positions
  const positions = {};
  const startY = viewBox.padding.top + nodes.metabolite.height / 2;
  
  // Main path - vertical layout
  mainPath.forEach((nodeId, i) => {
    positions[nodeId] = {
      x: viewBox.width * columns.main,
      y: startY + i * spacing.nodeGap
    };
  });
  
  // Branch nodes - horizontal from last main path node
  const branchY = positions[mainPath[mainPath.length - 1]].y + spacing.nodeGap + spacing.branchGap;
  
  branchNodes.forEach(nodeId => {
    const meta = metabolites[nodeId];
    if (meta.type === 'product') {
      positions[nodeId] = {
        x: viewBox.width * columns.product,
        y: branchY
      };
    } else if (meta.type === 'waste') {
      positions[nodeId] = {
        x: viewBox.width * columns.waste,
        y: branchY
      };
    }
  });
  
  // Compute enzyme positions (midpoint of their edge)
  const enzymePositions = {};
  edges.forEach(edge => {
    if (!edge.gene || !positions[edge.from] || !positions[edge.to]) return;
    
    const fromPos = positions[edge.from];
    const toPos = positions[edge.to];
    
    // For main path (vertical), enzyme is centered on the line
    if (fromPos.x === toPos.x) {
      enzymePositions[edge.gene] = {
        x: fromPos.x,
        y: (fromPos.y + toPos.y) / 2,
        isMainPath: true
      };
    } else {
      // For branches (horizontal), place enzyme along the path
      enzymePositions[edge.gene] = {
        x: (fromPos.x + toPos.x) / 2,
        y: (fromPos.y + toPos.y) / 2 + 30,
        isMainPath: false
      };
    }
  });
  
  // Compute dynamic viewBox height
  const maxY = Math.max(...Object.values(positions).map(p => p.y));
  const viewBoxHeight = maxY + viewBox.padding.bottom + nodes.metabolite.height;
  
  return {
    positions,
    enzymePositions,
    mainPath,
    branchNodes,
    viewBoxWidth: viewBox.width,
    viewBoxHeight,
    branchY
  };
}

/**
 * Get edge path data between two nodes
 */
export function getEdgePath(fromPos, toPos, nodeHeight, config = layoutConfig) {
  const padding = config.spacing.arrowPadding;
  
  if (fromPos.x === toPos.x) {
    // Vertical edge
    return {
      x1: fromPos.x,
      y1: fromPos.y + nodeHeight / 2 + padding,
      x2: toPos.x,
      y2: toPos.y - nodeHeight / 2 - padding,
      type: 'vertical'
    };
  } else {
    // Horizontal branch - L-shaped path
    const midY = fromPos.y + (toPos.y - fromPos.y) * 0.4;
    return {
      path: `M ${fromPos.x} ${fromPos.y + nodeHeight / 2 + padding} 
             L ${fromPos.x} ${midY} 
             L ${toPos.x} ${toPos.y}`,
      endX: toPos.x,
      endY: toPos.y,
      type: 'branch'
    };
  }
}
