import { create } from 'zustand';

/**
 * Global selection state for cross-component coordination.
 * Tracks selected epigenome layer, gene, reaction, and guide interventions.
 */
export const useSelectionStore = create((set, get) => ({
  // Selection state
  selectedLayer: null,       // e.g., 'ATAC-seq', 'Hi-C', 'ChIP-seq', 'RNA-seq'
  selectedGene: null,        // e.g., 'ATF1', 'BAT2'
  selectedReaction: null, // Default to first reaction

  // Layer loading states: 'idle' | 'loading' | 'loaded'
  layerLoadStates: {
    'Hi-C': 'idle',
    'ATAC-seq': 'idle',
    'ChIP-seq': 'idle',
    'RNA-seq': 'idle',
  },

  // Convergence state: 'idle' | 'converging' | 'converged'
  convergenceState: 'idle',
  convergenceTypingComplete: false,

  // Intervention state: 'repress' | 'normal' | 'activate'
  interventions: {
    BAT2: 'normal',
    ARO10: 'normal',
    ADH6: 'normal',
    ATF1: 'normal',
  },

  // Actions - toggle behavior (click again to deselect)
  selectLayer: (layer) => set((state) => ({
    selectedLayer: state.selectedLayer === layer ? null : layer,
  })),

  selectGene: (gene) => set((state) => ({
    selectedGene: state.selectedGene === gene ? null : gene,
  })),

  selectReaction: (reaction) => set((state) => ({
    selectedReaction: state.selectedReaction === reaction ? null : reaction,
  })),

  // Layer loading actions
  setLayerLoading: (source) => set((state) => ({
    layerLoadStates: { ...state.layerLoadStates, [source]: 'loading' },
  })),

  setLayerLoaded: (source) => set((state) => ({
    layerLoadStates: { ...state.layerLoadStates, [source]: 'loaded' },
    selectedLayer: source, // Auto-select when loaded
  })),

  // Convergence actions
  setConverging: () => set({ convergenceState: 'converging' }),
  setConverged: () => set({ convergenceState: 'converged', selectedLayer: 'convergence' }),
  setConvergenceTypingComplete: () => set({ convergenceTypingComplete: true }),

  // Set intervention for a specific gene
  setIntervention: (gene, state) => set((prev) => ({
    interventions: { ...prev.interventions, [gene]: state },
  })),

  // Reset all interventions to normal
  resetInterventions: () => set({
    interventions: {
      BAT2: 'normal',
      ARO10: 'normal',
      ADH6: 'normal',
      ATF1: 'normal',
    },
  }),

  // Clear all selections
  clearSelection: () => set({
    selectedLayer: null,
    selectedGene: null,
    selectedReaction: null,
  }),
}));
