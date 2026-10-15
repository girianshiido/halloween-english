import { WORDS, DISCOVERY_ORDER, STARTER_WORDS, progressiveCount } from './game.js';
export const PROGRESS_KEY = 'boo-english-progress-v5';
export const BESTS_KEY = 'boo-english-bests-v3';
export const SKILLS = ['listen', 'read', 'flash', 'once'];
export function clearLegacyProgress(storage) {
    for (const key of ['boo-english-progress-v1', 'boo-english-progress-v2', 'boo-english-progress-v3', 'boo-english-progress-v4', 'boo-english-bests-v1', 'boo-english-bests-v2'])
        storage.removeItem(key);
}
export function resetGameStorage(storage) {
    clearLegacyProgress(storage);
    for (const key of [PROGRESS_KEY, BESTS_KEY, 'boo-english-articles'])
        storage.removeItem(key);
}
export const VARIANTS = ['original', 'color', 'art'];
export const VARIANT_LABELS = { original: 'Original', color: 'Couleur', art: 'Artiste' };
export function emptyProgress() {
    return { words: Object.fromEntries(WORDS.map(word => [word.id, { listen: 0, read: 0, flash: 0, once: 0, selected: 'original', introduced: STARTER_WORDS.includes(word) }])), completedSessions: 0 };
}
function colorReady(entry) { return entry.listen >= 3 && entry.read >= 3; }
export function discoveredWords(progress) {
    let count = STARTER_WORDS.length;
    // Only already accessible cards can reveal the following pair.
    while (true) {
        const colored = DISCOVERY_ORDER.slice(0, count).filter(word => colorReady(progress.words[word.id])).length;
        const next = Math.min(WORDS.length, STARTER_WORDS.length + 2 * Math.floor(colored / 2));
        if (next <= count)
            return DISCOVERY_ORDER.slice(0, count);
        count = next;
    }
}
export function isDiscovered(progress, id) { return discoveredWords(progress).some(word => word.id === id); }
export function knownWords(progress) { return discoveredWords(progress).filter(word => progress.words[word.id].introduced); }
export function pendingWords(progress) { return discoveredWords(progress).filter(word => !progress.words[word.id].introduced); }
export function introduceWord(progress, id) {
    if (!isDiscovered(progress, id) || progress.words[id].introduced)
        return false;
    progress.words[id].introduced = true;
    return true;
}
export function coloredWords(progress) { return discoveredWords(progress).filter(word => colorReady(progress.words[word.id])); }
export function memoryAvailable(progress) { return coloredWords(progress).length >= 3; }
export function isUnlocked(progress, id, variant) {
    if (!VARIANTS.includes(variant) || !isDiscovered(progress, id))
        return false;
    const entry = progress.words[id];
    return variant === 'original' || colorReady(entry) && (variant === 'color' || entry.flash >= 3 && entry.once >= 3);
}
export function parseProgress(text) {
    const progress = emptyProgress();
    try {
        const raw = JSON.parse(text ?? 'null');
        if (!raw || typeof raw !== 'object' || !('version' in raw) || raw.version !== 5 || !('words' in raw) || !raw.words || typeof raw.words !== 'object')
            return progress;
        const words = raw.words;
        for (const word of WORDS) {
            const entry = words[word.id];
            if (!entry || typeof entry !== 'object')
                continue;
            const data = entry;
            const target = progress.words[word.id];
            for (const skill of SKILLS) {
                const value = data[skill];
                if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)
                    target[skill] = Math.min(3, value);
            }
            target.introduced ||= data.introduced === true;
        }
        // Sanitize impossible records without letting hidden cards unlock other cards.
        const available = new Set(discoveredWords(progress).map(word => word.id));
        for (const word of WORDS) {
            const entry = progress.words[word.id];
            if (!available.has(word.id)) {
                progress.words[word.id] = emptyProgress().words[word.id];
                continue;
            }
            if (!entry.introduced) {
                for (const skill of SKILLS)
                    entry[skill] = 0;
            }
            if (!colorReady(entry)) {
                entry.flash = 0;
                entry.once = 0;
            }
            const data = words[word.id];
            if (data && VARIANTS.includes(data.selected) && isUnlocked(progress, word.id, data.selected))
                entry.selected = data.selected;
        }
        if ('completedSessions' in raw && typeof raw.completedSessions === 'number' && Number.isSafeInteger(raw.completedSessions) && raw.completedSessions >= 0)
            progress.completedSessions = raw.completedSessions;
    }
    catch { /* A damaged save must never prevent playing. */ }
    return progress;
}
export function serializeProgress(progress) { return JSON.stringify({ version: 5, ...progress }); }
export function chooseVariant(progress, id, variant) {
    if (!isUnlocked(progress, id, variant))
        return false;
    progress.words[id].selected = variant;
    return true;
}
export function variantPath(id, variant) { return variant === 'original' ? `./images/${id}.png` : `./images/${variant}/${id}.png`; }
export function modeTargets(progress, mode) {
    if (mode === 'memory' && !memoryAvailable(progress))
        return [];
    return knownWords(progress).filter(word => mode !== 'memory' || colorReady(progress.words[word.id]));
}
export function skillFor(mode, cue) { return mode === 'memory' ? cue : mode; }
export function skillLevel(progress, id, mode, cue = 'flash') { return progress.words[id][skillFor(mode, cue)]; }
export function difficulty(progress, id, mode, cue = 'flash') { return progressiveCount(skillLevel(progress, id, mode, cue)); }
export function firstMemoryCue(progress) {
    const targets = modeTargets(progress, 'memory');
    const sum = (skill) => targets.reduce((total, word) => total + progress.words[word.id][skill], 0);
    return sum('flash') <= sum('once') ? 'flash' : 'once';
}
export function recommend(progress, forceTarget) {
    const memory = modeTargets(progress, 'memory').filter(word => !isUnlocked(progress, word.id, 'art'));
    const normal = knownWords(progress).filter(word => !isUnlocked(progress, word.id, 'color'));
    if (!forceTarget && memory.length && (!normal.length || progress.completedSessions % 3 === 2))
        return { mode: 'memory' };
    const least = forceTarget ? knownWords(progress).find(word => word.id === forceTarget) : [...normal].sort((a, b) => (progress.words[a.id].listen + progress.words[a.id].read) - (progress.words[b.id].listen + progress.words[b.id].read))[0];
    if (!least)
        return { mode: progress.completedSessions % 2 ? 'read' : 'listen' };
    const entry = progress.words[least.id];
    return { mode: entry.listen < entry.read ? 'listen' : entry.read < entry.listen ? 'read' : progress.completedSessions % 2 ? 'read' : 'listen', target: least.id };
}
export function recordAnswer(progress, session, result) {
    const reward = { variant: null, newCards: [] };
    if (result !== 'correct' || !session.solved || session.attempts !== 1 || session.credited.includes(session.index))
        return reward;
    const question = session.questions[session.index];
    const id = question.target.id;
    if (!modeTargets(progress, session.mode).some(word => word.id === id))
        return reward;
    session.credited.push(session.index);
    const before = discoveredWords(progress).map(word => word.id);
    const oldColor = isUnlocked(progress, id, 'color');
    const oldArt = isUnlocked(progress, id, 'art');
    const entry = progress.words[id];
    const skill = skillFor(session.mode, question.cue);
    entry[skill] = Math.min(3, entry[skill] + 1);
    if (!oldColor && isUnlocked(progress, id, 'color'))
        reward.variant = 'color';
    if (!oldArt && isUnlocked(progress, id, 'art'))
        reward.variant = 'art';
    reward.newCards = discoveredWords(progress).filter(word => !before.includes(word.id));
    return reward;
}
