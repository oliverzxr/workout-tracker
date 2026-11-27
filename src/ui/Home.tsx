import type { ReactNode } from 'react';
import { ArrowUpRight, ChevronRight, Play, Plus } from 'lucide-react';
import { countLabel, formatNumber, locale, longDate, shortDateRange, t } from '../app/pt-BR';
import type { Routine, Snapshot, Workout } from '../domain/model';
import { totals, weekStart, weekWorkouts } from '../domain/stats';
import { Empty } from './primitives';

type Props = {
  data: Snapshot; start: (routine?: Routine) => void; resume: () => void;
  routines: () => void; create: () => void; history: () => void; detail: (workout: Workout) => void; overview?: ReactNode;
};

const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
const dayLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' });

function TrainingWeek({ now, workouts }: { now: Date; workouts: Workout[] }) {
  const first = weekStart(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    const localDay = date.toDateString();
    return { date, current: localDay === now.toDateString(), ...totals(workouts.filter(workout => new Date(workout.startedAt).toDateString() === localDay)) };
  });
  const highest = Math.max(1, ...days.map(day => day.sets));
  const stats = totals(workouts);

  return <section className="home-week" aria-labelledby="home-week-heading">
    <header className="section-head"><h2 id="home-week-heading">{t.home.week}</h2>
      <span className="muted date-range">{shortDateRange(first, days[6]!.date)}</span>
    </header>
    <div className="week-totals">
      <span><strong>{formatNumber(stats.sessions)}</strong>{t.home.sessions}</span>
      <span><strong>{formatNumber(stats.sets)}</strong>{t.common.validSets}</span>
      <span><strong>{formatNumber(stats.volume)} <small>kg</small></strong>{t.common.volume}</span>
    </div>
    <p className="attendance-label" aria-hidden="true">{t.home.dailySets}</p>
    <ol className="attendance" role="list" aria-label={t.home.dailySets}>
      {days.map(day => <li key={day.date.toISOString()} aria-current={day.current ? 'date' : undefined} data-trained={day.sessions > 0}>
        <span className="sr-only">{dayLabel.format(day.date)}. {day.sessions ? countLabel(day.sets, t.active.series, t.common.validSets) : t.home.restDay}.</span>
        <span className="attendance-plot" aria-hidden="true"><span style={{ height: day.sets ? 4 + day.sets / highest * 24 : 3 }} /></span>
        <span aria-hidden="true">{weekday.format(day.date).replace('.', '')} <strong>{day.date.getDate()}</strong></span>
      </li>)}
    </ol>
  </section>;
}

export function Home({ data, start, resume, routines, create, history, detail, overview }: Props) {
  const now = new Date();
  const recent = [...data.workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const draft = data.draft;
  const pending = draft?.exercises.flatMap(exercise => exercise.sets).filter(set => !set.completed).length;
  return <>
    <header className="page-title home-title"><div><h1>{t.home.heading}</h1><p>{dayLabel.format(now)}</p></div></header>
    <div className="home-layout">
      <section className="session-start" aria-label={draft ? t.home.resume : t.home.start}>
        {draft && <div className="session-caption"><h2>{draft.name || t.home.free}</h2>
          <p>{countLabel(pending ?? 0, t.home.pendingSet, t.home.pendingSets)}</p></div>}
        <div className="session-actions">
          <button type="button" className="button primary session-launch" onClick={draft ? resume : () => start()}>
            <Play size={16} fill="currentColor" aria-hidden="true" />{draft ? t.home.resume : t.home.start}
          </button>
        </div>
      </section>
      <TrainingWeek now={now} workouts={weekWorkouts(data.workouts, now)} />
      {overview}
      <section className="section home-routines">
        <div className="section-head"><h2>{t.home.quick}</h2><button type="button" className="text-button" onClick={routines}>{t.home.allRoutines}<ChevronRight size={15} aria-hidden="true" /></button></div>
        {data.routines.length ? <div className="list home-list">{data.routines.slice(0, 3).map(routine => <div className="list-row" key={routine.id}>
          <span className="row-content"><strong>{routine.name}</strong><small>{countLabel(routine.items.length, t.common.exercise, t.common.exercises)}</small></span>
          <button className="icon-button start-icon" type="button" aria-label={t.home.startRoutine + ' ' + routine.name} onClick={() => start(routine)}><Play size={17} aria-hidden="true" /></button>
        </div>)}</div> : <Empty title={t.routines.empty} detail={t.home.noRoutines} action={<button type="button" className="button secondary" onClick={create}><Plus size={17} aria-hidden="true" />{t.home.createRoutine}</button>} />}
      </section>
      <section className="section home-recent">
        <div className="section-head"><h2>{t.home.recent}</h2><button type="button" className="text-button" onClick={history}>{t.home.seeHistory}<ChevronRight size={15} aria-hidden="true" /></button></div>
        {recent ? <button type="button" className="list-row clickable recent-entry" onClick={() => detail(recent)}>
          <span className="row-content"><strong>{recent.name}</strong><small>{longDate(recent.startedAt)}</small>
            <small className="recent-sets">{countLabel(totals([recent]).sets, t.active.series, t.common.validSets)}</small>
          </span><ArrowUpRight size={18} aria-hidden="true" />
        </button> : <Empty title={t.common.noHistory} detail={t.home.noRecent} />}
      </section>
    </div>
  </>;
}
