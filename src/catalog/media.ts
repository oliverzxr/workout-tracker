import media from './media.json';

type FrameCredit = { file: string; source: string; pageRevision: number; sha1: string };
export type ExerciseMedia = { key: string; frames: readonly FrameCredit[] };

const index: Record<string, ExerciseMedia> = media;
export const illustrationLicense = { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/', author: 'Everkinetic' };

export function exerciseMedia(exerciseId: string): ExerciseMedia | undefined {
  return Object.hasOwn(index, exerciseId) ? index[exerciseId] : undefined;
}

export function mediaUrl(key: string, frame: 'thumb' | 'start' | 'end') {
  return import.meta.env.BASE_URL + 'exercise-media/' + key + '-' + frame + '.webp';
}
