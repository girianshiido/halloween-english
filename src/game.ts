export type Mode = 'listen' | 'read' | 'memory';
export type ChoiceCount = 2 | 3 | 4;
export interface Word { id: string; english: string; french: string; article?: 'a' | 'an' | 'the'; unlocks?: string; }
export const WORDS: readonly Word[] = [
  { id: 'ghost', unlocks: 'owl', english: 'ghost', french: 'fantôme' },
  { id: 'vampire', unlocks: 'snake', english: 'vampire', french: 'vampire' },
  { id: 'pumpkin', unlocks: 'crow', english: 'pumpkin', french: 'citrouille' },
  { id: 'monster', unlocks: 'wolf', english: 'monster', french: 'monstre' },
  { id: 'witch', unlocks: 'moon', english: 'witch', french: 'sorcière' },
  { id: 'bat', unlocks: 'skull', english: 'bat', french: 'chauve-souris' },
  { id: 'skeleton', unlocks: 'mask', english: 'skeleton', french: 'squelette' },
  { id: 'spider', unlocks: 'candle', english: 'spider', french: 'araignée' },
  { id: 'rat', unlocks: 'hat', english: 'rat', french: 'rat' },
  { id: 'frog', unlocks: 'sweet', english: 'frog', french: 'grenouille' },
  { id: 'owl', english: 'owl', french: 'hibou', article: 'an' },
  { id: 'snake', english: 'snake', french: 'serpent' },
  { id: 'crow', english: 'crow', french: 'corbeau' },
  { id: 'wolf', english: 'wolf', french: 'loup' },
  { id: 'moon', english: 'Moon', french: 'Lune', article: 'the' },
  { id: 'skull', english: 'skull', french: 'crâne' },
  { id: 'mask', english: 'mask', french: 'masque' },
  { id: 'candle', english: 'candle', french: 'bougie' },
  { id: 'hat', english: 'hat', french: 'chapeau' },
  { id: 'sweet', english: 'sweet', french: 'bonbon' },
];
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
export interface Question { target: Word; choices: Word[]; cue: 'flash' | 'once'; }
export interface Session {
  mode: Mode; count: ChoiceCount; questions: Question[];
  index: number; score: number; attempts: number; solved: boolean;
  missed: string[]; rejected: string[];
}
export const ORIGINAL_WORDS = WORDS.slice(0, 10);
export function spokenWord(word: Word, articles = true): string {
  return articles ? `${word.article ?? 'a'} ${word.english}` : word.english;
}
export type Levels = Record<string, number>;
export function progressiveCount(targets: readonly Word[], levels: Levels): ChoiceCount {
  const half = Math.ceil(targets.length / 2);
  if (targets.filter(w => (levels[w.id] ?? 0) >= 4).length >= half) return 4;
  if (targets.filter(w => (levels[w.id] ?? 0) >= 2).length >= half) return 3;
  return 2;
}
// Weighted sampling favours low levels; a target may appear twice, never more.
export function createSession(mode: Mode, count: ChoiceCount, random: () => number = Math.random, targets: readonly Word[] = ORIGINAL_WORDS, levels: Levels = {}): Session {
  if (!['listen', 'read', 'memory'].includes(mode)) throw new Error('Invalid mode');
  if (![2, 3, 4].includes(count)) throw new Error('Invalid choice count');
  if (!targets.length || targets.some(w => !WORDS.includes(w))) throw new Error('Invalid targets');
  const uses: Record<string, number> = {};
  const questions: Question[] = [];
  for (let index = 0; index < Math.min(10, targets.length * 2); index++) {
    const pool = targets.filter(w => (uses[w.id] ?? 0) < 2);
    const weights = pool.map(w => 1 / (1 + (levels[w.id] ?? 0) + (uses[w.id] ?? 0)) ** 2);
    let pick = random() * weights.reduce((a, b) => a + b, 0);
    let selected = pool.length - 1;
    for (let i = 0; i < pool.length; i++) { pick -= weights[i]!; if (pick < 0) { selected = i; break; } }
    const target = pool[selected]!;
    uses[target.id] = (uses[target.id] ?? 0) + 1;
    questions.push({ target, cue: index % 2 === 0 ? 'flash' : 'once', choices: questionChoices(target, count, random) });
  }
  return { mode, count, questions, index: 0, score: 0, attempts: 0, solved: false, missed: [], rejected: [] };
}
export function questionChoices(target: Word, count: ChoiceCount, random: () => number = Math.random): Word[] {
  return shuffle([target, ...shuffle(WORDS.filter(w => w.id !== target.id), random).slice(0, count - 1)], random);
}
export interface Peek { radius: number; x: number; y: number; }
export function memoryPeek(level: number, random: () => number = Math.random): Peek | null {
  if (level < 2) return null;
  const radius = level >= 4 ? 18 : 30;
  // The window stays near the subject, entirely inside the picture.
  return { radius, x: 35 + random() * 30, y: 35 + random() * 30 };
}
export type AnswerResult = 'correct' | 'retry' | 'incorrect' | 'ignored';
export function answer(session: Session, id: string): AnswerResult {
  const q = session.questions[session.index];
  if (!q || session.solved || session.rejected.includes(id) || !q.choices.some(w => w.id === id)) return 'ignored';
  session.attempts++;
  if (id !== q.target.id) {
    session.rejected.push(id);
    if (session.attempts === 1) session.missed.push(q.target.id);
    if (session.mode === 'memory') { session.solved = true; return 'incorrect'; }
    return 'retry';
  }
  session.solved = true;
  if (session.attempts === 1) session.score++;
  return 'correct';
}
export function advance(session: Session): boolean {
  if (!session.solved) return false;
  session.index++;
  session.solved = false;
  session.attempts = 0;
  session.rejected = [];
  return session.index < session.questions.length;
}
