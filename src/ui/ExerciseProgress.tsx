import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { formatNumber, longDate, shortDate, t } from '../app/pt-BR';
import type { progression } from '../domain/stats';
import { Empty } from './primitives';

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
  const firstTime = Date.parse(points[0]!.date);
  const elapsed = Date.parse(points.at(-1)!.date) - firstTime;
  const coords = points.map((point, index) => ({
    x: points.length === 1 ? (left + right) / 2 : left + (right - left) * (elapsed ? (Date.parse(point.date) - firstTime) / elapsed : index / (points.length - 1)),
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


export function ExerciseProgress({ points, children }: { points: ReturnType<typeof progression>; children?: ReactNode }) {
  const [metric, setMetric] = useState<'load' | 'volume'>('load');
  if (!points.length) return <Empty title={t.progress.noExercises} />;
  return <div className="progress-panel">
    {children}
    <div className="records">
      <div><span>{t.progress.record}</span><strong>{formatNumber(Math.max(...points.map(point => point.load)))} <small>kg</small></strong></div>
      <div><span>{t.progress.volumeRecord}</span><strong>{formatNumber(Math.max(...points.map(point => point.volume)))} <small>kg</small></strong></div>
    </div>
    <div className="metric-switch">
      <button className="button secondary" aria-pressed={metric === 'load'} onClick={() => setMetric('load')}>{t.progress.load}</button>
      <button className="button secondary" aria-pressed={metric === 'volume'} onClick={() => setMetric('volume')}>{t.progress.volume}</button>
    </div>
    <Chart points={points} metric={metric} />
  </div>;
}
