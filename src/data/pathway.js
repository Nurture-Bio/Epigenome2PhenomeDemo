/**
 * Ehrlich pathway data for isoamyl acetate biosynthesis
 * Chromatin accessibility from ATAC-seq integration
 */

// Baseline chromatin states (from ATAC-seq data)
export const baselineChromatin = {
  BAT2: 0.65,
  ARO10: 0.72,
  ADH6: 0.68,
  ATF1: 0.06,  // THE BOTTLENECK
  EXPORT: 0.30,
};

// Predicted chromatin after repression
export const repressedChromatin = {
  BAT2: 0.18,   // -47% (significant reduction)
  ARO10: 0.20,  // -52% (significant reduction)
  ADH6: 0.15,   // -53% (significant reduction)
  ATF1: 0.02,   // -4% (already nearly closed)
  EXPORT: 0.30, // passive export, not controllable
};

// Predicted chromatin after activation
export const activatedChromatin = {
  BAT2: 0.88,   // +23% (marginal gain, already open)
  ARO10: 0.91,  // +19% (marginal gain)
  ADH6: 0.85,   // +17% (marginal gain)
  ATF1: 0.70,   // +64% (HUGE gain, was closed!)
  EXPORT: 0.30, // passive export, not controllable
};

// Gene metadata
export const geneMetadata = {
  BAT2: { 
    name: 'branched-chain aminotransferase', 
    yorf: 'YJR148W',
    ec: '2.6.1.42'
  },
  ARO10: { 
    name: 'phenylpyruvate decarboxylase', 
    yorf: 'YDR380W',
    ec: '4.1.1.43'
  },
  ADH6: { 
    name: 'alcohol dehydrogenase', 
    yorf: 'YMR318C',
    ec: '1.1.1.1'
  },
  ATF1: { 
    name: 'alcohol acetyltransferase', 
    yorf: 'YOR377W',
    ec: '2.3.1.84'
  },
  EXPORT: { 
    name: 'passive export', 
    yorf: null, 
    passive: true 
  },
};

// Pathway metabolites
export const metabolites = {
  leu: { name: 'L-Leucine', short: 'Leu', type: 'input' },
  kic: { name: 'α-ketoisocaproate', short: 'KIC', type: 'intermediate' },
  mbal: { name: '3-methylbutanal', short: '3-MB-al', type: 'intermediate' },
  iamoh: { name: 'isoamylol', short: 'IAM-OH', type: 'branch' },
  iamac: { name: 'isoamyl acetate', short: 'IAM-Ac', type: 'product' },
  waste: { name: 'fusel alcohol export', short: 'waste', type: 'waste' },
};

// Pathway edges (network topology)
export const pathwayEdges = [
  { from: 'leu', to: 'kic', gene: 'BAT2' },
  { from: 'kic', to: 'mbal', gene: 'ARO10' },
  { from: 'mbal', to: 'iamoh', gene: 'ADH6' },
  { from: 'iamoh', to: 'iamac', gene: 'ATF1' },    // branch A: product
  { from: 'iamoh', to: 'waste', gene: 'EXPORT' },  // branch B: waste
];

// Epigenome layer definitions (ordered from simple to complex)
export const epigenomeLayers = [
  { 
    name: 'Transcription', 
    source: 'RNA-seq', 
    color: '#22c55e', 
    question: 'Is the gene being transcribed?' 
  },
  { 
    name: 'Histone Modifications', 
    source: 'ChIP-seq', 
    color: '#06b6d4', 
    question: 'What is the activation state?' 
  },
  { 
    name: 'Chromatin Accessibility', 
    source: 'ATAC-seq', 
    color: '#f472b6', 
    question: 'Is the DNA physically accessible?' 
  },
  { 
    name: '3D Chromatin Structure', 
    source: 'Hi-C', 
    color: '#8b5cf6', 
    question: 'Does the promoter contact enhancers?' 
  },
];

// Bottleneck analysis data for epigenome page
export const bottleneckGenes = [
  { gene: 'YAL054C', name: 'ACS1', pct: 93, role: 'Acetyl-CoA synthetase' },
  { gene: 'YDL080C', name: 'PDC1', pct: 72, role: 'Pyruvate decarboxylase' },
  { gene: 'YDL168W', name: 'ADH1', pct: 69, role: 'Alcohol dehydrogenase' },
  { gene: 'YOR377W', name: 'ATF1', pct: 6, role: 'Alcohol acetyltransferase', highlight: true },
];
