import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, Dumbbell, HardDrive, History as HistoryIcon, House, Layers3, Settings as Gear, WifiOff } from 'lucide-react';
import { brand, formatInputLoad, t } from './pt-BR';
import { usePwa } from './usePwa';
import { useTracker } from './useTracker';
import { download, exportBackup } from '../data/export';
import type { TrackerRepository } from '../data/repository';
import { editWorkout, finishDraft, newDraft, workoutExercise } from '../domain/model';
import type { Draft, Exercise, Routine, Snapshot, Workout } from '../domain/model';
import { Catalog } from '../ui/Catalog';
import { History, WorkoutDetail } from '../ui/History';
import { Home } from '../ui/Home';
import { Progress } from '../ui/Progress';
import { Routines } from '../ui/Routines';
import { Settings } from '../ui/Settings';
import { WorkoutEditor } from '../ui/WorkoutEditor';
import { ReviewHome } from '../review/ReviewHome';
import { ReviewHistory } from '../review/ReviewHistory';
import { ReviewNavigation } from '../review/ReviewNavigation';
import { designCopy } from '../review/directions';
import type { Direction } from '../review/directions';

const tabs = [
  ['inicio', t.nav.home, House],
  ['rotinas', t.nav.routines, Layers3],
  ['historico', t.nav.history, HistoryIcon],
  ['progresso', t.nav.progress, Activity],
  ['ajustes', t.nav.settings, Gear],
] as const;

type Page = typeof tabs[number][0] | 'exercicios' | 'treino' | 'detalhes' | 'editar';
type Route = { page: Page; id: string };
const pages: Page[] = [...tabs.map(([page]) => page), 'exercicios', 'treino', 'detalhes', 'editar'];

function readRoute(): Route {
  const [page, id] = window.location.hash.replace(/^#\/?/, '').split('/');
  return { page: pages.includes(page as Page) ? page as Page : 'inicio', id: id ?? '' };
}

function routeHash(route: Route) {
  return '#/' + route.page + (route.id ? '/' + route.id : '');
}

function upsert<T extends { id: string }>(values: T[], value: T) {
  return values.some(item => item.id === value.id) ? values.map(item => item.id === value.id ? value : item) : [...values, value];
}

function useConnectivity() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  return online;
}

export function App({ repository, direction: requestedDirection }: { repository: TrackerRepository; direction?: Direction }) {
  const direction = import.meta.env.MODE === 'design' ? requestedDirection : undefined;
  const { data, update, status, reload, retry } = useTracker(repository);
  const pwa = usePwa();
  const online = useConnectivity();
  const [route, setRoute] = useState(readRoute);
  const [newRoutine, setNewRoutine] = useState(false);
  const [notice, setNotice] = useState('');
  const [editorError, setEditorError] = useState('');
  const [editing, setEditing] = useState<Draft | null>(null);
  const editDirty = useRef(false);
  const content = useRef<HTMLElement>(null);
  const focusedRoute = useRef(routeHash(route));

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (editDirty.current || status === 'saving' || (data && (status === 'error' || status === 'conflict'))) {
        event.preventDefault();
      }
    };
    const hashChange = () => {
      const next = readRoute();
      if (next.page === route.page && next.id === route.id) return;
      if (editDirty.current && !window.confirm(t.active.cancelEdit)) {
        window.history.replaceState(null, '', routeHash(route));
        return;
      }
      editDirty.current = false;
      setEditing(null);
      setNotice('');
      setEditorError('');
      setRoute(next);
    };
    window.addEventListener('hashchange', hashChange);
    window.addEventListener('beforeunload', beforeUnload);
    return () => { window.removeEventListener('hashchange', hashChange); window.removeEventListener('beforeunload', beforeUnload); };
  }, [route, status, data]);

  useEffect(() => {
    const next = routeHash({ page: route.page, id: route.id });
    if (focusedRoute.current === next) return;
    focusedRoute.current = next;
    content.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route.page, route.id]);

  function navigate(page: Page, id = '') {
    if (editDirty.current && !window.confirm(t.active.cancelEdit)) return;
    editDirty.current = false;
    setEditing(null);
    setNotice('');
    setEditorError('');
    setRoute({ page, id });
    window.location.hash = routeHash({ page, id });
  }

  function start(routine?: Routine) {
    if (!data) return;
    if (data.draft) { navigate('treino'); setNotice(t.active.activeExists); return; }
    const entries = (routine?.items ?? []).flatMap(row => {
      const exercise = data.exercises.find(item => item.id === row.exerciseId);
      return exercise ? [workoutExercise(exercise, row.sets)] : [];
    });
    const draft = newDraft(routine?.name ?? t.home.free, entries);
    void update(current => current.draft ? current : { ...current, draft });
    navigate('treino');
  }

  function saveExercise(exercise: Exercise) {
    void update(current => ({ ...current, exercises: upsert(current.exercises, exercise) }));
  }

  function saveRoutine(routine: Routine) {
    void update(current => ({ ...current, routines: upsert(current.routines, routine) }));
  }

  const showWorkout = (workout: Workout) => navigate('detalhes', workout.id);
  const showNewRoutine = () => { navigate('rotinas'); setNewRoutine(true); };
  const selected = data?.workouts.find(item => item.id === route.id);
  const editor = route.page === 'editar' && selected ? editing ?? editWorkout(selected, formatInputLoad) : data?.draft;
  const editingHistory = route.page === 'editar';
  const sessionOpen = Boolean(editor && (route.page === 'treino' || editingHistory));
  const alert = status === 'error' || status === 'conflict';
  const mainTab = route.page === 'exercicios' ? 'rotinas' : route.page === 'detalhes' || route.page === 'editar' ? 'historico' : route.page === 'treino' ? 'inicio' : route.page;

  async function finish() {
    if (!editor || status === 'conflict') return;
    if (editingHistory && editor.exercises.some(item => item.sets.some(set => !set.completed))) {
      setEditorError(t.active.editPending); return;
    }
    const workout = finishDraft(editor, editingHistory ? selected?.finishedAt : undefined);
    if (!workout) { setEditorError(t.active.finishInvalid); return; }
    if (!editingHistory && editor.exercises.some(item => item.sets.some(set => !set.completed && (set.load || set.reps || set.rir))) &&
      !window.confirm(t.active.confirmUnfinished)) return;
    const success = await update(current => ({
      ...current, workouts: upsert(current.workouts, workout), draft: editingHistory ? current.draft : null,
    }));
    if (success) { editDirty.current = false; showWorkout(workout); }
  }

  let page;
  if (data) {
    if (route.page === 'rotinas') page = <Routines routines={data.routines} exercises={data.exercises} openNew={newRoutine}
      setOpenNew={setNewRoutine} save={saveRoutine} remove={routine => { void update(current => ({ ...current, routines: current.routines.filter(item => item.id !== routine.id) })); }}
      start={start} catalog={() => navigate('exercicios')} direction={direction} />;
    else if (route.page === 'exercicios') page = <><div className="editor-top"><button className="text-button" onClick={() => navigate('rotinas')}><ArrowLeft size={17} />{t.nav.routines}</button></div>
      <Catalog exercises={data.exercises} save={saveExercise} /></>;
    else if (route.page === 'progresso') page = <Progress workouts={data.workouts} exercises={data.exercises} direction={direction} />;
    else if (route.page === 'ajustes') page = <Settings data={data} save={(value: Snapshot) => update(() => value)}
      install={pwa.install} installed={pwa.installed} offline={pwa.offline} demo={Boolean(direction)} />;
    else if (route.page === 'detalhes' && selected) page = <WorkoutDetail value={selected} back={() => navigate('historico')}
      edit={() => navigate('editar', selected.id)} remove={async () => {
        if (await update(current => ({ ...current, workouts: current.workouts.filter(item => item.id !== selected.id) }))) navigate('historico');
      }} />;
    else if ((route.page === 'treino' || (editingHistory && selected)) && editor) page = <WorkoutEditor key={editor.id} value={editor} editing={editingHistory}
      change={apply => {
        setEditorError('');
        if (editingHistory) {
          editDirty.current = true;
          setEditing(current => apply(current ?? editor));
        } else void update(current => current.draft ? { ...current, draft: apply(current.draft) } : current);
      }}
      exercises={data.exercises} workouts={data.workouts} close={() => editingHistory && selected ? showWorkout(selected) : navigate('inicio')}
      finish={() => { void finish(); }} discard={editingHistory ? undefined : async () => {
        if (window.confirm(t.active.confirmDiscard) && await update(current => ({ ...current, draft: null }))) navigate('inicio');
      }} saveStatus={direction ? designCopy.demoSaved : editingHistory || alert || status === 'loading' ? '' : t.storage[status]} error={editorError} direction={direction} />;
    else if (mainTab === 'historico') page = direction ? <ReviewHistory workouts={data.workouts} detail={showWorkout} home={() => navigate('inicio')} /> : <History workouts={data.workouts} detail={showWorkout} />;
    else {
      const home = { data, start, resume: () => navigate('treino'), routines: () => navigate('rotinas'), create: showNewRoutine, history: () => navigate('historico'), detail: showWorkout };
      page = direction ? <ReviewHome {...home} direction={direction} /> : <Home {...home} />;
    }
  }

  return <div className="app-shell" data-direction={direction} data-session={direction && sessionOpen ? true : undefined}>
    <a href="#conteudo" className="skip-link" onClick={event => { event.preventDefault(); content.current?.focus(); }}>{t.shell.skip}</a>
    {direction ? <ReviewNavigation direction={direction} items={tabs.slice(0, 4)} active={mainTab} home={() => navigate('inicio')}
      settings={() => navigate('ajustes')} train={() => data?.draft ? navigate('treino') : start()} navigate={navigate} /> : <>
    <aside className="rail">
      <button className="brand" onClick={() => navigate('inicio')}><span className="brand-mark"><Dumbbell size={22} strokeWidth={1.8} /></span>
        <span>{brand.name}</span></button>
      <nav aria-label={t.shell.navigation}>{tabs.map(([id, label, Icon]) => <button key={id} type="button" aria-current={mainTab === id ? 'page' : undefined} onClick={() => navigate(id)}>
        <Icon size={20} strokeWidth={1.75} /><span>{label}</span>
      </button>)}</nav>
      <button className="local-badge" title={t.shell.localHelp} onClick={() => navigate('ajustes')}><HardDrive size={16} />{t.shell.local}</button>
    </aside>
    <header className="mobile-brand"><button className="brand" onClick={() => navigate('inicio')}><span className="brand-mark"><Dumbbell size={19} /></span><span>{brand.name}</span></button>
      <button className="icon-button" aria-label={t.shell.localHelp} onClick={() => navigate('ajustes')}>{online ? <HardDrive size={19} /> : <WifiOff size={19} />}</button>
    </header></>}
    <main ref={content} id="conteudo" tabIndex={-1} className="main-content">
      {!online && <div className="banner muted"><WifiOff size={16} />{t.shell.offline}</div>}
      {pwa.update && <div className="banner"><span>{t.settings.updateNotice}</span><button className="button secondary" disabled={status !== 'saved' || editDirty.current} onClick={pwa.applyUpdate}>{t.settings.update}</button></div>}
      {alert && <div className="banner error" role="alert">
        <span>{t.storage[status]}</span>
        <div className="split">
          {data && <button className="button secondary" onClick={() => download(exportBackup(data), 'workout-tracker-recuperacao.json', 'application/json')}>{t.settings.backup}</button>}
          <button className="button secondary" onClick={() => { void (status === 'conflict' || !data ? reload() : retry()); }}>{status === 'conflict' ? t.storage.reload : t.storage.retry}</button>
        </div>
      </div>}
      {notice && <div role="status" className="banner">{notice}</div>}
      {page ?? (status === 'loading' && <p role="status" className="muted">{t.storage.loading}</p>)}
    </main>
  </div>;
}
