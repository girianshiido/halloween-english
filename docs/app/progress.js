import { WORDS } from './game.js';
export const PROGRESS_KEY = 'boo-english-progress-v1';
export const VARIANTS = ['original', 'color', 'art'];
export const THRESHOLDS = { original: 0, color: 10, art: 10 };
export const VARIANT_LABELS = { original: 'Original', color: 'Couleur', art: 'Artiste' };
export function emptyProgress() {
    return Object.fromEntries(WORDS.map(word => [word.id, { found: 0, memory: 0, selected: 'original' }]));
}
export function parseProgress(text) {
    const progress = emptyProgress();
    try {
        const raw = JSON.parse(text ?? 'null');
        if (!raw || typeof raw !== 'object' || !('version' in raw) || ![1, 2].includes(raw.version) || !('words' in raw) || !raw.words || typeof raw.words !== 'object')
            return progress;
        const words = raw.words;
        for (const word of WORDS) {
            const entry = words[word.id];
            if (!entry || typeof entry !== 'object' || !('found' in entry) || typeof entry.found !== 'number' || !Number.isSafeInteger(entry.found) || entry.found < 0)
                continue;
            const found = entry.found;
            const memory = raw.version === 2 && 'memory' in entry && typeof entry.memory === 'number' && Number.isSafeInteger(entry.memory) && entry.memory >= 0 ? entry.memory : 0;
            progress[word.id] = { found, memory, selected: 'original' };
            if ('selected' in entry && VARIANTS.includes(entry.selected) && (entry.selected === 'original' || entry.selected === 'color' && found >= 10 || entry.selected === 'art' && found >= 10 && memory >= 10))
                progress[word.id].selected = entry.selected;
        }
    }
    catch { /* A damaged save must never prevent playing. */ }
    return progress;
}
export function serializeProgress(progress) {
    return JSON.stringify({ version: 2, words: progress });
}
export function memoryAvailable(progress) { return WORDS.every(word => (progress[word.id]?.found ?? 0) >= 10); }
export function isUnlocked(progress, id, variant) {
    if (!WORDS.some(word => word.id === id) || !VARIANTS.includes(variant))
        return false;
    const entry = progress[id];
    return variant === 'original' || variant === 'color' && entry.found >= 10 || variant === 'art' && entry.found >= 10 && entry.memory >= 10;
}
export function recordFound(progress, id, memoryMode = false) {
    if (!WORDS.some(word => word.id === id))
        return null;
    const entry = progress[id];
    if (memoryMode) {
        if (!memoryAvailable(progress))
            return null;
        const previous = entry.memory;
        entry.memory = Math.min(Number.MAX_SAFE_INTEGER, previous + 1);
        entry.found = Math.min(Number.MAX_SAFE_INTEGER, entry.found + 1);
        return previous < 10 && entry.memory >= 10 ? 'art' : null;
    }
    const previous = entry.found;
    entry.found = Math.min(Number.MAX_SAFE_INTEGER, previous + 1);
    // Unlocking never changes the player's chosen version automatically.
    if (previous < 10 && entry.found >= 10)
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
