import { Activity, ArrowRight, CalendarDays, Dumbbell, History, Layers3, Play, Plus } from 'lucide-react';
import { countLabel, t, formatNumber, longDate, shortDate } from '../app/pt-BR';
import type { Routine, Snapshot, Workout } from '../domain/model';
import { totals, weekStart, weekWorkouts } from '../domain/stats';
import { Empty, Title } from './primitives';

type Props = {
  data: Snapshot; start: (routine?: Routine) => void; resume: () => void;
  routines: () => void; create: () => void; history: () => void; detail: (workout: Workout) => void;
};

export function Home({ data, start, resume, routines, create, history, detail }: Props) {
  const now = new Date();
  const week = weekWorkouts(data.workouts, now);
  const stats = totals(week);
  const recent = [...data.workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const startOfWeek = weekStart(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  return <>
    <Title heading={t.home.heading} subtitle={t.home.description} />
    <section className="launch">
      <div className="plate-art" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="launch-content">
        <span className="launch-icon"><Dumbbell size={22} strokeWidth={1.7} /></span>
        <h2>{data.draft ? data.draft.name : t.home.free}</h2>
        <button type="button" className="button primary" onClick={data.draft ? resume : () => start()}>
          <Play size={16} fill="currentColor" />{data.draft ? t.home.resume : t.home.start}
        </button>
      </div>
    </section>
    <section className="section">
      <div className="section-head"><h2>{t.home.week}</h2><span className="muted date-range"><CalendarDays size={15} />{shortDate(startOfWeek)} – {shortDate(endOfWeek)}</span></div>
      <div className="summary">
        <div><span><CalendarDays size={15} />{t.home.sessions}</span><strong>{stats.sessions}</strong></div>
        <div><span><Layers3 size={15} />{t.common.validSets}</span><strong>{stats.sets}</strong></div>
        <div><span><Activity size={15} />{t.common.volume}</span><strong>{formatNumber(stats.volume)} <small>{t.common.kg}</small></strong></div>
      </div>
    </section>
    <div className="home-bottom">
      <section className="section">
        <div className="section-head"><h2>{t.home.quick}</h2><button className="text-button" onClick={routines}>{t.home.allRoutines}<ArrowRight size={15} /></button></div>
        {data.routines.length ? <div className="list">
          {data.routines.slice(0, 3).map(routine => <div className="list-row" key={routine.id}>
            <span className="row-icon"><Layers3 size={19} /></span><div className="row-content"><strong>{routine.name}</strong><small>{countLabel(routine.items.length, t.common.exercise, t.common.exercises)}</small></div>
            <button className="icon-button" aria-label={t.home.startRoutine + ' ' + routine.name} onClick={() => start(routine)}><Play size={17} /></button>
          </div>)}
        </div> : <Empty title={t.routines.empty} detail={t.home.noRoutines} action={<button className="button secondary" onClick={create}><Plus size={16} />{t.home.createRoutine}</button>} />}
      </section>
      <section className="section">
        <div className="section-head"><h2>{t.home.recent}</h2><button className="text-button" onClick={history}>{t.home.seeHistory}<ArrowRight size={15} /></button></div>
        {recent ? <button className="list-row clickable" onClick={() => detail(recent)}><span className="row-icon"><History size={19} /></span><span className="row-content"><strong>{recent.name}</strong><small>{longDate(recent.startedAt)}</small></span><ArrowRight size={17} /></button> :
          <Empty title={t.common.noHistory} detail={t.home.noRecent} />}
      </section>
    </div>
  </>;
}
