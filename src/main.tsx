import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/barlow-semi-condensed/latin-600.css';
import '@fontsource/barlow-semi-condensed/latin-700.css';
import './styles.css';
import { App } from './app/App';
import { IndexedTrackerRepository } from './data/repository';

createRoot(document.getElementById('root')!).render(<App repository={new IndexedTrackerRepository()} />);
