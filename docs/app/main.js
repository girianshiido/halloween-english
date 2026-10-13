import { WORDS, createSession, answer, advance } from './game.js';
import { speak, stopSpeech } from './speech.js';
import './install.js';
const app = document.querySelector('#app');
const speaker = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const book = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/></svg>';
const arrow = '<span aria-hidden="true">→</span>';
let mode = 'listen';
let count = 3;
let session = null;
let bests = {};
try {
    const stored = JSON.parse(localStorage.getItem('boo-english-bests-v1') ?? '{}');
    if (stored && typeof stored === 'object') {
        for (const [key, value] of Object.entries(stored)) {
            if (/^(listen|read)-[234]$/.test(key) && typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10)
                bests[key] = value;
        }
    }
}
catch { /* Play still works when browser storage is unavailable. */ }
const bestKey = () => `${mode}-${count}`;
function image(word, alt, className = '') {
    return `<span class="art-crop art-${word.id}"><img class="${className}" src="./images/${word.id}.png" alt="${alt}" draggable="false" width="1024" height="1024"></span>`;
}
function audioStatus(message) {
    const status = document.querySelector('#audio-status');
    if (status)
        status.textContent = message;
}
function sayTarget() {
    const q = session?.questions[session.index];
    if (q)
        speak(q.target.english, audioStatus);
}
function focusHeading() { document.querySelector('[data-focus]')?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
function home() {
    stopSpeech();
    session = null;
    app.innerHTML = `<section class="welcome"><div class="welcome-copy"><span class="eyebrow"><span aria-hidden="true">✦</span> LA PETITE AVENTURE D’HALLOWEEN</span><h1>Un peu de <em>boo!</em><br>Beaucoup d’<span class="underline">anglais.</span></h1><p class="intro">Dix drôles d’amis t’attendent.<br>Ouvre grand les oreilles… et à toi de jouer !</p><div class="little-tags"><span>10 mots à découvrir</span><span>À ton rythme</span></div></div><div class="hero-art" aria-hidden="true"><span class="art-star">✦</span><div class="paper-card back-card">${image(WORDS[2], '')}</div><div class="paper-card front-card">${image(WORDS[0], '')}</div><span class="art-caption">Même pas peur !</span></div></section>
  <section class="setup" aria-label="Préparer ma partie"><div class="setup-main"><div class="step-title"><span>01</span><h2>Comment veux-tu jouer ?</h2></div><div class="mode-grid" role="group" aria-label="Mode de jeu"><button type="button" class="mode-card ${mode === 'learn' ? 'selected' : ''}" data-mode="learn" aria-pressed="${mode === 'learn'}"><span class="mode-icon mint">${book}</span><span><strong>J’apprends</strong><small>Dix cartes à écouter librement</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'listen' ? 'selected' : ''}" data-mode="listen" aria-pressed="${mode === 'listen'}"><span class="mode-icon peach">${speaker}</span><span><strong>J’écoute</strong><small>Un mot anglais → la bonne image</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'read' ? 'selected' : ''}" data-mode="read" aria-pressed="${mode === 'read'}"><span class="mode-icon lavender">${eye}</span><span><strong>Je regarde</strong><small>Une image → le bon mot anglais</small></span><span class="radio-mark" aria-hidden="true"></span></button></div></div><div class="setup-bottom"><div id="choice-settings"><div class="step-title"><span>02</span><h2>Combien de réponses ?</h2></div><div class="count-group" role="group" aria-label="Nombre de réponses">${[2, 3, 4].map(n => `<button type="button" data-count="${n}" class="count-button ${count === n ? 'selected' : ''}" aria-pressed="${count === n}"><strong>${n}</strong><small>${n === 2 ? 'Tout doux' : n === 3 ? 'Un petit défi' : 'À l’aventure'}</small></button>`).join('')}</div></div><div class="start-block"><button type="button" class="primary start" id="start">C’est parti ! ${arrow}</button><p id="best-note">${bests[bestKey()] !== undefined ? `Ton record : ${bests[bestKey()]} étoiles sur 10 ✦` : 'Une partie · 10 questions · Plein de découvertes'}</p></div></div></section><p class="home-footnote">${speaker} Mets le son pour entendre les mots en anglais.</p>`;
    app.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
        mode = button.dataset.mode;
        updateSettings();
    }));
    app.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
        count = Number(button.dataset.count);
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
    app.querySelectorAll('[data-count]').forEach(button => {
        const selected = Number(button.dataset.count) === count;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
    const learning = mode === 'learn';
    document.querySelector('#choice-settings').hidden = learning;
    document.querySelector('.setup-bottom').classList.toggle('learning', learning);
    document.querySelector('#start').innerHTML = `${learning ? 'Découvrir les cartes' : 'C’est parti !'} ${arrow}`;
    document.querySelector('#best-note').textContent = learning ? 'Écoute et recommence autant de fois que tu veux.' : bests[bestKey()] !== undefined ? `Ton record : ${bests[bestKey()]} étoiles sur 10 ✦` : 'Une partie · 10 questions · Plein de découvertes';
}
function start() {
    if (mode === 'learn') {
        learn();
        return;
    }
    session = createSession(mode, count);
    renderQuestion();
    if (mode === 'listen')
        sayTarget();
}
function renderQuestion() {
    if (!session)
        return;
    const q = session.questions[session.index];
    const listening = session.mode === 'listen';
    app.innerHTML = `<section class="play-area"><div class="game-top"><button type="button" id="back" class="quiet">← Accueil</button><span class="mode-label">${listening ? speaker + ' J’écoute' : eye + ' Je regarde'}</span><span class="score" aria-label="${session.score} étoiles">✦ <b>${session.score}</b><span> / 10</span></span></div><div class="progress-head"><span>Question <b>${session.index + 1}</b> sur 10</span><span>${session.index === 0 ? 'L’aventure commence !' : 'Tu avances bien !'}</span></div><div class="progress" role="progressbar" aria-label="Questions terminées" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${session.index}"><span style="width:${session.index * 10}%"></span></div><div class="question-head"><span class="eyebrow">À TOI DE JOUER</span><h1 data-focus tabindex="-1">${listening ? 'Trouve la bonne image !' : 'Trouve le bon mot anglais !'}</h1><p>${listening ? 'Écoute le mot, puis touche la bonne image.' : 'Observe bien, puis touche le bon mot.'}</p></div>${listening ? `<div class="audio-prompt"><button type="button" id="replay" class="listen-button">${speaker} <span>Réécouter le mot</span></button><p id="audio-status" role="status">Tu peux réécouter autant que tu veux.</p></div>` : `<div class="picture-prompt">${image(q.target, q.target.french)}</div><p class="read-hint">Trouve le mot avant de l’écouter !</p>`}<div class="answers ${listening ? 'image-answers' : 'word-answers'} choices-${count}" role="group" aria-label="Choisis une réponse">${q.choices.map((word, i) => `<button type="button" class="answer" data-answer="${word.id}" aria-label="${listening ? `Image ${i + 1} : ${word.french}` : word.english}"><span class="answer-number" aria-hidden="true">${i + 1}</span>${listening ? image(word, '') : `<span lang="en">${word.english}</span>`}<span class="answer-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite"><span>Prends ton temps, tu peux y arriver.</span></div><div id="next-area" class="next-area"></div></section>`;
    app.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => selectAnswer(button)));
    document.querySelector('#replay')?.addEventListener('click', sayTarget);
    document.querySelector('#back').addEventListener('click', () => { home(); document.querySelector('#start')?.focus(); });
    focusHeading();
}
function selectAnswer(button) {
    if (!session)
        return;
    const result = answer(session, button.dataset.answer);
    if (result === 'ignored')
        return;
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
    button.classList.add('correct');
    button.querySelector('.answer-mark').textContent = '✓';
    app.querySelectorAll('.answer').forEach(el => { el.disabled = true; });
    document.querySelector('.score b').textContent = String(session.score);
    document.querySelector('.score').setAttribute('aria-label', `${session.score} étoiles`);
    feedback.className = 'feedback success';
    feedback.innerHTML = `<strong>${session.attempts === 1 ? '✦ Bravo, une étoile !' : '✓ Bien joué, tu as trouvé !'}</strong><span><b lang="en">${word.english}</b> · ${word.french}</span>`;
    document.querySelector('#next-area').innerHTML = `<button type="button" class="primary" id="next">${session.index === 9 ? 'Voir mes étoiles' : 'On continue !'} ${arrow}</button>${session.mode === 'read' ? `<button type="button" class="quiet word-replay" id="replay">${speaker} Écouter le mot</button><p id="audio-status" role="status"></p>` : ''}`;
    if (session.mode === 'read') {
        document.querySelector('#replay').addEventListener('click', sayTarget);
        sayTarget();
    }
    const next = document.querySelector('#next');
    next.addEventListener('click', () => {
        if (!session)
            return;
        stopSpeech();
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
function results() {
    if (!session)
        return;
    stopSpeech();
    const previous = bests[bestKey()] ?? 0;
    bests[bestKey()] = Math.max(previous, session.score);
    let saved = true;
    try {
        localStorage.setItem('boo-english-bests-v1', JSON.stringify(bests));
    }
    catch {
        saved = false;
    }
    const mastered = 10 - session.missed.length;
    app.innerHTML = `<section class="results"><span class="eyebrow">AVENTURE TERMINÉE</span><div class="trophy" aria-hidden="true">✦</div><h1 data-focus tabindex="-1">${session.score === 10 ? 'Un sans-faute magique !' : session.score >= 6 ? 'Bravo, petit explorateur !' : 'Dix mots de plus dans ta poche !'}</h1><p>Tu as retrouvé tous les amis d’Halloween.</p><div class="result-score"><strong>${session.score}<small> / 10</small></strong><span>étoiles gagnées</span></div><p class="result-detail">${mastered} mot${mastered > 1 ? 's' : ''} trouvé${mastered > 1 ? 's' : ''} du premier coup.${session.missed.length ? ' Continue, chaque essai te fait progresser !' : ' Tes oreilles et tes yeux ont des super-pouvoirs !'}</p><span class="record">${saved ? `Ton record pour ce défi : ${bests[bestKey()]} / 10` : 'Le record n’a pas pu être enregistré sur cet appareil.'}</span><div class="result-actions"><button type="button" class="primary" id="again">Rejouer ${arrow}</button><button type="button" class="secondary" id="change">Changer de défi</button></div></section>`;
    document.querySelector('#again').addEventListener('click', start);
    document.querySelector('#change').addEventListener('click', home);
    focusHeading();
}
function learn() {
    stopSpeech();
    session = null;
    app.innerHTML = `<section class="learn-area"><div class="game-top"><button type="button" id="back" class="quiet">← Accueil</button><span class="mode-label">${book} J’apprends</span><span class="learn-pill">10 mots à découvrir</span></div><div class="question-head"><span class="eyebrow">À TON RYTHME</span><h1 data-focus tabindex="-1">Mes dix mots d’Halloween</h1><p>Touche une carte pour entendre le mot en anglais.</p></div><div class="vocab-grid" aria-label="Les dix cartes à écouter">${WORDS.map(word => `<button type="button" class="vocab-card" data-word="${word.id}" aria-label="Écouter ${word.english}">${image(word, '')}<strong lang="en">${word.english}</strong><small>${word.french}</small><span class="learn-listen">${speaker} Écouter</span></button>`).join('')}</div><p id="audio-status" role="status">Tu peux écouter chaque mot autant de fois que tu veux.</p><button type="button" class="primary" id="learn-back">Choisir un défi ${arrow}</button></section>`;
    app.querySelectorAll('[data-word]').forEach(button => button.addEventListener('click', () => {
        app.querySelectorAll('.vocab-card').forEach(card => card.classList.remove('last-listened'));
        button.classList.add('last-listened');
        speak(WORDS.find(word => word.id === button.dataset.word).english, audioStatus);
    }));
    document.querySelector('#back').addEventListener('click', home);
    document.querySelector('#learn-back').addEventListener('click', home);
    focusHeading();
}
const dialog = document.querySelector('#help-dialog');
document.querySelector('#help').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-help').addEventListener('click', () => dialog.close());
document.querySelector('#understood').addEventListener('click', () => dialog.close());
document.addEventListener('visibilitychange', () => { if (document.hidden)
    stopSpeech(); });
home();
