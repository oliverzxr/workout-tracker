import { useState } from 'react';
import { Archive, ChevronRight, Dumbbell, Pencil, Plus, Search, Undo2 } from 'lucide-react';
import { countLabel, t } from '../app/pt-BR';
import { defaultCatalogFilters, searchExercises } from '../catalog/profiles';
import type { CatalogFilters } from '../catalog/profiles';
import { exerciseMedia, mediaUrl } from '../catalog/media';
import { equipment, muscles, newId } from '../domain/model';
import type { Equipment, Exercise, Muscle } from '../domain/model';
import { Dialog, Empty, Title } from './primitives';
import { ExerciseImage } from './ExerciseImage';

type ListAction = { choose: (item: Exercise) => void } |
  { details: (item: Exercise) => void; edit: (item: Exercise) => void; archive: (item: Exercise) => void };

function ExerciseList({ exercises, filters, changeFilters, actions }: {
  exercises: Exercise[]; filters: CatalogFilters; changeFilters: (value: CatalogFilters) => void; actions: ListAction;
}) {
  const listed = searchExercises(exercises, filters);
  const choosing = 'choose' in actions;
  const dirty = filters.query || filters.muscle || filters.gear || filters.includeArchived;
  return <>
    <div className={'catalog-filters' + (choosing ? ' picker-filters' : '')}>
      <label className="search"><Search size={18} aria-hidden="true" /><input aria-label={t.catalog.search} placeholder={t.catalog.search} value={filters.query} onChange={event => changeFilters({ ...filters, query: event.target.value })} /></label>
      <select aria-label={t.common.muscle} value={filters.muscle} onChange={event => changeFilters({ ...filters, muscle: event.target.value as Muscle | '' })}>
        <option value="">{t.common.muscle}</option>
        {muscles.map(value => <option key={value} value={value}>{t.muscles[value]}</option>)}
      </select>
      <select aria-label={t.common.gear} value={filters.gear} onChange={event => changeFilters({ ...filters, gear: event.target.value as Equipment | '' })}>
        <option value="">{t.catalog.noGear}</option>
        {equipment.map(value => <option key={value} value={value}>{t.equipment[value]}</option>)}
      </select>
    </div>
    {!choosing && <div className="catalog-controls">
      <label className="checkbox-line"><input type="checkbox" checked={filters.includeArchived} onChange={event => changeFilters({ ...filters, includeArchived: event.target.checked })} />{t.catalog.showArchived}</label>
      {dirty && <button className="text-button" type="button" onClick={() => changeFilters(defaultCatalogFilters)}>{t.catalog.clear}</button>}
      <span className="result-count" role="status">{countLabel(listed.length, t.catalog.result, t.catalog.results)}</span>
    </div>}
    {listed.length ? <div className="list">{listed.map(item => {
      const label = <span className="row-content"><strong>{item.name}</strong>
        <small>{t.muscles[item.muscle]} · {t.equipment[item.equipment]}{item.archived ? ' · ' + t.catalog.archived : ''}</small></span>;
      if ('choose' in actions) return <button className="list-row clickable" type="button" key={item.id} onClick={() => actions.choose(item)}>
        <span className="row-icon"><Dumbbell size={19} aria-hidden="true" /></span>{label}<Plus size={18} aria-hidden="true" />
      </button>;
      const media = exerciseMedia(item.id);
      return <div className="catalog-row" key={item.id}>
        <button className="catalog-detail-link" type="button" onClick={() => actions.details(item)}>
          <ExerciseImage thumbnail src={media && mediaUrl(media.key, 'thumb')} alt="" />{label}<ChevronRight size={16} aria-hidden="true" />
        </button>
        <button className="icon-button" onClick={() => actions.edit(item)} aria-label={t.common.edit + ' ' + item.name}><Pencil size={17} aria-hidden="true" /></button>
        <button className="icon-button" onClick={() => actions.archive(item)} aria-label={(item.archived ? t.catalog.restore : t.catalog.archive) + ' ' + item.name}>{item.archived ? <Undo2 size={18} aria-hidden="true" /> : <Archive size={17} aria-hidden="true" />}</button>
      </div>;
    })}</div> : <Empty title={t.common.noResults} detail={t.catalog.empty} />}
  </>;
}

export function ExercisePicker({ exercises, choose, close }: { exercises: Exercise[]; choose: (item: Exercise) => void; close: () => void }) {
  const [filters, setFilters] = useState(defaultCatalogFilters);
  return <Dialog title={t.catalog.pick} close={close}><div className="dialog-body">
    <ExerciseList exercises={exercises} filters={filters} changeFilters={setFilters} actions={{ choose }} />
  </div></Dialog>;
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

export function Catalog({ exercises, save, details, filters, changeFilters }: {
  exercises: Exercise[]; save: (item: Exercise) => void; details: (item: Exercise) => void;
  filters: CatalogFilters; changeFilters: (value: CatalogFilters) => void;
}) {
  const [form, setForm] = useState<Exercise | null | undefined>();
  return <>
    <Title heading={t.catalog.heading} subtitle={t.catalog.subtitle} action={<button className="button primary" onClick={() => setForm(null)}><Plus size={17} />{t.catalog.new}</button>} />
    <ExerciseList exercises={exercises} filters={filters} changeFilters={changeFilters}
      actions={{ details, edit: setForm, archive: item => save({ ...item, archived: !item.archived }) }} />
    {form !== undefined && <ExerciseForm item={form} close={() => setForm(undefined)} save={item => { save(item); setForm(undefined); }} />}
  </>;
}
