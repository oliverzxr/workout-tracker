import { useState } from 'react';
import { Archive, Dumbbell, Pencil, Plus, Search, Undo2 } from 'lucide-react';
import { locale, t } from '../app/pt-BR';
import { equipment, muscles, newId } from '../domain/model';
import type { Equipment, Exercise, Muscle } from '../domain/model';
import { Dialog, Empty, Title } from './primitives';

const normalize = (text: string) => text.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{Diacritic}/gu, '');

function ExerciseList({ exercises, choose, edit, archive }: {
  exercises: Exercise[]; choose?: (item: Exercise) => void; edit?: (item: Exercise) => void; archive?: (item: Exercise) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Muscle | ''>('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const listed = exercises.filter(item => (includeArchived || !item.archived) && (!filter || item.muscle === filter) &&
    normalize(item.name).includes(normalize(query.trim()))).sort((a, b) => a.name.localeCompare(b.name, locale));
  return <>
    <div className="catalog-filters">
      <label className="search"><Search size={18} /><input aria-label={t.catalog.search} placeholder={t.catalog.search} value={query} onChange={event => setQuery(event.target.value)} /></label>
      <select aria-label={t.common.muscle} value={filter} onChange={event => setFilter(event.target.value as Muscle | '')}>
        <option value="">{t.common.muscle}</option>
        {muscles.map(value => <option key={value} value={value}>{t.muscles[value]}</option>)}
      </select>
    </div>
    {archive && <label className="checkbox-line"><input type="checkbox" checked={includeArchived} onChange={event => setIncludeArchived(event.target.checked)} />{t.catalog.showArchived}</label>}
    {listed.length ? <div className="list">{listed.map(item => {
      const shape = <><span className="row-icon"><Dumbbell size={19} /></span><span className="row-content"><strong>{item.name}</strong>
        <small>{t.muscles[item.muscle]} · {t.equipment[item.equipment]}{item.archived ? ' · ' + t.catalog.archived : ''}</small></span></>;
      return choose ? <button className="list-row clickable" type="button" key={item.id} onClick={() => choose(item)}>{shape}<Plus size={18} /></button> :
        <div className="list-row" key={item.id}>{shape}
          <button className="icon-button" onClick={() => edit?.(item)} aria-label={t.common.edit + ' ' + item.name}><Pencil size={17} /></button>
          <button className="icon-button" onClick={() => archive?.(item)} aria-label={(item.archived ? t.catalog.restore : t.catalog.archive) + ' ' + item.name}>{item.archived ? <Undo2 size={18} /> : <Archive size={17} />}</button>
        </div>;
    })}</div> : <Empty title={t.common.noResults} detail={t.catalog.empty} />}
  </>;
}

export function ExercisePicker({ exercises, choose, close }: { exercises: Exercise[]; choose: (item: Exercise) => void; close: () => void }) {
  return <Dialog title={t.catalog.pick} close={close}><div className="dialog-body"><ExerciseList exercises={exercises} choose={choose} /></div></Dialog>;
}

function ExerciseForm({ item, save, close }: { item: Exercise | null; save: (item: Exercise) => void; close: () => void }) {
  const [name, setName] = useState(item?.name ?? '');
  const [muscle, setMuscle] = useState<Muscle>(item?.muscle ?? 'chest');
  const [gear, setGear] = useState<Equipment>(item?.equipment ?? 'barbell');
  const [rest, setRest] = useState(String(item?.rest ?? 90));
  return <Dialog title={item ? t.catalog.edit : t.catalog.new} close={close}>
    <form className="dialog-body form" onSubmit={event => {
      event.preventDefault();
      if (!name.trim()) return;
      save({ id: item?.id ?? newId(), name: name.trim(), muscle, equipment: gear, rest: Number(rest), archived: item?.archived ?? false });
    }}>
      <label>{t.common.name}<input required maxLength={80} value={name} onChange={event => setName(event.target.value)} /></label>
      <label>{t.common.muscle}<select value={muscle} onChange={event => setMuscle(event.target.value as Muscle)}>{muscles.map(value => <option key={value} value={value}>{t.muscles[value]}</option>)}</select></label>
      <label>{t.common.gear}<select value={gear} onChange={event => setGear(event.target.value as Equipment)}>{equipment.map(value => <option key={value} value={value}>{t.equipment[value]}</option>)}</select></label>
      <label>{t.common.restSeconds}<input type="number" required min={0} max={900} value={rest} onChange={event => setRest(event.target.value)} /></label>
      <button className="button primary" type="submit">{t.common.save}</button>
    </form>
  </Dialog>;
}

export function Catalog({ exercises, save }: { exercises: Exercise[]; save: (item: Exercise) => void }) {
  const [form, setForm] = useState<Exercise | null | undefined>();
  return <>
    <Title heading={t.catalog.heading} subtitle={t.catalog.subtitle} action={<button className="button primary" onClick={() => setForm(null)}><Plus size={17} />{t.catalog.new}</button>} />
    <ExerciseList exercises={exercises} edit={setForm} archive={item => save({ ...item, archived: !item.archived })} />
    {form !== undefined && <ExerciseForm item={form} close={() => setForm(undefined)} save={item => { save(item); setForm(undefined); }} />}
  </>;
}
