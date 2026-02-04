import { useState } from 'react';
import styles from './App.module.css';
import {
    FlavorSearchPage,
    GeneTopologyPage,
    GuideDesignPage,
    MetabolismPage,
    Navigation,
    PageHeader,
    SimulationPage,
} from './components';
import sharedStyles from './styles/shared.module.css';

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
    <div className={styles.app}>
      <Navigation activePage={activePage} setActivePage={setActivePage} />
      <main className={styles.content} key={activePage}>
        <PageHeader title={title} subtitle={subtitle} />
        <div className={sharedStyles.pageContent}>
          <ActivePage />
        </div>
      </main>
    </div>
  );
}

export default App;
