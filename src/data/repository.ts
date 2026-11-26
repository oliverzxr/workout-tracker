import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { initialSnapshot, withBundledExercises } from '../domain/catalog';
import { snapshotSchema } from '../domain/model';
import type { Snapshot } from '../domain/model';

export type StoredTracker = { revision: number; data: Snapshot };

export interface TrackerRepository {
  read(): Promise<StoredTracker>;
  save(data: Snapshot, expectedRevision: number): Promise<number>;
}

export class WriteConflict extends Error {}

interface TrackerDb extends DBSchema {
  tracker: { key: 'snapshot'; value: StoredTracker };
}

export class IndexedTrackerRepository implements TrackerRepository {
  private connection?: Promise<IDBPDatabase<TrackerDb>>;

  constructor(private readonly dbName = 'workout-tracker') {}

  private database() {
    this.connection ??= openDB<TrackerDb>(this.dbName, 1, {
      upgrade: db => { db.createObjectStore('tracker'); },
      blocking: () => { void this.close().catch(() => undefined); },
      terminated: () => { this.connection = undefined; },
    }).catch(error => { this.connection = undefined; throw error; });
    return this.connection;
  }

  async read(): Promise<StoredTracker> {
    const db = await this.database();
    const tx = db.transaction('tracker', 'readwrite');
    const stored = await tx.store.get('snapshot');
    if (stored) {
      const validated = snapshotSchema.parse(stored.data);
      const data = withBundledExercises(validated);
      const revision = stored.revision + (data === validated ? 0 : 1);
      if (data !== validated) await tx.store.put({ data, revision }, 'snapshot');
      await tx.done;
      return { revision, data };
    }
    const first = { revision: 0, data: initialSnapshot() };
    await tx.store.put(first, 'snapshot');
    await tx.done;
    return first;
  }

  async save(data: Snapshot, expectedRevision: number) {
    const db = await this.database();
    const tx = db.transaction('tracker', 'readwrite');
    const previous = await tx.store.get('snapshot');
    if (!previous || previous.revision !== expectedRevision) {
      await tx.done;
      throw new WriteConflict();
    }
    const revision = expectedRevision + 1;
    await tx.store.put({ data, revision }, 'snapshot');
    await tx.done;
    return revision;
  }

  async close() {
    const connection = this.connection;
    this.connection = undefined;
    (await connection)?.close();
  }
}
