import { WORDS, spokenWord, questionChoices, memoryPeek, createSession, answer, advance } from './game.js';
import { speak, stopSpeech } from './speech.js';
import './install.js';
import { parseProgress, serializeProgress, PROGRESS_KEY, BESTS_KEY, clearLegacyProgress, resetGameStorage, emptyProgress, recordAnswer, chooseVariant, variantPath, memoryAvailable, discoveredWords, isDiscovered, modeTargets, modeLevels, difficulty, isUnlocked, VARIANT_LABELS } from './progress.js';
import { collectionMarkup } from './collection.js';
import { learningCardsMarkup } from './learning.js';
const app = document.querySelector('#app');
const speaker = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const book = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/></svg>';
const arrow = '<span aria-hidden="true">→</span>';
let mode = 'listen';
let count = 2;
let articles = true;
try {
    articles = localStorage.getItem('boo-english-articles') !== 'off';
}
catch { /* Default enabled. */ }
function pronounce(word, status = audioStatus) { speak(spokenWord(word, articles), status); }
function wordLabel(word) { return spokenWord(word, articles); }
let session = null;
let bests = {};
let progress = parseProgress(null);
let progressNotice = '';
let sessionUnlocks = 0;
let flashTimer;
let finishFlash = null;
function clearFlash() { window.clearTimeout(flashTimer); finishFlash = null; }
try {
    clearLegacyProgress(localStorage);
    progress = parseProgress(localStorage.getItem(PROGRESS_KEY));
}
catch {
    progressNotice = 'La progression reste disponible pendant cette visite, mais cet appareil ne permet pas de l’enregistrer.';
}
function saveProgress() {
    try {
        localStorage.setItem(PROGRESS_KEY, serializeProgress(progress));
        progressNotice = '';
    }
    catch {
        progressNotice = 'La progression reste disponible pendant cette visite, mais cet appareil ne permet pas de l’enregistrer.';
    }
}
function foundLabel(id) {
    const found = progress[id].found;
    if (session?.mode === 'memory')
        return `${progress[id].memory} / 6 Mémo`;
    return `${found} fois trouvé${found > 1 ? 's' : ''}`;
}
function counter(word) { return `<span class="found-counter" data-counter="${word.id}">${foundLabel(word.id)}</span>`; }
try {
    const stored = JSON.parse(localStorage.getItem(BESTS_KEY) ?? '{}');
    if (stored && typeof stored === 'object') {
        for (const [key, value] of Object.entries(stored)) {
            if (/^(listen|read|memory)-[234]$/.test(key) && typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10)
                bests[key] = value;
        }
    }
}
catch { /* Play still works when browser storage is unavailable. */ }
const bestKey = () => `${mode}-${count}`;
function image(word, alt, className = '', variant = progress[word.id].selected) {
    return `<span class="art-crop art-${word.id}"><img class="${className}" src="${variantPath(word.id, variant)}" alt="${alt}" draggable="false" width="1024" height="1024"></span>`;
}
function audioStatus(message) {
    const status = document.querySelector('#audio-status');
    if (status)
        status.textContent = message;
}
function sayTarget() {
    const q = session?.questions[session.index];
    if (q)
        pronounce(q.target);
}
function focusHeading() { document.querySelector('[data-focus]')?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
function home() {
    stopSpeech();
    clearFlash();
    session = null;
    app.innerHTML = `${progressNotice ? `<p class="save-notice" role="status">${progressNotice}</p>` : ''}<section class="welcome"><div class="welcome-copy"><span class="eyebrow"><span aria-hidden="true">✦</span> LA PETITE AVENTURE D’HALLOWEEN</span><h1>Un peu de <em>boo!</em><br>Beaucoup d’<span class="underline">anglais.</span></h1><p class="intro">Vingt drôles d’amis t’attendent.<br>Ouvre grand les oreilles… et à toi de jouer !</p><div class="little-tags"><span>20 mots à découvrir</span><span>À ton rythme</span></div></div><div class="hero-art" aria-hidden="true"><span class="art-star">✦</span><div class="paper-card back-card">${image(WORDS[2], '', '', 'original')}</div><div class="paper-card front-card">${image(WORDS[0], '', '', 'original')}</div><span class="art-caption">Même pas peur !</span></div></section>
  <section class="setup" aria-label="Préparer ma partie"><div class="setup-main"><div class="step-title"><span>01</span><h2>Comment veux-tu jouer ?</h2></div><div class="mode-grid" role="group" aria-label="Mode de jeu"><button type="button" class="mode-card ${mode === 'learn' ? 'selected' : ''}" data-mode="learn" aria-pressed="${mode === 'learn'}"><span class="mode-icon mint">${book}</span><span><strong>J’apprends</strong><small>Vingt cartes à découvrir peu à peu</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'listen' ? 'selected' : ''}" data-mode="listen" aria-pressed="${mode === 'listen'}"><span class="mode-icon peach">${speaker}</span><span><strong>J’écoute</strong><small>Un mot anglais → la bonne image</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'read' ? 'selected' : ''}" data-mode="read" aria-pressed="${mode === 'read'}"><span class="mode-icon lavender">${eye}</span><span><strong>Je regarde</strong><small>Une image → le bon mot anglais</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'collection' ? 'selected' : ''}" data-mode="collection" aria-pressed="${mode === 'collection'}"><span class="mode-icon gold">✦</span><span><strong>Ma collection</strong><small>Mes images et leurs trois versions</small></span><span class="radio-mark" aria-hidden="true"></span></button>${memoryAvailable(progress) ? `<button type="button" class="mode-card ${mode === 'memory' ? 'selected' : ''}" data-mode="memory" aria-pressed="${mode === 'memory'}"><span class="mode-icon magic">✧</span><span><strong>Mémo magique</strong><small>Une image éclair. Un mot, une seule fois.</small></span><span class="radio-mark" aria-hidden="true"></span></button>` : ''}</div><p class="reward-road">${memoryAvailable(progress) ? '✦ Mémo magique est débloqué !' : `Mémo magique s’ouvrira avec les dix premières couleurs : ${WORDS.slice(0, 10).filter(word => isUnlocked(progress, word.id, 'color')).length} / 10 débloquées.`}</p></div><div class="setup-bottom"><div id="choice-settings"><div class="step-title"><span>02</span><h2>Le défi grandit avec toi</h2></div><p class="difficulty-note" id="difficulty-note"></p></div><div class="start-block"><button type="button" class="primary start" id="start">C’est parti ! ${arrow}</button><p id="best-note">${bests[bestKey()] !== undefined ? `Ton record : ${bests[bestKey()]} étoiles sur 10 ✦` : 'Une partie · 10 questions · Plein de découvertes'}</p></div></div></section><p class="home-footnote">${speaker} Mets le son pour entendre les mots en anglais.</p>`;
    app.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
        mode = button.dataset.mode;
        updateSettings();
    }));
    document.querySelector('#start').addEventListener('click', start);
    updateSettings();
    window.scrollTo(0, 0);
}
function updateSettings() {
    app.querySelectorAll('[data-mode]').forEach(button => {
        const selected = button.dataset.mode === mode;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
    const learning = mode === 'learn' || mode === 'collection';
    const fixedChoices = mode === 'memory';
    if (!learning)
        count = difficulty(progress, mode);
    document.querySelector('#difficulty-note').textContent = `${count} réponses aujourd’hui · 3 au niveau 2, puis 4 au niveau 4 pour la moitié des cartes découvertes.`;
    document.querySelector('#choice-settings').hidden = learning;
    document.querySelector('.setup-bottom').classList.toggle('learning', learning);
    document.querySelector('#start').innerHTML = `${mode === 'collection' ? 'Ouvrir ma collection' : learning ? 'Découvrir les cartes' : 'C’est parti !'} ${arrow}`;
    document.querySelector('#best-note').textContent = mode === 'collection' ? 'Joue pour débloquer la couleur et la version artiste.' : fixedChoices ? `Image : 1 seconde. Mot : une seule écoute. ${count} choix progressifs.` : learning ? 'Écoute et recommence autant de fois que tu veux.' : bests[bestKey()] !== undefined ? `Ton record : ${bests[bestKey()]} étoiles sur 10 ✦` : 'Une partie · 10 questions · Plein de découvertes';
}
function start() {
    if (mode === 'learn') {
        learn();
        return;
    }
    if (mode === 'collection') {
        collection();
        return;
    }
    if (mode === 'memory' && !memoryAvailable(progress)) {
        home();
        return;
    }
    count = difficulty(progress, mode);
    sessionUnlocks = 0;
    session = createSession(mode, count, Math.random, modeTargets(progress, mode), modeLevels(progress, mode));
    renderQuestion();
    if (mode === 'listen')
        sayTarget();
}
function renderQuestion() {
    if (!session)
        return;
    clearFlash();
    const q = session.questions[session.index];
    count = difficulty(progress, session.mode);
    session.count = count;
    q.choices = questionChoices(q.target, count);
    const peek = memoryPeek(progress[q.target.id].memory);
    const memory = session.mode === 'memory';
    const flash = memory && q.cue === 'flash';
    const listening = session.mode === 'listen' || memory && q.cue === 'once';
    const label = memory ? '✧ Mémo magique' : listening ? speaker + ' J’écoute' : eye + ' Je regarde';
    const prompt = memory
        ? `<div class="memory-stage" id="memory-stage"><span aria-hidden="true">${flash ? '✧' : '♪'}</span><p>${flash ? 'Prépare tes yeux…' : 'Prépare tes oreilles…'}</p></div><button type="button" class="primary memory-ready" id="memory-ready" ${flash ? 'disabled' : ''}>${flash ? 'Regarder 1 seconde' : 'Écouter une seule fois'}</button><p id="audio-status" role="status">${flash ? 'Chargement de l’image…' : 'Quand tu es prêt, touche le bouton.'}</p>`
        : listening ? `<div class="audio-prompt"><button type="button" id="replay" class="listen-button">${speaker} <span>Réécouter le mot</span></button><p id="audio-status" role="status">Tu peux réécouter autant que tu veux.</p></div>`
            : `<div class="picture-prompt">${image(q.target, q.target.french)}</div><div class="prompt-counter">${counter(q.target)}</div><p class="read-hint">Trouve le mot avant de l’écouter !</p>`;
    app.innerHTML = `<section class="play-area"><div class="game-top"><button type="button" id="back" class="quiet">← Accueil</button><span class="mode-label">${label}</span><span class="score" aria-label="${session.score} étoiles">✦ <b>${session.score}</b><span> / 10</span></span></div><div class="progress-head"><span>Question <b>${session.index + 1}</b> sur 10</span><span>${memory ? flash ? 'IMAGE ÉCLAIR · 1 SECONDE' : 'MOT SECRET · 1 ÉCOUTE' : 'À ton rythme'}</span></div><div class="progress" role="progressbar" aria-label="Questions terminées" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${session.index}"><span style="width:${session.index * 10}%"></span></div><div class="question-head"><span class="eyebrow">${memory ? 'FAIS CONFIANCE À TA MÉMOIRE' : 'À TOI DE JOUER'}</span><h1 data-focus tabindex="-1">${flash ? 'Regarde… puis souviens-toi !' : listening ? 'Trouve la bonne image !' : 'Trouve le bon mot anglais !'}</h1><p>${memory ? `${count} choix, une seule tentative. Tu peux y arriver !` : listening ? 'Écoute le mot, puis touche la bonne image.' : 'Observe bien, puis touche le bon mot.'}</p></div>${prompt}<div id="question-choices" class="answers ${listening ? 'image-answers' : 'word-answers'} choices-${session.count}" role="group" aria-label="Choisis une réponse" ${memory ? 'hidden' : ''}>${q.choices.map((word, i) => `<button type="button" class="answer" data-answer="${word.id}" aria-label="${listening ? `Image ${i + 1} : ${word.french}` : wordLabel(word)}"><span class="answer-number" aria-hidden="true">${i + 1}</span>${listening ? image(word, '') + counter(word) : `<span lang="en" data-label="${word.id}">${wordLabel(word)}</span>`}<span class="answer-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite"><span>${memory ? 'Prêt pour un petit défi ?' : 'Prends ton temps, tu peux y arriver.'}</span></div><div id="next-area" class="next-area"></div></section>`;
    app.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => selectAnswer(button)));
    document.querySelector('#replay')?.addEventListener('click', sayTarget);
    document.querySelector('#back').addEventListener('click', home);
    if (memory) {
        const ready = document.querySelector('#memory-ready');
        const choices = document.querySelector('#question-choices');
        const stage = document.querySelector('#memory-stage');
        let used = false;
        if (flash) {
            const preload = new Image();
            preload.onload = () => { if (document.contains(ready)) {
                ready.disabled = false;
                audioStatus('Quand tu es prêt, touche le bouton.');
            } };
            preload.onerror = () => { if (document.contains(ready))
                audioStatus('Cette image ne peut pas être chargée. Reviens à l’accueil et réessaie avec une connexion.'); };
            preload.src = variantPath(q.target.id, progress[q.target.id].selected);
        }
        ready.addEventListener('click', () => {
            if (used)
                return;
            used = true;
            ready.hidden = true;
            ready.disabled = true;
            if (flash) {
                stage.innerHTML = `<div class="memory-picture">${image(q.target, q.target.french)}${peek ? `<span class="memory-mask" aria-hidden="true" style="--hole:${peek.radius}%;--hole-x:${peek.x}%;--hole-y:${peek.y}%"></span>` : ''}</div>`;
                audioStatus('Regarde bien !');
                finishFlash = () => {
                    clearFlash();
                    if (!document.contains(stage))
                        return;
                    stage.innerHTML = '<span aria-hidden="true">✧</span><p>L’image s’est envolée !</p>';
                    choices.hidden = false;
                    audioStatus('Quel était son nom en anglais ?');
                };
                flashTimer = window.setTimeout(() => finishFlash?.(), 1000);
            }
            else {
                stage.innerHTML = '<span aria-hidden="true">♪</span><p>Une seule écoute.</p>';
                choices.hidden = false;
                pronounce(q.target, message => {
                    if (!document.contains(stage) || session?.solved)
                        return;
                    if (/Pas de son|pas disponible/.test(message)) {
                        choices.hidden = true;
                        audioStatus('Le son n’a pas fonctionné. Passe cette question pour continuer.');
                        const skip = document.createElement('button');
                        skip.type = 'button';
                        skip.className = 'secondary';
                        skip.textContent = 'Passer cette question';
                        skip.addEventListener('click', () => { if (!session || session.solved)
                            return; session.solved = true; session.missed.push(q.target.id); showNext(); skip.remove(); });
                        document.querySelector('#next-area').replaceChildren(skip);
                    }
                    else
                        audioStatus(message === 'Écoute bien…' ? 'Écoute bien…' : 'À toi de choisir. Le mot ne sera pas répété.');
                });
            }
        });
    }
    focusHeading();
}
function showNext() {
    if (!session)
        return;
    document.querySelector('#next-area').innerHTML = `<button type="button" class="primary" id="next">${session.index === 9 ? 'Voir mes étoiles' : 'On continue !'} ${arrow}</button>${session.mode === 'read' ? `<button type="button" class="quiet word-replay" id="replay">${speaker} Écouter le mot</button><p id="audio-status" role="status"></p>` : ''}`;
    if (session.mode === 'read')
        document.querySelector('#replay').addEventListener('click', sayTarget);
    const next = document.querySelector('#next');
    next.addEventListener('click', () => {
        if (!session)
            return;
        stopSpeech();
        clearFlash();
        if (advance(session)) {
            renderQuestion();
            if (session.mode === 'listen')
                sayTarget();
        }
        else
            results();
    });
    next.focus();
}
function selectAnswer(button) {
    if (!session)
        return;
    if (session.mode === 'memory' && document.querySelector('#question-choices').hidden)
        return;
    const result = answer(session, button.dataset.answer);
    if (result === 'ignored')
        return;
    if (session.mode === 'read' || session.mode === 'memory' && session.questions[session.index].cue === 'flash') {
        pronounce(WORDS.find(w => w.id === button.dataset.answer));
    }
    const feedback = document.querySelector('#feedback');
    if (result === 'retry') {
        button.classList.add('incorrect');
        button.disabled = true;
        button.querySelector('.answer-mark').textContent = '↻';
        feedback.className = 'feedback retry';
        feedback.textContent = 'Presque ! Essaie une autre réponse, tu vas trouver.';
        if (session.mode === 'listen')
            sayTarget();
        app.querySelector('.answer:not(:disabled)')?.focus();
        return;
    }
    const word = session.questions[session.index].target;
    const correct = result === 'correct';
    const firstTry = correct && session.attempts === 1;
    const unlocked = recordAnswer(progress, session, result);
    if (unlocked)
        sessionUnlocks++;
    if (firstTry)
        saveProgress();
    app.querySelectorAll('[data-counter]').forEach(element => { element.textContent = foundLabel(element.dataset.counter); });
    const right = app.querySelector(`[data-answer="${word.id}"]`);
    right.classList.add('correct');
    right.querySelector('.answer-mark').textContent = '✓';
    if (!correct) {
        button.classList.add('incorrect');
        button.querySelector('.answer-mark').textContent = '×';
    }
    app.querySelectorAll('.answer').forEach(element => { element.disabled = true; });
    document.querySelector('.score b').textContent = String(session.score);
    document.querySelector('.score').setAttribute('aria-label', `${session.score} étoiles`);
    feedback.className = correct ? 'feedback success' : 'feedback retry';
    feedback.innerHTML = `<strong>${correct ? session.attempts === 1 ? '✦ Bravo, une étoile !' : '✓ Bien joué, tu as trouvé !' : 'Pas cette fois. Voici la bonne réponse.'}</strong><span><b lang="en" data-label="${word.id}">${wordLabel(word)}</b> · ${word.french}</span>${session.mode === 'memory' && correct ? `<span>Mémo magique : ${progress[word.id].memory} / 6 pour cette carte</span>` : ''}${unlocked ? `<span class="unlock-message">✦ ${unlocked === 'color' ? 'Version couleur débloquée !' : 'Version artiste débloquée !'}<small>Retrouve-la dans Ma collection.</small></span>` : ''}${correct && !firstTry ? '<span>Pour faire progresser cette carte, retrouve-la du premier coup la prochaine fois !</span>' : ''}${unlocked === 'art' && word.unlocks ? `<span class="unlock-message">✦ Nouvelle carte : ${wordLabel(WORDS.find(w => w.id === word.unlocks))} !<small>Elle t’attend dans J’apprends et les prochains défis.</small></span>` : ''}${progressNotice ? `<span class="save-notice">${progressNotice}</span>` : ''}`;
    showNext();
}
function results() {
    if (!session)
        return;
    stopSpeech();
    clearFlash();
    const previous = bests[bestKey()] ?? 0;
    bests[bestKey()] = Math.max(previous, session.score);
    let saved = true;
    try {
        localStorage.setItem(BESTS_KEY, JSON.stringify(bests));
    }
    catch {
        saved = false;
    }
    const mastered = session.score;
    app.innerHTML = `<section class="results"><span class="eyebrow">AVENTURE TERMINÉE</span><div class="trophy" aria-hidden="true">✦</div><h1 data-focus tabindex="-1">${session.score === 10 ? 'Un sans-faute magique !' : session.score >= 6 ? 'Bravo, petit explorateur !' : 'Bravo pour cette aventure !'}</h1><p>${session.mode === 'memory' ? 'Tu as terminé le défi. Ta mémoire grandit à chaque partie !' : 'Tu as terminé cette aventure d’Halloween.'}</p><div class="result-score"><strong>${session.score}<small> / 10</small></strong><span>étoiles gagnées</span></div><p class="result-detail">${mastered} réponse${mastered > 1 ? 's' : ''} correcte${mastered > 1 ? 's' : ''} du premier coup.${session.missed.length ? ' Continue, chaque essai te fait progresser !' : ' Tes oreilles et tes yeux ont des super-pouvoirs !'}</p><span class="record">${saved ? `Ton record pour ce défi : ${bests[bestKey()]} / 10` : 'Le record n’a pas pu être enregistré sur cet appareil.'}</span><div class="result-actions"><button type="button" class="primary" id="again">Rejouer ${arrow}</button><button type="button" class="secondary" id="change">Changer de défi</button></div>${sessionUnlocks ? `<p class="unlock-summary">✦ ${sessionUnlocks} nouvelle${sessionUnlocks > 1 ? 's' : ''} version${sessionUnlocks > 1 ? 's' : ''} débloquée${sessionUnlocks > 1 ? 's' : ''} !</p>` : ''}<button type="button" class="quiet" id="view-collection">Voir ma collection →</button></section>`;
    document.querySelector('#again').addEventListener('click', start);
    document.querySelector('#change').addEventListener('click', home);
    document.querySelector('#view-collection').addEventListener('click', () => collection());
    focusHeading();
}
function learn() {
    stopSpeech();
    clearFlash();
    session = null;
    app.innerHTML = `<section class="learn-area"><div class="game-top"><button type="button" id="back" class="quiet">← Accueil</button><span class="mode-label">${book} J’apprends</span><span class="learn-pill">20 mots à découvrir</span></div><div class="question-head"><span class="eyebrow">À TON RYTHME</span><h1 data-focus tabindex="-1">Mes vingt mots d’Halloween</h1><p>${discoveredWords(progress).length} cartes découvertes sur 20. Touche une carte pour entendre le mot en anglais.</p></div><div class="vocab-grid" aria-label="Les vingt cartes à découvrir">${learningCardsMarkup(progress, speaker, articles)}</div><p id="audio-status" role="status">Tu peux écouter chaque mot autant de fois que tu veux.</p><button type="button" class="primary" id="learn-back">Choisir un défi ${arrow}</button></section>`;
    app.querySelectorAll('[data-word]').forEach(button => button.addEventListener('click', () => {
        app.querySelectorAll('.vocab-card').forEach(card => card.classList.remove('last-listened'));
        button.classList.add('last-listened');
        pronounce(WORDS.find(word => word.id === button.dataset.word));
    }));
    document.querySelector('#back').addEventListener('click', home);
    document.querySelector('#learn-back').addEventListener('click', home);
    focusHeading();
}
function collection(resetScroll = true) {
    stopSpeech();
    clearFlash();
    session = null;
    const scrollY = window.scrollY;
    app.innerHTML = collectionMarkup(progress, speaker, progressNotice, articles);
    app.querySelectorAll('[data-choose]').forEach(button => button.addEventListener('click', () => {
        if (chooseVariant(progress, button.dataset.choose, button.dataset.variant)) {
            saveProgress();
            collection(false);
            app.querySelector(`[data-choose="${button.dataset.choose}"][data-variant="${button.dataset.variant}"]`)?.focus({ preventScroll: true });
        }
    }));
    app.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => openZoom(button.dataset.zoom, button.dataset.variant)));
    app.querySelectorAll('[data-listen]').forEach(button => button.addEventListener('click', () => pronounce(WORDS.find(word => word.id === button.dataset.listen))));
    document.querySelector('#back').addEventListener('click', home);
    document.querySelector('#collection-back').addEventListener('click', home);
    if (resetScroll)
        focusHeading();
    else
        window.scrollTo(0, scrollY);
}
const zoomDialog = document.querySelector('#zoom-dialog');
let zoomId = '';
let zoomVariant = 'original';
function openZoom(id, variant) {
    if (!isDiscovered(progress, id) || !isUnlocked(progress, id, variant))
        return;
    zoomId = id;
    zoomVariant = variant;
    document.querySelector('#zoom-title').textContent = `${wordLabel(WORDS.find(word => word.id === id))} · ${VARIANT_LABELS[variant]}`;
    const img = document.querySelector('#zoom-image');
    img.src = variantPath(id, variant);
    img.alt = `${WORDS.find(word => word.id === id).french}, version ${VARIANT_LABELS[variant]}`;
    document.querySelector('#zoom-use').textContent = progress[id].selected === variant ? '✓ Version utilisée' : 'Utiliser cette version';
    zoomDialog.showModal();
}
document.querySelector('#zoom-close').addEventListener('click', () => zoomDialog.close());
document.querySelector('#zoom-use').addEventListener('click', () => { if (chooseVariant(progress, zoomId, zoomVariant)) {
    saveProgress();
    zoomDialog.close();
    collection(false);
} });
const dialog = document.querySelector('#help-dialog');
document.querySelector('#help').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-help').addEventListener('click', () => dialog.close());
document.querySelector('#understood').addEventListener('click', () => dialog.close());
const resetDialog = document.querySelector('#reset-dialog');
document.querySelector('#reset-open').addEventListener('click', () => {
    dialog.close();
    resetDialog.showModal();
});
document.querySelector('#reset-cancel').addEventListener('click', () => { resetDialog.close(); dialog.showModal(); });
resetDialog.addEventListener('cancel', () => { window.setTimeout(() => dialog.showModal(), 0); });
document.querySelector('#reset-confirm').addEventListener('click', () => {
    progressNotice = '';
    try {
        resetGameStorage(localStorage);
    }
    catch {
        progressNotice = 'La remise à zéro vaut pour cette visite, mais cet appareil n’a pas permis d’effacer toute la sauvegarde.';
    }
    progress = emptyProgress();
    bests = {};
    sessionUnlocks = 0;
    mode = 'listen';
    count = 2;
    articles = true;
    resetDialog.close();
    zoomDialog.close();
    home();
    updateArticles();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    stopSpeech();
    finishFlash?.();
} });
home();
const articlesButton = document.querySelector('#articles');
function updateArticles() {
    document.querySelectorAll('[data-label]').forEach(el => { const word = WORDS.find(w => w.id === el.dataset.label); el.textContent = wordLabel(word); const button = el.closest('[data-answer]'); if (button)
        button.setAttribute('aria-label', wordLabel(word)); });
    if (zoomDialog.open)
        document.querySelector('#zoom-title').textContent = `${wordLabel(WORDS.find(w => w.id === zoomId))} · ${VARIANT_LABELS[zoomVariant]}`;
    articlesButton.setAttribute('aria-pressed', String(articles));
    articlesButton.textContent = articles ? 'a / an / the ✓' : 'Articles : non';
}
articlesButton.addEventListener('click', () => { articles = !articles; try {
    localStorage.setItem('boo-english-articles', articles ? 'on' : 'off');
}
catch { /* Session preference still works. */ } updateArticles(); });
updateArticles();
