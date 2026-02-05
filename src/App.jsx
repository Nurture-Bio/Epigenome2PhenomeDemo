import { useState } from 'react';
import {
    FlavorSearchPage,
    GeneTopologyPage,
    GuideDesignPage,
    MetabolismPage,
    Navigation,
    PageHeader,
    SimulationPage,
} from './components';

const pages = [
  {
    component: FlavorSearchPage,
    title: 'Flavor Search',
    subtitle: 'From banana beer to citrus IPA. Find the genes that make flavor compounds.',
  },
  {
    component: MetabolismPage,
    title: 'Metabolic Landscape',
    subtitle: 'The same thermodynamics govern every living cell. One physics. Universal.',
  },
  {
    component: GeneTopologyPage,
    title: 'Gene Topology',
    subtitle: 'Each regulatory layer constrains which genes can be active. One unified score.',
  },
  {
    component: SimulationPage,
    title: 'Simulation',
    subtitle: 'Chromatin accessibility constrains metabolic flux. Click any enzyme to simulate activation or repression.',
  },
  {
    component: GuideDesignPage,
    title: 'Guide Design',
    subtitle: 'CRISPR guides ranked by predicted flux impact. Target accessible chromatin for maximum effect.',
  },
];

function App() {
  const [activePage, setActivePage] = useState(0);
  const { component: ActivePage, title, subtitle } = pages[activePage];

  return (
    <div className="min-h-screen overflow-hidden">
      <Navigation activePage={activePage} setActivePage={setActivePage} />
      <main className="grid grid-rows-[auto_1fr] gap-6 px-10 py-6 h-[calc(100vh-81px)] overflow-hidden" key={activePage}>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="overflow-auto min-h-0 animate-[pageContentFadeIn_0.4s_ease-out_0.1s_both]">
          <ActivePage />
        </div>
      </main>
    </div>
  );
}

export default App;
