import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { formatNumber, shortDate } from '../app/pt-BR';
import { Dialog, Empty, Title } from '../ui/primitives';
import { decimal, localDay, measureTrend, recordMeasurement } from './model';
import type { Fitness, MetricEntry } from './model';
import type { SaveFitness } from './NutritionScreen';

function valueText(number: number) { return formatNumber(Number(number.toFixed(2))); }

function TrendChart({ points, weight }: { points: ReturnType<typeof measureTrend>; weight: boolean }) {
  const first = new Date(points[0]!.date).getTime();
  const last = new Date(points.at(-1)!.date).getTime();
  const minimum = Math.min(...points.map(point => point.value));
  const maximum = Math.max(...points.map(point => point.value));
  const pad = Math.max(.5, (maximum - minimum) * .15);
  const x = (date: string) => first === last ? 176 : 45 + (+new Date(date) - first) / (last - first) * 250;
  const y = (value: number) => 133 - (value - minimum + pad) / (maximum - minimum + 2 * pad) * 110;
  return <div className="body-plot">
    <svg role="img" aria-label={weight ? 'Gráfico de peso e média móvel de sete dias' : 'Gráfico da medida'} viewBox="0 0 320 165">
      {[maximum + pad, (maximum + minimum) / 2, minimum - pad].map(value => <g key={value}>
        <line x1="46" x2="301" y1={y(value)} y2={y(value)} />
        <text x="39" y={y(value) + 3} textAnchor="end">{valueText(value)}</text>
      </g>)}
      {weight && <polyline className="average-line" points={points.map(point => x(point.date) + ',' + y(point.average)).join(' ')} />}
      <polyline points={points.map(point => x(point.date) + ',' + y(point.value)).join(' ')} />
      {points.map(point => <circle key={point.id} cx={x(point.date)} cy={y(point.value)} r="3"><title>{point.date} · {valueText(point.value)}</title></circle>)}
      <text x="45" y="153">{shortDate(points[0]!.date + 'T12:00:00')}</text>
      {first !== last && <text x="297" y="153" textAnchor="end">{shortDate(points.at(-1)!.date + 'T12:00:00')}</text>}
    </svg>
    {weight && <p className="muted">Linha tracejada · média dos registros dos últimos 7 dias</p>}
  </div>;
}

function BodyForm({ metricId, unit, entry, target, mode, data, save, close }: {
  metricId: string; unit: string; entry?: MetricEntry; target?: number;
  mode: 'record' | 'objective' | 'metric'; data: Fitness; save: SaveFitness; close: () => void;
}) {
  const [error, setError] = useState('');
  const [id] = useState(() => entry?.id ?? crypto.randomUUID());
  const title = mode === 'metric' ? 'Nova medida' : mode === 'objective' ? 'Objetivo pessoal' : entry ? 'Editar medida' : 'Registrar medida';
  return <Dialog title={title} close={close}><form className="dialog-body form" onSubmit={async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let update: (value: Fitness) => Fitness;
    if (mode === 'metric') {
      const name = String(form.get('name') ?? '').trim();
      if (!name || [ 'Peso corporal', ...data.measurements.map(item => item.name) ].some(item => item.toLowerCase() === name.toLowerCase())) {
        setError('Escolha um nome de medida diferente dos existentes.'); return;
      }
      update = value => ({ ...value, measurements: [...value.measurements.filter(item => item.id !== id), { id, name }] });
    } else {
      const amount = decimal(String(form.get('amount') ?? ''));
      if (!(amount > 0 && amount <= 1000)) { setError('Informe um valor positivo de até 1.000.'); return; }
      if (mode === 'objective') update = value => ({ ...value, objectives: [...value.objectives.filter(item => item.metricId !== metricId), { metricId, target: amount }] });
      else {
        const date = String(form.get('date') ?? '');
        if (!date || date > localDay()) { setError('Escolha uma data até hoje.'); return; }
        if (data.observations.some(item => item.id !== id && item.date === date && item.metricId === metricId)
          && !window.confirm('Substituir a medida já registrada para esta data?')) return;
        update = value => recordMeasurement(value, { id, date, metricId, value: amount });
      }
    }
    if (await save(update)) close();
    else setError('O registro ainda não foi salvo. Tente novamente.');
  }}>
    {mode === 'metric' ? <label>Nome da medida (cm)<input name="name" maxLength={100} required /></label> : <>
      {mode === 'record' && <label>Data da medida<input name="date" type="date" required max={localDay()} defaultValue={entry?.date ?? localDay()} /></label>}
      <label>{mode === 'objective' ? 'Meta' : 'Valor'} ({unit})<input name="amount" inputMode="decimal" required defaultValue={entry?.value ?? target} /></label>
    </>}
    {error && <p className="error" role="alert">{error}</p>}
    <button className="button primary">Salvar</button>
    {mode === 'objective' && target !== undefined && <button type="button" className="text-button" onClick={async () => {
      if (await save(value => ({ ...value, objectives: value.objectives.filter(item => item.metricId !== metricId) }))) close();
    }}>Remover objetivo</button>}
  </form></Dialog>;
}

export function BodyScreen({ data, save }: { data: Fitness; save: SaveFitness }) {
  const [metricId, setMetric] = useState('peso');
  const [dialog, setDialog] = useState<'record' | 'objective' | 'metric' | MetricEntry | null>(null);
  const weight = metricId === 'peso';
  const unit = weight ? 'kg' : 'cm';
  const points = measureTrend(data.observations, metricId);
  const last = points.at(-1);
  const target = data.objectives.find(item => item.metricId === metricId)?.target;
  return <>
    <Title heading="Evolução corporal" subtitle="Peso, medidas e objetivos pessoais" action={<button className="button primary" onClick={() => setDialog('record')}><Plus size={17} aria-hidden="true" />Registrar medida</button>} />
    <div className="fitness-day">
      <label>Medida<select value={metricId} onChange={event => setMetric(event.target.value)}>
        <option value="peso">Peso corporal</option>
        {data.measurements.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <button className="text-button" onClick={() => setDialog('metric')}>Nova medida</button>
      <button className="text-button" onClick={() => setDialog('objective')}><Target size={16} aria-hidden="true" />Definir objetivo</button>
    </div>
    <div className="fitness-body-layout">
      <section className="fitness-ledger" aria-labelledby="body-evolution"><h2 id="body-evolution">Evolução da medida</h2>
        <div className="body-metrics">
          <div><span>Última medida</span><strong>{last ? valueText(last.value) + ' ' + unit : '—'}</strong></div>
          {weight && <div><span>Média de 7 dias</span><strong>{last ? valueText(last.average) + ' kg' : '—'}</strong></div>}
          {target !== undefined && <div><span>Objetivo pessoal</span><strong>{valueText(target)} {unit}</strong></div>}
        </div>
        {points.length > 0 ? <TrendChart points={points} weight={weight} /> : <Empty title="Registre uma medida para iniciar o gráfico." />}
      </section>
      <section className="fitness-ledger" aria-labelledby="body-history"><h2 id="body-history">Histórico de medidas</h2>
        {!points.length ? <Empty title="Nenhuma medida registrada." /> : <div className="table-wrap"><table>
          <thead><tr><th scope="col">Data</th><th scope="col">Valor</th>{weight && <th scope="col">Média 7 dias</th>}<th scope="col"><span className="sr-only">Ação</span></th></tr></thead>
          <tbody>{[...points].reverse().map(item => <tr key={item.id}>
            <th scope="row">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}</th><td>{valueText(item.value)} {unit}</td>
            {weight && <td>{valueText(item.average)} kg</td>}
            <td><button className="text-button" onClick={() => setDialog(item)} aria-label={'Editar medida de ' + item.date}>Editar</button></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </div>
    {dialog && <BodyForm metricId={metricId} unit={unit} data={data} save={save} close={() => setDialog(null)}
      mode={typeof dialog === 'string' ? dialog : 'record'} entry={typeof dialog === 'object' ? dialog : undefined}
      target={dialog === 'objective' ? target : undefined} />}
  </>;
}
