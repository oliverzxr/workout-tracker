import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber, locale, shortDateRange, t } from '../app/pt-BR';
import type { Exercise, Workout } from '../domain/model';
import { muscleTotals, progression, totals, validSets, weekStart, weekWorkouts } from '../domain/stats';
import { Empty, Title } from './primitives';

import { ExerciseProgress } from './ExerciseProgress';

export function Progress({ workouts, exercises }: { workouts: Workout[]; exercises: Exercise[] }) {
  const [offset, setOffset] = useState(0);
  const [exerciseId, setExerciseId] = useState('');
  const now = new Date();
  const start = weekStart(now, offset);
  const end = weekStart(now, offset + 1);
  end.setDate(end.getDate() - 1);
  const week = weekWorkouts(workouts, now, offset);
  const summary = totals(week);
  const muscles = muscleTotals(week);
  const used = new Set(workouts.flatMap(validSets).map(set => set.exerciseId));
  const catalog = exercises.filter(item => used.has(item.id)).sort((a, b) => a.name.localeCompare(b.name, locale));
  const selected = catalog.some(item => item.id === exerciseId) ? exerciseId : (catalog[0]?.id ?? '');
  const points = progression(workouts, selected);
  const weekly = <section className="section">
      <div className="section-head"><h2>{t.progress.weekly}</h2><div className="week-switch">
        <button className="icon-button" aria-label={t.progress.prev} onClick={() => setOffset(value => value - 1)}><ChevronLeft size={19} /></button>
        <span>{shortDateRange(start, end)}</span>
        <button className="icon-button" aria-label={t.progress.next} disabled={offset >= 0} onClick={() => setOffset(value => value + 1)}><ChevronRight size={19} /></button>
      </div></div>
      <div className="summary">
        <div><span>{t.home.sessions}</span><strong>{summary.sessions}</strong></div>
        <div><span>{t.common.validSets}</span><strong>{summary.sets}</strong></div>
        <div><span>{t.common.volume}</span><strong>{formatNumber(summary.volume)} <small>kg</small></strong></div>
      </div>
    </section>;
  const byMuscle = <section className="section">
      <div className="section-head"><h2>{t.progress.muscles}</h2></div>
      {muscles.length ? <div className="table-wrap muscle-table"><table>
        <thead><tr><th scope="col">{t.common.muscle}</th><th scope="col">{t.common.validSets}</th><th scope="col">{t.common.volume}</th></tr></thead>
        <tbody>{muscles.map(item => <tr key={item.muscle}><th scope="row">{t.muscles[item.muscle]}</th><td><div className="muscle-count"><strong>{item.sets}</strong><span aria-hidden="true"><i style={{ width: 100 * item.sets / muscles[0]!.sets + '%' }} /></span></div></td><td>{formatNumber(item.volume)} kg</td></tr>)}</tbody>
      </table></div> : <Empty title={t.progress.empty} />}
      <p className="muted footnote">{t.progress.muscleHint}</p>
    </section>;
  const chart = <section className="section progress-chart">
      <div className="section-head"><h2>{t.progress.progression}</h2></div>
      <ExerciseProgress points={points}>
        <label>{t.common.exercise}<span className="select-field"><select value={selected} onChange={event => setExerciseId(event.target.value)}>
            {catalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select><ChevronDown size={15} aria-hidden="true" /></span></label>
      </ExerciseProgress>
    </section>;
  return <>
    <Title heading={t.progress.heading} />
    <div className="progress-overview">{weekly}</div><div className="progress-layout">{chart}{byMuscle}</div>
  </>;
}
