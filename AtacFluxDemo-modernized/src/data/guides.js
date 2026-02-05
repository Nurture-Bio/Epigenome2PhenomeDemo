/**
 * sgRNA guide data for ATF1 promoter targeting
 * Ranked by predicted flux impact with ATAC-seq accessibility scores
 */

export const guides = [
  { 
    id: 1, 
    spacer: 'GCAATCGATTACGCTATCGG', 
    position: -127, 
    strand: '+', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.06, 
    predictedFlux: '+47%' 
  },
  { 
    id: 2, 
    spacer: 'TTGACCTAAAGTGCAACTGG', 
    position: -203, 
    strand: '-', 
    pam: 'TGG', 
    offTargets: 1, 
    atacScore: 0.08, 
    predictedFlux: '+41%' 
  },
  { 
    id: 3, 
    spacer: 'AACGGTTTACGCAATCGGAT', 
    position: -89, 
    strand: '+', 
    pam: 'CGG', 
    offTargets: 0, 
    atacScore: 0.05, 
    predictedFlux: '+52%' 
  },
  { 
    id: 4, 
    spacer: 'CGATATCGCAATGGCTAACG', 
    position: -156, 
    strand: '+', 
    pam: 'TGG', 
    offTargets: 2, 
    atacScore: 0.07, 
    predictedFlux: '+38%' 
  },
  { 
    id: 5, 
    spacer: 'TTAGCAATCGGATCGCAATC', 
    position: -67, 
    strand: '-', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.04, 
    predictedFlux: '+55%' 
  },
  { 
    id: 6, 
    spacer: 'GCTAGCTAATCGCAATGGCT', 
    position: -234, 
    strand: '+', 
    pam: 'CGG', 
    offTargets: 1, 
    atacScore: 0.09, 
    predictedFlux: '+36%' 
  },
  { 
    id: 7, 
    spacer: 'AATCGGCTAGCTAATCGCAT', 
    position: -178, 
    strand: '-', 
    pam: 'GGG', 
    offTargets: 0, 
    atacScore: 0.06, 
    predictedFlux: '+44%' 
  },
  { 
    id: 8, 
    spacer: 'TCGAATCGCTAGCAATCGGA', 
    position: -112, 
    strand: '+', 
    pam: 'AGG', 
    offTargets: 0, 
    atacScore: 0.05, 
    predictedFlux: '+49%' 
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
