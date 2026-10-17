export type Mode = 'listen' | 'read' | 'memory';
export type ChoiceCount = 2 | 3 | 4;
export interface Word { id: string; english: string; french: string; article?: 'a' | 'an' | 'the'; }
export const WORDS: readonly Word[] = [
  { id: 'ghost', english: 'ghost', french: 'fantôme' },
  { id: 'vampire', english: 'vampire', french: 'vampire' },
  { id: 'pumpkin', english: 'pumpkin', french: 'citrouille' },
  { id: 'monster', english: 'monster', french: 'monstre' },
  { id: 'witch', english: 'witch', french: 'sorcière' },
  { id: 'bat', english: 'bat', french: 'chauve-souris' },
  { id: 'skeleton', english: 'skeleton', french: 'squelette' },
  { id: 'spider', english: 'spider', french: 'araignée' },
  { id: 'rat', english: 'rat', french: 'rat' },
  { id: 'frog', english: 'frog', french: 'grenouille' },
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
  { id: 'cat', english: 'black cat', french: 'chat noir' },
  { id: 'broom', english: 'broom', french: 'balai' },
  { id: 'cauldron', english: 'cauldron', french: 'chaudron' },
  { id: 'wand', english: 'wand', french: 'baguette magique' },
  { id: 'potion', english: 'potion', french: 'potion' },
  { id: 'spellbook', english: 'spellbook', french: 'grimoire' },
  { id: 'house', english: 'haunted house', french: 'maison hantée' },
  { id: 'door', english: 'door', french: 'porte' },
  { id: 'key', english: 'key', french: 'clé' },
  { id: 'chest', english: 'chest', french: 'coffre' },
  { id: 'lantern', english: 'lantern', french: 'lanterne' },
  { id: 'bell', english: 'bell', french: 'cloche' },
  { id: 'leaf', english: 'leaf', french: 'feuille' },
  { id: 'acorn', english: 'acorn', french: 'gland', article: 'an' },
  { id: 'mushroom', english: 'mushroom', french: 'champignon' },
  { id: 'apple', english: 'apple', french: 'pomme', article: 'an' },
  { id: 'basket', english: 'basket', french: 'panier' },
  { id: 'umbrella', english: 'umbrella', french: 'parapluie', article: 'an' },
];
export const ORIGINAL_WORDS = WORDS.slice(0, 10);
export interface CardPack { id: string; title: string; description: string; words: readonly Word[]; startingCount: number; }
const wordIds = (ids: readonly string[]) => ids.map(id => WORDS.find(word => word.id === id)!);
export const CORE_PACK: CardPack = { id: 'halloween', title: 'Halloween', description: 'Tes premiers mots d’Halloween', startingCount: 4, words: wordIds(['ghost', 'pumpkin', 'bat', 'witch', 'vampire', 'monster', 'skeleton', 'spider', 'rat', 'frog', 'owl', 'snake', 'crow', 'wolf', 'moon', 'skull', 'mask', 'candle', 'hat', 'sweet']) };
export const EXTRA_PACKS: readonly CardPack[] = [
  { id: 'sorcery', title: 'Petite sorcellerie', description: 'De nouveaux mots pour un peu plus de magie', startingCount: 2, words: wordIds(['cat', 'broom', 'cauldron', 'wand', 'potion', 'spellbook']) },
  { id: 'mystery-house', title: 'La maison mystérieuse', description: 'De nouveaux mots derrière une porte d’Halloween', startingCount: 2, words: wordIds(['house', 'door', 'key', 'chest', 'lantern', 'bell']) },
  { id: 'autumn', title: 'Les trésors d’automne', description: 'De petites trouvailles aux couleurs de la saison', startingCount: 2, words: wordIds(['leaf', 'acorn', 'mushroom', 'apple', 'basket', 'umbrella']) },
];
export const DISCOVERY_ORDER: readonly Word[] = [...CORE_PACK.words, ...EXTRA_PACKS.flatMap(pack => pack.words)];
export const STARTER_WORDS = CORE_PACK.words.slice(0, CORE_PACK.startingCount);
export type Cue = 'flash' | 'once';
export type Skill = 'listen' | 'read' | Cue;
export function spokenWord(word: Word, articles = true): string {
  return articles ? `${word.article ?? 'a'} ${word.english}` : word.english;
}
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
export function progressiveCount(level: number): ChoiceCount { return level >= 2 ? 4 : level >= 1 ? 3 : 2; }
export interface Question { target: Word; choices: Word[]; cue: Cue; review: boolean; }
export interface Session {
  mode: Mode; count: ChoiceCount; questions: Question[]; principalLength: number;
  index: number; score: number; attempts: number; solved: boolean;
  missed: string[]; found: string[]; rejected: string[];
  credited: number[]; targets: readonly Word[]; pool: readonly Word[];
  level: (word: Word, cue: Cue) => number; random: () => number; firstCue: Cue;
}
export function questionChoices(target: Word, count: ChoiceCount, random: () => number = Math.random, pool: readonly Word[] = STARTER_WORDS): Word[] {
  return shuffle([target, ...shuffle(pool.filter(w => w.id !== target.id), random).slice(0, count - 1)], random);
}
function weighted(pool: readonly Word[], level: (word: Word) => number, random: () => number): Word {
  const weights = pool.map(word => 1 / (1 + level(word)) ** 2);
  let pick = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { pick -= weights[i]!; if (pick < 0) return pool[i]!; }
  return pool[pool.length - 1]!;
}
function cueAt(session: Pick<Session, 'firstCue'>, index: number): Cue {
  return index % 2 === 0 ? session.firstCue : session.firstCue === 'flash' ? 'once' : 'flash';
}
function makeQuestion(session: Session, target: Word, index: number, review = false): Question {
  const cue = cueAt(session, index);
  return { target, cue, review, choices: questionChoices(target, progressiveCount(session.level(target, cue)), session.random, session.pool) };
}
export interface SessionOptions {
  random?: () => number; targets?: readonly Word[]; pool?: readonly Word[];
  level?: (word: Word, cue: Cue) => number; firstCue?: Cue; forceTarget?: string;
}
// Four different targets, selected more often when the active skill is still weak.
export function createSession(mode: Mode, options: SessionOptions = {}): Session {
  if (!['listen', 'read', 'memory'].includes(mode)) throw new Error('Invalid mode');
  const targets = options.targets ?? STARTER_WORDS;
  const pool = options.pool ?? targets;
  if (!targets.length || new Set(targets.map(w => w.id)).size !== targets.length || targets.some(w => !WORDS.includes(w) || !pool.includes(w))) throw new Error('Invalid targets');
  const session: Session = { mode, count: 2, questions: [], principalLength: Math.min(4, targets.length), index: 0, score: 0, attempts: 0, solved: false, missed: [], found: [], rejected: [], credited: [], targets, pool, level: options.level ?? (() => 0), random: options.random ?? Math.random, firstCue: options.firstCue ?? 'flash' };
  for (let index = 0; index < Math.min(4, targets.length); index++) {
    const available = targets.filter(w => !session.questions.some(q => q.target.id === w.id));
    const forced = index === 0 ? available.find(w => w.id === options.forceTarget) : undefined;
    const target = forced ?? weighted(available, word => session.level(word, cueAt(session, index)), session.random);
    session.questions.push(makeQuestion(session, target, index));
  }
  return session;
}
export interface Peek { radius: number; x: number; y: number; }
export function memoryPeek(level: number, random: () => number = Math.random): Peek | null {
  if (level < 1) return null;
  return { radius: level >= 2 ? 18 : 30, x: 35 + random() * 30, y: 35 + random() * 30 };
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
  session.found.push(q.target.id);
  if (session.attempts === 1) session.score++;
  return 'correct';
}
function reviewCandidates(session: Session): Word[] {
  const previous = session.questions[session.index]?.target.id;
  const retry = session.targets.filter(word => session.missed.includes(word.id) && !session.found.includes(word.id) && word.id !== previous && session.questions.filter(q => q.target.id === word.id).length < 2);
  const unseen = session.targets.filter(word => !session.questions.some(q => q.target.id === word.id) && session.level(word, cueAt(session, session.questions.length)) < 3);
  return retry.length ? retry : unseen;
}
export function canReview(session: Session): boolean {
  return session.solved && session.index === session.questions.length - 1 && session.questions.length === session.principalLength && reviewCandidates(session).length > 0;
}
export function advance(session: Session, includeReview = true): boolean {
  if (!session.solved) return false;
  if (includeReview && canReview(session)) {
    // Only an unfound word can return, at most twice and never consecutively.
    const target = weighted(reviewCandidates(session), word => session.level(word, cueAt(session, session.questions.length)), session.random);
    session.questions.push(makeQuestion(session, target, session.questions.length, true));
  }
  session.index++;
  session.solved = false;
  session.attempts = 0;
  session.rejected = [];
  return session.index < session.questions.length;
}
