import { useCallback, useEffect, useRef, useState } from 'react';
import { WriteConflict } from '../data/repository';
import type { TrackerRepository } from '../data/repository';
import type { Snapshot } from '../domain/model';

export function useTracker(repository: TrackerRepository) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'conflict'>('loading');
  const current = useRef<Snapshot | null>(null);
  const revision = useRef(0);
  const pending = useRef<Promise<boolean> | null>(null);
  const blocked = useRef(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      await pending.current;
      const stored = await repository.read();
      revision.current = stored.revision;
      current.current = stored.data;
      blocked.current = false;
      setData(stored.data);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => { void load(); }, [load]);

  const persist = useCallback(async () => {
    if (pending.current) return pending.current;
    if (!current.current || blocked.current) return false;
    setStatus('saving');
    const task = (async () => {
      try {
        let snapshot: Snapshot | null;
        do {
          snapshot = current.current;
          if (!snapshot) return false;
          revision.current = await repository.save(snapshot, revision.current);
        } while (snapshot !== current.current);
        setStatus('saved');
        return true;
      } catch (error) {
        blocked.current = error instanceof WriteConflict;
        setStatus(blocked.current ? 'conflict' : 'error');
        return false;
      }
    })();
    pending.current = task;
    try {
      return await task;
    } finally {
      pending.current = null;
    }
  }, [repository]);

  const update = useCallback((change: (value: Snapshot) => Snapshot) => {
    if (!current.current || blocked.current) return Promise.resolve(false);
    const changed = change(current.current);
    current.current = changed;
    setData(changed);
    return persist();
  }, [persist]);

  return { data, status, update, reload: load, retry: persist };
}
