src/
├── components/
│   ├── FlavorSearchPage/    # Flavor compound search
│   ├── MetabolismPage/      # Reaction network visualization
│   ├── GeneTopologyPage/    # Epigenomic layer integration
│   ├── SimulationPage/      # Interactive flux model
│   ├── GuideDesignPage/     # Guide RNA selection
│   ├── Navigation/          # Navigation header
│   ├── PageHeader/          # Page titles
│   └── ui/                  # Shared component library
├── data/
│   ├── pathway.js           # Chromatin states, metabolites, edges
│   ├── pathwayLayout.js     # Node positioning configuration
│   ├── reactions.js         # Biochemistry data (ΔG, cofactors)
│   ├── guides.js            # CRISPR guide sequences
│   └── geneFlavorMap.js     # Gene-to-flavor compound mapping
├── hooks/
│   ├── useFluxSolver.js     # Flux propagation algorithm
│   └── usePathwayLayout.js  # Layout computation
├── stores/
│   └── useSelectionStore.js # Shared selection state (Zustand)
├── lib/
│   └── utils.js             # Utilities (cn class merger)
├── dev/
│   └── NavDiagnostic.jsx    # Runtime CSS assertion tool
└── styles/
    └── global.css
