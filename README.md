# Boo! English

Jeu éducatif d’Halloween autonome en TypeScript. Dix illustrations originales en noir et blanc, deux modes (« J’écoute » et « Je regarde »), et 2, 3 ou 4 réponses au choix. Chaque partie présente les dix mots une fois, dans un ordre aléatoire.

## Jouer

https://girianshiido.github.io/halloween-english/

Aucun compte, aucune installation. Compatible avec les navigateurs récents sur ordinateur, tablette et smartphone. Pour le mode écoute, activer le son. La prononciation utilise la synthèse vocale du navigateur avec une voix anglaise (britannique en priorité). Les mots sont prononcés à la suite d’une action tactile pour respecter les restrictions mobiles. La disponibilité et la qualité des voix dépendent de l’appareil et du navigateur. En cas d’échec, un message invite à vérifier le son ou à changer de navigateur.

Une étoile est attribuée si la première réponse est correcte. Après une erreur, l’enfant peut réessayer sans limite de temps. Le bilan permet de réécouter les dix mots et identifie ceux à revoir. Le meilleur score est conservé séparément pour chaque mode et nombre de choix dans le stockage local, sans serveur ni collecte de données de jeu. Les polices Google Fonts sont facultatives : des polices système prennent le relais si elles ne sont pas accessibles.

## Installer comme application

Le bouton **Installer** explique les étapes adaptées à l’appareil. Sur Android avec Chrome ou Edge, confirmer l’installation proposée par le navigateur. Sur iPhone et iPad, ouvrir le lien dans Safari puis **Partager → Sur l’écran d’accueil → Ajouter**. Le manifeste utilise le mode autonome et fournit des icônes classiques, adaptatives et Apple.

Après la première ouverture connectée, le jeu, ses dix images et ses icônes sont mis en cache. Le panneau d’installation indique quand le jeu est prêt hors ligne. La voix anglaise hors ligne dépend des voix disponibles sur l’appareil ; le mode « Je regarde » fonctionne sans son. Les polices système prennent le relais sans réseau. Aucune boutique d’applications n’est nécessaire.

Le cache et le service worker restent limités au chemin de ce dépôt. Une nouvelle version attend la fermeture des anciennes fenêtres du jeu pour remplacer la précédente sans interrompre une partie.

## Développement

Node.js 22 ou ultérieur et pnpm.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
pnpm preview
```

Le site statique est compilé dans `docs/`, publié par GitHub Pages depuis `main:/docs`. Les chemins des fichiers sont relatifs pour fonctionner sous le préfixe du dépôt. Aucun service ni clé API ne sont nécessaires. Les illustrations originales, téléchargées depuis la bibliothèque ChatGPT de l’utilisateur, sont dans `public/images/` et ne sont pas redessinées.

## Vocabulaire

ghost, vampire, pumpkin, monster, witch, bat, skeleton, spider, rat, frog.

## Vérifications

Tests automatisés du moteur : 600 parties couvrant les deux modes et les trois difficultés, unicité des questions, présence de la bonne réponse, diversité des positions, scores, erreurs, doubles réponses et fin de partie. Les vérifications de rendu et de parcours sont consignées dans `VALIDATION.md`.

## Voix anglaise

La sélection des voix et leur chargement suivent l’API documentée par [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Aucun microphone n’est requis.

Projet indépendant : aucune dépendance ni modification de « Fabrique des mots » ou d’un autre projet.
