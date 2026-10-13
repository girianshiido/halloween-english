export {};
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
const button = document.querySelector<HTMLButtonElement>('#install')!;
const dialog = document.querySelector<HTMLDialogElement>('#install-dialog')!;
const action = document.querySelector<HTMLButtonElement>('#install-now')!;
const instructions = document.querySelector<HTMLElement>('#install-instructions')!;
const status = document.querySelector<HTMLElement>('#offline-status')!;
const display = window.matchMedia('(display-mode: standalone)');
let prompt: InstallPromptEvent | null = null;
const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function update(): void {
  const installed = display.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  button.hidden = installed;
  action.hidden = !prompt;
  instructions.innerHTML = prompt
    ? '<p>Touche « Installer le jeu », puis confirme dans la fenêtre de ton navigateur.</p>'
    : isAppleMobile
      ? '<ol><li>Ouvre ce lien dans <strong>Safari</strong>.</li><li>Touche <strong>Partager</strong> (le carré avec une flèche).</li><li>Choisis <strong>Sur l’écran d’accueil</strong>, puis <strong>Ajouter</strong>. Si proposé, laisse « Ouvrir comme app web » activé.</li></ol>'
      : '<p>Dans le menu de ton navigateur, choisis <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>. Sur ordinateur, l’option peut aussi apparaître dans la barre d’adresse.</p>';
}
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  prompt = event as InstallPromptEvent;
  update();
});
window.addEventListener('appinstalled', () => {
  prompt = null;
  button.hidden = true;
  dialog.close();
});
display.addEventListener('change', update);
button.addEventListener('click', () => { update(); dialog.showModal(); });
document.querySelector('#close-install')!.addEventListener('click', () => dialog.close());
document.querySelector('#install-done')!.addEventListener('click', () => dialog.close());
action.addEventListener('click', async () => {
  const pending = prompt;
  if (!pending) return;
  prompt = null;
  action.disabled = true;
  try {
    await pending.prompt();
    const choice = await pending.userChoice;
    if (choice.outcome === 'accepted') dialog.close();
  } catch { /* Instructions remain available if the prompt is dismissed or fails. */ }
  action.disabled = false;
  update();
});
update();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(async () => {
    await navigator.serviceWorker.ready;
    status.textContent = '✓ Le jeu et toutes ses illustrations sont prêts pour jouer hors ligne.';
  }).catch(() => {
    status.textContent = 'Le jeu fonctionne en ligne. Rouvre-le avec une connexion pour préparer le mode hors ligne.';
  });
} else {
  status.textContent = 'Ce navigateur permet de jouer en ligne. Essaie Safari ou Chrome pour garder le jeu sur ton écran.';
}
