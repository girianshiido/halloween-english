let utterance = null;
export function stopSpeech() {
    if ('speechSynthesis' in window)
        window.speechSynthesis.cancel();
    utterance = null;
}
export function speak(word, status) {
    if (!('speechSynthesis' in window)) {
        status('La voix n’est pas disponible ici. Essaie Safari ou Chrome, ou le mode « Je regarde ».');
        return;
    }
    stopSpeech();
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const english = voices.filter(v => /^en[-_]/i.test(v.lang));
    const voice = english.find(v => /^en[-_]GB/i.test(v.lang)) ?? english[0];
    utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = voice?.lang ?? 'en-GB';
    if (voice)
        utterance.voice = voice;
    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.onstart = () => status('Écoute bien…');
    utterance.onend = () => status('Tu peux réécouter autant que tu veux.');
    utterance.onerror = event => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
            status('Pas de son ? Vérifie le volume et touche à nouveau le haut-parleur.');
        }
    };
    // Called synchronously from a tap, including Start and Next, for mobile Safari.
    synth.speak(utterance);
}
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices());
}
