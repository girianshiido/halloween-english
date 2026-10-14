import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, ORIGINAL_WORDS, createSession, answer, advance, spokenWord, progressiveCount, memoryPeek } from '../docs/app/game.js';
import { emptyProgress, recordFound, recordAnswer, parseProgress, serializeProgress, isUnlocked, chooseVariant, discoveredWords, memoryAvailable, modeTargets, difficulty, modeLevels, clearLegacyProgress, PROGRESS_KEY, BESTS_KEY } from '../docs/app/progress.js';
import { collectionMarkup } from '../docs/app/collection.js';
const colorAll = p => ORIGINAL_WORDS.forEach(w => { p[w.id].found = 6; });
test('Six premières réussites débloquent la couleur, six mémo débloquent artiste et un seul nouvel ami', () => {
  const p = emptyProgress();
  assert.equal(discoveredWords(p).length, 10);
  for(let n=0;n<5;n++) assert.equal(recordFound(p,'ghost'),null);
  assert.equal(isUnlocked(p,'ghost','color'),false);
  assert.equal(recordFound(p,'ghost'),'color');
  assert.equal(recordFound(p,'ghost',true),null);
  colorAll(p); assert.equal(memoryAvailable(p),true);
  for(let n=0;n<5;n++) assert.equal(recordFound(p,'ghost',true),null);
  assert.equal(discoveredWords(p).length,10);
  assert.equal(recordFound(p,'ghost',true),'art');
  assert.equal(discoveredWords(p).length,11);
  assert.ok(discoveredWords(p).some(w=>w.id==='owl'));
  assert.equal(p.ghost.found,6); // Counters are independent.
  assert.equal(p.ghost.selected,'original');
  assert.equal(chooseVariant(p,'ghost','art'),true);
  assert.equal(memoryAvailable(p),true); // New cards never relock the mode.
  assert.equal(modeTargets(p,'memory').some(w=>w.id==='owl'),false);
  for(let n=0;n<6;n++) recordFound(p,'owl');
  assert.equal(modeTargets(p,'memory').some(w=>w.id==='owl'),true);
  assert.equal(parseProgress(serializeProgress(p)).ghost.selected,'art');
});
test('Les dix chaînes révèlent exactement les dix nouvelles cartes, sans doublons ni progression secrète',()=>{
  const p=emptyProgress(); colorAll(p);
  assert.equal(recordFound(p,'owl'),null);assert.equal(p.owl.found,0);
  for(const w of ORIGINAL_WORDS) for(let n=0;n<6;n++) recordFound(p,w.id,true);
  assert.equal(discoveredWords(p).length,20);
  assert.equal(new Set(ORIGINAL_WORDS.map(w=>w.unlocks)).size,10);
  assert.equal(recordFound(p,'ghost',true),null);
  assert.equal(discoveredWords(p).length,20);
});
test('Une correction au deuxième essai ne fait monter aucun compteur ; les doublons sont ignorés',()=>{
  const p=emptyProgress(), s=createSession('read',2);
  const q=s.questions[0], wrong=q.choices.find(w=>w.id!==q.target.id);
  let r=answer(s,wrong.id); assert.equal(recordAnswer(p,s,r),null);
  r=answer(s,q.target.id);assert.equal(r,'correct');recordAnswer(p,s,r);
  assert.equal(p[q.target.id].found,0);assert.equal(s.score,0);
  advance(s);const target=s.questions[1].target.id;
  r=answer(s,target);recordAnswer(p,s,r);assert.equal(p[target].found,1);
  r=answer(s,target);recordAnswer(p,s,r);assert.equal(p[target].found,1);
});
test('Deux choix puis trois à la moitié au niveau 2, quatre à la moitié au niveau 4, mémo indépendant',()=>{
  const p=emptyProgress();assert.equal(difficulty(p,'read'),2);
  ORIGINAL_WORDS.slice(0,4).forEach(w=>p[w.id].found=2);assert.equal(difficulty(p,'listen'),2);
  p[ORIGINAL_WORDS[4].id].found=2;assert.equal(difficulty(p,'listen'),3);
  ORIGINAL_WORDS.slice(0,5).forEach(w=>p[w.id].found=4);assert.equal(difficulty(p,'read'),4);
  colorAll(p);assert.equal(difficulty(p,'memory'),2);
  ORIGINAL_WORDS.slice(0,5).forEach(w=>p[w.id].memory=2);assert.equal(difficulty(p,'memory'),3);
  ORIGINAL_WORDS.slice(0,5).forEach(w=>p[w.id].memory=4);assert.equal(difficulty(p,'memory'),4);
  assert.equal(progressiveCount(WORDS.slice(0,11),Object.fromEntries(WORDS.slice(0,5).map(w=>[w.id,4]))),2);
});
test('Cache noir au niveau mémo 2 et trou plus petit au niveau 4, position bornée et aléatoire',()=>{
  assert.equal(memoryPeek(1),null);
  const medium=memoryPeek(2,()=>0), small=memoryPeek(4,()=>0.999);
  assert.ok(small.radius<medium.radius);assert.equal(medium.x,35);assert.ok(small.x<65);
  assert.notEqual(medium.x,small.x);assert.notEqual(medium.y,small.y);
});
test('Articles adaptés et désactivation',()=>{
  assert.equal(spokenWord(WORDS[0]),'a ghost');
  assert.equal(spokenWord(WORDS.find(w=>w.id==='owl')),'an owl');
  assert.equal(spokenWord(WORDS.find(w=>w.id==='moon')),'the Moon');
  assert.equal(spokenWord(WORDS[0],false),'ghost');
});
test('L’ancienne progression est effacée sans supprimer les nouveaux acquis ni les préférences',()=>{
  const fresh=emptyProgress();fresh.ghost.found=2;
  const store=new Map([['boo-english-progress-v1',JSON.stringify({version:3,words:{ghost:{found:99,memory:99,selected:'art'}}})],['boo-english-bests-v1','{"read-4":10}'],[PROGRESS_KEY,serializeProgress(fresh)],[BESTS_KEY,'{"read-2":1}'],['boo-english-articles','off'],['other-project','keep']]);
  const storage={removeItem:key=>store.delete(key)};
  clearLegacyProgress(storage);
  assert.equal(store.has('boo-english-progress-v1'),false);assert.equal(store.has('boo-english-bests-v1'),false);
  assert.equal(parseProgress(store.get(PROGRESS_KEY)).ghost.found,2);
  assert.equal(store.get(BESTS_KEY),'{"read-2":1}');assert.equal(store.get('boo-english-articles'),'off');assert.equal(store.get('other-project'),'keep');
  clearLegacyProgress(storage);assert.equal(parseProgress(store.get(PROGRESS_KEY)).ghost.found,2);
  for(const version of [1,2,3]) assert.deepEqual(parseProgress(JSON.stringify({version,words:{ghost:{found:99,memory:99,selected:'art'}}})),emptyProgress());
  assert.deepEqual(parseProgress('{bad'),emptyProgress());
});
test('Mémo reste caché si une seule des dix originales n’a que cinq réussites',()=>{
  const p=emptyProgress();colorAll(p);p.frog.found=5;
  WORDS.slice(10).forEach(w=>p[w.id].found=99);
  assert.equal(memoryAvailable(p),false);
  recordFound(p,'frog');assert.equal(memoryAvailable(p),true);
});
test('Collection garde les cartes secrètes cachées, distingue agrandir et choisir',()=>{
  const p=emptyProgress();let html=collectionMarkup(p,'','');
  assert.equal((html.match(/<article /g)||[]).length,10);
  assert.ok(!html.includes('data-zoom="owl"'));assert.ok(!html.includes('images/color/ghost.png'));
  colorAll(p);p.ghost.memory=6;html=collectionMarkup(p,'','');
  assert.equal((html.match(/<article /g)||[]).length,11);
  assert.ok(html.includes('data-zoom="owl"'));assert.ok(html.includes('data-choose="ghost"'));
});

test('Les textes de collection suivent également la préférence des articles',()=>{
  const p=emptyProgress();colorAll(p);p.ghost.memory=6;p.witch.memory=6;
  const withArticles=collectionMarkup(p,'','',true), without=collectionMarkup(p,'','',false);
  assert.match(withArticles,/>an owl</);assert.match(withArticles,/>the Moon</);assert.match(withArticles,/>a skeleton</);
  assert.match(without,/>owl</);assert.match(without,/>Moon</);assert.ok(!without.includes('>an owl<'));
});

import { learningCardsMarkup } from '../docs/app/learning.js';
test('J’apprends présente dix originaux et dix cartes vides, puis remplace seulement la carte révélée',()=>{
  const p=emptyProgress();let html=learningCardsMarkup(p,'',true);
  assert.equal((html.match(/data-word=/g)||[]).length,10);assert.equal((html.match(/secret-card/g)||[]).length,10);
  assert.ok(!html.includes('owl'));assert.ok(!html.includes('images/moon.png'));
  colorAll(p);p.ghost.memory=6;html=learningCardsMarkup(p,'',true);
  assert.equal((html.match(/data-word=/g)||[]).length,11);assert.equal((html.match(/secret-card/g)||[]).length,9);
  assert.ok(html.includes('data-word="owl"'));assert.ok(html.includes('an owl'));assert.ok(!html.includes('data-word="snake"'));
});
