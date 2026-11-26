import { readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { exerciseGuide } from '../src/catalog/guides';
import media from '../src/catalog/media.json';
import { defaultCatalogFilters, exerciseProfile, searchExercises } from '../src/catalog/profiles';
import { initialSnapshot } from '../src/domain/catalog';

const { exercises } = initialSnapshot();

describe('catálogo de exercícios', () => {
  it('combina aliases, grupos secundários, equipamento e visibilidade', () => {
    const filters = { ...defaultCatalogFilters, query: 'Plano SUPINO', muscle: 'triceps', gear: 'barbell' } as const;
    const expected = expect.objectContaining({ id: 'catalog:bench' });
    expect(searchExercises(exercises, filters)).toContainEqual(expected);
    expect(searchExercises(exercises, { ...filters, gear: 'bodyweight' })).toEqual([]);
    const modified = exercises.map(item => item.id === 'catalog:bench' ? { ...item, archived: true } : item);
    expect(searchExercises(modified, filters)).not.toContainEqual(expected);
    expect(searchExercises(modified, { ...filters, includeArchived: true })).toContainEqual(expected);
    expect(searchExercises(exercises, { ...defaultCatalogFilters, query: 'elevacao lateral' })).toContainEqual(expect.objectContaining({ id: 'catalog:lateral' }));
  });

  it('liga cada movimento nativo a instruções e aliases pelo ID interno', () => {
    const identifiers = exercises.map(item => item.id);
    expect(exercises).toHaveLength(76);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    for (const id of identifiers) {
      expect(exerciseGuide(id)?.steps.length, id).toBeGreaterThanOrEqual(2);
      expect(exerciseProfile(id).aliases.length, id).toBeGreaterThan(0);
    }
    expect(exerciseGuide('personalizado')).toBeUndefined();
  });

  it('distribui somente quadros rastreáveis e limita o tamanho para uso offline', () => {
    const folder = 'public/exercise-media/';
    const expectedFiles: string[] = [];
    let total = 0;
    for (const [id, { key, frames }] of Object.entries(media)) {
      expect(id).toBe('catalog:' + key);
      expect(exerciseGuide(id)).toBeDefined();
      expect(frames).toHaveLength(2);
      for (const { source, pageRevision, sha1 } of frames) {
        expect(new URL(source).hostname).toBe('commons.wikimedia.org');
        expect(pageRevision).toBeGreaterThan(0);
        expect(sha1).toMatch(/^[a-f0-9]{40}$/);
      }
      for (const frame of ['start', 'end', 'thumb']) {
        const filename = key + '-' + frame + '.webp';
        expectedFiles.push(filename);
        const asset = readFileSync(folder + filename);
        expect(asset.subarray(8, 12).toString()).toBe('WEBP');
        expect(asset.length).toBeLessThan(frame === 'thumb' ? 8_000 : 40_000);
        total += statSync(folder + filename).size;
      }
    }
    expect(Object.keys(media).length).toBeGreaterThanOrEqual(20);
    expect(readdirSync(folder).filter(name => name.endsWith('.webp')).sort()).toEqual(expectedFiles.sort());
    expect(total).toBeLessThan(1_000_000);
  });
});
