import { Activity, ArrowLeft, ChevronRight } from 'lucide-react';
import { countLabel, formatNumber, longDate, t } from '../app/pt-BR';
import { exerciseGuide } from '../catalog/guides';
import { exerciseMedia, illustrationLicense, mediaUrl } from '../catalog/media';
import { exerciseProfile } from '../catalog/profiles';
import type { Exercise, Workout } from '../domain/model';
import { progression } from '../domain/stats';
import { ExerciseImage } from './ExerciseImage';
import { ExerciseProgress } from './ExerciseProgress';
import { Empty, Title } from './primitives';

function Demonstration({ exercise }: { exercise: Exercise }) {
  const media = exerciseMedia(exercise.id);
  return <section className="section exercise-visual" aria-labelledby="exercise-visual-title">
    <div className="section-head"><h2 id="exercise-visual-title">{t.catalog.visual}</h2></div>
    {media ? <>
      <div className="movement-frames">
        <figure><ExerciseImage src={mediaUrl(media.key, 'start')} alt={exercise.name + ' · ' + t.catalog.start} /><figcaption>{t.catalog.start}</figcaption></figure>
        <figure><ExerciseImage src={mediaUrl(media.key, 'end')} alt={exercise.name + ' · ' + t.catalog.end} /><figcaption>{t.catalog.end}</figcaption></figure>
      </div>
      <details className="exercise-credits">
        <summary>{t.catalog.credits}</summary>
        <p>{illustrationLicense.author} · <a href={illustrationLicense.url}>{illustrationLicense.name}</a> · {t.catalog.adaptations}</p>
        <ul>{media.frames.map(frame => <li key={frame.source}><a href={frame.source}>{frame.file}</a></li>)}</ul>
      </details>
    </> : <div className="movement-fallback panel"><ExerciseImage alt="" /><p>{t.catalog.unavailable}</p></div>}
  </section>;
}

function ExerciseHistory({ exerciseId, workouts, showWorkout }: { exerciseId: string; workouts: Workout[]; showWorkout: (workout: Workout) => void }) {
  const entries = [...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).flatMap(workout => {
    const sets = workout.exercises.filter(row => row.exerciseId === exerciseId).flatMap(row => row.sets);
    return sets.length ? [{ workout, sets }] : [];
  });
  return <section className="section exercise-history">
    <div className="section-head"><h2>{t.catalog.exerciseHistory}</h2></div>
    {entries.length ? <div className="list">{entries.map(({ workout, sets }) => <details className="exercise-history-entry" key={workout.id}>
      <summary><span><strong>{workout.name}</strong><small>{longDate(workout.startedAt)}</small></span>
        <span className="muted">{countLabel(sets.length, t.active.series, t.common.sets)}</span></summary>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">{t.active.series}</th><th scope="col">{t.active.load}</th><th scope="col">{t.common.reps}</th><th scope="col">{t.common.rir}</th></tr></thead>
        <tbody>{sets.map((set, index) => <tr key={index}>
          <th scope="row">{index + 1} <small className="muted">{t.kinds[set.kind]}</small></th><td>{formatNumber(set.grams / 1000)} kg</td><td>{set.reps}</td><td>{set.rir ?? '—'}</td>
        </tr>)}</tbody>
      </table></div>
      <button className="text-button" type="button" onClick={() => showWorkout(workout)}>{t.history.details}<ChevronRight size={16} aria-hidden="true" /></button>
    </details>)}</div> : <Empty title={t.catalog.emptyHistory} />}
  </section>;
}

export function ExerciseDetail({ exercise, workouts, close, showWorkout }: {
  exercise: Exercise; workouts: Workout[]; close: () => void; showWorkout: (workout: Workout) => void;
}) {
  const guide = exerciseGuide(exercise.id);
  const profile = exerciseProfile(exercise.id);
  const secondary = profile.secondary.filter(muscle => muscle !== exercise.muscle);
  return <>
    <div className="editor-top"><button type="button" className="text-button" onClick={close}><ArrowLeft size={17} aria-hidden="true" />{t.catalog.heading}</button></div>
    <Title heading={exercise.name} subtitle={t.muscles[exercise.muscle] + ' · ' + t.equipment[exercise.equipment]} />
    <div className="exercise-guide-layout">
      <Demonstration exercise={exercise} />
      <section className="section exercise-technique">
        <div className="section-head"><h2>{t.catalog.execution}</h2></div>
        <dl>
          <div><dt>{t.catalog.primary}</dt><dd>{guide?.primary ?? t.muscles[exercise.muscle]}</dd></div>
          <div><dt>{t.catalog.secondary}</dt><dd>{guide?.secondary ?? (secondary.length ? secondary.map(muscle => t.muscles[muscle]).join(', ') : t.catalog.noSecondary)}</dd></div>
        </dl>
        {guide ? <ol className="technique-steps">{guide.steps.map(step => <li key={step}>{step}</li>)}</ol> : <p className="muted">{t.catalog.missingGuide}</p>}
      </section>
    </div>
    <div className="exercise-performance-layout">
      <section className="section"><div className="section-head"><h2><Activity size={19} aria-hidden="true" />{t.progress.progression}</h2></div>
        <ExerciseProgress points={progression(workouts, exercise.id)} />
      </section>
      <ExerciseHistory exerciseId={exercise.id} workouts={workouts} showWorkout={showWorkout} />
    </div>
  </>;
}
