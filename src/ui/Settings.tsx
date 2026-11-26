import { useRef, useState } from 'react';
import { Download, HardDrive, Smartphone, Upload } from 'lucide-react';
import { t } from '../app/pt-BR';
import { download, exportBackup, exportCsv, importBackup } from '../data/export';
import type { Snapshot } from '../domain/model';
import { Title } from './primitives';

export function Settings({ data, save, install, installed, offline, demo }: {
  data: Snapshot; save: (value: Snapshot) => Promise<boolean>; install: (() => void) | null;
  installed: boolean; offline: boolean; demo?: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function restore(selected: File) {
    setMessage('');
    setError(false);
    let restored: Snapshot;
    try {
      if (selected.size > 25_000_000) throw new Error('Backup is larger than 25 MB');
      restored = importBackup(await selected.text());
    } catch {
      setMessage(t.settings.restoreError);
      setError(true);
      return;
    }
    if (window.confirm(t.settings.restoreConfirm) && await save(restored)) setMessage(t.settings.restoreSuccess);
  }

  if (demo) return <>
    <Title heading={t.settings.heading} subtitle={t.shell.demo} />
    <section className="panel settings-panel">
      <h2><HardDrive size={21} aria-hidden="true" />{t.settings.local}</h2>
      <p>{t.shell.demoNote}</p>
    </section>
  </>;

  return <>
    <Title heading={t.settings.heading} subtitle={t.settings.description} />
    <section className="panel settings-panel">
      <h2><HardDrive size={21} />{t.settings.local}</h2>
      <p>{t.settings.warning}</p>
      <div className="settings-actions">
        <button className="button primary" onClick={() => download(exportBackup(data), 'workout-tracker-backup.json', 'application/json')}><Download size={17} />{t.settings.backup}</button>
        <button className="button secondary" onClick={() => download(exportCsv(data.workouts, t.settings.csvHeaders, t.kinds), 'workout-tracker-historico.csv', 'text/csv;charset=utf-8')}><Download size={17} />{t.settings.csv}</button>
        <button className="button secondary" onClick={() => file.current?.click()}><Upload size={17} />{t.settings.restore}</button>
        <input ref={file} aria-label={t.settings.restore} type="file" accept=".json,application/json" hidden onChange={event => {
          const input = event.currentTarget;
          const selected = input.files?.[0];
          input.value = '';
          if (selected) void restore(selected);
        }} />
      </div>
      {message && <p className={error ? 'error' : 'success'} role={error ? 'alert' : 'status'}>{message}</p>}
    </section>
    <section className="panel settings-panel">
      <h2><Smartphone size={21} />{t.settings.installation}</h2>
      {installed ? <p>{t.settings.installed}</p> : <p>{t.settings.ios}</p>}
      {install && !installed && <button className="button primary" onClick={install}>{t.settings.install}</button>}
      <p>{t.settings.offline}</p>
      {offline && <span className="offline-label"><span />{t.settings.ready}</span>}
    </section>
  </>;
}
