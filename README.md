# ATACFlux

Interactive visualization of how epigenomic data (ATAC-seq chromatin accessibility) can be integrated with metabolic flux modeling to identify intervention targets for CRISPR-based gene activation.

**Demo**: A tool for exploring the Ehrlich pathway in *S. cerevisiae* for isoamyl acetate (banana flavor) biosynthesis.

## What This Shows

Traditional metabolic engineering picks gene targets based on pathway position or expression levels. This demo illustrates a different approach: using chromatin accessibility data to identify which genes are epigenetically constrained and would benefit most from chromatin activation.

The key insight: **ATF1** (alcohol acetyltransferase) has only 6% chromatin accessibility at baseline, making it the flux bottleneck—not because the enzyme is slow, but because the gene is epigenetically silenced. Opening upstream genes that are already 65-72% accessible provides marginal gains; opening ATF1 redirects flux from waste to product.

## Pages

1. **Biochemistry** — Interactive reaction network with thermodynamic data (ΔG°) and cofactor requirements
2. **Epigenome** — Multi-layer epigenomic integration (Hi-C, ATAC-seq, ChIP-seq, RNA-seq) with unified regulatory scores  
3. **Flux Dynamics** — Live flux simulation with toggleable chromatin interventions per gene
4. **Guide Design** — CRISPR guide RNA ranking by predicted flux impact

## Project Structure

```
src/
├── components/
│   ├── BiochemistryPage/    # Reaction network visualization
│   ├── EpigenomePage/       # Epigenomic layer integration
│   ├── FluxDynamicsPage/    # Interactive flux model
│   ├── GuideDesignPage/     # Guide RNA selection
│   └── Header/              # Navigation
├── data/
│   ├── pathway.js           # Chromatin states, metabolites, edges
│   ├── pathwayLayout.js     # Node positioning configuration
│   ├── reactions.js         # Biochemistry data (ΔG, cofactors)
│   └── guides.js            # CRISPR guide sequences
├── hooks/
│   ├── useFluxSolver.js     # Flux propagation algorithm
│   └── usePathwayLayout.js  # Layout computation
└── styles/
    ├── global.css
    └── shared.module.css
```

## Flux Model

The solver in `useFluxSolver.js` propagates flux through the pathway topology:

- **Single-exit nodes**: Chromatin accessibility limits throughput (multiplicative)
- **Branch points**: Chromatin determines split ratio (proportional)

```
Leucine (1.0)
    ↓ ×0.65 (BAT2)
α-ketoisocaproate (0.65)
    ↓ ×0.72 (ARO10)  
3-methylbutanal (0.47)
    ↓ ×0.68 (ADH6)
Isoamylol (0.32) ──┬── ATF1 (6%) ──→ Product (0.05)
                   └── Export (30%) ─→ Waste (0.27)
```

With ATF1 activated (70%), the branch split shifts dramatically: ~70% to product, ~30% to waste.

## Running Locally

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 + Vite
- CSS Modules
- SVG-based visualizations with spring physics animations

## Data Sources

Chromatin accessibility values are illustrative. In a real application, these would come from:
- ATAC-seq peak calling at promoter regions
- Normalized to 0-1 scale based on genome-wide distribution
- Optionally integrated with Hi-C contact frequencies and histone ChIP-seq

## License

MIT