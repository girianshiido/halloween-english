import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, CORE_PACK, EXTRA_PACKS, createSession, spokenWord } from '../docs/app/game.js';
import { emptyProgress, parseProgress, serializeProgress, packAvailable, openPack, availablePacks, collectionWords, discoveredWords, knownWords, pendingWords, introduceWord, isUnlocked, PROGRESS_KEY, BESTS_KEY, focusPack, recommend } from '../docs/app/progress.js';
import { packsMarkup } from '../docs/app/packs.js';
import { learningCardsMarkup } from '../docs/app/learning.js';
const pack=EXTRA_PACKS[0];
function finishCore(p){for(const w of CORE_PACK.words)Object.assign(p.words[w.id],{listen:3,read:3,introduced:true});}
function color(p,id){Object.assign(p.words[id],{listen:3,read:3,introduced:true});}
test('Pack Petite sorcellerie : six noms illustrables, uniques et prononcés avec leur article',()=>{
  assert.equal(WORDS.length,32);assert.equal(new Set(WORDS.map(w=>w.id)).size,32);
  assert.deepEqual(pack.words.map(w=>spokenWord(w)),['a black cat','a broom','a cauldron','a wand','a potion','a spellbook']);
  assert.ok(pack.words.every(w=>!CORE_PACK.words.includes(w)));
});
test('Le pack attend les vingt premières couleurs ; le mémo est facultatif',()=>{
  const p=emptyProgress();assert.equal(openPack(p,'sorcery'),false);assert.equal(openPack(p,'unknown'),false);
  for(const w of CORE_PACK.words.slice(0,19))color(p,w.id);
  assert.equal(packAvailable(p,'sorcery'),false);assert.deepEqual(availablePacks(p),[]);
  assert.match(packsMarkup(p),/19 \/ 20/);assert.match(packsMarkup(p),/disabled/);
  color(p,CORE_PACK.words[19].id);assert.equal(packAvailable(p,'sorcery'),true);
  assert.ok(CORE_PACK.words.every(w=>p.words[w.id].flash===0&&p.words[w.id].once===0));
  assert.equal(discoveredWords(p).length,20);assert.equal(collectionWords(p).length,20);
  assert.ok(!learningCardsMarkup(p,'',true).includes('cat.png'));
  assert.match(packsMarkup(p),/Explorer ce pack/);
});
test('Choisir le pack révèle exactement deux cartes, sans les interroger avant présentation',()=>{
  const p=emptyProgress();finishCore(p);
  assert.equal(openPack(p,'sorcery'),true);assert.equal(openPack(p,'sorcery'),false);
  assert.equal(discoveredWords(p).length,22);assert.equal(collectionWords(p).length,26);
  assert.deepEqual(pendingWords(p).map(w=>w.id),['cat','broom']);assert.equal(knownWords(p).length,20);
  assert.equal(introduceWord(p,'cauldron'),false);introduceWord(p,'cat');
  const s=createSession('listen',{targets:knownWords(p),pool:knownWords(p),forceTarget:'cat'});
  assert.equal(s.questions[0].target.id,'cat');assert.equal(s.questions[0].choices.length,2);
  assert.ok(s.questions.every(q=>q.choices.every(w=>!pack.words.includes(w)||w.id==='cat')));
});
test('Les couleurs du pack, sans mémoire, ouvrent les deux paires suivantes',()=>{
  const p=emptyProgress();finishCore(p);openPack(p,'sorcery');
  color(p,'cat');assert.equal(discoveredWords(p).length,22);
  color(p,'broom');assert.equal(discoveredWords(p).length,24);
  assert.deepEqual(pendingWords(p).map(w=>w.id),['cauldron','wand']);
  color(p,'cauldron');assert.equal(discoveredWords(p).length,24);
  color(p,'wand');assert.equal(discoveredWords(p).length,26);
  assert.deepEqual(pendingWords(p).map(w=>w.id),['potion','spellbook']);
  for(const w of pack.words){assert.equal(p.words[w.id].flash,0);assert.equal(p.words[w.id].once,0);}
});
test('Une sauvegarde v5 antérieure au pack garde tous ses acquis sans remise à zéro',()=>{
  const p=emptyProgress();finishCore(p);Object.assign(p.words.ghost,{flash:3,once:3,selected:'art'});p.completedSessions=42;
  const old={version:5,words:Object.fromEntries(CORE_PACK.words.map(w=>[w.id,p.words[w.id]])),completedSessions:42};
  const loaded=parseProgress(JSON.stringify(old));
  assert.equal(loaded.completedSessions,42);assert.equal(loaded.words.ghost.selected,'art');
  for(const w of CORE_PACK.words)assert.deepEqual(loaded.words[w.id],p.words[w.id]);
  assert.equal(discoveredWords(loaded).length,20);assert.deepEqual(loaded.openedPacks,[]);
  assert.ok(pack.words.every(w=>loaded.words[w.id].listen===0&&!loaded.words[w.id].introduced));
  assert.equal(PROGRESS_KEY,'boo-english-progress-v5');assert.equal(BESTS_KEY,'boo-english-bests-v3');
  assert.ok(isUnlocked(loaded,'ghost','art'));assert.equal(openPack(loaded,'sorcery'),true);
});
test('Ouverture et réussites du pack conservées après rechargement ; données invalides ignorées',()=>{
  const p=emptyProgress();finishCore(p);openPack(p,'sorcery');introduceWord(p,'cat');p.words.cat.listen=2;
  assert.deepEqual(parseProgress(serializeProgress(p)),p);
  const malformed=JSON.parse(serializeProgress(emptyProgress()));malformed.openedPacks=['sorcery','sorcery','unknown'];
  assert.deepEqual(parseProgress(JSON.stringify(malformed)).openedPacks,[]);
  const raw=JSON.parse(serializeProgress(p));raw.openedPacks.push('sorcery','unknown');
  assert.deepEqual(parseProgress(JSON.stringify(raw)).openedPacks,['sorcery']);
});
test('La maison mystérieuse utilise six mots anglais et peut être choisie en premier',()=>{
  const house=EXTRA_PACKS.find(pack=>pack.id==='mystery-house');
  assert.deepEqual(house.words.map(w=>spokenWord(w)),['a haunted house','a door','a key','a chest','a lantern','a bell']);
  const p=emptyProgress();finishCore(p);
  assert.deepEqual(availablePacks(p).map(p=>p.id),['sorcery','mystery-house']);
  assert.equal(openPack(p,'mystery-house'),true);assert.equal(openPack(p,'sorcery'),false);
  assert.deepEqual(pendingWords(p).map(w=>w.id),['house','door']);
  assert.equal(discoveredWords(p).length,22);assert.equal(p.activePack,'mystery-house');
  assert.ok(!learningCardsMarkup(p,'',true).includes('cat.png'));
});
test('Quatre couleurs dans le premier pack ouvrent le second, dans les deux ordres',()=>{
  for(const first of EXTRA_PACKS){
    const p=emptyProgress();finishCore(p);openPack(p,first.id);
    const second=EXTRA_PACKS.find(pack=>pack!==first);
    for(const w of first.words.slice(0,3))color(p,w.id);
    assert.equal(packAvailable(p,second.id),false);
    color(p,first.words[3].id);assert.equal(packAvailable(p,second.id),true);
    assert.ok(first.words.every(w=>p.words[w.id].flash===0&&p.words[w.id].once===0));
    assert.equal(openPack(p,second.id),true);assert.equal(p.activePack,second.id);
    assert.deepEqual(pendingWords(p).slice(0,2).map(w=>w.id),second.words.slice(0,2).map(w=>w.id));
    assert.deepEqual(parseProgress(serializeProgress(p)),p);
  }
});
test('Ancienne sauvegarde à 26 mots : couleurs et artiste conservés, nouveau pack encore fermé',()=>{
  const p=emptyProgress();finishCore(p);openPack(p,'sorcery');introduceWord(p,'cat');
  Object.assign(p.words.cat,{listen:3,read:3,flash:3,once:3,selected:'art'});
  const raw=JSON.parse(serializeProgress(p));delete raw.activePack;
  for(const word of EXTRA_PACKS.find(pack=>pack.id==='mystery-house').words)delete raw.words[word.id];
  const loaded=parseProgress(JSON.stringify(raw));
  assert.deepEqual(loaded.words.cat,p.words.cat);assert.deepEqual(loaded.openedPacks,['sorcery']);
  assert.equal(loaded.activePack,'sorcery');assert.equal(packAvailable(loaded,'mystery-house'),false);
  assert.ok(!loaded.words.house.introduced&&loaded.words.house.listen===0);
});

test('Reprendre un pack conserve le choix après rechargement et privilégie ses mots faibles',()=>{
  const p=emptyProgress();finishCore(p);openPack(p,'mystery-house');
  const house=EXTRA_PACKS.find(pack=>pack.id==='mystery-house');for(const w of house.words.slice(0,4))color(p,w.id);
  openPack(p,'sorcery');introduceWord(p,'cat');introduceWord(p,'broom');
  assert.equal(focusPack(p,'mystery-house'),true);assert.equal(focusPack(p,'unknown'),false);
  assert.deepEqual(pendingWords(p).slice(0,2).map(w=>w.id),['lantern','bell']);
  introduceWord(p,'lantern');p.completedSessions=0;
  assert.equal(recommend(p).target,'lantern');
  assert.deepEqual(parseProgress(serializeProgress(p)),p);
});
