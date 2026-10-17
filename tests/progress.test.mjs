import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, CORE_PACK, EXTRA_PACKS, STARTER_WORDS, createSession, answer, advance } from '../docs/app/game.js';
import { emptyProgress, parseProgress, serializeProgress, recordAnswer, isUnlocked, memoryAvailable, discoveredWords, knownWords, pendingWords, introduceWord, modeTargets, recommend, skillLevel, difficulty, firstMemoryCue, chooseVariant, clearLegacyProgress, resetGameStorage, PROGRESS_KEY, BESTS_KEY, openPack, availablePacks } from '../docs/app/progress.js';
import { learningCardsMarkup } from '../docs/app/learning.js';
import { collectionMarkup } from '../docs/app/collection.js';
function color(p, word) { Object.assign(p.words[word.id], { listen:3, read:3 }); }
function allKnown(p) { p.openedPacks=EXTRA_PACKS.map(pack=>pack.id); p.activePack='mystery-house'; for(const word of WORDS) Object.assign(p.words[word.id],{listen:3,read:3,introduced:true}); }
function gain(p,id,mode='listen',cue='flash',wrong=false) {
  const s=createSession(mode,{targets:modeTargets(p,mode),pool:knownWords(p),forceTarget:id,firstCue:cue,level:(w,c)=>skillLevel(p,w.id,mode,c)});
  const q=s.questions[0]; assert.equal(q.target.id,id);
  if(wrong) {const r=answer(s,q.choices.find(w=>w!==q.target).id);recordAnswer(p,s,r);}
  const result=answer(s,id); return {s,reward:recordAnswer(p,s,result)};
}
test('Quatre cartes initiales, seize emplacements secrets, aucun distracteur inconnu', () => {
  const p=emptyProgress();
  assert.deepEqual(discoveredWords(p),STARTER_WORDS);
  assert.deepEqual(knownWords(p),STARTER_WORDS);
  assert.deepEqual(modeTargets(p,'listen'),STARTER_WORDS);
  assert.equal(modeTargets(p,'memory').length,0);
  assert.equal(memoryAvailable(p),false);
  const html=learningCardsMarkup(p,'speaker',true);
  assert.equal((html.match(/data-word=/g)||[]).length,4);
  assert.equal((html.match(/secret-card/g)||[]).length,16);
  assert.ok(!html.includes('vampire.png'));
});
test('Couleur : trois écoutes ET trois lectures, pas six dans la même activité', () => {
  const p=emptyProgress();
  for(let i=0;i<8;i++) assert.equal(gain(p,'ghost').reward.variant,null);
  assert.equal(p.words.ghost.listen,3);assert.equal(isUnlocked(p,'ghost','color'),false);
  for(let i=0;i<2;i++) assert.equal(gain(p,'ghost','read').reward.variant,null);
  assert.equal(gain(p,'ghost','read').reward.variant,'color');
  assert.equal(isUnlocked(p,'ghost','color'),true);
  assert.equal(p.words.ghost.selected,'original');
});
test('Erreur, correction et double appel ne font pas progresser la carte', () => {
  const p=emptyProgress(); gain(p,'ghost','listen','flash',true);
  assert.equal(p.words.ghost.listen,0);
  const {s}=gain(p,'ghost'); assert.equal(p.words.ghost.listen,1);
  recordAnswer(p,s,'correct');assert.equal(p.words.ghost.listen,1);
});
test('Chaque paire colorée révèle deux cartes ; elles sont présentées avant les questions', () => {
  const p=emptyProgress();color(p,STARTER_WORDS[0]);assert.equal(discoveredWords(p).length,4);
  color(p,STARTER_WORDS[1]);assert.equal(discoveredWords(p).length,6);
  assert.deepEqual(pendingWords(p).map(w=>w.id),['vampire','monster']);
  assert.equal(modeTargets(p,'read').length,4);
  assert.equal(introduceWord(p,'owl'),false);
  assert.equal(introduceWord(p,'vampire'),true);
  assert.equal(introduceWord(p,'vampire'),false);
  assert.equal(modeTargets(p,'read').length,5);
  assert.equal(p.words.vampire.listen,0);
  color(p,STARTER_WORDS[2]);color(p,STARTER_WORDS[3]);assert.equal(discoveredWords(p).length,8);
});
test('Les vingt cartes sont accessibles grâce aux couleurs, sans aucune réussite mémo', () => {
  const p=emptyProgress();
  for(const word of CORE_PACK.words) {
    assert.ok(discoveredWords(p).includes(word)); introduceWord(p,word.id);color(p,word);
  }
  assert.equal(discoveredWords(p).length,20);
  assert.ok(WORDS.every(w=>p.words[w.id].flash===0&&p.words[w.id].once===0));
});
test('Le mémo apparaît à trois couleurs et prend seulement les cartes colorées', () => {
  const p=emptyProgress();for(const w of STARTER_WORDS.slice(0,2))color(p,w);
  assert.equal(memoryAvailable(p),false);
  color(p,STARTER_WORDS[2]);assert.equal(memoryAvailable(p),true);
  assert.equal(modeTargets(p,'memory').length,3);
  assert.ok(modeTargets(p,'memory').every(w=>isUnlocked(p,w.id,'color')));
});
test('Artiste : trois images éclair ET trois écoutes uniques, indépendantes des autres points', () => {
  const p=emptyProgress();for(const w of STARTER_WORDS.slice(0,3))color(p,w);
  for(let i=0;i<8;i++) assert.equal(gain(p,'ghost','memory','flash').reward.variant,null);
  assert.equal(p.words.ghost.flash,3);assert.equal(isUnlocked(p,'ghost','art'),false);
  for(let i=0;i<2;i++) assert.equal(gain(p,'ghost','memory','once').reward.variant,null);
  const reward=gain(p,'ghost','memory','once').reward;
  assert.equal(reward.variant,'art');assert.equal(reward.newCards.length,0);
  assert.equal(p.words.ghost.selected,'original');
  assert.equal(chooseVariant(p,'ghost','art'),true);
  assert.equal(chooseVariant(p,'witch','art'),false);
});
test('Difficultés séparées par carte et compétence ; première alternance mémo équilibrée', () => {
  const p=emptyProgress();p.words.ghost.listen=2;
  assert.equal(difficulty(p,'ghost','listen'),4);assert.equal(difficulty(p,'ghost','read'),2);
  assert.equal(difficulty(p,'pumpkin','listen'),2);
  for(const w of STARTER_WORDS.slice(0,3))color(p,w);
  p.words.ghost.flash=1;
  assert.equal(difficulty(p,'ghost','memory','flash'),3);assert.equal(difficulty(p,'ghost','memory','once'),2);
  assert.equal(firstMemoryCue(p),'once');
});
test('Conseil guidé : compétence faible et mémo régulier', () => {
  const p=emptyProgress();p.words.ghost.listen=3;
  assert.equal(recommend(p,'ghost').mode,'read');
  for(const w of STARTER_WORDS.slice(0,3))color(p,w);
  p.completedSessions=2;assert.equal(recommend(p).mode,'memory');
  p.completedSessions=3;assert.equal(recommend(p).mode,'read');
  assert.equal(recommend(p,'witch').target,'witch');
});
test('Anciennes sauvegardes effacées une seule fois ; nouvelles données et autres jeux conservés', () => {
  const old={version:4,words:{ghost:{found:99,memory:99,selected:'art'}}};
  assert.deepEqual(parseProgress(JSON.stringify(old)),emptyProgress());
  const p=emptyProgress();p.words.ghost.listen=2;p.completedSessions=4;
  const data=new Map([['boo-english-progress-v4',JSON.stringify(old)],['boo-english-bests-v2','old'],[PROGRESS_KEY,serializeProgress(p)],[BESTS_KEY,'{"listen-4":4}'],['other-game','keep'],['boo-english-articles','off']]);
  const storage={removeItem:key=>data.delete(key)};clearLegacyProgress(storage);clearLegacyProgress(storage);
  assert.equal(data.has('boo-english-progress-v4'),false);assert.equal(data.has('boo-english-bests-v2'),false);
  assert.deepEqual(parseProgress(data.get(PROGRESS_KEY)),p);assert.equal(data.get('boo-english-articles'),'off');
  resetGameStorage(storage);assert.deepEqual([...data],[['other-game','keep']]);
});
test('Sauvegarde actuelle : aller-retour, versions choisies, cartes présentées et mémoire', () => {
  const p=emptyProgress();allKnown(p);Object.assign(p.words.ghost,{flash:3,once:3,selected:'art'});p.completedSessions=17;
  assert.deepEqual(parseProgress(serializeProgress(p)),p);
  const raw=JSON.parse(serializeProgress(p));raw.words.ghost.listen=-8;raw.words.ghost.read='3';raw.words.pumpkin.listen=500;raw.words.witch.selected='art';
  const parsed=parseProgress(JSON.stringify(raw));
  assert.equal(parsed.words.ghost.listen,0);assert.equal(parsed.words.ghost.read,0);assert.equal(parsed.words.ghost.selected,'original');
  assert.equal(parsed.words.pumpkin.listen,3);assert.equal(parsed.words.witch.selected,'original');
  assert.deepEqual(parseProgress('bad json'),emptyProgress());
});
test('Collection : quatre compteurs, zoom, choix manuel et images verrouillées non révélées', () => {
  const p=emptyProgress();let html=collectionMarkup(p,'speaker','',true);
  assert.equal((html.match(/collection-card/g)||[]).length,4);
  assert.ok(!html.includes('./images/color/'));assert.ok(!html.includes('./images/art/'));
  color(p,STARTER_WORDS[0]);html=collectionMarkup(p,'speaker','',true);
  assert.ok(html.includes('data-zoom="ghost" data-variant="color"'));
  assert.ok(html.includes('Écoute <b>3/3'));assert.ok(html.includes('3 écoutes + 3 mots'));
  assert.equal(chooseVariant(p,'ghost','color'),true);
  assert.ok(learningCardsMarkup(p,'speaker',true).includes('./images/color/ghost.png'));
});
test('Parcours guidé complet : toutes les couleurs et toutes les versions artiste atteignables', () => {
  for(let run=1;run<=12;run++) {
    const p=emptyProgress();let seed=run;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    let rounds=0;
    while(!WORDS.every(w=>isUnlocked(p,w.id,'art'))&&rounds<500) {
      for(const pack of availablePacks(p))openPack(p,pack.id);
      const pending=pendingWords(p)[0];if(pending)introduceWord(p,pending.id);
      const rec=recommend(p,pending?.id);const s=createSession(rec.mode,{targets:modeTargets(p,rec.mode),pool:knownWords(p),level:(w,c)=>skillLevel(p,w.id,rec.mode,c),firstCue:firstMemoryCue(p),forceTarget:rec.target,random});
      do {const q=s.questions[s.index];assert.ok(p.words[q.target.id].introduced);assert.ok(q.choices.every(w=>p.words[w.id].introduced));const result=answer(s,q.target.id);recordAnswer(p,s,result);} while(advance(s));
      p.completedSessions++;rounds++;
      // Reloads must preserve acquired skills, introductions and selected versions.
      assert.deepEqual(parseProgress(serializeProgress(p)),p);
    }
    assert.ok(rounds<500,`run ${run}: stalled at ${rounds}`);
    assert.equal(discoveredWords(p).length,WORDS.length);
    assert.ok(WORDS.every(w=>isUnlocked(p,w.id,'color')&&isUnlocked(p,w.id,'art')));
  }
});
