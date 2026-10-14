import { WORDS, ORIGINAL_WORDS, progressiveCount } from './game.js';
export const PROGRESS_KEY = 'boo-english-progress-v4';
export const BESTS_KEY = 'boo-english-bests-v2';
export function clearLegacyProgress(storage) {
    storage.removeItem('boo-english-progress-v1');
    storage.removeItem('boo-english-bests-v1');
}
export const VARIANTS = ['original', 'color', 'art'];
export const THRESHOLDS = { original: 0, color: 6, art: 6 };
export const VARIANT_LABELS = { original: 'Original', color: 'Couleur', art: 'Artiste' };
export function emptyProgress() {
    return Object.fromEntries(WORDS.map(word => [word.id, { found: 0, memory: 0, selected: 'original' }]));
}
export function parseProgress(text) {
    const progress = emptyProgress();
    try {
        const raw = JSON.parse(text ?? 'null');
        if (!raw || typeof raw !== 'object' || !('version' in raw) || raw.version !== 4 || !('words' in raw) || !raw.words || typeof raw.words !== 'object')
            return progress;
        const words = raw.words;
        for (const word of WORDS) {
            const entry = words[word.id];
            if (!entry || typeof entry !== 'object' || !('found' in entry) || typeof entry.found !== 'number' || !Number.isSafeInteger(entry.found) || entry.found < 0)
                continue;
            const found = entry.found;
            const memory = 'memory' in entry && typeof entry.memory === 'number' && Number.isSafeInteger(entry.memory) && entry.memory >= 0 ? entry.memory : 0;
            progress[word.id] = { found, memory, selected: 'original' };
            if ('selected' in entry && VARIANTS.includes(entry.selected) && (entry.selected === 'original' || entry.selected === 'color' && found >= 6 || entry.selected === 'art' && found >= 6 && memory >= 6))
                progress[word.id].selected = entry.selected;
        }
    }
    catch { /* A damaged save must never prevent playing. */ }
    return progress;
}
export function serializeProgress(progress) {
    return JSON.stringify({ version: 4, words: progress });
}
export function memoryAvailable(progress) { return ORIGINAL_WORDS.every(word => (progress[word.id]?.found ?? 0) >= 6); }
export function isUnlocked(progress, id, variant) {
    if (!WORDS.some(word => word.id === id) || !VARIANTS.includes(variant))
        return false;
    if (!isDiscovered(progress, id))
        return false;
    const entry = progress[id];
    return variant === 'original' || variant === 'color' && entry.found >= 6 || variant === 'art' && entry.found >= 6 && entry.memory >= 6;
}
export function recordFound(progress, id, memoryMode = false) {
    if (!isDiscovered(progress, id))
        return null;
    const entry = progress[id];
    if (memoryMode) {
        if (!memoryAvailable(progress) || entry.found < 6)
            return null;
        const previous = entry.memory;
        entry.memory = Math.min(Number.MAX_SAFE_INTEGER, previous + 1);
        return previous < 6 && entry.memory >= 6 ? 'art' : null;
    }
    const previous = entry.found;
    entry.found = Math.min(Number.MAX_SAFE_INTEGER, previous + 1);
    // Unlocking never changes the player's chosen version automatically.
    if (previous < 6 && entry.found >= 6)
        return 'color';
    return null;
}
export function chooseVariant(progress, id, variant) {
    if (!isUnlocked(progress, id, variant))
        return false;
    progress[id].selected = variant;
    return true;
}
export function variantPath(id, variant) {
    return variant === 'original' ? `./images/${id}.png` : `./images/${variant}/${id}.png`;
}
export function isDiscovered(progress, id) {
    if (ORIGINAL_WORDS.some(w => w.id === id))
        return true;
    const parent = ORIGINAL_WORDS.find(w => w.unlocks === id);
    return !!parent && (progress[parent.id]?.memory ?? 0) >= 6;
}
export function discoveredWords(progress) { return WORDS.filter(w => isDiscovered(progress, w.id)); }
export function modeTargets(progress, mode) {
    return discoveredWords(progress).filter(w => mode !== 'memory' || (progress[w.id]?.found ?? 0) >= 6);
}
export function modeLevels(progress, mode) {
    return Object.fromEntries(WORDS.map(w => [w.id, mode === 'memory' ? progress[w.id].memory : progress[w.id].found]));
}
export function difficulty(progress, mode) {
    return progressiveCount(modeTargets(progress, mode), modeLevels(progress, mode));
}
export function recordAnswer(progress, session, result) {
    if (result !== 'correct' || !session.solved || session.attempts !== 1)
        return null;
    return recordFound(progress, session.questions[session.index].target.id, session.mode === 'memory');
}
