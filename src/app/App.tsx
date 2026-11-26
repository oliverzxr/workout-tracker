import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, Dumbbell, History as HistoryIcon, House, Layers3, Settings as Gear, WifiOff } from 'lucide-react';
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

export function App({ repository, demo = false }: { repository: TrackerRepository; demo?: boolean }) {
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
      start={start} catalog={() => navigate('exercicios')} />;
    else if (route.page === 'exercicios') page = <><div className="editor-top"><button className="text-button" onClick={() => navigate('rotinas')}><ArrowLeft size={17} />{t.nav.routines}</button></div>
      <Catalog exercises={data.exercises} save={saveExercise} /></>;
    else if (route.page === 'progresso') page = <Progress workouts={data.workouts} exercises={data.exercises} />;
    else if (route.page === 'ajustes') page = <Settings data={data} save={(value: Snapshot) => update(() => value)}
      install={pwa.install} installed={pwa.installed} offline={pwa.offline} demo={demo} />;
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
      }} saveStatus={demo ? t.shell.demo : editingHistory || alert || status === 'loading' ? '' : t.storage[status]} error={editorError} />;
    else if (mainTab === 'historico') page = <History workouts={data.workouts} detail={showWorkout} />;
    else page = <Home data={data} start={start} resume={() => navigate('treino')} routines={() => navigate('rotinas')}
      create={showNewRoutine} history={() => navigate('historico')} detail={showWorkout} />;
  }

  return <div className="app-shell" data-session={sessionOpen ? 'open' : undefined}>
    <a href="#conteudo" className="skip-link" onClick={event => { event.preventDefault(); content.current?.focus(); }}>{t.shell.skip}</a>
    <header className="app-header">
      <div className="app-header-inner">
        <button type="button" className="brand" onClick={() => navigate('inicio')}>
          <span className="brand-mark"><Dumbbell size={20} strokeWidth={1.8} aria-hidden="true" /></span><span>{brand.name}</span>
        </button>
        <nav aria-label={t.shell.navigation} className="app-navigation">
          <div className="nav-tabs">
            {tabs.slice(0, -1).map(([id, label, Icon]) => <button key={id} type="button" aria-current={mainTab === id ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={21} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>
            </button>)}
          </div>
          <button type="button" className="icon-button nav-settings" aria-label={t.nav.settings} aria-current={mainTab === 'ajustes' ? 'page' : undefined} title={t.nav.settings} onClick={() => navigate('ajustes')}>
            <Gear size={21} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
    <main ref={content} id="conteudo" tabIndex={-1} className="main-content">
      {demo && !sessionOpen && <div className="demo-note">{t.shell.demo} <span>{t.shell.demoNote}</span></div>}
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
