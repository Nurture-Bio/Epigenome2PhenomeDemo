/**
 * sgRNA guide data for ATF1 promoter targeting (CRISPRa)
 * Spacers extracted from S. cerevisiae S288C chrXV:1045726-1046226 (NC_001147.6)
 * SpCas9 NGG PAM sites, filtered for poly-T/A runs and GC content
 * Ranked by proximity to TSS and predicted flux impact
 * 
 * ATAC scores and predicted flux values are modeled, not experimentally validated
 */

export const guides = [
  { 
    id: 1, 
    spacer: 'GGTATTGTCATCGCGTTGAG', 
    position: -151, 
    strand: '+', 
    pam: 'CGG', 
    offTargets: 0, 
    atacScore: 0.08,
    predictedAtac: 0.64,
    predictedFlux: '+421%' 
  },
  { 
    id: 2, 
    spacer: 'CTCAACGCGATGACAATACC', 
    position: -151, 
    strand: '-', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.14,
    predictedAtac: 0.69,
    predictedFlux: '+367%' 
  },
  { 
    id: 3, 
    spacer: 'ACTCATTGGCTTGCGATTTA', 
    position: -210, 
    strand: '+', 
    pam: 'CGG', 
    offTargets: 1, 
    atacScore: 0.19,
    predictedAtac: 0.72,
    predictedFlux: '+312%' 
  },
  { 
    id: 4, 
    spacer: 'AGCGTGTGAGGACTACTCAT', 
    position: -224, 
    strand: '+', 
    pam: 'TGG', 
    offTargets: 0, 
    atacScore: 0.24,
    predictedAtac: 0.74,
    predictedFlux: '+267%' 
  },
  { 
    id: 5, 
    spacer: 'ATATATAGATCTAGCGTGTG', 
    position: -236, 
    strand: '+', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.31,
    predictedAtac: 0.78,
    predictedFlux: '+198%' 
  },
  { 
    id: 6, 
    spacer: 'ACACGCTAGATCTATATATT', 
    position: -237, 
    strand: '-', 
    pam: 'CGG', 
    offTargets: 2, 
    atacScore: 0.36,
    predictedAtac: 0.79,
    predictedFlux: '+178%' 
  },
  { 
    id: 7, 
    spacer: 'CTAAGGTTCAATGCACTCGA', 
    position: -274, 
    strand: '+', 
    pam: 'TGG', 
    offTargets: 1, 
    atacScore: 0.42,
    predictedAtac: 0.81,
    predictedFlux: '+156%' 
  },
  { 
    id: 8, 
    spacer: 'AGGTTAGGGTTTATGGACCC', 
    position: -370, 
    strand: '+', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.47,
    predictedAtac: 0.83,
    predictedFlux: '+134%' 
  }
];

// Target gene info
export const targetGene = {
  yorf: 'YOR377W',
  name: 'ATF1',
  fullName: 'Alcohol acetyltransferase',
  description: 'Catalyzes the esterification of isoamyl alcohol with acetyl-CoA to produce isoamyl acetate (banana flavor)',
  region: 'Promoter (-500 to TSS)',
  source: 'NC_001147.6:1045726-1046226',
  pam: 'NGG',
  cas: 'SpCas9'
};