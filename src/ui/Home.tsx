import { CalendarDays, Check, ChevronRight, Dumbbell, Play, Plus } from 'lucide-react';
import { countLabel, formatNumber, locale, longDate, shortDate, t } from '../app/pt-BR';
import type { Routine, Snapshot, Workout } from '../domain/model';
import { totals, weekStart, weekWorkouts } from '../domain/stats';
import { Empty, Title } from './primitives';

type Props = {
  data: Snapshot; start: (routine?: Routine) => void; resume: () => void;
  routines: () => void; create: () => void; history: () => void; detail: (workout: Workout) => void;
};

const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });

function TrainingWeek({ now, workouts }: { now: Date; workouts: Workout[] }) {
  const first = weekStart(now);
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  const stats = totals(workouts);
  return <section className="home-week" aria-labelledby="home-week-heading">
    <header className="section-head"><h2 id="home-week-heading">{t.home.week}</h2>
      <span className="muted date-range">{shortDate(first)} – {shortDate(last)}</span>
    </header>
    <ol className="attendance" aria-label={t.home.week}>
      {Array.from({ length: 7 }, (_, index) => {
        const date = new Date(first);
        date.setDate(first.getDate() + index);
        const day = date.toDateString();
        const trained = workouts.some(item => new Date(item.startedAt).toDateString() === day);
        return <li key={day} aria-current={day === now.toDateString() ? 'date' : undefined} data-trained={trained}>
          <span>{weekday.format(date).replace('.', '')}</span><strong>{date.getDate()}</strong>
          <span className="attendance-status">
            <span className="sr-only">{trained ? t.home.trainingDay : t.home.restDay}</span>
            {trained ? <Check size={13} aria-hidden="true" /> : <i />}
          </span>
        </li>;
      })}
    </ol>
    {workouts.length > 0 ? <div className="week-totals">
      <span><strong>{formatNumber(stats.sessions)}</strong> {t.home.sessions.toLowerCase()}</span>
      <span><strong>{formatNumber(stats.sets)}</strong> {t.common.validSets.toLowerCase()}</span>
      <span><strong>{formatNumber(stats.volume)} kg</strong> de volume</span>
    </div> : <p className="week-totals">{t.home.weekEmpty}</p>}
  </section>;
}

export function Home({ data, start, resume, routines, create, history, detail }: Props) {
  const now = new Date();
  const recent = [...data.workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const draft = data.draft;
  return <>
    <Title heading={t.home.heading} />
    <div className="home-start">
      <section className="session-start">
        <span className="session-icon"><Dumbbell size={21} strokeWidth={1.7} aria-hidden="true" /></span>
        <div className="session-caption"><h2>{draft ? draft.name || t.home.free : t.home.free}</h2>
          <p>{draft ? t.home.draftHint : t.home.preferred}</p>
        </div>
        <div className="session-actions">
          <button type="button" className="button primary" onClick={draft ? resume : () => start()}>
            <Play size={16} fill="currentColor" aria-hidden="true" />{draft ? t.home.resume : t.home.start}
          </button>
          {!draft && data.routines.length > 0 && <button type="button" className="button secondary" onClick={routines}>{t.home.openRoutine}</button>}
        </div>
      </section>
      <TrainingWeek now={now} workouts={weekWorkouts(data.workouts, now)} />
    </div>
    <div className="home-bottom">
      <section className="section">
        <div className="section-head"><h2>{t.home.quick}</h2><button type="button" className="text-button" onClick={routines}>{t.home.allRoutines}<ChevronRight size={16} aria-hidden="true" /></button></div>
        {data.routines.length ? <div className="list home-list">{data.routines.slice(0, 3).map(routine => <div className="list-row" key={routine.id}>
          <span className="row-content"><strong>{routine.name}</strong><small>{countLabel(routine.items.length, t.common.exercise, t.common.exercises)}</small></span>
          <button className="icon-button start-icon" type="button" aria-label={t.home.startRoutine + ' ' + routine.name} onClick={() => start(routine)}><Play size={16} aria-hidden="true" /></button>
        </div>)}</div> : <Empty title={t.routines.empty} detail={t.home.noRoutines} action={<button type="button" className="button secondary" onClick={create}><Plus size={17} aria-hidden="true" />{t.home.createRoutine}</button>} />}
      </section>
      <section className="section">
        <div className="section-head"><h2>{t.home.recent}</h2><button type="button" className="text-button" onClick={history}>{t.home.seeHistory}<ChevronRight size={16} aria-hidden="true" /></button></div>
        {recent ? <button type="button" className="list-row clickable" onClick={() => detail(recent)}>
          <span className="row-icon"><CalendarDays size={18} aria-hidden="true" /></span>
          <span className="row-content"><strong>{recent.name}</strong><small>{longDate(recent.startedAt)}</small></span>
          <ChevronRight size={18} aria-hidden="true" />
        </button> : <Empty title={t.common.noHistory} detail={t.home.noRecent} />}
      </section>
    </div>
  </>;
}
