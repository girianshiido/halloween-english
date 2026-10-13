export const WORDS = [
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
];
export function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
export function createSession(mode, count, random = Math.random) {
    if (mode !== 'listen' && mode !== 'read')
        throw new Error('Invalid mode');
    if (![2, 3, 4].includes(count))
        throw new Error('Invalid choice count');
    const questions = shuffle(WORDS, random).map(target => ({
        target,
        choices: shuffle([target, ...shuffle(WORDS.filter(w => w.id !== target.id), random).slice(0, count - 1)], random),
    }));
    return { mode, count, questions, index: 0, score: 0, attempts: 0, solved: false, missed: [], rejected: [] };
}
export function answer(session, id) {
    const q = session.questions[session.index];
    if (!q || session.solved || session.rejected.includes(id) || !q.choices.some(w => w.id === id))
        return 'ignored';
    session.attempts++;
    if (id !== q.target.id) {
        session.rejected.push(id);
        if (!session.missed.includes(q.target.id))
            session.missed.push(q.target.id);
        return 'retry';
    }
    session.solved = true;
    if (session.attempts === 1)
        session.score++;
    return 'correct';
}
export function advance(session) {
    if (!session.solved)
        return false;
    session.index++;
    session.solved = false;
    session.attempts = 0;
    session.rejected = [];
    return session.index < session.questions.length;
}
