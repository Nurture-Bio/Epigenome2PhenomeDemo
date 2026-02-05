import { useState } from 'react';
import {
    BiochemistryPage,
    EpigenomePage,
    FluxDynamicsPage,
    GuideDesignPage,
    Navigation,
    PageHeader,
} from './components';

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
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 flex flex-col overflow-hidden px-6 pb-6" key={activePage}>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-auto min-h-0">
          <ActivePage />
        </div>
      </main>
    </div>
  );
}

export default App;
