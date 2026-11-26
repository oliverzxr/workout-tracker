import { createRoot } from 'react-dom/client';
import { ArrowUpRight, CircleGauge, NotebookPen, Zap } from 'lucide-react';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/newsreader/latin-500.css';
import '@fontsource/newsreader/latin-600.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '../styles.css';
import './review.css';
import { App } from '../app/App';
import { directions } from './directions';
import type { Direction } from './directions';
import { DemoRepository, demoSnapshot } from './sample';

const symbols = { arranque: Zap, caderno: NotebookPen, cadencia: CircleGauge };

function Gallery() {
  return <main className="review-gallery">
    <header><p>Workout Tracker</p><h1>Três direções para treinar</h1>
      <p>Experimente a mesma sessão em cada proposta. A demonstração usa dados de exemplo e reinicia quando a página é recarregada.</p>
    </header>
    <div className="gallery-grid">{(Object.keys(directions) as Direction[]).map(id => {
      const direction = directions[id];
      const Symbol = symbols[id];
      const url = '?direction=' + id;
      return <article className="gallery-direction" data-direction={id} key={id}>
        <div className="gallery-sample"><Symbol size={22} /><span>{direction.name}</span></div>
        <div className="gallery-info">
          <p>{direction.summary}</p><p>{direction.interaction}</p>
          <a className="gallery-primary" href={url + '&state=active#/treino'}>Testar treino ativo<ArrowUpRight size={15} /></a>
          <div className="gallery-links"><a href={url}>Explorar com histórico</a><a href={url + '&state=empty'}>Explorar vazio</a></div>
        </div>
      </article>;
    })}</div>
  </main>;
}

const query = new URLSearchParams(location.search);
const chosen = query.get('direction');
const direction = chosen && Object.hasOwn(directions, chosen) ? chosen as Direction : null;
const demoState = query.get('state');
const mode = demoState === 'empty' || demoState === 'active' ? demoState : 'filled';
createRoot(document.getElementById('root')!).render(direction
  ? <App repository={new DemoRepository(demoSnapshot(mode))} direction={direction} />
  : <Gallery />);
