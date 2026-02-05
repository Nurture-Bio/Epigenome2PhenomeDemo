/**
 * Mock thermodynamic data structure based on ATACFlux cache
 * Real data from yeast-GEM integrated with eQuilibrator
 */

export const reactionDetails = {
  'r_0534': {
    name: 'hexokinase (D-glucose:ATP)',
    dG: -20.4,
    uncertainty: 0.4,
    method: 'standard',
    ec: '2.7.1.1',
    substrates: ['1 ATP', '1 D-glucose'],
    products: ['1 ADP', '1 D-glucose 6-phosphate'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0886': {
    name: 'phosphofructokinase',
    dG: -17.8,
    uncertainty: 0.7,
    method: 'standard',
    ec: '2.7.1.11',
    substrates: ['1 ATP', '1 D-fructose 6-phosphate'],
    products: ['1 ADP', '1 D-fructose 1,6-bisphosphate'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0450': {
    name: 'fructose-bisphosphate aldolase',
    dG: 23.2,
    uncertainty: 0.5,
    method: 'standard',
    ec: '4.1.2.13',
    substrates: ['1 D-fructose 1,6-bisphosphate'],
    products: ['1 DHAP', '1 G3P'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0486': {
    name: 'glyceraldehyde-3-phosphate dehydrogenase',
    dG: 1.2,
    uncertainty: 0.4,
    method: 'standard',
    ec: '1.2.1.12',
    substrates: ['1 G3P', '1 NAD⁺', '1 Pᵢ'],
    products: ['1 1,3-BPG', '1 NADH'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_1054': {
    name: 'triose-phosphate isomerase',
    dG: 5.6,
    uncertainty: 0.5,
    method: 'standard',
    ec: '5.3.1.1',
    substrates: ['1 DHAP'],
    products: ['1 G3P'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0892': {
    name: 'phosphoglycerate kinase',
    dG: -19.5,
    uncertainty: 0.4,
    method: 'standard',
    ec: '2.7.2.3',
    substrates: ['1 1,3-BPG', '1 ADP'],
    products: ['1 3-PG', '1 ATP'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0893': {
    name: 'phosphoglycerate mutase',
    dG: 4.5,
    uncertainty: 0.4,
    method: 'standard',
    ec: '5.4.2.11',
    substrates: ['1 3-PG'],
    products: ['1 2-PG'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0366': {
    name: 'enolase',
    dG: -3.8,
    uncertainty: 0.3,
    method: 'standard',
    ec: '4.2.1.11',
    substrates: ['1 2-PG'],
    products: ['1 PEP', '1 H₂O'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0962': {
    name: 'pyruvate kinase',
    dG: -25.0,
    uncertainty: 0.4,
    method: 'standard',
    ec: '2.7.1.40',
    substrates: ['1 PEP', '1 ADP'],
    products: ['1 pyruvate', '1 ATP'],
    compartment: 'cytoplasm',
    subsystem: 'Glycolysis'
  },
  'r_0300': {
    name: 'citrate synthase',
    dG: -38.8,
    uncertainty: 0.4,
    method: 'standard',
    ec: '2.3.3.1',
    substrates: ['1 acetyl-CoA', '1 oxaloacetate'],
    products: ['1 citrate', '1 CoA'],
    compartment: 'mitochondria',
    subsystem: 'TCA cycle'
  },
  'r_0117': {
    name: 'aconitase',
    dG: 0.0,
    uncertainty: 0.0,
    method: 'standard',
    ec: '4.2.1.3',
    substrates: ['1 citrate'],
    products: ['1 isocitrate'],
    compartment: 'mitochondria',
    subsystem: 'TCA cycle'
  },
  'r_0658': {
    name: 'isocitrate dehydrogenase (NAD⁺)',
    dG: 5.4,
    uncertainty: 3.2,
    method: 'standard',
    ec: '1.1.1.41',
    substrates: ['1 isocitrate', '1 NAD⁺'],
    products: ['1 α-ketoglutarate', '1 CO₂', '1 NADH'],
    compartment: 'mitochondria',
    subsystem: 'TCA cycle'
  },
  'r_1021': {
    name: 'succinate dehydrogenase (ubiquinone-6)',
    dG: -16.7,
    uncertainty: 2.1,
    method: 'redox_carrier',
    ec: '1.3.5.1',
    substrates: ['1 succinate', '1 ubiquinone'],
    products: ['1 fumarate', '1 ubiquinol'],
    compartment: 'mitochondria',
    subsystem: 'TCA cycle / ETC'
  },
  'r_0451': {
    name: 'fumarase',
    dG: -3.4,
    uncertainty: 0.3,
    method: 'standard',
    ec: '4.2.1.2',
    substrates: ['1 fumarate', '1 H₂O'],
    products: ['1 malate'],
    compartment: 'mitochondria',
    subsystem: 'TCA cycle'
  },
  'r_0713': {
    name: 'malate dehydrogenase',
    dG: 26.5,
    uncertainty: 0.3,
    method: 'standard',
    ec: '1.1.1.37',
    substrates: ['1 malate', '1 NAD⁺'],
    products: ['1 oxaloacetate', '1 NADH'],
    compartment: 'mitochondria',
    subsystem: 'TCA cycle'
  },
  'r_0770': {
    name: 'NADH dehydrogenase (Complex I)',
    dG: -74.9,
    uncertainty: 0.6,
    method: 'redox_carrier',
    ec: '1.6.5.9',
    substrates: ['1 NADH', '1 ubiquinone', '1 H⁺'],
    products: ['1 NAD⁺', '1 ubiquinol'],
    compartment: 'mitochondria',
    subsystem: 'Oxidative phosphorylation'
  },
  'r_0439': {
    name: 'ubiquinol:cytochrome c reductase (Complex III)',
    dG: -40.3,
    uncertainty: 0.0,
    method: 'redox_carrier',
    ec: '1.10.2.2',
    substrates: ['1 ubiquinol', '2 cyt c (ox)'],
    products: ['1 ubiquinone', '2 cyt c (red)'],
    compartment: 'mitochondria',
    subsystem: 'Oxidative phosphorylation'
  },
  'r_0226': {
    name: 'ATP synthase',
    dG: -21.8,
    uncertainty: 0.3,
    method: 'multicompartmental',
    ec: '3.6.3.14',
    substrates: ['1 ADP', '1 Pᵢ', '3 H⁺ (IMS)'],
    products: ['1 ATP', '3 H⁺ (matrix)'],
    compartment: 'mitochondria',
    subsystem: 'Oxidative phosphorylation'
  },
  'r_0163': {
    name: 'alcohol dehydrogenase',
    dG: 18.1,
    uncertainty: 0.3,
    method: 'standard',
    ec: '1.1.1.1',
    substrates: ['1 ethanol', '1 NAD⁺'],
    products: ['1 acetaldehyde', '1 NADH'],
    compartment: 'cytoplasm',
    subsystem: 'Fermentation'
  },
  'r_0160': {
    name: 'alcohol acetyltransferase (isoamyl alcohol)',
    dG: -3.9,
    uncertainty: 2.1,
    method: 'standard',
    ec: '2.3.1.84',
    substrates: ['1 isoamyl alcohol', '1 acetyl-CoA'],
    products: ['1 isoamyl acetate', '1 CoA'],
    compartment: 'cytoplasm',
    subsystem: 'Ester metabolism'
  }
};

// Reaction table data for display
export const reactionTableData = [
  { flux: [0.88, 0.44], dG: [-20, -20], loc: 'c', id: 'r_0534', name: 'hexokinase (D-glucose:ATP)', wave: 1, status: 'reduced' },
  { flux: [0.88, 0.44], dG: [-18, -18], loc: 'c', id: 'r_0886', name: 'phosphofructokinase', wave: 1, status: 'reduced' },
  { flux: [0.88, 0.44], dG: [23, 23], loc: 'c', id: 'r_0450', name: 'fructose-bisphosphate aldolase', wave: 1, status: 'reduced' },
  { flux: [1.76, 0.88], dG: [1, 1], loc: 'c', id: 'r_0486', name: 'glyceraldehyde-3-phosphate dehydrogenase', wave: 1, status: 'reduced' },
  { flux: [1.76, 0.88], dG: [-20, -20], loc: 'c', id: 'r_0892', name: 'phosphoglycerate kinase', wave: 2, status: 'reduced' },
  { flux: [1.76, 0.88], dG: [-4, -4], loc: 'c', id: 'r_0366', name: 'enolase', wave: 2, status: 'reduced' },
  { flux: [1.76, 0.88], dG: [-25, -25], loc: 'c', id: 'r_0962', name: 'pyruvate kinase', wave: 2, status: 'reduced' },
  { flux: [0.42, 0.00], dG: [-39, -39], loc: 'm', id: 'r_0300', name: 'citrate synthase', wave: 0, status: 'blocked' },
  { flux: [0.42, 0.00], dG: [5, 5], loc: 'm', id: 'r_0658', name: 'isocitrate dehydrogenase (NAD+)', wave: 0, status: 'blocked' },
  { flux: [0.42, 0.00], dG: [-17, -17], loc: 'm', id: 'r_1021', name: 'succinate dehydrogenase (ubiquinone-6)', wave: 1, status: 'blocked' },
  { flux: [0.42, 0.00], dG: [27, 27], loc: 'm', id: 'r_0713', name: 'malate dehydrogenase', wave: 1, status: 'blocked' },
  { flux: [0.84, 0.00], dG: [-75, -75], loc: 'm', id: 'r_0770', name: 'NADH dehydrogenase', wave: 0, status: 'blocked' },
  { flux: [2.52, 0.00], dG: [-22, -22], loc: 'm', id: 'r_0226', name: 'ATP synthase', wave: 0, status: 'blocked' },
  { flux: [0.02, 0.85], dG: [18, 18], loc: 'c', id: 'r_0163', name: 'alcohol dehydrogenase (ethanol)', wave: 3, status: 'increased' },
  { flux: [0.12, 0.56], dG: [-4, -4], loc: 'c', id: 'r_0160', name: 'alcohol acetyltransferase (isoamyl alcohol)', wave: 3, status: 'increased' },
];

// Reaction status mapping for quick lookup
export const reactionStatusMap = Object.fromEntries(
  reactionTableData.map(r => [r.id, r.status])
);
