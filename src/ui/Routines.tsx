import { useState } from 'react';
import { Dumbbell, Layers3, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { t } from '../app/pt-BR';
import { move, newId } from '../domain/model';
import type { Exercise, Routine } from '../domain/model';
import { ExercisePicker } from './Catalog';
import { Dialog, Empty, Order, Title } from './primitives';

function RoutineForm({ routine, exercises, save, close }: {
  routine: Routine | null; exercises: Exercise[]; save: (item: Routine) => void; close: () => void;
}) {
  const [name, setName] = useState(routine?.name ?? '');
  const [items, setItems] = useState(routine?.items ?? []);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState(false);
  return <>
    <Dialog title={routine ? t.routines.edit : t.routines.create} close={close}>
      <form className="dialog-body form" onSubmit={event => {
        event.preventDefault();
        if (!name.trim() || !items.length || items.some(item => item.sets < 1 || item.sets > 20 || !Number.isInteger(item.sets))) { setError(true); return; }
        save({ id: routine?.id ?? newId(), name: name.trim(), items });
      }}>
        <label>{t.routines.name}<input maxLength={80} value={name} onChange={event => setName(event.target.value)} /></label>
        <div className="list">{items.map((row, index) => {
          const exercise = exercises.find(item => item.id === row.exerciseId);
          const label = (exercise?.name ?? t.common.exercise) + ' ' + (index + 1);
          return <div className="routine-entry" key={row.id}>
            <div className="row-content"><strong>{exercise?.name ?? t.common.exercise}</strong><small>{exercise?.archived && t.catalog.archived}</small></div>
            <input type="number" min={1} max={20} inputMode="numeric" aria-label={t.routines.sets + ' ' + label} value={row.sets || ''} onChange={event => {
              const sets = Number(event.target.value);
              setItems(current => current.map(item => item.id === row.id ? { ...item, sets } : item));
            }} />
            <Order index={index} length={items.length} label={label} move={step => setItems(current => move(current, index, step))} />
            <button type="button" className="icon-button" aria-label={t.common.remove + ' ' + label} onClick={() => setItems(current => current.filter(item => item.id !== row.id))}><Trash2 size={17} /></button>
          </div>;
        })}</div>
        <button type="button" className="button secondary" onClick={() => setPicker(true)}><Plus size={17} />{t.catalog.pick}</button>
        {error && <p className="error" role="alert">{t.routines.invalid}</p>}
        <button type="submit" className="button primary">{t.common.save}</button>
      </form>
    </Dialog>
    {picker && <ExercisePicker exercises={exercises} close={() => setPicker(false)} choose={item => {
      setItems(current => [...current, { id: newId(), exerciseId: item.id, sets: 3 }]);
      setPicker(false);
    }} />}
  </>;
}

export function Routines({ routines, exercises, openNew, setOpenNew, save, remove, start, catalog }: {
  routines: Routine[]; exercises: Exercise[]; openNew: boolean; setOpenNew: (value: boolean) => void;
  save: (item: Routine) => void; remove: (item: Routine) => void; start: (item: Routine) => void; catalog: () => void;
}) {
  const [editing, setEditing] = useState<Routine | null>(null);
  return <>
    <Title heading={t.routines.heading} subtitle={t.routines.description} action={<button className="button primary" onClick={() => setOpenNew(true)}><Plus size={17} />{t.routines.create}</button>} />
    <div className="section-head"><button className="button secondary" onClick={catalog}><Dumbbell size={17} />{t.routines.catalog}</button></div>
    {routines.length ? <div className="list">{routines.map(routine => <article className="routine-list" key={routine.id}>
      <div className="list-row"><span className="row-icon"><Layers3 size={19} /></span><div className="row-content">
        <strong>{routine.name}</strong><small>{routine.items.map(item => exercises.find(exercise => exercise.id === item.exerciseId)?.name).filter(Boolean).join(' · ')}</small>
      </div><button className="icon-button" aria-label={t.common.edit + ' ' + routine.name} onClick={() => setEditing(routine)}><Pencil size={17} /></button>
        <button className="icon-button" aria-label={t.routines.remove + ' ' + routine.name} onClick={() => { if (window.confirm(t.routines.confirm)) remove(routine); }}><Trash2 size={17} /></button>
      </div>
      <button className="button secondary" onClick={() => start(routine)}><Play size={15} />{t.routines.start}</button>
    </article>)}</div> : <Empty title={t.routines.empty} detail={t.home.noRoutines} />}
    {(openNew || editing) && <RoutineForm routine={editing} exercises={exercises} close={() => { setOpenNew(false); setEditing(null); }} save={item => {
      save(item); setOpenNew(false); setEditing(null);
    }} />}
  </>;
}
