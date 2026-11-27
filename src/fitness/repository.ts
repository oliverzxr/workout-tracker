import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { WriteConflict } from '../data/repository';
import type { SnapshotRepository } from '../data/repository';
import { emptyFitness, fitnessSchema } from './model';
import type { Fitness } from './model';

type StoredFitness = { data: Fitness; revision: number };
export type FitnessRepository = SnapshotRepository<Fitness>;

interface FitnessDb extends DBSchema {
  fitness: { key: 'snapshot'; value: StoredFitness };
}

export class LocalFitnessRepository implements FitnessRepository {
  private connection: Promise<IDBPDatabase<FitnessDb>> | undefined;

  constructor(private readonly name = 'workout-tracker-fitness') {}

  private database() {
    this.connection ??= openDB<FitnessDb>(this.name, 1, {
      upgrade: db => { db.createObjectStore('fitness'); },
      blocking: () => { void this.close().catch(() => undefined); },
      terminated: () => { this.connection = undefined; },
    }).catch(error => { this.connection = undefined; throw error; });
    return this.connection;
  }

  async read(): Promise<StoredFitness> {
    const db = await this.database();
    const stored = await db.get('fitness', 'snapshot');
    return stored ? { revision: stored.revision, data: fitnessSchema.parse(stored.data) } : { revision: 0, data: emptyFitness() };
  }

  async save(data: Fitness, expected: number) {
    const validated = fitnessSchema.parse(data);
    const db = await this.database();
    const tx = db.transaction('fitness', 'readwrite');
    const stored = await tx.store.get('snapshot');
    if ((stored?.revision ?? 0) !== expected) {
      await tx.done;
      throw new WriteConflict();
    }
    const revision = expected + 1;
    await tx.store.put({ data: validated, revision }, 'snapshot');
    await tx.done;
    return revision;
  }

  async close() {
    const connection = this.connection;
    this.connection = undefined;
    (await connection)?.close();
  }
}

export class MemoryFitnessRepository implements FitnessRepository {
  private revision = 0;

  constructor(private data: Fitness) {}

  async read() { return { data: this.data, revision: this.revision }; }

  async save(data: Fitness, expected: number) {
    if (expected !== this.revision) throw new WriteConflict();
    this.data = fitnessSchema.parse(data);
    return ++this.revision;
  }
}
