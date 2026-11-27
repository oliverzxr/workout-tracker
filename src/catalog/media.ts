import media from './media.json';

type FrameCredit = { file: string; source: string; pageRevision: number; sha1: string };
type FrameSet = { key: string; frames: readonly FrameCredit[] };
export type ExerciseMedia = FrameSet & { kind: 'frames' };

const index = new Map<string, ExerciseMedia>(Object.entries(media).map(([id, entry]) => [id, { ...entry, kind: 'frames' }]));
export const illustrationLicense = { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/', author: 'Everkinetic' };

export function exerciseMedia(exerciseId: string): ExerciseMedia | undefined {
  return index.get(exerciseId);
}

export function mediaUrl(key: string, frame: 'thumb' | 'start' | 'end') {
  return import.meta.env.BASE_URL + 'exercise-media/' + key + '-' + frame + '.webp';
}
