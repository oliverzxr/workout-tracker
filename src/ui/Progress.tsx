import { useState } from 'react';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber, locale, shortDate, t } from '../app/pt-BR';
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
        <span>{shortDate(start)} – {shortDate(end)}</span>
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
      {muscles.length ? <div className="table-wrap panel"><table>
        <thead><tr><th scope="col">{t.common.muscle}</th><th scope="col">{t.common.validSets}</th><th scope="col">{t.common.volume}</th></tr></thead>
        <tbody>{muscles.map(item => <tr key={item.muscle}><th scope="row">{t.muscles[item.muscle]}</th><td>{item.sets}</td><td>{formatNumber(item.volume)} kg</td></tr>)}</tbody>
      </table></div> : <Empty title={t.progress.empty} />}
      <p className="muted footnote">{t.progress.muscleHint}</p>
    </section>;
  const chart = <section className="section progress-chart">
      <div className="section-head"><h2><Activity size={19} />{t.progress.progression}</h2></div>
      <ExerciseProgress points={points}>
        <label>{t.common.exercise}<select value={selected} onChange={event => setExerciseId(event.target.value)}>
            {catalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
      </ExerciseProgress>
    </section>;
  return <>
    <Title heading={t.progress.heading} subtitle={t.progress.description} />
    <div className="progress-layout">{chart}<div className="progress-context">{weekly}{byMuscle}</div></div>
  </>;
}
