import { CalendarDays, Check, ChevronRight, Play, Plus } from 'lucide-react';
import { countLabel, formatNumber, locale, shortDate, t } from '../app/pt-BR';
import type { Routine, Snapshot, Workout } from '../domain/model';
import { totals, weekStart, weekWorkouts } from '../domain/stats';
import { designCopy } from './directions';
import type { Direction } from './directions';

type Props = {
  data: Snapshot; direction: Direction; start: (routine?: Routine) => void; resume: () => void;
  routines: () => void; create: () => void; history: () => void; detail: (workout: Workout) => void;
};

const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function TrainingWeek({ week, now }: { week: Workout[]; now: Date }) {
  const first = weekStart(now);
  const stats = totals(week);
  return <section className="training-week">
    <header><h2>{t.home.week}</h2><span>{countLabel(stats.sessions, 'Treino', t.home.sessions)}</span></header>
    <ol aria-label={t.home.week} className="week-days">{Array.from({ length: 7 }, (_, index) => {
      const day = new Date(first);
      day.setDate(day.getDate() + index);
      const logged = week.some(item => sameDay(new Date(item.startedAt), day));
      return <li key={day.toISOString()} data-done={logged} aria-current={sameDay(day, now) ? 'date' : undefined}>
        <span>{weekday.format(day).replace('.', '')}</span><strong>{day.getDate()}</strong>
        <span className="week-status">{logged ? <Check size={13} aria-label="Treino registrado" /> : <span aria-hidden="true" />}</span>
      </li>;
    })}</ol>
    {week.length ? <div className="week-totals"><span><strong>{stats.sets}</strong> {t.common.validSets.toLowerCase()}</span><span><strong>{formatNumber(stats.volume)} kg</strong> de volume</span></div> :
      <p>{designCopy.weekEmpty}</p>}
  </section>;
}

export function ReviewHome({ data, direction, start, resume, routines, create, history, detail }: Props) {
  const now = new Date();
  const week = weekWorkouts(data.workouts, now);
  const recent = [...data.workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const nextRoutine = data.routines[0];
  const launch = data.draft ? resume : () => start(nextRoutine);
  const launchLabel = data.draft ? t.home.resume : nextRoutine ? 'Treinar rotina' : t.home.start;
  const featured = data.draft?.name ?? nextRoutine?.name ?? t.home.free;
  return <div className="review-home">
    <div className="home-lead">
      <section className="review-launch">
        <div className="review-launch-copy">
          <h1>{direction === 'arranque' ? designCopy.train : direction === 'caderno' ? 'Meu caderno' : 'Hoje'}</h1>
          <div className="launch-session">
            {data.draft && <span className="session-state">{designCopy.active}</span>}
            <h2>{featured}</h2>
            {nextRoutine && !data.draft && <p>{countLabel(nextRoutine.items.length, t.common.exercise, t.common.exercises)} / {countLabel(nextRoutine.items.reduce((sum, row) => sum + row.sets, 0), t.active.series, t.common.sets)}</p>}
            {!nextRoutine && !data.draft && <p>{designCopy.chooseRoutine}</p>}
            <button type="button" className="button primary" onClick={launch}><Play size={17} fill="currentColor" />{launchLabel}</button>
            {!data.draft && nextRoutine && <button type="button" className="text-button" onClick={() => start()}>{t.home.start}</button>}
          </div>
        </div>
        {direction === 'arranque' && <div className="launch-photo" aria-hidden="true" />}
      </section>
      <TrainingWeek week={week} now={now} />
    </div>
    <div className="home-index">
      <section className="review-index-section">
        <header><h2>{t.home.quick}</h2><button type="button" className="text-button" onClick={routines}>{designCopy.seeAll}</button></header>
        {data.routines.length ? <ol>{data.routines.map(routine => <li key={routine.id}>
          <button type="button" onClick={() => start(routine)}><span><strong>{routine.name}</strong><small>{countLabel(routine.items.length, t.common.exercise, t.common.exercises)}</small></span><Play size={16} /></button>
        </li>)}</ol> : <div className="review-empty"><p>{designCopy.noRoutines}</p>
          <button type="button" className="button secondary" onClick={create}><Plus size={16} />{t.home.createRoutine}</button>
        </div>}
      </section>
      <section className="review-index-section latest-session">
        <header><h2>{t.home.recent}</h2><button type="button" className="text-button" onClick={history}>{t.home.seeHistory}</button></header>
        {recent ? <button type="button" className="latest-entry" onClick={() => detail(recent)}>
          <CalendarDays size={19} /><span><strong>{recent.name}</strong><small>{shortDate(recent.startedAt)} / {formatNumber(totals([recent]).volume)} kg</small></span><ChevronRight size={18} />
        </button> : <div className="review-empty"><p>{designCopy.noSessions}</p></div>}
      </section>
    </div>
  </div>;
}
