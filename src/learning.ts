import { DISCOVERY_ORDER, spokenWord } from './game.js';
import { isDiscovered, variantPath, type Progress } from './progress.js';

export function learningCardsMarkup(progress: Progress, speaker: string, articles: boolean): string {
  return DISCOVERY_ORDER.map(word => {
    if (!isDiscovered(progress, word.id)) return '<div class="vocab-card secret-card" aria-label="Carte à découvrir"><span class="secret-picture" aria-hidden="true">?</span><strong>À découvrir</strong><small>Une nouvelle carte apparaîtra ici</small></div>';
    const entry = progress.words[word.id]!;
    return `<button type="button" class="vocab-card" data-word="${word.id}" aria-label="Écouter ${spokenWord(word, articles)}"><span class="art-crop art-${word.id}"><img src="${variantPath(word.id, entry.selected)}" alt="" draggable="false" width="1024" height="1024"></span><strong lang="en" data-label="${word.id}">${spokenWord(word, articles)}</strong><small>${word.french}</small><span class="found-counter" data-counter="${word.id}">${entry.introduced ? `Écoute ${entry.listen}/3 · Mot ${entry.read}/3` : 'Nouvelle carte !'}</span><span class="learn-listen">${speaker} Écouter</span></button>`;
  }).join('');
}
