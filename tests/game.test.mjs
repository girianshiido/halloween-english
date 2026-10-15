import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, questionChoices, answer, advance, WORDS, STARTER_WORDS, progressiveCount, memoryPeek, spokenWord } from '../docs/app/game.js';
function randomSeed(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
test('600 parties courtes : choix uniques, bonne réponse et seulement des cartes connues', () => {
  const positions = new Set();
  for (const mode of ['listen', 'read', 'memory']) for (const level of [0, 1, 2, 3]) for (let seed = 0; seed < 50; seed++) {
    const s = createSession(mode, { random: randomSeed(seed), level: () => level });
    assert.equal(s.questions.length, 4);
    assert.equal(new Set(s.questions.map(q => q.target.id)).size, 4);
    for (const q of s.questions) {
      assert.equal(q.choices.length, progressiveCount(level));
      assert.equal(new Set(q.choices.map(w => w.id)).size, q.choices.length);
      assert.equal(q.choices.filter(w => w.id === q.target.id).length, 1);
      assert.ok(q.choices.every(w => STARTER_WORDS.includes(w)));
      positions.add(q.choices.findIndex(w => w.id === q.target.id));
    }
  }
  assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
});
test('Une partie parfaite initiale se termine à quatre étoiles, sans répétition', () => {
  const s = createSession('listen');
  for (let i = 0; i < 4; i++) {
    assert.equal(answer(s, s.questions[s.index].target.id), 'correct');
    assert.equal(answer(s, s.questions[s.index].target.id), 'ignored');
    assert.equal(s.score, i + 1);
    assert.equal(advance(s), i < 3);
  }
  assert.equal(s.questions.length, 4);
  assert.equal(answer(s, WORDS[0].id), 'ignored');
  assert.equal(advance(s), false);
});
test('Une correction après erreur ne gagne pas une étoile et le mot trouvé ne revient plus', () => {
  const s = createSession('read');
  assert.equal(advance(s), false);
  const q = s.questions[0]; const wrong = q.choices.find(w => w !== q.target);
  assert.equal(answer(s, 'not-a-word'), 'ignored');
  assert.equal(s.attempts, 0);
  assert.equal(answer(s, wrong.id), 'retry');
  assert.equal(answer(s, wrong.id), 'ignored');
  assert.equal(s.attempts, 1);
  assert.equal(answer(s, q.target.id), 'correct');
  assert.equal(s.score, 0);
  while (advance(s)) answer(s, s.questions[s.index].target.id);
  assert.equal(s.questions.length, 4);
  assert.equal(s.questions.filter(item => item.target === q.target).length, 1);
});
test('Le mémo alterne et une cinquième question revoit un mot raté non consécutif', () => {
  const s = createSession('memory', { firstCue: 'once' });
  const first = s.questions[0];
  assert.equal(answer(s, first.choices.find(w => w !== first.target).id), 'incorrect');
  assert.equal(answer(s, first.target.id), 'ignored');
  for (let i = 1; i < 4; i++) { assert.equal(advance(s), true); answer(s, s.questions[s.index].target.id); }
  assert.equal(advance(s), true);
  assert.equal(s.questions.length, 5);
  assert.equal(s.questions[4].target, first.target);
  assert.equal(s.questions[4].review, true);
  assert.deepEqual(s.questions.map(q => q.cue), ['once','flash','once','flash','once']);
  answer(s, s.questions[4].choices.find(w => w !== first.target).id);
  assert.equal(advance(s), false);
});
test('Une seule révision, même avec seulement trois cibles mémo ou une erreur finale', () => {
  const s = createSession('memory', { targets: STARTER_WORDS.slice(0,3), pool: STARTER_WORDS });
  for (let i = 0; i < 3; i++) { const q = s.questions[s.index]; answer(s, q.choices.find(w => w !== q.target).id); assert.equal(advance(s), true); }
  assert.equal(s.questions.length, 4);
  const q = s.questions[s.index]; answer(s, q.choices.find(w => w !== q.target).id);
  assert.equal(advance(s), false);
  const perfect = createSession('memory', { targets: STARTER_WORDS.slice(0,3), pool: STARTER_WORDS });
  do { answer(perfect, perfect.questions[perfect.index].target.id); } while (advance(perfect));
  assert.equal(perfect.questions.length, 3);
});
test('Une cinquième carte peu avancée peut servir de révision sans dépasser cinq questions', () => {
  const s = createSession('listen', { targets: WORDS, pool: WORDS, random: randomSeed(8) });
  do { answer(s, s.questions[s.index].target.id); } while (advance(s));
  assert.equal(s.questions.length, 5);
  assert.equal(new Set(s.questions.map(q => q.target.id)).size, 5);
  assert.equal(s.questions[4].review, true);
});
test('300 parties avec erreurs : jamais deux fois de suite, jamais un mot déjà trouvé', () => {
  for(let seed=0;seed<300;seed++) {
    const s=createSession('memory',{targets:WORDS,pool:WORDS,random:randomSeed(seed)});
    const found=new Set();const seen=[];
    do {
      const q=s.questions[s.index];
      assert.ok(!found.has(q.target.id));
      assert.notEqual(q.target.id,seen.at(-1)); seen.push(q.target.id);
      if(s.index%2) {answer(s,q.target.id);found.add(q.target.id);} else answer(s,q.choices.find(w=>w!==q.target).id);
    } while(advance(s));
    assert.ok(s.questions.length<=5);
    for(const word of WORDS) assert.ok(seen.filter(id=>id===word.id).length<=2);
  }
});
test('La carte faible est privilégiée selon la compétence active', () => {
  let weak = 0;
  for(let seed=0;seed<400;seed++) {
    const s=createSession('read',{targets:WORDS,pool:WORDS,random:randomSeed(seed+90),level:w=>w.id==='ghost'?0:3});
    if(s.questions.some(q=>q.target.id==='ghost')) weak++;
  }
  assert.ok(weak > 300, `${weak}/400`);
});
test('Difficulté individuelle, trous mémo et articles', () => {
  assert.deepEqual([0,1,2,3].map(progressiveCount),[2,3,4,4]);
  assert.equal(memoryPeek(0),null);
  assert.equal(memoryPeek(1).radius,30);
  assert.equal(memoryPeek(2).radius,18);
  for(let i=0;i<100;i++) {const peek=memoryPeek(3); assert.ok(peek.x>=35&&peek.x<=65&&peek.y>=35&&peek.y<=65);}
  assert.equal(spokenWord(WORDS.find(w=>w.id==='owl')),'an owl');
  assert.equal(spokenWord(WORDS.find(w=>w.id==='moon')),'the Moon');
  assert.equal(spokenWord(WORDS[0],false),'ghost');
});
test('Entrées invalides refusées et petit pool sans doublon', () => {
  assert.throws(()=>createSession('invalid'));
  assert.throws(()=>createSession('listen',{targets:[]}));
  assert.throws(()=>createSession('listen',{targets:[WORDS[1]],pool:STARTER_WORDS}));
  assert.equal(questionChoices(STARTER_WORDS[0],4,Math.random,STARTER_WORDS.slice(0,2)).length,2);
});
test('La révision est facultative : terminer après les quatre questions reste possible', () => {
  const s=createSession('read',{targets:WORDS,pool:WORDS});
  for(let i=0;i<4;i++){answer(s,s.questions[s.index].target.id);assert.equal(advance(s,false),i<3);}
  assert.equal(s.questions.length,4);assert.equal(s.score,4);
});
