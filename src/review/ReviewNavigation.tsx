import { CircleGauge, Dumbbell, NotebookPen, Settings, Zap } from 'lucide-react';
import { brand, t } from '../app/pt-BR';
import { designCopy } from './directions';
import type { Direction } from './directions';
import type { LucideIcon } from 'lucide-react';

const symbols = { arranque: Zap, caderno: NotebookPen, cadencia: CircleGauge };

export function ReviewNavigation<Key extends string>({ direction, items, active, home, settings, train, navigate }: {
  direction: Direction; items: ReadonlyArray<readonly [Key, string, LucideIcon]>; active: string;
  home: () => void; settings: () => void; train: () => void; navigate: (page: Key) => void;
}) {
  const Symbol = symbols[direction];
  return <header className="review-chrome">
    <div className="review-chrome-inner">
      <button type="button" className="review-brand" onClick={home}><Symbol size={22} /><span>{brand.name}</span></button>
      <nav aria-label={t.shell.navigation} className="review-nav">
        {items.map(([page, label, Icon], index) => <div className="review-nav-slot" key={page}>
          {index === 2 && direction === 'cadencia' && <button type="button" className="review-train-tab" onClick={train}><Dumbbell size={21} /><span>{designCopy.train}</span></button>}
          <button type="button" onClick={() => navigate(page)} aria-current={page === active ? 'page' : undefined}><Icon size={20} /><span>{label}</span></button>
        </div>)}
      </nav>
      <div className="review-tools">
        <a className="review-compare" href="./design.html" aria-label={designCopy.compare} title={designCopy.compare}>Demo</a>
        <button type="button" className="icon-button" aria-label={t.nav.settings} onClick={settings}><Settings size={20} /></button>
      </div>
    </div>
  </header>;
}
