import { useEffect, useRef, useState } from 'react';
import { Activity, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { formatNumber, locale, longDate, shortDate, t } from '../app/pt-BR';
import type { Exercise, Workout } from '../domain/model';
import { muscleTotals, progression, totals, validSets, weekStart, weekWorkouts } from '../domain/stats';
import { Empty, Title } from './primitives';

function Chart({ points, metric }: { points: ReturnType<typeof progression>; metric: 'load' | 'volume' }) {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(680);
  useEffect(() => {
    const chart = ref.current;
    if (!chart) return;
    const observer = new ResizeObserver(entries => {
      const measured = entries[0]?.contentRect.width;
      if (measured) setWidth(Math.max(220, Math.round(measured)));
    });
    observer.observe(chart);
    return () => observer.disconnect();
  }, []);
  const highest = Math.max(1, ...points.map(point => point[metric]));
  const left = Math.max(48, formatNumber(highest).length * 8 + 8);
  const right = width - 14;
  const bottom = 158;
  const top = 22;
  const coords = points.map((point, index) => ({
    x: points.length === 1 ? (left + right) / 2 : left + (right - left) * index / (points.length - 1),
    y: bottom - (bottom - top) * point[metric] / highest,
  }));
  return <>
    <svg ref={ref} className="chart" viewBox={'0 0 ' + width + ' 194'} height={194} role="img" aria-label={t.progress[metric]}>
      {[0, 0.5, 1].map(level => {
        const y = bottom - (bottom - top) * level;
        return <g key={level}><line x1={left} x2={right} y1={y} y2={y} /><text x={left - 7} y={y + 4} textAnchor="end">{formatNumber(highest * level)}</text></g>;
      })}
      <polyline points={coords.map(point => point.x + ',' + point.y).join(' ')} />
      {coords.map((point, index) => <circle key={points[index]?.id} cx={point.x} cy={point.y} r={4}>
        <title>{longDate(points[index]!.date)} · {formatNumber(points[index]![metric])} kg</title>
      </circle>)}
      <text x={points.length === 1 ? coords[0]!.x : left} y={185} textAnchor={points.length === 1 ? 'middle' : 'start'}>{shortDate(points[0]!.date)}</text>
      {points.length > 1 && <text x={right} y={185} textAnchor="end">{shortDate(points.at(-1)!.date)}</text>}
    </svg>
    <details className="chart-data"><summary>{t.progress.table}</summary><table>
      <thead><tr><th scope="col">{t.progress.date}</th><th scope="col">{t.progress[metric]}</th></tr></thead>
      <tbody>{[...points].reverse().map(point => <tr key={point.id}><th scope="row">{longDate(point.date)}</th><td>{formatNumber(point[metric])} kg</td></tr>)}</tbody>
    </table></details>
  </>;
}

export function Progress({ workouts, exercises }: { workouts: Workout[]; exercises: Exercise[] }) {
  const [offset, setOffset] = useState(0);
  const [exerciseId, setExerciseId] = useState('');
  const [metric, setMetric] = useState<'load' | 'volume'>('load');
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
  return <>
    <Title heading={t.progress.heading} subtitle={t.progress.description} />
    <section className="section">
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
    </section>
    <section className="section">
      <div className="section-head"><h2>{t.progress.muscles}</h2></div>
      {muscles.length ? <div className="table-wrap panel"><table>
        <thead><tr><th scope="col">{t.common.muscle}</th><th scope="col">{t.common.validSets}</th><th scope="col">{t.common.volume}</th></tr></thead>
        <tbody>{muscles.map(item => <tr key={item.muscle}><th scope="row">{t.muscles[item.muscle]}</th><td>{item.sets}</td><td>{formatNumber(item.volume)} kg</td></tr>)}</tbody>
      </table></div> : <Empty title={t.progress.empty} />}
      <p className="muted footnote">{t.progress.muscleHint}</p>
    </section>
    <section className="section">
      <div className="section-head"><h2><Activity size={19} />{t.progress.progression}</h2></div>
      {points.length ? <>
        <div className="panel progress-panel">
          <label>{t.common.exercise}<select value={selected} onChange={event => setExerciseId(event.target.value)}>
            {catalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <div className="records">
            <div><span><Trophy size={16} />{t.progress.record}</span><strong>{formatNumber(Math.max(...points.map(point => point.load)))} <small>kg</small></strong></div>
            <div><span><Trophy size={16} />{t.progress.volumeRecord}</span><strong>{formatNumber(Math.max(...points.map(point => point.volume)))} <small>kg</small></strong></div>
          </div>
          <div className="split">
            <button className="button secondary" aria-pressed={metric === 'load'} onClick={() => setMetric('load')}>{t.progress.load}</button>
            <button className="button secondary" aria-pressed={metric === 'volume'} onClick={() => setMetric('volume')}>{t.progress.volume}</button>
          </div>
          <Chart points={points} metric={metric} />
        </div>
      </> : <Empty title={t.progress.noExercises} />}
    </section>
  </>;
}
