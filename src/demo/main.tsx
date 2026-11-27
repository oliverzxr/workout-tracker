import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '../styles.css';
import { App } from '../app/App';
import { DemoRepository, demoSnapshot } from './sample';
import { MemoryFitnessRepository } from '../fitness/repository';
import { demoFitness } from './fitness';

const state = new URLSearchParams(location.search).get('state');
const mode = state === 'empty' || state === 'active' ? state : 'filled';
createRoot(document.getElementById('root')!).render(<App repository={new DemoRepository(demoSnapshot(mode))} fitnessRepository={new MemoryFitnessRepository(demoFitness(mode === 'empty'))} demo />);
