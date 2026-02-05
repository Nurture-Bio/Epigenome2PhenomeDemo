// Pathway definition - this is all you need to define a new pathway
// The component will handle layout and rendering automatically

export const ehrlichPathway = {
  id: 'ehrlich',
  name: 'Ehrlich Pathway',
  description: 'Leucine to isoamyl acetate (banana flavor)',
  
  // Metabolites (nodes)
  metabolites: {
    leu:   { name: 'Leucine',         type: 'input' },
    kic:   { name: 'KIC',             type: 'intermediate' },
    iamoh: { name: 'Isoamyl-OH',      type: 'intermediate' },
    iamac: { name: 'Isoamyl acetate', type: 'product' },
    waste: { name: 'Waste',           type: 'waste' },
  },
  
  // Reactions (edges) - enzyme connects source to target
  reactions: [
    { id: 'r1', from: 'leu',   to: 'kic',   gene: 'BAT2'  },
    { id: 'r2', from: 'kic',   to: 'iamoh', gene: 'ARO10' },
    { id: 'r3', from: 'iamoh', to: 'iamac', gene: 'ATF1'  },
    { id: 'r4', from: 'iamoh', to: 'waste', gene: null    }, // spontaneous/export
  ],
  
  // Baseline chromatin accessibility (epigenetic state)
  baselineChromatin: {
    BAT2:  0.18,
    ARO10: 0.65,
    ATF1:  0.06,
  },
  
  // Intervention effects (how much chromatin changes)
  interventionEffects: {
    activate: 0.64,  // VPR adds this much
    repress: -0.30,  // KRAB subtracts this much
  },
};

// Example: A different pathway you could add later
export const shikimatepathway = {
  id: 'shikimate',
  name: 'Shikimate Pathway',
  description: 'Aromatic amino acid biosynthesis',
  metabolites: {
    pep:  { name: 'PEP',        type: 'input' },
    e4p:  { name: 'E4P',        type: 'input' },
    dahp: { name: 'DAHP',       type: 'intermediate' },
    shik: { name: 'Shikimate',  type: 'intermediate' },
    chor: { name: 'Chorismate', type: 'product' },
  },
  reactions: [
    { id: 'r1', from: 'pep',  to: 'dahp', gene: 'ARO3' },
    { id: 'r2', from: 'e4p',  to: 'dahp', gene: 'ARO4' },
    { id: 'r3', from: 'dahp', to: 'shik', gene: 'ARO1' },
    { id: 'r4', from: 'shik', to: 'chor', gene: 'ARO2' },
  ],
  baselineChromatin: {
    ARO3: 0.45,
    ARO4: 0.52,
    ARO1: 0.38,
    ARO2: 0.61,
  },
  interventionEffects: {
    activate: 0.50,
    repress: -0.25,
  },
};
