import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = (await readFile(new URL('../docs/app/speech.js', import.meta.url), 'utf8')).replaceAll('export ', '');
function setup(voices) {
  const spoken = [], listeners = {}, messages = [];
  let cancellations = 0;
  const synth = { getVoices: () => voices, speak: u => spoken.push(u), cancel: () => cancellations++, addEventListener: (event, fn) => listeners[event] = fn };
  const context = vm.createContext({ window: { speechSynthesis: synth }, SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } } });
  vm.runInContext(source + '\nthis.api = { speak, stopSpeech };', context);
  return { spoken, listeners, messages, context, synth, speak: word => context.api.speak(word, m => messages.push(m)), get cancellations() { return cancellations; } };
}
test('La voix britannique est prioritaire, même si la voix par défaut est française', () => {
  const french = { lang: 'fr-FR' }, american = { lang: 'en-US' }, british = { lang: 'en-GB' };
  const state = setup([french, american, british]);
  state.speak('pumpkin');
  assert.equal(state.spoken[0].voice, british);
  assert.equal(state.spoken[0].lang, 'en-GB');
  assert.equal(state.spoken[0].text, 'pumpkin');
  assert.equal(state.spoken[0].rate, 0.78);
  assert.equal(state.cancellations, 1);
});
test('Une autre voix anglaise convient si la voix britannique est absente', () => {
  const english = { lang: 'en-US' };
  const state = setup([{ lang: 'fr-FR' }, english]);
  state.speak('ghost');
  assert.equal(state.spoken[0].voice, english);
  assert.equal(state.spoken[0].lang, 'en-US');
});
test('Le chargement différé des voix conserve une demande explicite en anglais', () => {
  const voices = [];
  const state = setup(voices);
  state.speak('frog');
  assert.equal(state.spoken[0].lang, 'en-GB');
  voices.push({ lang: 'en-GB' });
  state.listeners.voiceschanged();
  state.speak('bat');
  assert.equal(state.spoken[1].voice, voices[0]);
  assert.equal(state.cancellations, 2);
});
test('Une erreur audio est signalée, une interruption volontaire est silencieuse', () => {
  const state = setup([]);
  state.speak('rat');
  state.spoken[0].onerror({ error: 'interrupted' });
  assert.equal(state.messages.length, 0);
  state.spoken[0].onerror({ error: 'audio-busy' });
  assert.match(state.messages[0], /volume/);
  state.spoken[0].onstart();
  state.spoken[0].onend();
  assert.match(state.messages.at(-1), /réécouter/);
});
test('Un navigateur sans synthèse vocale affiche une solution de repli', () => {
  const state = setup([]);
  delete state.context.window.speechSynthesis;
  state.speak('witch');
  assert.equal(state.spoken.length, 0);
  assert.match(state.messages[0], /Je regarde/);
});
