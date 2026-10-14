import { WORDS, spokenWord } from './game.js';
import { isDiscovered, variantPath, type Progress } from './progress.js';

export function learningCardsMarkup(progress: Progress, speaker: string, articles: boolean): string {
  return WORDS.map(word => {
    if (!isDiscovered(progress, word.id)) {
      return '<div class="vocab-card secret-card" aria-label="Carte à découvrir"><span class="secret-picture" aria-hidden="true">?</span><strong>À découvrir</strong><small>Un nouvel ami arrivera ici</small></div>';
    }
    const entry = progress[word.id]!;
    return `<button type="button" class="vocab-card" data-word="${word.id}" aria-label="Écouter ${spokenWord(word, articles)}"><span class="art-crop art-${word.id}"><img src="${variantPath(word.id, entry.selected)}" alt="" draggable="false" width="1024" height="1024"></span><strong lang="en" data-label="${word.id}">${spokenWord(word, articles)}</strong><small>${word.french}</small><span class="found-counter" data-counter="${word.id}">${entry.found} fois trouvé${entry.found > 1 ? 's' : ''}</span><span class="learn-listen">${speaker} Écouter</span></button>`;
  }).join('');
}
