/**
 * Gene → Flavor compound mapping from Yeast8 model and GoodScents data.
 * 
 * Key genes for banana flavor:
 * - ATF1 (YOR377W): Alcohol acetyltransferase 1 - produces isoamyl acetate ("banana ester")
 * - ATF2 (YGR177C): Alcohol acetyltransferase 2 - also produces acetate esters
 * 
 * The banana flavor in beer comes primarily from isoamyl acetate, produced
 * by ATF1 and ATF2 enzymes. Upregulating these genes increases banana notes.
 */

// Common gene name mapping for yeast (systematic name → standard name)
export const geneNameMap = {
  'YOR377W': 'ATF1',   // Alcohol acetyltransferase 1 - BANANA ESTER KEY GENE
  'YGR177C': 'ATF2',   // Alcohol acetyltransferase 2 - also makes banana esters
  'YBR145W': 'ADH5',   // Alcohol dehydrogenase 5
  'YOL086C': 'ADH1',   // Alcohol dehydrogenase 1
  'YGL256W': 'ADH4',   // Alcohol dehydrogenase 4
  'YMR083W': 'ADH3',   // Alcohol dehydrogenase 3 (mitochondrial)
  'YDL168W': 'SFA1',   // S-formylglutathione hydrolase/alcohol dehydrogenase
  'YCR105W': 'ADH7',   // Alcohol dehydrogenase 7
  'YMR318C': 'ADH6',   // Alcohol dehydrogenase 6
  'YOR126C': 'IAH1',   // Isoamyl acetate hydrolase 1
  'YJR019C': 'TES1',   // Peroxisomal acyl-CoA thioesterase
  'YKR039W': 'GAP1',   // General amino acid permease
  'YGR087C': 'PDC6',   // Pyruvate decarboxylase 6
  'YLR134W': 'PDC5',   // Pyruvate decarboxylase 5
  'YLR044C': 'PDC1',   // Pyruvate decarboxylase 1
  'YDL080C': 'THI3',   // Alpha-ketoisocaproate decarboxylase
  'YAL060W': 'BDH1',   // (2R,3R)-2,3-butanediol dehydrogenase
  'YPL147W': 'PXA1',   // Peroxisomal ABC transporter
  'YKL188C': 'PXA2',   // Peroxisomal ABC transporter
  'YDR368W': 'YPR1',   // Aldose reductase
  'YMR170C': 'ALD2',   // Aldehyde dehydrogenase
  'YMR303C': 'ADH2',   // Alcohol dehydrogenase 2
  'YOL165C': 'AAD15',  // Aryl-alcohol dehydrogenase
  'YPL088W': 'AAD16',  // Aryl-alcohol dehydrogenase
  'YDL243C': 'AAD4',   // Aryl-alcohol dehydrogenase
  'YJR155W': 'AAD10',  // Aryl-alcohol dehydrogenase
  'YNL331C': 'AAD14',  // Aryl-alcohol dehydrogenase
  'YCR107W': 'AAD3',   // Aryl-alcohol dehydrogenase
};

// Full gene flavor map data (from yeast8 model + GoodScents/FooDB)
export const geneFlavorMap = [
  {
    gene_id: "YOR377W",
    gene_name: "ATF1",
    full_name: "Alcohol acetyltransferase 1",
    num_compounds: 5,
    all_odors: ["apple", "balsamic", "banana", "cocoa", "estery", "ethereal", "floral", "fruity", "grape", "green", "honey", "juicy fruit", "overripe fruit", "ripe", "rose", "rummy", "solvent", "sweet", "tropical", "weedy", "yeasty"],
    all_flavors: ["banana", "cherry", "estery", "ethereal", "floral", "fruity", "grape", "green", "honey", "juicy", "ripe", "rose", "sweet", "tutti frutti"],
    compounds: [
      { name: "isoamyl acetate", page_id: "rw1006711", chebi_id: "31725", odor: ["sweet", "fruity", "banana", "solvent", "ripe", "estery"], flavor: ["sweet", "fruity", "banana", "green", "ripe"], note: "Primary banana ester in beer" },
      { name: "2-methyl butyl acetate", page_id: "rw1008041", chebi_id: "50585", odor: ["overripe fruit", "sweet", "banana", "juicy fruit", "fruity", "ripe", "estery", "tropical"], flavor: ["sweet", "banana", "fruity", "estery", "ripe", "juicy"] },
      { name: "ethyl acetate", page_id: "rw1004691", chebi_id: "27750", odor: ["ethereal", "fruity", "sweet", "weedy", "green", "grape", "rummy"], flavor: ["ethereal", "fruity", "sweet", "grape", "cherry"] },
      { name: "isobutyl acetate", page_id: "rw1013631", chebi_id: "50569", odor: ["sweet", "fruity", "ethereal", "banana", "tropical", "apple"], flavor: ["sweet", "fruity", "banana", "tutti frutti"] },
      { name: "phenethyl acetate", page_id: "rw1010031", chebi_id: "31988", odor: ["floral", "rose", "sweet", "honey", "fruity", "tropical", "yeasty", "cocoa", "balsamic"], flavor: ["sweet", "honey", "floral", "rose", "green", "fruity"] }
    ],
    reactions: ["r_0158", "r_0159", "r_0160", "r_0161", "r_0162"],
    highlight: true,
    importance: "Primary enzyme for banana ester production. Key target for increasing banana flavor in beer.",
  },
  {
    gene_id: "YGR177C",
    gene_name: "ATF2",
    full_name: "Alcohol acetyltransferase 2",
    num_compounds: 5,
    all_odors: ["apple", "balsamic", "banana", "cocoa", "estery", "ethereal", "floral", "fruity", "grape", "green", "honey", "juicy fruit", "overripe fruit", "ripe", "rose", "rummy", "solvent", "sweet", "tropical", "weedy", "yeasty"],
    all_flavors: ["banana", "cherry", "estery", "ethereal", "floral", "fruity", "grape", "green", "honey", "juicy", "ripe", "rose", "sweet", "tutti frutti"],
    compounds: [
      { name: "isoamyl acetate", page_id: "rw1006711", chebi_id: "31725", odor: ["sweet", "fruity", "banana", "solvent", "ripe", "estery"], flavor: ["sweet", "fruity", "banana", "green", "ripe"], note: "Primary banana ester" },
      { name: "2-methyl butyl acetate", page_id: "rw1008041", chebi_id: "50585", odor: ["overripe fruit", "sweet", "banana", "juicy fruit", "fruity", "ripe", "estery", "tropical"], flavor: ["sweet", "banana", "fruity", "estery", "ripe", "juicy"] },
      { name: "ethyl acetate", page_id: "rw1004691", chebi_id: "27750", odor: ["ethereal", "fruity", "sweet", "weedy", "green", "grape", "rummy"], flavor: ["ethereal", "fruity", "sweet", "grape", "cherry"] },
      { name: "isobutyl acetate", page_id: "rw1013631", chebi_id: "50569", odor: ["sweet", "fruity", "ethereal", "banana", "tropical", "apple"], flavor: ["sweet", "fruity", "banana", "tutti frutti"] },
      { name: "phenethyl acetate", page_id: "rw1010031", chebi_id: "31988", odor: ["floral", "rose", "sweet", "honey", "fruity", "tropical", "yeasty", "cocoa", "balsamic"], flavor: ["sweet", "honey", "floral", "rose", "green", "fruity"] }
    ],
    reactions: ["r_0158", "r_0159", "r_0160", "r_0161", "r_0162"],
    highlight: true,
    importance: "Secondary ester synthase. Contributes to banana and fruity esters.",
  },
  {
    gene_id: "YBR145W",
    gene_name: "ADH5",
    full_name: "Alcohol dehydrogenase 5",
    num_compounds: 5,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "medicinal", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"], note: "Banana precursor - substrate for ATF1" },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "ethanol", page_id: "rw1000511", chebi_id: "16236", odor: ["alcoholic", "ethereal", "medicinal"], flavor: [] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0166", "r_0169", "r_0179", "r_0182", "r_2115"],
    importance: "Produces isoamyl alcohol, the precursor for banana ester synthesis by ATF1.",
  },
  {
    gene_id: "YOL086C",
    gene_name: "ADH1",
    full_name: "Alcohol dehydrogenase 1",
    num_compounds: 5,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "medicinal", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "ethanol", page_id: "rw1000511", chebi_id: "16236", odor: ["alcoholic", "ethereal", "medicinal"], flavor: [] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0166", "r_0169", "r_0179", "r_0182", "r_2115"],
  },
  {
    gene_id: "YGL256W",
    gene_name: "ADH4",
    full_name: "Alcohol dehydrogenase 4",
    num_compounds: 5,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "medicinal", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "ethanol", page_id: "rw1000511", chebi_id: "16236", odor: ["alcoholic", "ethereal", "medicinal"], flavor: [] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0165", "r_0167", "r_0170", "r_0180", "r_0183"],
  },
  {
    gene_id: "YMR083W",
    gene_name: "ADH3",
    full_name: "Alcohol dehydrogenase 3 (mitochondrial)",
    num_compounds: 5,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "medicinal", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "ethanol", page_id: "rw1000511", chebi_id: "16236", odor: ["alcoholic", "ethereal", "medicinal"], flavor: [] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0165", "r_0167", "r_0170", "r_0180", "r_0183"],
  },
  {
    gene_id: "YDL168W",
    gene_name: "SFA1",
    full_name: "Long-chain alcohol dehydrogenase",
    num_compounds: 4,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0166", "r_0169", "r_0179", "r_0182"],
  },
  {
    gene_id: "YCR105W",
    gene_name: "ADH7",
    full_name: "Alcohol dehydrogenase 7",
    num_compounds: 4,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0168", "r_0171", "r_0181", "r_0184"],
  },
  {
    gene_id: "YMR318C",
    gene_name: "ADH6",
    full_name: "Alcohol dehydrogenase 6",
    num_compounds: 4,
    all_odors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "dried rose", "ethereal", "fatty", "floral", "fresh", "fruity", "fusel", "greasy", "honey", "leathery", "molasses", "pungent", "rose", "sweet", "whiskey", "winey"],
    all_flavors: ["alcoholic", "banana", "bready", "cocoa", "cognac", "ethereal", "fatty", "fermented", "floral", "fruity", "fusel", "greasy", "leathery", "rose", "sweet", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "2-methyl-1-butanol", page_id: "rw1059521", chebi_id: "48945", odor: ["ethereal", "fusel", "alcoholic", "fatty", "greasy", "winey", "whiskey", "leathery", "cocoa"], flavor: ["ethereal", "alcoholic", "fatty", "greasy", "cocoa", "whiskey", "fusel", "leathery"] },
      { name: "phenethyl alcohol", page_id: "rw1010051", chebi_id: "49000", odor: ["floral", "rose", "dried rose", "sweet", "fresh", "bready", "honey"], flavor: ["floral", "sweet", "rose", "bready"] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0168", "r_0171", "r_0181", "r_0184"],
  },
  {
    gene_id: "YOR126C",
    gene_name: "IAH1",
    full_name: "Isoamyl acetate hydrolase",
    num_compounds: 4,
    all_odors: ["alcoholic", "banana", "cognac", "ethereal", "fruity", "fusel", "medicinal", "molasses", "pungent", "sharp", "sour", "vinegar", "whiskey", "winey"],
    all_flavors: ["acetic", "banana", "cognac", "ethereal", "fermented", "fruity", "fusel", "overripe fruit", "pungent", "sour", "whiskey"],
    compounds: [
      { name: "isoamyl alcohol", page_id: "rw1014671", chebi_id: "15837", odor: ["fusel", "alcoholic", "whiskey", "fruity", "banana", "pungent", "ethereal", "cognac", "molasses"], flavor: ["fusel", "fermented", "fruity", "banana", "ethereal", "cognac"] },
      { name: "acetic acid", page_id: "rw1097191", chebi_id: "30089", odor: ["sharp", "pungent", "sour", "vinegar"], flavor: ["pungent", "sour", "overripe fruit", "acetic"] },
      { name: "ethanol", page_id: "rw1000511", chebi_id: "16236", odor: ["alcoholic", "ethereal", "medicinal"], flavor: [] },
      { name: "isobutyl alcohol", page_id: "rw1028231", chebi_id: "46645", odor: ["ethereal", "winey"], flavor: ["fusel", "whiskey"] }
    ],
    reactions: ["r_0369", "r_0656", "r_0657"],
    importance: "Degrades isoamyl acetate. Knockout increases banana flavor.",
  },
  {
    gene_id: "YJR019C",
    gene_name: "TES1",
    full_name: "Peroxisomal acyl-CoA thioesterase",
    num_compounds: 8,
    all_odors: ["acetic", "bay", "buttery", "cheesy", "citrus", "citrus peel", "coconut", "creamy", "dairy", "fatty", "fried", "fruity", "lard", "oily", "pineapple", "rancid", "savory", "sharp", "soapy", "sour", "sweaty", "tallow", "vegetable", "waxy"],
    all_flavors: ["acidic", "brandy", "cheesy", "creamy", "dairy", "fatty", "fried", "fruity", "goaty", "lard", "oily", "phenolic", "potato", "rancid", "soapy", "sour", "tallow", "vegetable", "waxy"],
    compounds: [
      { name: "octanoic acid", page_id: "rw1009091", chebi_id: "25646", odor: ["fatty", "waxy", "rancid", "oily", "vegetable", "cheesy"], flavor: ["rancid", "soapy", "cheesy", "fatty", "brandy"] },
      { name: "decanoic acid", page_id: "rw1007741", chebi_id: "27689", odor: ["rancid", "sour", "fatty", "citrus"], flavor: ["soapy", "waxy", "fruity"] },
      { name: "lauric acid", page_id: "rw1008181", chebi_id: "18262", odor: ["fatty", "coconut", "bay"], flavor: [] },
      { name: "myristic acid", page_id: "rw1009061", chebi_id: "30807", odor: ["waxy", "fatty", "soapy", "coconut", "pineapple", "citrus peel"], flavor: ["waxy", "fatty", "soapy", "creamy", "cheesy"] },
      { name: "palmitic acid", page_id: "rw1009101", chebi_id: "7896", odor: ["waxy", "fatty", "creamy"], flavor: ["waxy", "creamy", "fatty", "soapy", "lard", "tallow", "dairy"] },
      { name: "(Z)-oleic acid", page_id: "rw1029521", chebi_id: "30823", odor: ["fatty", "waxy", "lard", "fried", "oily", "tallow", "savory"], flavor: ["fatty", "vegetable", "oily", "lard", "tallow", "fried", "potato"] },
      { name: "butyric acid", page_id: "rw1003411", chebi_id: "17968", odor: ["sharp", "acetic", "cheesy", "buttery", "fruity", "dairy"], flavor: ["acidic", "sour", "cheesy", "dairy", "creamy", "fruity"] },
      { name: "hexanoic acid", page_id: "rw1008541", chebi_id: "17120", odor: ["sour", "fatty", "sweaty", "cheesy"], flavor: ["cheesy", "fruity", "phenolic", "fatty", "goaty"] }
    ],
    reactions: ["r_0844", "r_0845", "r_0847", "r_0848", "r_0850", "r_2232", "r_2233", "r_2235"],
  },
  {
    gene_id: "YGR087C",
    gene_name: "PDC6",
    full_name: "Pyruvate decarboxylase 6",
    num_compounds: 4,
    all_odors: ["alcoholic", "aldehydic", "buttery", "chocolate", "cocoa", "coffee", "creamy", "dairy", "ethereal", "fatty", "fermented", "floral", "fresh", "fruity", "malty", "milky", "musty", "nutty", "phenolic", "pungent", "sweet"],
    all_flavors: ["aldehydic", "buttery", "caramellic", "cereal", "creamy", "dairy", "fresh", "fruity", "green", "herbal", "malty", "milky", "musty", "nutty", "oily", "pungent", "rummy", "sweet", "yogurt"],
    compounds: [
      { name: "acetoin", page_id: "rw1007331", chebi_id: "15686", odor: ["sweet", "buttery", "creamy", "dairy", "milky", "fatty"], flavor: ["creamy", "dairy", "sweet", "oily", "milky", "buttery", "yogurt"] },
      { name: "2-methyl butyraldehyde", page_id: "rw1008921", chebi_id: "16182", odor: ["musty", "cocoa", "phenolic", "coffee", "nutty", "malty", "fermented", "fatty", "alcoholic", "chocolate"], flavor: ["musty", "rummy", "nutty", "cereal", "caramellic", "fruity"] },
      { name: "acetaldehyde", page_id: "rw1019471", chebi_id: "15343", odor: ["pungent", "ethereal", "aldehydic", "fruity", "fresh", "musty"], flavor: ["pungent", "fresh", "aldehydic", "green"] },
      { name: "isobutyraldehyde", page_id: "rw1006831", chebi_id: "48943", odor: ["fresh", "aldehydic", "floral", "pungent"], flavor: ["fresh", "aldehydic", "herbal", "green", "malty"] }
    ],
    reactions: ["r_0062", "r_0064", "r_0095", "r_0959", "r_0960"],
  },
  {
    gene_id: "YLR134W",
    gene_name: "PDC5",
    full_name: "Pyruvate decarboxylase 5",
    num_compounds: 4,
    all_odors: ["alcoholic", "aldehydic", "buttery", "chocolate", "cocoa", "coffee", "creamy", "dairy", "ethereal", "fatty", "fermented", "floral", "fresh", "fruity", "malty", "milky", "musty", "nutty", "phenolic", "pungent", "sweet"],
    all_flavors: ["aldehydic", "buttery", "caramellic", "cereal", "creamy", "dairy", "fresh", "fruity", "green", "herbal", "malty", "milky", "musty", "nutty", "oily", "pungent", "rummy", "sweet", "yogurt"],
    compounds: [
      { name: "acetoin", page_id: "rw1007331", chebi_id: "15686", odor: ["sweet", "buttery", "creamy", "dairy", "milky", "fatty"], flavor: ["creamy", "dairy", "sweet", "oily", "milky", "buttery", "yogurt"] },
      { name: "2-methyl butyraldehyde", page_id: "rw1008921", chebi_id: "16182", odor: ["musty", "cocoa", "phenolic", "coffee", "nutty", "malty", "fermented", "fatty", "alcoholic", "chocolate"], flavor: ["musty", "rummy", "nutty", "cereal", "caramellic", "fruity"] },
      { name: "acetaldehyde", page_id: "rw1019471", chebi_id: "15343", odor: ["pungent", "ethereal", "aldehydic", "fruity", "fresh", "musty"], flavor: ["pungent", "fresh", "aldehydic", "green"] },
      { name: "isobutyraldehyde", page_id: "rw1006831", chebi_id: "48943", odor: ["fresh", "aldehydic", "floral", "pungent"], flavor: ["fresh", "aldehydic", "herbal", "green", "malty"] }
    ],
    reactions: ["r_0062", "r_0064", "r_0095", "r_0959", "r_0960"],
  },
  {
    gene_id: "YLR044C",
    gene_name: "PDC1",
    full_name: "Pyruvate decarboxylase 1",
    num_compounds: 4,
    all_odors: ["alcoholic", "aldehydic", "buttery", "chocolate", "cocoa", "coffee", "creamy", "dairy", "ethereal", "fatty", "fermented", "floral", "fresh", "fruity", "malty", "milky", "musty", "nutty", "phenolic", "pungent", "sweet"],
    all_flavors: ["aldehydic", "buttery", "caramellic", "cereal", "creamy", "dairy", "fresh", "fruity", "green", "herbal", "malty", "milky", "musty", "nutty", "oily", "pungent", "rummy", "sweet", "yogurt"],
    compounds: [
      { name: "acetoin", page_id: "rw1007331", chebi_id: "15686", odor: ["sweet", "buttery", "creamy", "dairy", "milky", "fatty"], flavor: ["creamy", "dairy", "sweet", "oily", "milky", "buttery", "yogurt"] },
      { name: "2-methyl butyraldehyde", page_id: "rw1008921", chebi_id: "16182", odor: ["musty", "cocoa", "phenolic", "coffee", "nutty", "malty", "fermented", "fatty", "alcoholic", "chocolate"], flavor: ["musty", "rummy", "nutty", "cereal", "caramellic", "fruity"] },
      { name: "acetaldehyde", page_id: "rw1019471", chebi_id: "15343", odor: ["pungent", "ethereal", "aldehydic", "fruity", "fresh", "musty"], flavor: ["pungent", "fresh", "aldehydic", "green"] },
      { name: "isobutyraldehyde", page_id: "rw1006831", chebi_id: "48943", odor: ["fresh", "aldehydic", "floral", "pungent"], flavor: ["fresh", "aldehydic", "herbal", "green", "malty"] }
    ],
    reactions: ["r_0062", "r_0064", "r_0095", "r_0959", "r_0960"],
  },
  {
    gene_id: "YDL080C",
    gene_name: "THI3",
    full_name: "Alpha-ketoisocaproate decarboxylase",
    num_compounds: 2,
    all_odors: ["alcoholic", "aldehydic", "chocolate", "cocoa", "coffee", "ethereal", "fatty", "fermented", "malty", "musty", "nutty", "peach", "phenolic"],
    all_flavors: ["caramellic", "cereal", "chocolate", "cocoa", "dry", "fruity", "green", "leafy", "musty", "nutty", "rummy"],
    compounds: [
      { name: "2-methyl butyraldehyde", page_id: "rw1008921", chebi_id: "16182", odor: ["musty", "cocoa", "phenolic", "coffee", "nutty", "malty", "fermented", "fatty", "alcoholic", "chocolate"], flavor: ["musty", "rummy", "nutty", "cereal", "caramellic", "fruity"] },
      { name: "isovaleraldehyde", page_id: "rw1023131", chebi_id: "16638", odor: ["ethereal", "aldehydic", "chocolate", "peach", "fatty"], flavor: ["fruity", "dry", "green", "chocolate", "nutty", "leafy", "cocoa"] }
    ],
    reactions: ["r_0064", "r_0072"],
    importance: "Produces peach-like aldehyde aromas.",
  },
  {
    gene_id: "YAL060W",
    gene_name: "BDH1",
    full_name: "Butanediol dehydrogenase",
    num_compounds: 1,
    all_odors: ["buttery", "creamy", "dairy", "fatty", "milky", "sweet"],
    all_flavors: ["buttery", "creamy", "dairy", "milky", "oily", "sweet", "yogurt"],
    compounds: [
      { name: "acetoin", page_id: "rw1007331", chebi_id: "15686", odor: ["sweet", "buttery", "creamy", "dairy", "milky", "fatty"], flavor: ["creamy", "dairy", "sweet", "oily", "milky", "buttery", "yogurt"] }
    ],
    reactions: ["r_0003"],
    importance: "Produces buttery/creamy diacetyl flavors.",
  },
  {
    gene_id: "YOL165C",
    gene_name: "AAD15",
    full_name: "Aryl-alcohol dehydrogenase",
    num_compounds: 4,
    all_odors: ["almond", "bitter", "bitter almond", "cherry", "cumin", "fruity", "green", "herbal", "maraschino cherry", "nutty", "phenolic", "powdery", "sharp", "spicy", "sweet"],
    all_flavors: ["almond", "bitter almond", "cherry", "cinnamon", "cumin", "fruity", "green", "herbal", "maraschino cherry", "nutty", "oily", "spicy", "sweet", "tropical", "tropical fruit", "vegetable", "woody"],
    compounds: [
      { name: "benzaldehyde", page_id: "rw1001491", chebi_id: "17169", odor: ["sharp", "sweet", "bitter", "almond", "cherry", "fruity", "powdery", "nutty", "maraschino cherry"], flavor: ["fruity", "cherry", "maraschino cherry", "oily", "nutty", "woody", "tropical fruit", "sweet", "almond"] },
      { name: "meta-tolualdehyde", page_id: "rw1051061", chebi_id: "28476", odor: ["sweet", "fruity", "cherry", "bitter almond", "phenolic"], flavor: ["fruity", "bitter almond", "cherry", "tropical", "nutty"] },
      { name: "cuminaldehyde", page_id: "rw1004031", chebi_id: "28671", odor: ["spicy", "cumin", "green", "herbal"], flavor: ["spicy", "cumin", "green", "herbal", "vegetable"] },
      { name: "para-tolualdehyde", page_id: "rw1003422", chebi_id: "28617", odor: ["fruity", "cherry", "phenolic"], flavor: ["sweet", "spicy", "cinnamon", "fruity", "bitter almond"] }
    ],
    reactions: ["r_4177", "r_4178", "r_4179", "r_4180"],
  },
  {
    gene_id: "YMR170C",
    gene_name: "ALD2",
    full_name: "Aldehyde dehydrogenase",
    num_compounds: 3,
    all_odors: ["animal", "chocolate", "civet", "floral", "honey", "honeysuckle", "powdery", "pungent", "rose", "sharp", "sour", "sweet", "tobacco", "vinegar", "waxy"],
    all_flavors: ["acetic", "chocolate", "floral", "honey", "overripe fruit", "pungent", "sour", "sweet", "tobacco"],
    compounds: [
      { name: "acetic acid", page_id: "rw1097191", chebi_id: "30089", odor: ["sharp", "pungent", "sour", "vinegar"], flavor: ["pungent", "sour", "overripe fruit", "acetic"] },
      { name: "beta-alanine", page_id: "rw1002211", chebi_id: "16958", odor: [], flavor: ["sweet"] },
      { name: "phenyl acetic acid", page_id: "rw1009911", chebi_id: "18401", odor: ["sweet", "honey", "floral", "honeysuckle", "sour", "waxy", "civet", "rose", "chocolate", "tobacco", "powdery", "animal"], flavor: ["sweet", "floral", "chocolate", "honey", "tobacco"] }
    ],
    reactions: ["r_0172", "r_0185", "r_2116"],
  },
  {
    gene_id: "YPL147W",
    gene_name: "PXA1",
    full_name: "Peroxisomal fatty acid transporter",
    num_compounds: 4,
    all_odors: ["bay", "citrus peel", "coconut", "creamy", "fatty", "fried", "lard", "oily", "pineapple", "savory", "soapy", "tallow", "waxy"],
    all_flavors: ["cheesy", "creamy", "dairy", "fatty", "fried", "lard", "oily", "potato", "soapy", "tallow", "vegetable", "waxy"],
    compounds: [
      { name: "lauric acid", page_id: "rw1008181", chebi_id: "18262", odor: ["fatty", "coconut", "bay"], flavor: [] },
      { name: "myristic acid", page_id: "rw1009061", chebi_id: "30807", odor: ["waxy", "fatty", "soapy", "coconut", "pineapple", "citrus peel"], flavor: ["waxy", "fatty", "soapy", "creamy", "cheesy"] },
      { name: "palmitic acid", page_id: "rw1009101", chebi_id: "7896", odor: ["waxy", "fatty", "creamy"], flavor: ["waxy", "creamy", "fatty", "soapy", "lard", "tallow", "dairy"] },
      { name: "(Z)-oleic acid", page_id: "rw1029521", chebi_id: "30823", odor: ["fatty", "waxy", "lard", "fried", "oily", "tallow", "savory"], flavor: ["fatty", "vegetable", "oily", "lard", "tallow", "fried", "potato"] }
    ],
    reactions: ["r_1771", "r_1772", "r_1774", "r_2231"],
  },
  // Additional genes for rancid, cheesy, sour flavors
  {
    gene_id: "YLR303W",
    gene_name: "MET17",
    full_name: "O-acetylhomoserine sulfhydrylase",
    num_compounds: 1,
    all_odors: ["pungent", "sharp", "sour", "vinegar"],
    all_flavors: ["acetic", "overripe fruit", "pungent", "sour"],
    compounds: [
      { name: "acetic acid", page_id: "rw1097191", chebi_id: "30089", odor: ["sharp", "pungent", "sour", "vinegar"], flavor: ["pungent", "sour", "overripe fruit", "acetic"] }
    ],
    reactions: ["r_0312", "r_0812", "r_0813"],
  },
  {
    gene_id: "YKL217W",
    gene_name: "JEN1",
    full_name: "Monocarboxylate transporter",
    num_compounds: 3,
    all_odors: ["acetic", "caramellic", "sharp", "sour"],
    all_flavors: ["acidic", "brown sugar", "caramellic", "sour"],
    compounds: [
      { name: "lactic acid", page_id: "rw1007391", chebi_id: "16004", odor: [], flavor: ["sour", "acidic"] },
      { name: "laevo-lactic acid", page_id: "rw1107811", chebi_id: "16651", odor: [], flavor: ["sour", "acidic"] },
      { name: "pyruvic acid", page_id: "rw1034261", chebi_id: "15361", odor: ["sharp", "sour", "acetic", "caramellic"], flavor: ["caramellic", "brown sugar", "sour"] }
    ],
    reactions: ["r_1136", "r_1206", "r_1207", "r_1254"],
  },
];

// Generate comprehensive descriptor statistics
export function getDescriptorStats() {
  const odorFreq = {};
  const flavorFreq = {};
  
  geneFlavorMap.forEach(gene => {
    gene.all_odors.forEach(o => {
      odorFreq[o] = (odorFreq[o] || 0) + 1;
    });
    gene.all_flavors.forEach(f => {
      flavorFreq[f] = (flavorFreq[f] || 0) + 1;
    });
  });
  
  return {
    totalGenes: geneFlavorMap.length,
    topOdors: Object.entries(odorFreq).sort((a, b) => b[1] - a[1]).slice(0, 20),
    topFlavors: Object.entries(flavorFreq).sort((a, b) => b[1] - a[1]).slice(0, 20),
  };
}

// Search for genes by descriptor
export function searchByDescriptor(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  return geneFlavorMap
    .filter(gene => {
      const odorsMatch = gene.all_odors.some(o => o.toLowerCase().includes(q));
      const flavorsMatch = gene.all_flavors.some(f => f.toLowerCase().includes(q));
      return odorsMatch || flavorsMatch;
    })
    .map(gene => {
      // Find which compounds match
      const matchingCompounds = gene.compounds.filter(c => {
        const odorMatch = c.odor?.some(o => o.toLowerCase().includes(q));
        const flavorMatch = c.flavor?.some(f => f.toLowerCase().includes(q));
        return odorMatch || flavorMatch;
      });
      
      return {
        ...gene,
        matchingCompounds,
        matchScore: matchingCompounds.length + (gene.highlight ? 10 : 0),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// Popular search suggestions
export const suggestedSearches = [
  { term: 'banana',    description: 'Fruity ester notes' },
  { term: 'peach',     description: 'Stone fruit aldehydes' },
  { term: 'rose',      description: 'Floral phenethyl alcohol' },
  { term: 'buttery',   description: 'Diacetyl/acetoin' },
  { term: 'rancid',    description: 'Off-flavor fatty acids' },
  { term: 'honey',     description: 'Sweet floral notes' },
  { term: 'chocolate', description: 'Malty aldehydes' },
  { term: 'cherry',    description: 'Benzaldehyde' },
];
