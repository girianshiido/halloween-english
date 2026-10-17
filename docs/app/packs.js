import { CORE_PACK, EXTRA_PACKS } from './game.js';
import { packAvailable, packColors, discoveredWords, isUnlocked } from './progress.js';
export function packsMarkup(progress) {
    const coreColors = CORE_PACK.words.filter(word => isUnlocked(progress, word.id, 'color')).length;
    return `<section class="packs-area"><div class="game-top"><button type="button" class="quiet" id="packs-back">← Accueil</button><span class="mode-label">✧ Mes prochaines aventures</span></div><div class="question-head"><span class="eyebrow">ENCORE UN PEU DE MAGIE</span><h1 data-focus tabindex="-1">Choisis la suite de ton aventure.</h1><p>Vingt premières couleurs : choisis ton premier pack. Chaque pack où tu gagnes quatre couleurs te permet d’en choisir un autre. Tes réussites restent avec toi !</p></div><div class="pack-grid">${EXTRA_PACKS.map(pack => {
        const opened = progress.openedPacks.includes(pack.id);
        const available = packAvailable(progress, pack.id);
        const bestOpened = Math.max(0, ...progress.openedPacks.map(id => packColors(progress, id)).filter(colors => colors < 4));
        const current = progress.activePack === pack.id;
        const revealed = discoveredWords(progress).filter(word => pack.words.includes(word)).length;
        const colors = pack.words.filter(word => isUnlocked(progress, word.id, 'color')).length;
        return `<article class="pack-card ${available ? 'available' : 'waiting'}"><span class="pack-symbol" aria-hidden="true">✧</span><span class="eyebrow">DE NOUVELLES CARTES</span><h2>${pack.title}</h2><p>${pack.description}.</p><p class="pack-status">${current ? 'Aventure en cours · ' : ''}${opened ? `${revealed} cartes révélées · ${colors} couleurs gagnées` : available ? 'Ce pack est prêt à être exploré !' : coreColors < CORE_PACK.words.length ? `${coreColors} / ${CORE_PACK.words.length} premières couleurs gagnées` : `${bestOpened} / 4 couleurs dans un pack exploré pour ouvrir celui-ci`}</p><p class="pack-rule">Deux cartes pour commencer. Chaque paire colorée révèle les deux suivantes.</p>${opened ? `<button type="button" class="primary" data-pack-continue="${pack.id}">Continuer cette aventure →</button>` : `<button type="button" class="${available ? 'primary' : 'secondary'}" data-open-pack="${pack.id}" ${available ? '' : 'disabled'}>${available ? 'Explorer ce pack →' : coreColors < CORE_PACK.words.length ? 'Encore quelques couleurs à gagner' : '4 couleurs pour ouvrir un autre pack'}</button>`}</article>`;
    }).join('')}</div><button type="button" class="quiet" id="packs-play">Continuer avec mes cartes →</button></section>`;
}
