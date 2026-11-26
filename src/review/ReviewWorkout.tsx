import { ArrowLeft, Check, ChevronRight, ListChecks, Pencil } from 'lucide-react';
import { t } from '../app/pt-BR';
import type { Draft, DraftExercise } from '../domain/model';
import { designCopy } from './directions';
import type { Direction } from './directions';

export function ReviewWorkoutHeader({ value, close, finish, editing, saveStatus, changeName }: {
  value: Draft; close: () => void; finish: () => void; editing: boolean; saveStatus: string; changeName: (name: string) => void;
}) {
  const sets = value.exercises.flatMap(item => item.sets);
  const completed = sets.filter(set => set.completed).length;
  return <header className="review-workout-head">
    <div className="workout-head-actions">
      <button type="button" className="icon-button back-session" aria-label={editing ? t.common.cancel : designCopy.workoutBack} onClick={close}><ArrowLeft size={22} /></button>
      <span className="save-status">{saveStatus}</span>
      <button type="button" className="button finish-top" onClick={finish}>{editing ? t.common.save : t.active.finish}</button>
    </div>
    <div className="workout-head-name">
      <div><p>{editing ? t.active.editHeading : designCopy.active}</p><h1>{value.name || t.home.free}</h1></div>
      <details className="edit-workout-name">
        <summary aria-label={designCopy.workoutSettings} title={designCopy.workoutSettings}><Pencil size={17} /></summary>
        <label>{t.active.name}<input value={value.name} maxLength={80} onChange={event => changeName(event.target.value)} /></label>
      </details>
    </div>
    {sets.length > 0 && <div className="workout-progress">
      <span><ListChecks size={17} />{designCopy.completed}</span>
      <progress value={completed} max={sets.length} aria-label={designCopy.completed} />
      <strong>{completed}/{sets.length}</strong>
    </div>}
  </header>;
}

export function ExerciseSequence({ items, direction, selected, onSelect }: {
  items: DraftExercise[]; direction: Direction; selected: string; onSelect: (id: string) => void;
}) {
  if (!items.length || direction === 'caderno') return null;
  return <section className="exercise-sequence" aria-label={designCopy.exerciseOrder}>
    {direction === 'cadencia' && <h2>{designCopy.exerciseOrder}</h2>}
    <ol>{items.map((item, index) => {
      const completed = item.sets.filter(set => set.completed).length;
      const isDone = completed > 0 && completed === item.sets.length;
      return <li key={item.id}><button type="button" aria-pressed={selected === item.id} onClick={() => onSelect(item.id)}>
        <span className="sequence-n">{isDone ? <Check size={16} /> : String(index + 1).padStart(2, '0')}</span>
        <span className="sequence-name">{item.name}</span><span className="sequence-count">{completed}/{item.sets.length}</span>
        <ChevronRight className="sequence-arrow" size={14} />
      </button></li>;
    })}</ol>
  </section>;
}
