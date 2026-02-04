import { useState } from 'react';
import styles from './App.module.css';
import {
    BiochemistryPage,
    EpigenomePage,
    FluxDynamicsPage,
    GuideDesignPage,
    Navigation,
    PageHeader,
} from './components';
import sharedStyles from './styles/shared.module.css';

const pages = [
  {
    component: BiochemistryPage,
    title: 'Biochemistry Layer',
    subtitle: 'The same thermodynamics govern every living cell. One physics. Universal.',
  },
  {
    component: EpigenomePage,
    title: 'Epigenome Layer',
    subtitle: 'Each regulatory layer constrains which genes can be active. One unified score.',
  },
  {
    component: FluxDynamicsPage,
    title: 'Flux Dynamics',
    subtitle: 'Chromatin accessibility constrains metabolic flux. Click any enzyme to simulate dCas9-VPR activation.',
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
