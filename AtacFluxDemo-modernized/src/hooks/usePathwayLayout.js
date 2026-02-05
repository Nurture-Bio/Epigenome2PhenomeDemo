import { useMemo } from 'react';
import { metabolites, pathwayEdges } from '../data';
import { computeLayout, getEdgePath, layoutConfig } from '../data/pathwayLayout';

/**
 * Hook that computes pathway layout from data
 * Returns positions, dimensions, and helper functions for rendering
 */
export function usePathwayLayout() {
  const layout = useMemo(() => {
    return computeLayout(metabolites, pathwayEdges, layoutConfig);
  }, []);

  const config = layoutConfig;

  // Helper to get edge rendering data
  const getEdgeData = useMemo(() => {
    return (fromId, toId) => {
      const fromPos = layout.positions[fromId];
      const toPos = layout.positions[toId];
      if (!fromPos || !toPos) return null;
      return getEdgePath(fromPos, toPos, config.nodes.metabolite.height, config);
    };
  }, [layout, config]);

  // Get all renderable edges with their positions
  const edges = useMemo(() => {
    return pathwayEdges.map(edge => {
      const edgeData = getEdgeData(edge.from, edge.to);
      const enzymePos = layout.enzymePositions[edge.gene];
      return {
        ...edge,
        ...edgeData,
        enzymePosition: enzymePos
      };
    }).filter(e => e !== null);
  }, [getEdgeData, layout.enzymePositions]);

  return {
    // Layout data
    positions: layout.positions,
    enzymePositions: layout.enzymePositions,
    mainPath: layout.mainPath,
    branchNodes: layout.branchNodes,
    
    // Dimensions
    viewBoxWidth: layout.viewBoxWidth,
    viewBoxHeight: layout.viewBoxHeight,
    
    // Config values for rendering
    nodeConfig: config.nodes,
    arrowConfig: config.arrows,
    chromatinBarConfig: config.chromatinBar,
    
    // Computed edges
    edges,
    
    // Raw config for custom use
    config
  };
}
