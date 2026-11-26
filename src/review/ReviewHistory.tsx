import { CalendarDays, ChevronRight } from 'lucide-react';
import { countLabel, formatNumber, locale, t } from '../app/pt-BR';
import type { Workout } from '../domain/model';
import { totals } from '../domain/stats';
import { Title } from '../ui/primitives';
import { designCopy } from './directions';

const dayOfWeek = new Intl.DateTimeFormat(locale, { weekday: 'short' });
const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });

export function ReviewHistory({ workouts, detail, home }: {
  workouts: Workout[]; detail: (workout: Workout) => void; home: () => void;
}) {
  const months = new Map<string, Workout[]>();
  for (const workout of [...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt))) {
    const key = month.format(new Date(workout.startedAt));
    const entries = months.get(key);
    if (entries) entries.push(workout);
    else months.set(key, [workout]);
  }
  return <div className="history-ledger">
    <Title heading={t.history.heading} subtitle={workouts.length ? countLabel(workouts.length, 'Sessão registrada', designCopy.historyMonth) : undefined} />
    {months.size ? [...months].map(([group, entries]) => <section key={group} className="history-month">
      <h2>{group.charAt(0).toLocaleUpperCase(locale) + group.slice(1)}</h2>
      <ol>{entries.map(entry => {
        const start = new Date(entry.startedAt);
        const length = Math.max(0, Math.round((Date.parse(entry.finishedAt) - +start) / 60_000));
        return <li key={entry.id}><button type="button" onClick={() => detail(entry)} className="session-line">
          <span className="session-date"><strong>{start.getDate().toString().padStart(2, '0')}</strong><small>{dayOfWeek.format(start).replace('.', '')}</small></span>
          <span className="session-description"><strong>{entry.name}</strong><small>{time.format(start)} / {length} min</small></span>
          <span className="session-sets"><strong>{formatNumber(totals([entry]).sets)}</strong><small>{t.common.validSets.toLowerCase()}</small></span>
          <ChevronRight size={18} />
        </button></li>;
      })}</ol>
    </section>) : <div className="review-empty history-empty"><CalendarDays size={25} /><h2>{t.common.noHistory}</h2>
      <p>{designCopy.noSessions}</p><button type="button" className="button primary" onClick={home}>{designCopy.train}</button>
    </div>}
  </div>;
}
