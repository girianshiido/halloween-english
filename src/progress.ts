import { WORDS, CORE_PACK, EXTRA_PACKS, STARTER_WORDS, progressiveCount, type Mode, type Word, type Skill, type Cue, type Session, type AnswerResult, type CardPack } from './game.js';

export type Variant = 'original' | 'color' | 'art';
export interface WordProgress { listen: number; read: number; flash: number; once: number; selected: Variant; introduced: boolean; }
export interface Progress { words: Record<string, WordProgress>; completedSessions: number; openedPacks: string[]; }
export const PROGRESS_KEY = 'boo-english-progress-v5';
export const BESTS_KEY = 'boo-english-bests-v3';
export const SKILLS: readonly Skill[] = ['listen', 'read', 'flash', 'once'];
export function clearLegacyProgress(storage: Pick<Storage, 'removeItem'>): void {
  for (const key of ['boo-english-progress-v1', 'boo-english-progress-v2', 'boo-english-progress-v3', 'boo-english-progress-v4', 'boo-english-bests-v1', 'boo-english-bests-v2']) storage.removeItem(key);
}
export function resetGameStorage(storage: Pick<Storage, 'removeItem'>): void {
  clearLegacyProgress(storage);
  for (const key of [PROGRESS_KEY, BESTS_KEY, 'boo-english-articles']) storage.removeItem(key);
}
export const VARIANTS: readonly Variant[] = ['original', 'color', 'art'];
export const VARIANT_LABELS: Record<Variant, string> = { original: 'Original', color: 'Couleur', art: 'Artiste' };
export function emptyProgress(): Progress {
  return { words: Object.fromEntries(WORDS.map(word => [word.id, { listen: 0, read: 0, flash: 0, once: 0, selected: 'original' as const, introduced: STARTER_WORDS.includes(word) }])), completedSessions: 0, openedPacks: [] };
}
function colorReady(entry: WordProgress): boolean { return entry.listen >= 3 && entry.read >= 3; }
function packDiscoveries(progress: Progress, pack: CardPack): Word[] {
  let count = pack.startingCount;
  // A pack only uses its own already revealed colors to open its next pair.
  while (true) {
    const colored = pack.words.slice(0, count).filter(word => colorReady(progress.words[word.id]!)).length;
    const next = Math.min(pack.words.length, pack.startingCount + 2 * Math.floor(colored / 2));
    if (next <= count) return pack.words.slice(0, count);
    count = next;
  }
}
export function packAvailable(progress: Progress, id: string): boolean {
  const index = EXTRA_PACKS.findIndex(pack => pack.id === id);
  if (index < 0) return false;
  const preceding = [CORE_PACK, ...EXTRA_PACKS.slice(0, index)];
  return preceding.every(pack => (pack === CORE_PACK || progress.openedPacks.includes(pack.id)) && pack.words.every(word => colorReady(progress.words[word.id]!)));
}
export function openPack(progress: Progress, id: string): boolean {
  if (progress.openedPacks.includes(id) || !packAvailable(progress, id)) return false;
  progress.openedPacks.push(id);
  return true;
}
export function availablePacks(progress: Progress): CardPack[] { return EXTRA_PACKS.filter(pack => !progress.openedPacks.includes(pack.id) && packAvailable(progress, pack.id)); }
export function collectionWords(progress: Progress): Word[] { return [...CORE_PACK.words, ...EXTRA_PACKS.filter(pack => progress.openedPacks.includes(pack.id)).flatMap(pack => pack.words)]; }
export function discoveredWords(progress: Progress): Word[] {
  return [...packDiscoveries(progress, CORE_PACK), ...EXTRA_PACKS.filter(pack => progress.openedPacks.includes(pack.id) && packAvailable(progress, pack.id)).flatMap(pack => packDiscoveries(progress, pack))];
}
export function isDiscovered(progress: Progress, id: string): boolean { return discoveredWords(progress).some(word => word.id === id); }
export function knownWords(progress: Progress): Word[] { return discoveredWords(progress).filter(word => progress.words[word.id]!.introduced); }
export function pendingWords(progress: Progress): Word[] { return discoveredWords(progress).filter(word => !progress.words[word.id]!.introduced); }
export function introduceWord(progress: Progress, id: string): boolean {
  if (!isDiscovered(progress, id) || progress.words[id]!.introduced) return false;
  progress.words[id]!.introduced = true;
  return true;
}
export function coloredWords(progress: Progress): Word[] { return discoveredWords(progress).filter(word => colorReady(progress.words[word.id]!)); }
export function memoryAvailable(progress: Progress): boolean { return coloredWords(progress).length >= 3; }
export function isUnlocked(progress: Progress, id: string, variant: Variant): boolean {
  if (!VARIANTS.includes(variant) || !isDiscovered(progress, id)) return false;
  const entry = progress.words[id]!;
  return variant === 'original' || colorReady(entry) && (variant === 'color' || entry.flash >= 3 && entry.once >= 3);
}
export function parseProgress(text: string | null): Progress {
  const progress = emptyProgress();
  try {
    const raw: unknown = JSON.parse(text ?? 'null');
    if (!raw || typeof raw !== 'object' || !('version' in raw) || raw.version !== 5 || !('words' in raw) || !raw.words || typeof raw.words !== 'object') return progress;
    const words = raw.words as Record<string, unknown>;
    for (const word of WORDS) {
      const entry = words[word.id];
      if (!entry || typeof entry !== 'object') continue;
      const data = entry as Record<string, unknown>;
      const target = progress.words[word.id]!;
      for (const skill of SKILLS) {
        const value = data[skill];
        if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) target[skill] = Math.min(3, value);
      }
      target.introduced ||= data.introduced === true;
    }
    // Format 5 stays compatible: saves made before packs simply have no opened pack.
    if ('openedPacks' in raw && Array.isArray(raw.openedPacks)) {
      for (const pack of EXTRA_PACKS) if (raw.openedPacks.includes(pack.id) && packAvailable(progress, pack.id)) progress.openedPacks.push(pack.id);
    }
    // Sanitize impossible records without letting hidden cards unlock other cards.
    const available = new Set(discoveredWords(progress).map(word => word.id));
    for (const word of WORDS) {
      const entry = progress.words[word.id]!;
      if (!available.has(word.id)) { progress.words[word.id] = emptyProgress().words[word.id]!; continue; }
      if (!entry.introduced) { for (const skill of SKILLS) entry[skill] = 0; }
      if (!colorReady(entry)) { entry.flash = 0; entry.once = 0; }
      const data = words[word.id] as Record<string, unknown> | undefined;
      if (data && VARIANTS.includes(data.selected as Variant) && isUnlocked(progress, word.id, data.selected as Variant)) entry.selected = data.selected as Variant;
    }
    if ('completedSessions' in raw && typeof raw.completedSessions === 'number' && Number.isSafeInteger(raw.completedSessions) && raw.completedSessions >= 0) progress.completedSessions = raw.completedSessions;
  } catch { /* A damaged save must never prevent playing. */ }
  return progress;
}
export function serializeProgress(progress: Progress): string { return JSON.stringify({ version: 5, ...progress }); }
export function chooseVariant(progress: Progress, id: string, variant: Variant): boolean {
  if (!isUnlocked(progress, id, variant)) return false;
  progress.words[id]!.selected = variant;
  return true;
}
export function variantPath(id: string, variant: Variant): string { return variant === 'original' ? `./images/${id}.png` : `./images/${variant}/${id}.png`; }
export function modeTargets(progress: Progress, mode: Mode): Word[] {
  if (mode === 'memory' && !memoryAvailable(progress)) return [];
  return knownWords(progress).filter(word => mode !== 'memory' || colorReady(progress.words[word.id]!));
}
export function skillFor(mode: Mode, cue: Cue): Skill { return mode === 'memory' ? cue : mode; }
export function skillLevel(progress: Progress, id: string, mode: Mode, cue: Cue = 'flash'): number { return progress.words[id]![skillFor(mode, cue)]; }
export function difficulty(progress: Progress, id: string, mode: Mode, cue: Cue = 'flash'): 2 | 3 | 4 { return progressiveCount(skillLevel(progress, id, mode, cue)); }
export function firstMemoryCue(progress: Progress): Cue {
  const targets = modeTargets(progress, 'memory');
  const sum = (skill: Skill) => targets.reduce((total, word) => total + progress.words[word.id]![skill], 0);
  return sum('flash') <= sum('once') ? 'flash' : 'once';
}
export interface Recommendation { mode: Mode; target?: string; }
export function recommend(progress: Progress, forceTarget?: string): Recommendation {
  const memory = modeTargets(progress, 'memory').filter(word => !isUnlocked(progress, word.id, 'art'));
  const normal = knownWords(progress).filter(word => !isUnlocked(progress, word.id, 'color'));
  if (!forceTarget && memory.length && (!normal.length || progress.completedSessions % 3 === 2)) return { mode: 'memory' };
  const least = forceTarget ? knownWords(progress).find(word => word.id === forceTarget) : [...normal].sort((a, b) => (progress.words[a.id]!.listen + progress.words[a.id]!.read) - (progress.words[b.id]!.listen + progress.words[b.id]!.read))[0];
  if (!least) return { mode: progress.completedSessions % 2 ? 'read' : 'listen' };
  const entry = progress.words[least.id]!;
  return { mode: entry.listen < entry.read ? 'listen' : entry.read < entry.listen ? 'read' : progress.completedSessions % 2 ? 'read' : 'listen', target: least.id };
}
export interface Reward { variant: Variant | null; newCards: Word[]; }
export function recordAnswer(progress: Progress, session: Session, result: AnswerResult): Reward {
  const reward: Reward = { variant: null, newCards: [] };
  if (result !== 'correct' || !session.solved || session.attempts !== 1 || session.credited.includes(session.index)) return reward;
  const question = session.questions[session.index]!;
  const id = question.target.id;
  if (!modeTargets(progress, session.mode).some(word => word.id === id)) return reward;
  session.credited.push(session.index);
  const before = discoveredWords(progress).map(word => word.id);
  const oldColor = isUnlocked(progress, id, 'color');
  const oldArt = isUnlocked(progress, id, 'art');
  const entry = progress.words[id]!;
  const skill = skillFor(session.mode, question.cue);
  entry[skill] = Math.min(3, entry[skill] + 1);
  if (!oldColor && isUnlocked(progress, id, 'color')) reward.variant = 'color';
  if (!oldArt && isUnlocked(progress, id, 'art')) reward.variant = 'art';
  reward.newCards = discoveredWords(progress).filter(word => !before.includes(word.id));
  return reward;
}
