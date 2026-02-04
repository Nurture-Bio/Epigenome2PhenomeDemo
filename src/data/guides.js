/**
 * sgRNA guide data for ATF1 promoter targeting
 * Ranked by predicted flux impact with ATAC-seq accessibility scores
 * 
 * Logic: Lower ATAC = more closed chromatin = more room for activation to open = bigger flux gain
 * But extremely low ATAC sites may be harder to access initially
 */

export const guides = [
  { 
    id: 1, 
    spacer: 'GCAATCGATTACGCTATCGG', 
    position: -127, 
    strand: '+', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.18,
    predictedAtac: 0.72,  // After activation
    predictedFlux: '+312%' 
  },
  { 
    id: 2, 
    spacer: 'TTGACCTAAAGTGCAACTGG', 
    position: -203, 
    strand: '-', 
    pam: 'TGG', 
    offTargets: 1, 
    atacScore: 0.31,
    predictedAtac: 0.78,
    predictedFlux: '+198%' 
  },
  { 
    id: 3, 
    spacer: 'AACGGTTTACGCAATCGGAT', 
    position: -89, 
    strand: '+', 
    pam: 'CGG', 
    offTargets: 0, 
    atacScore: 0.12,
    predictedAtac: 0.68,
    predictedFlux: '+387%' 
  },
  { 
    id: 4, 
    spacer: 'CGATATCGCAATGGCTAACG', 
    position: -156, 
    strand: '+', 
    pam: 'TGG', 
    offTargets: 2, 
    atacScore: 0.24,
    predictedAtac: 0.71,
    predictedFlux: '+245%' 
  },
  { 
    id: 5, 
    spacer: 'TTAGCAATCGGATCGCAATC', 
    position: -67, 
    strand: '-', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.08,
    predictedAtac: 0.64,
    predictedFlux: '+421%' 
  },
  { 
    id: 6, 
    spacer: 'GCTAGCTAATCGCAATGGCT', 
    position: -234, 
    strand: '+', 
    pam: 'CGG', 
    offTargets: 1, 
    atacScore: 0.42,
    predictedAtac: 0.81,
    predictedFlux: '+156%' 
  },
  { 
    id: 7, 
    spacer: 'AATCGGCTAGCTAATCGCAT', 
    position: -178, 
    strand: '-', 
    pam: 'GGG', 
    offTargets: 0, 
    atacScore: 0.22,
    predictedAtac: 0.74,
    predictedFlux: '+267%' 
  },
  { 
    id: 8, 
    spacer: 'TCGAATCGCTAGCAATCGGA', 
    position: -112, 
    strand: '+', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.15,
    predictedAtac: 0.69,
    predictedFlux: '+345%' 
  },
];

// Target gene info
export const targetGene = {
  yorf: 'YOR377W',
  name: 'ATF1',
  fullName: 'Alcohol acetyltransferase',
  description: 'Catalyzes the esterification of isoamyl alcohol with acetyl-CoA to produce isoamyl acetate (banana flavor)',
  region: 'Promoter (-500 to TSS)',
  pam: 'NGG',
  cas: 'SpCas9'
};
