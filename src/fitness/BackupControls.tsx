import { useRef, useState } from 'react';
import { download } from '../data/export';
import { fitnessBackup, readFitnessBackup } from './model';
import type { Fitness } from './model';
import type { SaveFitness } from './NutritionScreen';

export function BackupControls({ data, save }: { data: Fitness; save: SaveFitness }) {
  const file = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  return <section className="fitness-ledger fitness-backup">
    <h2>Dados de nutrição e corpo</h2>
    <p className="muted">Este arquivo inclui refeições, metas, medidas e objetivos. Guarde-o em local privado.</p>
    <div className="split">
      <button className="button secondary" onClick={() => download(fitnessBackup(data), 'workout-tracker-fitness.json', 'application/json')}>Baixar backup de nutrição e corpo</button>
      <button className="text-button" onClick={() => file.current?.click()}>Restaurar nutrição e corpo</button>
    </div>
    <input ref={file} type="file" hidden aria-label="Arquivo de nutrição e corpo" accept="application/json,.json" onChange={async event => {
      const input = event.currentTarget;
      const selected = input.files?.[0];
      input.value = '';
      if (!selected) return;
      setMessage('');
      try {
        if (selected.size > 25_000_000) throw new Error('Tamanho');
        const restored = readFitnessBackup(await selected.text());
        if (window.confirm('Substituir os dados atuais de nutrição e corpo deste dispositivo?')) {
          setMessage(await save(() => restored) ? 'Backup restaurado.' : 'A gravação falhou. Tente novamente.');
        }
      } catch { setMessage('Arquivo inválido para nutrição e corpo.'); }
    }} />
    {message && <p role="status">{message}</p>}
  </section>;
}
