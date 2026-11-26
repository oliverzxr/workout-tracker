import { ArrowLeft, ArrowRight, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { formatNumber, longDate, t } from '../app/pt-BR';
import type { Workout } from '../domain/model';
import { totals } from '../domain/stats';
import { Empty, Title } from './primitives';

export function History({ workouts, detail }: { workouts: Workout[]; detail: (value: Workout) => void }) {
  return <>
    <Title heading={t.history.heading} subtitle={t.history.description} />
    {workouts.length ? <div className="list">{[...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map(workout =>
      <button className="list-row clickable history-row" key={workout.id} onClick={() => detail(workout)}>
        <span className="row-icon"><CalendarDays size={19} /></span>
        <span className="row-content"><strong>{workout.name}</strong><small>{longDate(workout.startedAt)}</small></span>
        <span className="muted history-count">{totals([workout]).sets} {t.common.validSets.toLowerCase()}</span>
        <ArrowRight size={18} />
      </button>,
    )}</div> : <Empty title={t.common.noHistory} />}
  </>;
}

export function WorkoutDetail({ value, back, edit, remove }: { value: Workout; back: () => void; edit: () => void; remove: () => void }) {
  const stats = totals([value]);
  return <>
    <div className="editor-top"><button className="text-button" onClick={back}><ArrowLeft size={17} />{t.nav.history}</button></div>
    <Title heading={value.name} subtitle={longDate(value.startedAt)}
      action={<button className="button primary" onClick={edit}><Pencil size={17} />{t.common.edit}</button>} />
    <div className="summary detail-summary">
      <div><span>{t.common.validSets}</span><strong>{stats.sets}</strong></div>
      <div><span>{t.common.volume}</span><strong>{formatNumber(stats.volume)} <small>kg</small></strong></div>
    </div>
    <div className="detail-exercises">{value.exercises.map(item => <section className="exercise-entry" key={item.id}>
      <header className="exercise-head"><div><h2>{item.name}</h2><p>{t.muscles[item.muscle]}</p></div></header>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">{t.active.series}</th><th scope="col">{t.active.load}</th><th scope="col">{t.common.reps}</th><th scope="col">{t.common.rir}</th></tr></thead>
        <tbody>{item.sets.map((set, index) => <tr key={set.id}>
          <th scope="row">{index + 1} <small className="muted">{t.kinds[set.kind]}</small></th>
          <td>{formatNumber(set.grams / 1000)} kg</td><td>{set.reps}</td><td>{set.rir ?? '—'}</td>
        </tr>)}</tbody>
      </table></div>
    </section>)}</div>
    <button className="text-button danger" onClick={() => { if (window.confirm(t.history.confirm)) remove(); }}><Trash2 size={17} />{t.history.remove}</button>
  </>;
}
