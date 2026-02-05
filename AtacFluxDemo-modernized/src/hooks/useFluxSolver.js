import { useCallback, useMemo } from 'react';
import {
    activatedChromatin,
    baselineChromatin,
    geneMetadata,
    pathwayEdges,
    repressedChromatin
} from '../data';

// Helper to get chromatin value based on intervention state
function getChromatin(gene, state) {
  if (state === 'activate') return activatedChromatin[gene];
  if (state === 'repress') return repressedChromatin[gene];
  return baselineChromatin[gene];
}

/**
 * Hook for computing metabolic flux through the Ehrlich pathway
 * based on chromatin accessibility states
 */
export function useFluxSolver(interventions) {
  // Compute gene states based on current interventions
  const geneStates = useMemo(() => ({
    BAT2: { 
      chromatin: getChromatin('BAT2', interventions.BAT2),
      ...geneMetadata.BAT2
    },
    ARO10: { 
      chromatin: getChromatin('ARO10', interventions.ARO10),
      ...geneMetadata.ARO10
    },
    ADH6: { 
      chromatin: getChromatin('ADH6', interventions.ADH6),
      ...geneMetadata.ADH6
    },
    ATF1: { 
      chromatin: getChromatin('ATF1', interventions.ATF1),
      ...geneMetadata.ATF1
    },
    EXPORT: { 
      chromatin: baselineChromatin.EXPORT,
      ...geneMetadata.EXPORT
    },
  }), [interventions]);

  // Flux solver - propagates flux through network
  const solveFlux = useCallback((geneStatesInput, inputFlux = 1.0) => {
    const nodeFlux = { leu: inputFlux };
    const edgeFlux = {};
    
    // Group edges by source node
    const outgoing = {};
    pathwayEdges.forEach(e => {
      if (!outgoing[e.from]) outgoing[e.from] = [];
      outgoing[e.from].push(e);
    });
    
    // Process nodes in topological order
    const order = ['leu', 'kic', 'mbal', 'iamoh'];
    
    order.forEach(node => {
      const flux = nodeFlux[node] || 0;
      const exits = outgoing[node] || [];
      
      if (exits.length === 0) return;
      
      if (exits.length === 1) {
        // Single exit: chromatin LIMITS throughput
        const e = exits[0];
        const rate = geneStatesInput[e.gene].chromatin;
        const edgeF = flux * rate;
        edgeFlux[`${e.from}-${e.to}`] = edgeF;
        nodeFlux[e.to] = (nodeFlux[e.to] || 0) + edgeF;
      } else {
        // Multiple exits (branch): chromatin determines SPLIT
        const totalRate = exits.reduce((sum, e) => 
          sum + geneStatesInput[e.gene].chromatin, 0);
        
        exits.forEach(e => {
          const rate = geneStatesInput[e.gene].chromatin;
          const edgeF = flux * (rate / totalRate);
          edgeFlux[`${e.from}-${e.to}`] = edgeF;
          nodeFlux[e.to] = (nodeFlux[e.to] || 0) + edgeF;
        });
      }
    });
    
    return { nodeFlux, edgeFlux };
  }, []);

  // Calculate current flux state
  const fluxState = useMemo(() => 
    solveFlux(geneStates), 
    [solveFlux, geneStates]
  );

  // Calculate baseline flux (no interventions) for comparison
  const baselineGeneStates = useMemo(() => ({
    BAT2: { chromatin: baselineChromatin.BAT2 },
    ARO10: { chromatin: baselineChromatin.ARO10 },
    ADH6: { chromatin: baselineChromatin.ADH6 },
    ATF1: { chromatin: baselineChromatin.ATF1 },
    EXPORT: { chromatin: baselineChromatin.EXPORT },
  }), []);

  const baselineFlux = useMemo(() => 
    solveFlux(baselineGeneStates), 
    [solveFlux, baselineGeneStates]
  );

  return {
    geneStates,
    fluxState,
    baselineFlux,
    solveFlux
  };
}

// Helper functions for visualization
export function getChromatinColor(chromatin) {
  if (chromatin >= 0.6) return '#22c55e'; // green - open
  if (chromatin >= 0.4) return '#3b82f6'; // blue - moderate
  if (chromatin >= 0.2) return '#f97316'; // orange - restricted
  return '#ef4444'; // red - closed
}

export function getFlowSpeed(chromatin) {
  if (chromatin >= 0.6) return 'flow-animate-fast';
  if (chromatin >= 0.3) return 'flow-animate';
  return 'flow-animate-slow';
}

export function getFluxSpeed(flux) {
  if (flux >= 0.15) return 'flow-animate-fast';
  if (flux >= 0.08) return 'flow-animate';
  return 'flow-animate-slow';
}

export function getFluxColor(chromatin) {
  if (chromatin < 0.2) return '#ef4444';  // red - severely restricted
  if (chromatin < 0.4) return '#f97316';  // orange - restricted
  if (chromatin < 0.6) return '#eab308';  // yellow - moderate
  if (chromatin < 0.8) return '#22c55e';  // green - good
  return '#10b981';                        // emerald - excellent
}

export function getFluxWidth(flux) {
  return Math.max(2, Math.min(8, flux * 12));
}
