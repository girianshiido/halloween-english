import { WORDS, spokenWord, questionChoices, memoryPeek, createSession, answer, advance, canReview, type Mode, type ChoiceCount, type Session, type Word } from './game.js';
import { picturePeek } from './peek.js';
import { speak, stopSpeech } from './speech.js';
import './install.js';
import { parseProgress, serializeProgress, PROGRESS_KEY, BESTS_KEY, clearLegacyProgress, resetGameStorage, emptyProgress, recordAnswer, chooseVariant, variantPath, memoryAvailable, discoveredWords, isDiscovered, modeTargets, knownWords, pendingWords, introduceWord, coloredWords, recommend, firstMemoryCue, skillLevel, difficulty, isUnlocked, VARIANT_LABELS, type Variant } from './progress.js';
import { collectionMarkup } from './collection.js';
import { learningCardsMarkup } from './learning.js';

const app = document.querySelector<HTMLElement>('#app')!;
const speaker = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const book = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 2Zm0 0v15"/></svg>';
type Activity = Mode | 'learn' | 'collection';
const arrow = '<span aria-hidden="true">→</span>';
let mode: Activity = 'listen';
let count: ChoiceCount = 2;
let articles = true;
try { articles = localStorage.getItem('boo-english-articles') !== 'off'; } catch { /* Default enabled. */ }
function pronounce(word: Word, status = audioStatus): void { speak(spokenWord(word, articles), status); }
function wordLabel(word: Word): string { return spokenWord(word, articles); }
let session: Session | null = null;
let bests: Record<string, number> = {};
let progress = parseProgress(null);
let progressNotice = '';
let sessionUnlocks = 0;
let sessionNewCards = 0;
let flashTimer: number | undefined;
let finishFlash: (() => void) | null = null;
function clearFlash(): void { window.clearTimeout(flashTimer); finishFlash = null; }

try { clearLegacyProgress(localStorage); progress = parseProgress(localStorage.getItem(PROGRESS_KEY)); }
catch { progressNotice = 'La progression reste disponible pendant cette visite, mais cet appareil ne permet pas de l’enregistrer.'; }
function saveProgress(): void {
  try { localStorage.setItem(PROGRESS_KEY, serializeProgress(progress)); progressNotice = ''; }
  catch { progressNotice = 'La progression reste disponible pendant cette visite, mais cet appareil ne permet pas de l’enregistrer.'; }
}
function foundLabel(id: string): string {
  const entry = progress.words[id]!;
  return session?.mode === 'memory' ? `Image ${entry.flash}/3 · Écoute ${entry.once}/3` : `Écoute ${entry.listen}/3 · Mot ${entry.read}/3`;
}
function counter(word: Word): string { return `<span class="found-counter" data-counter="${word.id}">${foundLabel(word.id)}</span>`; }

try {
  const stored: unknown = JSON.parse(localStorage.getItem(BESTS_KEY) ?? '{}');
  if (stored && typeof stored === 'object') {
    for (const [key, value] of Object.entries(stored)) {
      if (/^(listen|read|memory)-[345]$/.test(key) && typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5) bests[key] = value;
    }
  }
} catch { /* Play still works when browser storage is unavailable. */ }
const bestKey = () => `${session?.mode ?? mode}-${session?.questions.length ?? 4}`;
function image(word: Word, alt: string, className = '', variant: Variant = progress.words[word.id]!.selected): string {
  return `<span class="art-crop art-${word.id}"><img class="${className}" src="${variantPath(word.id, variant)}" alt="${alt}" draggable="false" width="1024" height="1024"></span>`;
}
function audioStatus(message: string): void {
  const status = document.querySelector('#audio-status');
  if (status) status.textContent = message;
}
function sayTarget(): void {
  const q = session?.questions[session.index];
  if (q) pronounce(q.target);
}
function focusHeading(): void { document.querySelector<HTMLElement>('[data-focus]')?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
function nextAction(): { label: string; detail: string } {
  if (pendingWords(progress).length) return { label: 'Découvrir une nouvelle carte', detail: 'Écoute son nom, puis retrouve-la dans un petit défi.' };
  const next = recommend(progress);
  return next.mode === 'memory' ? { label: 'Essayer Mémo magique', detail: 'Une courte aventure pour gagner les versions artiste.' }
    : { label: 'Continuer mon aventure', detail: next.mode === 'listen' ? 'Un petit défi d’écoute pour faire grandir tes couleurs.' : 'Un petit défi avec les mots pour faire grandir tes couleurs.' };
}
function home(): void {
  stopSpeech(); clearFlash(); session = null;
  const next = nextAction();
  const colors = coloredWords(progress).length;
  app.innerHTML = `${progressNotice ? `<p class="save-notice" role="status">${progressNotice}</p>` : ''}<section class="welcome"><div class="welcome-copy"><span class="eyebrow"><span aria-hidden="true">✦</span> LA PETITE AVENTURE D’HALLOWEEN</span><h1>Un peu de <em>boo!</em><br>Beaucoup d’<span class="underline">anglais.</span></h1><p class="intro">Vingt drôles de mots t’attendent.<br>Quatre cartes pour commencer… et plein de surprises !</p><div class="little-tags"><span>${discoveredWords(progress).length} / 20 cartes révélées</span><span>4 questions · révision au choix</span></div></div><div class="hero-art" aria-hidden="true"><span class="art-star">✦</span><div class="paper-card back-card">${image(WORDS[2]!, '', '', 'original')}<span class="paper-label" lang="en" data-label="pumpkin">${wordLabel(WORDS[2]!)}</span></div><div class="paper-card middle-card">${image(WORDS[5]!, '', '', 'original')}<span class="paper-label" lang="en" data-label="bat">${wordLabel(WORDS[5]!)}</span></div><div class="paper-card front-card">${image(WORDS[0]!, '', '', 'original')}<span class="paper-label" lang="en" data-label="ghost">${wordLabel(WORDS[0]!)}</span></div><span class="art-caption">Même pas peur !</span></div></section>
  <section class="adventure-path" aria-label="Mon aventure"><div><span class="eyebrow">TON PROCHAIN PETIT PAS</span><h2>${next.label}</h2><p>${next.detail}</p><p class="path-summary">${colors} couleur${colors > 1 ? 's' : ''} gagnée${colors > 1 ? 's' : ''} · Chaque paire de couleurs révèle deux cartes.</p></div><button type="button" class="primary" id="adventure">${pendingWords(progress).length ? 'Découvrir ma carte' : 'C’est parti !'} ${arrow}</button></section>
  <section class="setup" aria-label="Choisir librement"><div class="setup-main"><div class="step-title"><span>✧</span><h2>Ou choisis ton activité</h2></div><div class="mode-grid" role="group" aria-label="Mode de jeu"><button type="button" class="mode-card ${mode === 'learn' ? 'selected' : ''}" data-mode="learn" aria-pressed="${mode === 'learn'}"><span class="mode-icon mint">${book}</span><span><strong>J’apprends</strong><small>Mes cartes à écouter librement</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'listen' ? 'selected' : ''}" data-mode="listen" aria-pressed="${mode === 'listen'}"><span class="mode-icon peach">${speaker}</span><span><strong>J’écoute</strong><small>Un mot anglais → la bonne image</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'read' ? 'selected' : ''}" data-mode="read" aria-pressed="${mode === 'read'}"><span class="mode-icon lavender">${eye}</span><span><strong>Je regarde</strong><small>Une image → le bon mot anglais</small></span><span class="radio-mark" aria-hidden="true"></span></button><button type="button" class="mode-card ${mode === 'collection' ? 'selected' : ''}" data-mode="collection" aria-pressed="${mode === 'collection'}"><span class="mode-icon gold">✦</span><span><strong>Ma collection</strong><small>Mes images et leurs trois versions</small></span><span class="radio-mark" aria-hidden="true"></span></button>${memoryAvailable(progress) ? `<button type="button" class="mode-card ${mode === 'memory' ? 'selected' : ''}" data-mode="memory" aria-pressed="${mode === 'memory'}"><span class="mode-icon magic">✧</span><span><strong>Mémo magique</strong><small>Une image éclair. Un mot, une seule fois.</small></span><span class="radio-mark" aria-hidden="true"></span></button>` : ''}</div><p class="reward-road">${memoryAvailable(progress) ? '✦ Mémo magique est débloqué !' : `Mémo magique s’ouvrira avec trois cartes colorées : ${colors} / 3.`}</p></div><div class="setup-bottom"><div id="choice-settings"><div class="step-title"><span>✦</span><h2>Un défi à ta taille</h2></div><p class="difficulty-note" id="difficulty-note"></p></div><div class="start-block"><button type="button" class="primary start" id="start">C’est parti ! ${arrow}</button><p id="best-note"></p></div></div></section><p class="home-footnote">${speaker} Mets le son pour entendre les mots en anglais.</p>`;
  app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode as Activity; updateSettings(); }));
  document.querySelector('#start')!.addEventListener('click', () => { start(); });
  document.querySelector('#adventure')!.addEventListener('click', continueAdventure);
  updateSettings(); window.scrollTo(0, 0);
}
function updateSettings(): void {
  app.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => { const selected = button.dataset.mode === mode; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
  const learning = mode === 'learn' || mode === 'collection';
  document.querySelector('#difficulty-note')!.textContent = '2 réponses pour découvrir, puis 3 et 4 selon tes réussites sur cette carte et dans ce défi.';
  document.querySelector<HTMLElement>('#choice-settings')!.hidden = learning;
  document.querySelector('.setup-bottom')!.classList.toggle('learning', learning);
  document.querySelector('#start')!.innerHTML = `${mode === 'collection' ? 'Ouvrir ma collection' : learning ? 'Découvrir les cartes' : 'C’est parti !'} ${arrow}`;
  document.querySelector('#best-note')!.textContent = mode === 'collection' ? 'Chaque couleur : 3 écoutes + 3 mots trouvés.' : mode === 'memory' ? '1 seconde ou 1 écoute. Une courte partie avec tes cartes colorées.' : learning ? 'Écoute et recommence autant de fois que tu veux.' : '4 questions + une révision si tu en as envie.';
}
function continueAdventure(): void {
  const pending = pendingWords(progress)[0];
  if (pending) { introduce(pending); return; }
  const next = recommend(progress); mode = next.mode; start(next.target);
}
function introduce(word: Word): void {
  stopSpeech(); clearFlash(); session = null;
  app.innerHTML = `<section class="results discovery-intro"><span class="eyebrow">UNE NOUVELLE CARTE !</span><h1 data-focus tabindex="-1">Fais sa connaissance.</h1><p>Regarde le dessin et écoute son nom. Ensuite, à toi de le retrouver !</p><button type="button" class="vocab-card introduction-card" id="introduce-listen" aria-label="Écouter ${wordLabel(word)}">${image(word, word.french)}<strong lang="en" data-label="${word.id}">${wordLabel(word)}</strong><small>${word.french}</small><span class="learn-listen">${speaker} Écouter</span></button><p id="audio-status" role="status">Touche la carte pour l’écouter.</p><button type="button" class="primary" id="introduce-play" disabled>Retrouver cette carte ${arrow}</button><button type="button" class="quiet" id="intro-back">← Accueil</button></section>`;
  document.querySelector('#introduce-listen')!.addEventListener('click', () => { introduceWord(progress, word.id); saveProgress(); pronounce(word); document.querySelector<HTMLButtonElement>('#introduce-play')!.disabled = false; });
  document.querySelector('#introduce-play')!.addEventListener('click', () => { const next = recommend(progress, word.id); mode = next.mode; start(word.id); });
  document.querySelector('#intro-back')!.addEventListener('click', home); focusHeading();
}
function start(forceTarget?: string): void {
  if (mode === 'learn') { learn(); return; }
  if (mode === 'collection') { collection(); return; }
  if (mode === 'memory' && !memoryAvailable(progress)) { home(); return; }
  stopSpeech(); sessionUnlocks = 0; sessionNewCards = 0;
  const activity = mode;
  session = createSession(activity, { targets: modeTargets(progress, activity), pool: knownWords(progress), level: (word, cue) => skillLevel(progress, word.id, activity, cue), firstCue: firstMemoryCue(progress), forceTarget });
  renderQuestion(); if (mode === 'listen') sayTarget();
}
function renderQuestion(): void {
  if (!session) return;
  clearFlash();
  const q = session.questions[session.index]!;
  count = difficulty(progress, q.target.id, session.mode, q.cue);
  session.count = count;
  q.choices = questionChoices(q.target, count, Math.random, session.pool);
  let peek = memoryPeek(progress.words[q.target.id]!.flash);
  const memory = session.mode === 'memory';
  const flash = memory && q.cue === 'flash';
  const listening = session.mode === 'listen' || memory && q.cue === 'once';
  const label = memory ? '✧ Mémo magique' : listening ? speaker + ' J’écoute' : eye + ' Je regarde';
  const prompt = memory
    ? `<div class="memory-stage" id="memory-stage"><span aria-hidden="true">${flash ? '✧' : '♪'}</span><p>${flash ? 'Prépare tes yeux…' : 'Prépare tes oreilles…'}</p></div><button type="button" class="primary memory-ready" id="memory-ready" ${flash ? 'disabled' : ''}>${flash ? 'Regarder 1 seconde' : 'Écouter une seule fois'}</button><p id="audio-status" role="status">${flash ? 'Chargement de l’image…' : 'Quand tu es prêt, touche le bouton.'}</p>`
    : listening ? `<div class="audio-prompt"><button type="button" id="replay" class="listen-button">${speaker} <span>Réécouter le mot</span></button><p id="audio-status" role="status">Tu peux réécouter autant que tu veux.</p></div>`
    : `<div class="picture-prompt">${image(q.target, q.target.french)}</div><div class="prompt-counter">${counter(q.target)}</div><p class="read-hint">Trouve le mot avant de l’écouter !</p>`;
  app.innerHTML = `<section class="play-area"><div class="game-top"><button type="button" id="back" class="quiet">← Accueil</button><span class="mode-label">${label}</span><span class="score" aria-label="${session.score} étoiles">✦ <b>${session.score}</b><span> étoiles</span></span></div><div class="progress-head"><span>${q.review ? 'Petite révision bonus' : 'Question <b>' + (session.index + 1) + '</b> sur ' + session.principalLength}</span><span>${memory ? flash ? 'IMAGE ÉCLAIR · 1 SECONDE' : 'MOT SECRET · 1 ÉCOUTE' : 'À ton rythme'}</span></div><div class="progress" role="progressbar" aria-label="Questions terminées" aria-valuemin="0" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index}"><span style="width:${session.index / session.questions.length * 100}%"></span></div><div class="question-head"><span class="eyebrow">${memory ? 'FAIS CONFIANCE À TA MÉMOIRE' : 'À TOI DE JOUER'}</span><h1 data-focus tabindex="-1">${flash ? 'Regarde… puis souviens-toi !' : listening ? 'Trouve la bonne image !' : 'Trouve le bon mot anglais !'}</h1><p>${memory ? `${count} choix, une seule tentative. Tu peux y arriver !` : listening ? 'Écoute le mot, puis touche la bonne image.' : 'Observe bien, puis touche le bon mot.'}</p></div>${prompt}<div id="question-choices" class="answers ${listening ? 'image-answers' : 'word-answers'} choices-${session.count}" role="group" aria-label="Choisis une réponse" ${memory ? 'hidden' : ''}>${q.choices.map((word, i) => `<button type="button" class="answer" data-answer="${word.id}" aria-label="${listening ? `Image ${i + 1} : ${word.french}` : wordLabel(word)}"><span class="answer-number" aria-hidden="true">${i + 1}</span>${listening ? image(word, '') + counter(word) : `<span lang="en" data-label="${word.id}">${wordLabel(word)}</span>`}<span class="answer-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite"><span>${memory ? 'Prêt pour un petit défi ?' : 'Prends ton temps, tu peux y arriver.'}</span></div><div id="next-area" class="next-area"></div></section>`;
  app.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(button => button.addEventListener('click', () => selectAnswer(button)));
  document.querySelector('#replay')?.addEventListener('click', sayTarget);
  document.querySelector('#back')!.addEventListener('click', home);
  if (memory) {
    const ready = document.querySelector<HTMLButtonElement>('#memory-ready')!;
    const choices = document.querySelector<HTMLElement>('#question-choices')!;
    const stage = document.querySelector<HTMLElement>('#memory-stage')!;
    let used = false;
    if (flash) {
      const preload = new Image();
      preload.onload = () => {
        if (!document.contains(ready)) return;
        const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) { context.drawImage(preload, 0, 0, 64, 64); peek = picturePeek(progress.words[q.target.id]!.flash, context.getImageData(0, 0, 64, 64)); }
        ready.disabled = false; audioStatus('Quand tu es prêt, touche le bouton.');
      };
      preload.onerror = () => { if (document.contains(ready)) audioStatus('Cette image ne peut pas être chargée. Reviens à l’accueil et réessaie avec une connexion.'); };
      preload.src = variantPath(q.target.id, progress.words[q.target.id]!.selected);
    }
    ready.addEventListener('click', () => {
      if (used) return;
      used = true;
      ready.hidden = true;
      ready.disabled = true;
      if (flash) {
        stage.innerHTML = `<div class="memory-picture">${image(q.target, q.target.french)}${peek ? `<span class="memory-mask" aria-hidden="true" style="--hole:${peek.radius}%;--hole-x:${peek.x}%;--hole-y:${peek.y}%"></span>` : ''}</div>`;
        audioStatus('Regarde bien !');
        finishFlash = () => {
          clearFlash();
          if (!document.contains(stage)) return;
          stage.innerHTML = '<span aria-hidden="true">✧</span><p>L’image s’est envolée !</p>';
          choices.hidden = false;
          audioStatus('Quel était son nom en anglais ?');
        };
        flashTimer = window.setTimeout(() => finishFlash?.(), 1000);
      } else {
        stage.innerHTML = '<span aria-hidden="true">♪</span><p>Une seule écoute.</p>';
        choices.hidden = false;
        pronounce(q.target, message => {
          if (!document.contains(stage) || session?.solved) return;
          if (/Pas de son|pas disponible/.test(message)) {
            choices.hidden = true;
            audioStatus('Le son n’a pas fonctionné. Passe cette question pour continuer.');
            const skip = document.createElement('button');
            skip.type = 'button'; skip.className = 'secondary'; skip.textContent = 'Passer cette question';
            skip.addEventListener('click', () => { if (!session || session.solved) return; session.solved = true; session.missed.push(q.target.id); showNext(); skip.remove(); });
            document.querySelector('#next-area')!.replaceChildren(skip);
          } else audioStatus(message === 'Écoute bien…' ? 'Écoute bien…' : 'À toi de choisir. Le mot ne sera pas répété.');
        });
      }
    });
  }
  focusHeading();
}
function showNext(): void {
  if (!session) return;
  const last = session.index === session.questions.length - 1;
  document.querySelector('#next-area')!.innerHTML = `<button type="button" class="primary" id="next">${last ? 'Voir mes étoiles' : 'On continue !'} ${arrow}</button>${canReview(session) ? '<button type="button" class="secondary review-button" id="review">Une petite révision ? →</button>' : ''}${session.mode === 'read' ? `<button type="button" class="quiet word-replay" id="replay">${speaker} Écouter le mot</button><p id="audio-status" role="status"></p>` : ''}`;
  if (session.mode === 'read') document.querySelector('#replay')!.addEventListener('click', sayTarget);
  function go(includeReview: boolean): void {
    if (!session) return;
    stopSpeech(); clearFlash();
    if (advance(session, includeReview)) { renderQuestion(); if (session.mode === 'listen') sayTarget(); }
    else results();
  }
  const next = document.querySelector<HTMLButtonElement>('#next')!;
  next.addEventListener('click', () => go(false));
  document.querySelector('#review')?.addEventListener('click', () => go(true));
  next.focus();
}
function selectAnswer(button: HTMLButtonElement): void {
  if (!session) return;
  if (session.mode === 'memory' && document.querySelector<HTMLElement>('#question-choices')!.hidden) return;
  const result = answer(session, button.dataset.answer!);
  if (result === 'ignored') return;
  if (session.mode === 'read' || session.mode === 'memory' && session.questions[session.index]!.cue === 'flash') {
    pronounce(WORDS.find(w => w.id === button.dataset.answer)!, message => audioStatus(session?.mode === 'memory' && message === 'Tu peux réécouter autant que tu veux.' ? 'À toi de continuer !' : message));
  }
  const feedback = document.querySelector<HTMLElement>('#feedback')!;
  if (result === 'retry') {
    button.classList.add('incorrect'); button.disabled = true;
    button.querySelector('.answer-mark')!.textContent = '↻';
    feedback.className = 'feedback retry';
    feedback.textContent = 'Presque ! Essaie une autre réponse, tu vas trouver.';
    if (session.mode === 'listen') sayTarget();
    app.querySelector<HTMLButtonElement>('.answer:not(:disabled)')?.focus();
    return;
  }
  const word = session.questions[session.index]!.target;
  const correct = result === 'correct';
  const firstTry = correct && session.attempts === 1;
  const reward = recordAnswer(progress, session, result);
  const unlocked = reward.variant;
  if (unlocked) sessionUnlocks++;
  sessionNewCards += reward.newCards.length;
  if (firstTry) saveProgress();
  app.querySelectorAll<HTMLElement>('[data-counter]').forEach(element => { element.textContent = foundLabel(element.dataset.counter!); });
  const right = app.querySelector<HTMLButtonElement>(`[data-answer="${word.id}"]`)!;
  right.classList.add('correct'); right.querySelector('.answer-mark')!.textContent = '✓';
  if (!correct) { button.classList.add('incorrect'); button.querySelector('.answer-mark')!.textContent = '×'; }
  app.querySelectorAll<HTMLButtonElement>('.answer').forEach(element => { element.disabled = true; });
  document.querySelector('.score b')!.textContent = String(session.score);
  document.querySelector('.score')!.setAttribute('aria-label', `${session.score} étoiles`);
  feedback.className = correct ? 'feedback success' : 'feedback retry';
  feedback.innerHTML = `<strong>${correct ? session.attempts === 1 ? '✦ Bravo, une étoile !' : '✓ Bien joué, tu as trouvé !' : 'Pas cette fois. Voici la bonne réponse.'}</strong><span><b lang="en" data-label="${word.id}">${wordLabel(word)}</b> · ${word.french}</span><span>${foundLabel(word.id)}</span>${unlocked ? `<span class="unlock-message">✦ ${unlocked === 'color' ? 'Version couleur débloquée !' : 'Version artiste débloquée !'}<small>Retrouve-la dans Ma collection.</small></span>` : ''}${correct && !firstTry ? '<span>Pour faire progresser cette carte, retrouve-la du premier coup la prochaine fois !</span>' : ''}${reward.newCards.length ? '<span class="unlock-message">✦ Deux nouvelles cartes révélées !<small>Tu les découvriras tranquillement après ce défi.</small></span>' : ''}${progressNotice ? `<span class="save-notice">${progressNotice}</span>` : ''}`;
  showNext();
}
function results(): void {
  if (!session) return;
  stopSpeech(); clearFlash();
  progress.completedSessions++; saveProgress();
  const key = bestKey(); const total = session.questions.length;
  bests[key] = Math.max(bests[key] ?? 0, session.score);
  let saved = true;
  try { localStorage.setItem(BESTS_KEY, JSON.stringify(bests)); } catch { saved = false; }
  const next = nextAction();
  app.innerHTML = `<section class="results"><span class="eyebrow">PETITE AVENTURE TERMINÉE</span><div class="trophy" aria-hidden="true">✦</div><h1 data-focus tabindex="-1">${session.score === total ? 'Un sans-faute magique !' : 'Bravo, petit explorateur !'}</h1><p>${session.mode === 'memory' ? 'Ta mémoire grandit à chaque partie !' : 'Un petit pas de plus vers tes prochaines couleurs.'}</p><div class="result-score"><strong>${session.score}<small> / ${total}</small></strong><span>étoiles gagnées</span></div><p class="result-detail">${session.score} réponse${session.score > 1 ? 's' : ''} du premier coup.${session.missed.length ? ' Chaque essai t’aide à apprendre !' : ' Tes oreilles et tes yeux ont des super-pouvoirs !'}</p><span class="record">${saved ? `Ton record sur ${total} questions : ${bests[key]} / ${total}` : 'Le record n’a pas pu être enregistré sur cet appareil.'}</span>${sessionUnlocks ? `<p class="unlock-summary">✦ ${sessionUnlocks} nouvelle${sessionUnlocks > 1 ? 's' : ''} version${sessionUnlocks > 1 ? 's' : ''} débloquée${sessionUnlocks > 1 ? 's' : ''} !</p>` : ''}${sessionNewCards ? `<p class="unlock-summary">${sessionNewCards} nouvelles cartes t’attendent !</p>` : ''}<div class="next-adventure"><p>${next.detail}</p><button type="button" class="primary" id="continue-adventure">${next.label} ${arrow}</button></div><div class="result-actions"><button type="button" class="secondary" id="again">Refaire ce défi</button><button type="button" class="secondary" id="change">Choisir une activité</button></div><button type="button" class="quiet" id="view-collection">Voir ma collection →</button>${progressNotice ? `<p class="save-notice" role="status">${progressNotice}</p>` : ''}</section>`;
  document.querySelector('#continue-adventure')!.addEventListener('click', continueAdventure);
  document.querySelector('#again')!.addEventListener('click', () => { start(); });
  document.querySelector('#change')!.addEventListener('click', home);
  document.querySelector('#view-collection')!.addEventListener('click', () => collection());
  focusHeading();
}
function learn(): void {
  stopSpeech();
  clearFlash();
  session = null;
  app.innerHTML = `<section class="learn-area"><div class="game-top"><button type="button" id="back" class="quiet">← Accueil</button><span class="mode-label">${book} J’apprends</span><span class="learn-pill">20 mots à découvrir</span></div><div class="question-head"><span class="eyebrow">À TON RYTHME</span><h1 data-focus tabindex="-1">Mes vingt mots d’Halloween</h1><p>${discoveredWords(progress).length} cartes découvertes sur 20. Touche une carte pour entendre le mot en anglais.</p></div><div class="vocab-grid" aria-label="Les vingt cartes à découvrir">${learningCardsMarkup(progress, speaker, articles)}</div><p id="audio-status" role="status">Tu peux écouter chaque mot autant de fois que tu veux.</p><button type="button" class="primary" id="learn-back">Choisir un défi ${arrow}</button></section>`;
  app.querySelectorAll<HTMLButtonElement>('[data-word]').forEach(button => button.addEventListener('click', () => {
    app.querySelectorAll('.vocab-card').forEach(card => card.classList.remove('last-listened'));
    button.classList.add('last-listened');
    const word = WORDS.find(word => word.id === button.dataset.word)!;
    if (introduceWord(progress, word.id)) { saveProgress(); button.querySelector('.found-counter')!.textContent = foundLabel(word.id); }
    pronounce(word);
  }));
  document.querySelector('#back')!.addEventListener('click', home);
  document.querySelector('#learn-back')!.addEventListener('click', home);
  focusHeading();
}
function collection(resetScroll = true): void {
  stopSpeech();
  clearFlash();
  session = null;
  const scrollY = window.scrollY;
  app.innerHTML = collectionMarkup(progress, speaker, progressNotice, articles);
  app.querySelectorAll<HTMLButtonElement>('[data-choose]').forEach(button => button.addEventListener('click', () => {
    if (chooseVariant(progress, button.dataset.choose!, button.dataset.variant as Variant)) {
      saveProgress();
      collection(false);
      app.querySelector<HTMLButtonElement>(`[data-choose="${button.dataset.choose}"][data-variant="${button.dataset.variant}"]`)?.focus({ preventScroll: true });
    }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(button => button.addEventListener('click', () => openZoom(button.dataset.zoom!, button.dataset.variant as Variant)));
  app.querySelectorAll<HTMLButtonElement>('[data-listen]').forEach(button => button.addEventListener('click', () => pronounce(WORDS.find(word => word.id === button.dataset.listen)!)));
  document.querySelector('#back')!.addEventListener('click', home);
  document.querySelector('#collection-back')!.addEventListener('click', home);
  if (resetScroll) focusHeading(); else window.scrollTo(0, scrollY);
}
const zoomDialog = document.querySelector<HTMLDialogElement>('#zoom-dialog')!;
let zoomId = ''; let zoomVariant: Variant = 'original';
function openZoom(id: string, variant: Variant): void {
  if (!isDiscovered(progress, id) || !isUnlocked(progress, id, variant)) return;
  zoomId = id; zoomVariant = variant;
  document.querySelector('#zoom-title')!.textContent = `${wordLabel(WORDS.find(word => word.id === id)!)} · ${VARIANT_LABELS[variant]}`;
  const img = document.querySelector<HTMLImageElement>('#zoom-image')!;
  img.src = variantPath(id, variant); img.alt = `${WORDS.find(word => word.id === id)!.french}, version ${VARIANT_LABELS[variant]}`;
  document.querySelector('#zoom-use')!.textContent = progress.words[id]!.selected === variant ? '✓ Version utilisée' : 'Utiliser cette version';
  zoomDialog.showModal();
}
document.querySelector('#zoom-close')!.addEventListener('click', () => zoomDialog.close());
document.querySelector('#zoom-use')!.addEventListener('click', () => { if (chooseVariant(progress, zoomId, zoomVariant)) { saveProgress(); zoomDialog.close(); collection(false); } });
const dialog = document.querySelector<HTMLDialogElement>('#help-dialog')!;
document.querySelector('#help')!.addEventListener('click', () => dialog.showModal());
document.querySelector('#close-help')!.addEventListener('click', () => dialog.close());
document.querySelector('#understood')!.addEventListener('click', () => dialog.close());
const resetDialog = document.querySelector<HTMLDialogElement>('#reset-dialog')!;
document.querySelector('#reset-open')!.addEventListener('click', () => {
  dialog.close();
  resetDialog.showModal();
});
document.querySelector('#reset-cancel')!.addEventListener('click', () => { resetDialog.close(); dialog.showModal(); });
resetDialog.addEventListener('cancel', () => { window.setTimeout(() => dialog.showModal(), 0); });
document.querySelector('#reset-confirm')!.addEventListener('click', () => {
  progressNotice = '';
  try { resetGameStorage(localStorage); }
  catch { progressNotice = 'La remise à zéro vaut pour cette visite, mais cet appareil n’a pas permis d’effacer toute la sauvegarde.'; }
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

document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); finishFlash?.(); } });
home();

const articlesButton = document.querySelector<HTMLButtonElement>('#articles')!;
function updateArticles(): void {
  document.querySelectorAll<HTMLElement>('[data-label]').forEach(el => { const word = WORDS.find(w => w.id === el.dataset.label)!; el.textContent = wordLabel(word); const button = el.closest<HTMLButtonElement>('[data-answer]'); if (button) button.setAttribute('aria-label', wordLabel(word)); });
  if (zoomDialog.open) document.querySelector('#zoom-title')!.textContent = `${wordLabel(WORDS.find(w => w.id === zoomId)!)} · ${VARIANT_LABELS[zoomVariant]}`;
  articlesButton.setAttribute('aria-pressed', String(articles)); articlesButton.textContent = articles ? 'a / an / the ✓' : 'Articles : non'; }
articlesButton.addEventListener('click', () => { articles = !articles; try { localStorage.setItem('boo-english-articles', articles ? 'on' : 'off'); } catch { /* Session preference still works. */ } updateArticles(); });
updateArticles();
