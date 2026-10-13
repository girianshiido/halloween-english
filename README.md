# Boo! English

Jeu éducatif d’Halloween autonome en TypeScript. Dix illustrations en noir et blanc, quatre modes (« J’apprends », « J’écoute », « Je regarde » et « Ma collection »), et 2, 3 ou 4 réponses au choix dans les défis. Chaque partie présente les dix mots une fois, dans un ordre aléatoire.

## Jouer

https://girianshiido.github.io/halloween-english/

Aucun compte, aucune installation. Compatible avec les navigateurs récents sur ordinateur, tablette et smartphone. Pour le mode écoute, activer le son. La prononciation utilise la synthèse vocale du navigateur avec une voix anglaise (britannique en priorité). Les mots sont prononcés à la suite d’une action tactile pour respecter les restrictions mobiles. La disponibilité et la qualité des voix dépendent de l’appareil et du navigateur. En cas d’échec, un message invite à vérifier le son ou à changer de navigateur.

Une étoile est attribuée si la première réponse est correcte. Après une erreur, l’enfant peut réessayer sans limite de temps. Le bilan affiche les étoiles gagnées et les boutons pour rejouer ou changer de défi. Le mode « J’apprends », accessible directement depuis l’accueil, présente les dix cartes avec le mot anglais et sa traduction ; toucher une carte prononce le mot, sans score ni limite de temps. Le meilleur score est conservé séparément pour chaque mode et nombre de choix dans le stockage local, sans serveur ni collecte de données de jeu. Les polices Google Fonts sont facultatives : des polices système prennent le relais si elles ne sont pas accessibles.

## Collection et récompenses

Chaque bonne identification dans « J’écoute » ou « Je regarde » ajoute **une réussite au compteur de l’image cible**, même après un nouvel essai. Les doubles réponses et les clics d’écoute ne comptent pas. À **10 réussites par carte**, sa version couleur fidèle est débloquée. Elle n’est jamais sélectionnée automatiquement.

Quand les **dix versions couleur sont débloquées**, un cinquième mode apparaît : **Mémo magique**. Ce défi alterne cinq questions de chaque type :

- **Image éclair** : après « Regarder 1 seconde », l’image préchargée apparaît pendant 1 000 ms, puis est retirée. Les trois mots apparaissent ensuite. Il n’est pas possible de revoir l’image.
- **Mot secret** : après « Écouter une seule fois », le mot anglais est prononcé et les trois images apparaissent. Aucun bouton de réécoute n’est proposé.

Une seule tentative par question. Une erreur affiche la correction et permet de continuer, sans réussite supplémentaire. Une réussite dans Mémo magique ajoute un point au compteur Mémo de la carte cible, ainsi qu’à son total de bonnes identifications. **10 réussites Mémo par carte** débloquent définitivement sa version artiste. Les défis classiques ne font jamais progresser ce second compteur. En cas d’erreur audio, la question peut être passée sans point.

« Ma collection » présente les trois emplacements de chaque personnage avec son compteur. Les versions encore verrouillées ne sont pas affichées. Toucher une image débloquée l’ouvre dans un **zoom** ; un bouton séparé permet de sélectionner la version utilisée dans « J’apprends » et les défis. Le dessin original reste disponible. Les images décoratives de l’accueil restent en noir et blanc.

Compteurs et choix sont enregistrés sur cet appareil et dans ce navigateur, sans compte, séparément des anciens meilleurs scores. Les parties antérieures à cette fonction ne sont pas reconstituées à partir d’un score global. Si le stockage est indisponible, un message l’indique et le jeu reste utilisable pendant la visite.

Les trente images sont mises en cache pour rester accessibles hors ligne, y compris les récompenses une fois débloquées. Les verrouillages constituent une mécanique de jeu locale, pas un contrôle d’accès à des fichiers privés.

## Installer comme application

Le bouton **Installer** explique les étapes adaptées à l’appareil. Sur Android avec Chrome ou Edge, confirmer l’installation proposée par le navigateur. Sur iPhone et iPad, ouvrir le lien dans Safari puis **Partager → Sur l’écran d’accueil → Ajouter**. Le manifeste utilise le mode autonome et fournit des icônes classiques, adaptatives et Apple.

Après la première ouverture connectée, le jeu, ses trente images et ses icônes sont mis en cache. Le panneau d’installation indique quand le jeu est prêt hors ligne. La voix anglaise hors ligne dépend des voix disponibles sur l’appareil ; le mode « Je regarde » fonctionne sans son. Les polices système prennent le relais sans réseau. Aucune boutique d’applications n’est nécessaire.

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

Le site statique est compilé dans `docs/`, publié par GitHub Pages depuis `main:/docs`. Les chemins des fichiers sont relatifs pour fonctionner sous le préfixe du dépôt. Aucun service ni clé API ne sont nécessaires. Les illustrations sont dans `public/images/`. Les cadres et les légendes imprimées ont été retirés avec l’outil de retouche d’images ; le fantôme et la citrouille ont été débarrassés de leurs points parasites. Les originaux restent disponibles dans le premier commit du dépôt. Voir `IMAGE_EDITS.md` pour les consignes de retouche.

## Vocabulaire

ghost, vampire, pumpkin, monster, witch, bat, skeleton, spider, rat, frog.

## Vérifications

Tests automatisés du moteur : 600 parties couvrant les deux modes et les trois difficultés, unicité des questions, présence de la bonne réponse, diversité des positions, scores, erreurs, doubles réponses et fin de partie. Les vérifications de rendu et de parcours sont consignées dans `VALIDATION.md`.

## Voix anglaise

La sélection des voix et leur chargement suivent l’API documentée par [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Aucun microphone n’est requis.

Projet indépendant : aucune dépendance ni modification de « Fabrique des mots » ou d’un autre projet.
