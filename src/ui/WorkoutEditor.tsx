import { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Clock3, Copy, Ellipsis, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { formatInputLoad, formatNumber, t } from '../app/pt-BR';
import { emptySet, move, parseSet, remaining, workoutExercise } from '../domain/model';
import type { Draft, DraftExercise, DraftSet, Exercise, SavedSet, Workout } from '../domain/model';
import { ExercisePicker } from './Catalog';
import { Dialog, Empty, Title } from './primitives';

type Change = (apply: (value: Draft) => Draft) => void;
type RowChange = (apply: (value: DraftExercise) => DraftExercise) => void;
type Menu = { exerciseId: string; setId?: string };

function Timer({ timer, update }: { timer: NonNullable<Draft['timer']>; update: (endAt: number | null) => void }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const handle = window.setInterval(refresh, 250);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(handle); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const seconds = remaining(timer.endAt, now);
  const clock = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  return <aside className="timer" aria-label={t.active.rest}>
    <span className="timer-icon"><Clock3 size={20} /></span>
    <span className="timer-time" role="timer" aria-label={t.active.rest}>{clock}</span>
    <div className="timer-name"><strong aria-live="polite">{seconds ? t.active.rest : t.active.timerComplete}</strong><small>{timer.exercise}</small></div>
    <button className="button secondary timer-extra" aria-label={t.active.addTime} onClick={() => update(Math.max(Date.now(), timer.endAt) + 15000)}>+15 s</button>
    <button className="icon-button" aria-label={t.active.stop} onClick={() => update(null)}><X size={19} /></button>
    <progress className="rest-progress" max={Math.max(1, timer.duration)} value={Math.min(timer.duration, seconds)} aria-hidden="true" />
  </aside>;
}

function Previous({ set, copy, editing }: { set?: SavedSet; copy: () => void; editing: boolean }) {
  if (!set) return <span className="muted previous-value">{t.active.noPrevious}</span>;
  return <div className="previous-value" data-label={t.active.previous}>
    <span>{formatNumber(set.grams / 1000)} kg × {set.reps}{set.rir !== null && <small> · RIR {set.rir}</small>}</span>
    {!editing && <button className="icon-button tiny" type="button" aria-label={t.active.copy} title={t.active.copy} onClick={copy}><Copy size={15} /></button>}
  </div>;
}

function ExerciseEntry({ entry, previous, change, menu }: {
  entry: DraftExercise; previous: NonNullable<Workout['exercises'][number]> | undefined; change: RowChange;
  menu: (setId?: string) => void;
}) {
  const [invalid, setInvalid] = useState<string | null>(null);
  const patchSet = (id: string, patch: Partial<DraftSet>) => {
    if (invalid === id) setInvalid(null);
    change(row => ({ ...row, sets: row.sets.map(set => set.id === id ? { ...set, ...patch } : set) }));
  };
  const next = entry.sets.findIndex(set => !set.completed);
  return <section id={'movimento-' + entry.id} tabIndex={-1} className="exercise-entry" aria-label={entry.name}>
    <header className="exercise-head">
      <div><h2>{entry.name}</h2><p>{t.muscles[entry.muscle]} <span>·</span> {t.active.rest} {entry.rest ? entry.rest + ' s' : t.active.noRest}</p></div>
      <button className="icon-button" type="button" aria-label={t.active.options + ' ' + entry.name} onClick={() => menu()}><Ellipsis size={22} /></button>
    </header>
    <div className="set-grid set-head" aria-hidden="true"><span>{t.active.series}</span><span>{t.active.previous}</span><span>{t.active.load} (kg)</span><span>{t.common.reps}</span><span>{t.common.rir}</span><span /></div>
    {entry.sets.map((set, index) => {
      const sequence = entry.sets.slice(0, index).filter(item => item.kind === set.kind).length;
      const lastSets = previous?.sets.filter(item => item.kind === set.kind);
      const last = lastSets?.[sequence];
      const label = ' ' + t.active.series.toLocaleLowerCase() + ' ' + (index + 1);
      const helpId = invalid === set.id ? 'erro-serie-' + set.id : undefined;
      return <div className={'set-grid set-row' + (set.completed ? ' completed' : '')} data-next={index === next ? true : undefined} key={set.id}>
        <button className={'set-kind ' + set.kind} onClick={() => menu(set.id)} type="button" title={t.kinds[set.kind]} aria-label={t.active.options + label + ' · ' + t.kinds[set.kind]}>
          {set.kind === 'warmup' ? 'A' : index + 1}
        </button>
        <Previous set={last} editing={set.completed} copy={() => {
          if (last) patchSet(set.id, { load: formatInputLoad(last.grams), reps: String(last.reps), rir: last.rir === null ? '' : String(last.rir) });
        }} />
        <input aria-label={t.active.load + label} aria-describedby={helpId} inputMode="decimal" placeholder="—" readOnly={set.completed} maxLength={20} value={set.load} onChange={event => patchSet(set.id, { load: event.target.value })} />
        <input aria-label={t.common.reps + label} aria-describedby={helpId} inputMode="numeric" placeholder="—" readOnly={set.completed} maxLength={5} value={set.reps} onChange={event => patchSet(set.id, { reps: event.target.value })} />
        <input aria-label={t.common.rir + label} aria-describedby={helpId} inputMode="numeric" placeholder="—" readOnly={set.completed} maxLength={5} value={set.rir} onChange={event => patchSet(set.id, { rir: event.target.value })} />
        <button className="check-set" type="button" aria-pressed={set.completed} aria-label={(set.completed ? t.active.reopen : t.active.complete) + ' ' + (index + 1)} onClick={() => {
          if (!set.completed && !parseSet(set)) { setInvalid(set.id); return; }
          setInvalid(null);
          patchSet(set.id, { completed: !set.completed });
        }}><Check size={21} /></button>
        {helpId && <p id={helpId} className="error set-error" role="alert">{t.active.invalid}</p>}
      </div>;
    })}
    <button className="text-button add-set" type="button" onClick={() => change(row => {
      const last = row.sets.at(-1);
      const set = emptySet();
      return { ...row, sets: [...row.sets, last ? { ...set, load: last.load, reps: last.reps } : set] };
    })}><Plus size={16} />{t.active.addSet}</button>
  </section>;

}

function RowOptions({ menu, value, change, close, editing }: { menu: Menu; value: Draft; change: Change; close: () => void; editing: boolean }) {
  const entryIndex = value.exercises.findIndex(item => item.id === menu.exerciseId);
  const entry = value.exercises[entryIndex];
  const [rest, setRest] = useState(String(entry?.rest ?? 0));
  if (!entry) return null;
  const setIndex = entry.sets.findIndex(item => item.id === menu.setId);
  const set = entry.sets[setIndex];
  const updateRow = (apply: (value: DraftExercise) => DraftExercise) => change(current => ({
    ...current, exercises: current.exercises.map(item => item.id === entry.id ? apply(item) : item),
  }));
  const reorder = (step: -1 | 1) => {
    if (set) updateRow(row => ({ ...row, sets: move(row.sets, setIndex, step) }));
    else change(current => ({ ...current, exercises: move(current.exercises, entryIndex, step) }));
    close();
  };
  return <Dialog title={set ? t.active.series + ' ' + (setIndex + 1) : entry.name} close={close}>
    <div className="dialog-body form">
      {set && <label>{t.common.sets}<select value={set.kind} onChange={event => {
        const kind = event.target.value === 'warmup' ? 'warmup' : 'work';
        updateRow(row => ({ ...row, sets: row.sets.map(item => item.id === set.id ? { ...item, kind } : item) }));
      }}><option value="work">{t.kinds.work}</option><option value="warmup">{t.kinds.warmup}</option></select></label>}
      {!set && <form className="rest-form" onSubmit={event => { event.preventDefault(); updateRow(row => ({ ...row, rest: Number(rest) })); close(); }}>
        <label>{t.common.restSeconds}<input type="number" required min={0} max={900} value={rest} onChange={event => setRest(event.target.value)} /></label>
        <button className="button secondary" type="submit">{t.common.save}</button>
      </form>}
      {!set && !editing && entry.rest > 0 && <button className="button secondary" onClick={() => { change(current => ({ ...current, timer: { endAt: Date.now() + entry.rest * 1000, duration: entry.rest, exercise: entry.name } })); close(); }}><Clock3 size={17} />{t.active.restNow}</button>}
      <div className="split"><button className="button secondary" disabled={(set ? setIndex : entryIndex) === 0} onClick={() => reorder(-1)}><ArrowUp size={17} />{t.active.reorderUp}</button>
      <button className="button secondary" disabled={(set ? setIndex : entryIndex) >= (set ? entry.sets.length : value.exercises.length) - 1} onClick={() => reorder(1)}><ArrowDown size={17} />{t.active.reorderDown}</button></div>
      <button className="button danger" onClick={() => {
        if (set) updateRow(row => ({ ...row, sets: row.sets.filter(item => item.id !== set.id) }));
        else change(current => ({ ...current, exercises: current.exercises.filter(item => item.id !== entry.id) }));
        close();
      }}><Trash2 size={17} />{set ? t.active.removeSet : t.active.removeExercise}</button>
    </div>
  </Dialog>;
}

export function WorkoutEditor({ value, change, exercises, workouts, close, finish, discard, saveStatus, editing, error }: {
  value: Draft; change: Change; exercises: Exercise[]; workouts: Workout[]; close: () => void; finish: () => void;
  discard?: () => void; saveStatus: string; editing: boolean; error: string;
}) {
  const [picker, setPicker] = useState(false);
  const [menu, setMenu] = useState<Menu | null>(null);
  const earlier = workouts.filter(item => item.id !== value.id && item.startedAt <= value.startedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const completed = value.exercises.reduce((count, item) => count + item.sets.filter(set => set.completed).length, 0);
  const planned = value.exercises.reduce((count, item) => count + item.sets.length, 0);
  return <>
    <header className="session-heading">
      <div className="editor-top"><button className="text-button" onClick={close}><ArrowLeft size={18} aria-hidden="true" />{editing ? t.common.cancel : t.nav.home}</button><span className="save-status">{saveStatus}</span></div>
      <Title heading={editing ? t.active.editHeading : t.active.heading} />
      <label className="session-name">{t.active.name}<input value={value.name} maxLength={80} onChange={event => { const name = event.target.value; change(current => ({ ...current, name })); }} /></label>
      {planned > 0 && <div className="session-progress">
        <span>{t.active.completedSets}</span><progress value={completed} max={planned} aria-label={t.active.completedSets} /><strong>{completed}/{planned}</strong>
      </div>}
    </header>
    {value.exercises.length > 1 && <nav className="session-sequence" aria-label={t.active.jump}>
      {value.exercises.map((item, index) => <button key={item.id} type="button" onClick={() => {
        const exercise = document.getElementById('movimento-' + item.id);
        exercise?.focus({ preventScroll: true });
        exercise?.scrollIntoView({ block: 'start' });
      }}>
        <span>{index + 1}</span>{item.name}
      </button>)}
    </nav>}
    <div className="workout-exercises">
      {value.exercises.length === 0 && <Empty title={t.active.empty} />}
      {value.exercises.map(entry => <ExerciseEntry key={entry.id} entry={entry}
        previous={earlier.map(item => item.exercises.find(row => row.exerciseId === entry.exerciseId)).find(Boolean)}
        change={apply => change(current => {
          const previous = current.exercises.find(row => row.id === entry.id);
          if (!previous) return current;
          const next = apply(previous);
          const start = !editing && next.rest > 0 && next.sets.some(set => set.completed && previous.sets.some(old => old.id === set.id && !old.completed));
          const timer = start ? { endAt: Date.now() + next.rest * 1000, duration: next.rest, exercise: next.name } : current.timer;
          return { ...current, timer, exercises: current.exercises.map(row => row.id === entry.id ? next : row) };
        })}
        menu={setId => setMenu({ exerciseId: entry.id, setId })} />)}
    </div>
    <div className="workout-actions">
      <p className="muted rir-help">{t.active.rirHelp}</p>
      {error && <p className="error" role="alert">{error}</p>}
      {discard && <button className="text-button danger" onClick={discard}><RotateCcw size={16} />{t.active.discard}</button>}
    </div>
    <div className="workout-dock">
      {!editing && value.timer && <Timer timer={value.timer} update={endAt => change(current => ({ ...current, timer: endAt === null || !current.timer ? null : { ...current.timer, endAt } }))} />}
      <div className="dock-actions">
        <button className="button secondary" onClick={() => setPicker(true)}><Plus size={18} aria-hidden="true" />{t.catalog.pick}</button>
        <button className="button primary finish-button" onClick={finish}><Check size={18} aria-hidden="true" />{editing ? t.common.save : t.active.finish}</button>
      </div>
    </div>
    {picker && <ExercisePicker exercises={exercises} choose={item => { change(current => ({ ...current, exercises: [...current.exercises, workoutExercise(item)] })); setPicker(false); }} close={() => setPicker(false)} />}
    {menu && <RowOptions key={menu.exerciseId + (menu.setId ?? '')} menu={menu} value={value} change={change} editing={editing} close={() => setMenu(null)} />}
  </>;
}
