import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, answer, advance, WORDS, shuffle } from '../docs/app/game.js';
function randomSeed(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
test('Chaque combinaison propose dix questions et des distracteurs sans doublons', () => {
  const positions = new Set();
  for (const mode of ['listen', 'read']) for (const count of [2, 3, 4]) for (let seed = 0; seed < 100; seed++) {
    const s = createSession(mode, count, randomSeed(seed));
    assert.equal(s.questions.length, 10);
    assert.ok(s.questions.every(q => WORDS.slice(0, 10).includes(q.target)));
    for(const word of WORDS) assert.ok(s.questions.filter(q=>q.target.id===word.id).length<=2);
    for (const q of s.questions) {
      assert.equal(q.choices.length, count);
      assert.equal(new Set(q.choices.map(w => w.id)).size, count);
      assert.equal(q.choices.filter(w => w.id === q.target.id).length, 1);
      assert.ok(q.choices.every(w => WORDS.includes(w)));
      positions.add(q.choices.findIndex(w => w.id === q.target.id));
    }
  }
  assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
});
test('Une partie parfaite donne dix étoiles et se termine après dix questions', () => {
  const s = createSession('listen', 4, randomSeed(10));
  for (let i = 0; i < 10; i++) {
    const q = s.questions[s.index];
    assert.equal(answer(s, q.target.id), 'correct');
    assert.equal(answer(s, q.target.id), 'ignored');
    assert.equal(s.score, i + 1);
    assert.equal(advance(s), i < 9);
  }
  assert.equal(s.index, 10);
  assert.equal(answer(s, WORDS[0].id), 'ignored');
  assert.equal(advance(s), false);
});
test('Une erreur permet de réessayer sans gagner une étoile sur cette question', () => {
  const s = createSession('read', 3, randomSeed(3));
  assert.equal(advance(s), false);
  const q = s.questions[0];
  const wrong = q.choices.find(w => w.id !== q.target.id);
  assert.equal(answer(s, wrong.id), 'retry');
  assert.equal(answer(s, wrong.id), 'ignored');
  assert.equal(s.attempts, 1);
  assert.deepEqual(s.missed, [q.target.id]);
  assert.equal(answer(s, q.target.id), 'correct');
  assert.equal(s.score, 0);
  assert.equal(advance(s), true);
  assert.equal(s.attempts, 0);
  assert.deepEqual(s.rejected, []);
  assert.equal(answer(s, s.questions[1].target.id), 'correct');
  assert.equal(s.score, 1);
});
test('Les entrées invalides et les doubles clics ne changent pas le score', () => {
  assert.throws(() => createSession('invalid', 2));
  assert.throws(() => createSession('read', 5));
  const s = createSession('listen', 2);
  assert.equal(answer(s, 'not-a-word'), 'ignored');
  assert.equal(s.attempts, 0);
  answer(s, s.questions[0].target.id);
  for (let i = 0; i < 10; i++) answer(s, s.questions[0].target.id);
  assert.equal(s.score, 1);
});
test('Le mélange ne modifie pas le catalogue et varie les parties', () => {
  const before = [...WORDS];
  shuffle(WORDS, randomSeed(1));
  assert.deepEqual(WORDS, before);
  assert.notDeepEqual(createSession('read', 3, randomSeed(1)).questions, createSession('read', 3, randomSeed(2)).questions);
});

test('La sélection privilégie fortement les cartes faibles, sans dépasser deux occurrences',()=>{
  let seed=42;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const levels=Object.fromEntries(WORDS.map(w=>[w.id,30]));levels.ghost=0;
  let low=0,other=0;for(let i=0;i<200;i++){const s=createSession('memory',2,random,WORDS.slice(0,10),levels);low+=s.questions.filter(q=>q.target.id==='ghost').length;other+=s.questions.filter(q=>q.target.id==='vampire').length;assert.equal(s.questions.filter(q=>q.cue==='flash').length,5);}
  assert.ok(low>other*1.8);assert.ok(low<=400);
});
