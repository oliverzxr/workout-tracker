import { ArrowUpRight, Play } from 'lucide-react';
import { formatNumber, t } from '../app/pt-BR';
import type { Routine, Snapshot } from '../domain/model';
import { muscleTotals, weekWorkouts } from '../domain/stats';
import { dayTotals, localDay, measureTrend } from './model';
import type { Fitness } from './model';
import { MacroTotals } from './NutritionScreen';
import type { SaveFitness } from './NutritionScreen';

export function Overview({ training, data, save, start, showNutrition, showBody, showProgress }: {
  training: Snapshot; data: Fitness; save: SaveFitness; start: (routine: Routine) => void;
  showNutrition: () => void; showBody: () => void; showProgress: () => void;
}) {
  const selected = training.routines.find(item => item.id === data.nextRoutineId);
  const today = data.entries.filter(item => item.date === localDay());
  const load = muscleTotals(weekWorkouts(training.workouts));
  const weight = measureTrend(data.observations, 'peso').at(-1);
  return <div className="fitness-overview">
    {training.routines.length > 0 && <section className="fitness-ledger overview-plan" aria-labelledby="fitness-next">
      <h2 id="fitness-next">Próximo treino</h2>
      <div className="fitness-day"><label>Rotina planejada<select value={selected?.id ?? ''} onChange={event => {
        const nextRoutineId = event.target.value || null;
        void save(value => ({ ...value, nextRoutineId }));
      }}><option value="">Escolher rotina</option>{training.routines.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        {selected && <button className="button secondary" onClick={() => start(selected)}><Play size={15} aria-hidden="true" />Iniciar {selected.name}</button>}
      </div>
    </section>}
    <section className="fitness-ledger overview-nutrition" aria-labelledby="fitness-eating">
      <header className="section-head"><h2 id="fitness-eating">Alimentação de hoje</h2><button className="text-button" type="button" onClick={showNutrition}>Abrir diário <ArrowUpRight size={15} aria-hidden="true" /></button></header>
      {today.length ? <MacroTotals actual={dayTotals(today)} targets={data.targets} /> : <p className="muted">Nenhum alimento registrado hoje.</p>}
    </section>
    <section className="fitness-ledger overview-body" aria-labelledby="fitness-weight">
      <header className="section-head"><h2 id="fitness-weight">Peso corporal</h2><button className="text-button" onClick={showBody}>Ver evolução <ArrowUpRight size={15} aria-hidden="true" /></button></header>
      {weight ? <div className="body-metrics">
        <div><span>Último registro</span><strong>{formatNumber(weight.value)} kg</strong></div>
        <div><span>Média de 7 dias</span><strong>{formatNumber(Number(weight.average.toFixed(2)))} kg</strong></div>
      </div> : <p className="muted">Nenhum peso registrado.</p>}
    </section>
    <section className="fitness-ledger overview-muscles" aria-labelledby="fitness-muscles">
      <header className="section-head"><h2 id="fitness-muscles">Séries válidas nesta semana</h2><button className="text-button" onClick={showProgress}>Ver progresso <ArrowUpRight size={15} aria-hidden="true" /></button></header>
      {load.length ? <ul className="overview-muscle-list">{load.slice(0, 5).map(item => <li key={item.muscle}>
        <span>{t.muscles[item.muscle]}</span><span className="overview-bar" aria-hidden="true"><i style={{ width: item.sets / load[0]!.sets * 100 + '%' }} /></span><strong>{item.sets}</strong>
      </li>)}</ul> : <p className="muted">As séries aparecem após um treino finalizado.</p>}
    </section>
  </div>;
}
