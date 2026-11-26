import { ArrowLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { formatNumber, locale, longDate, t } from '../app/pt-BR';
import type { Workout } from '../domain/model';
import { totals } from '../domain/stats';
import { Empty, Title } from './primitives';

export function History({ workouts, detail }: { workouts: Workout[]; detail: (value: Workout) => void }) {
  const months = new Map<string, Workout[]>();
  for (const workout of [...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt))) {
    const month = monthDisplay.format(new Date(workout.startedAt));
    const entries = months.get(month);
    if (entries) entries.push(workout);
    else months.set(month, [workout]);
  }
  return <>
    <Title heading={t.history.heading} subtitle={t.history.description} />
    {months.size ? [...months].map(([month, entries]) => <section className="history-group" key={month}>
      <h2>{month.charAt(0).toLocaleUpperCase(locale) + month.slice(1)}</h2>
      <div className="list">{entries.map(workout => {
        const start = new Date(workout.startedAt);
        const duration = Math.round((Date.parse(workout.finishedAt) - +start) / 60_000);
        return <button className="list-row clickable history-row" key={workout.id} onClick={() => detail(workout)}>
          <span className="history-date">{String(start.getDate()).padStart(2, '0')}<small>{weekday.format(start).replace('.', '')}</small></span>
          <span className="row-content"><strong>{workout.name}</strong><small>{timeOfDay.format(start)} · {duration} min</small></span>
          <span className="history-count">{totals([workout]).sets}<small>{t.common.validSets.toLowerCase()}</small></span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>;
      })}</div>
    </section>) : <Empty title={t.common.noHistory} detail={t.history.emptyDetail} />}
  </>;
}

const monthDisplay = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
const timeOfDay = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });

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
