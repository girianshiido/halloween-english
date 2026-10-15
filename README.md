# Boo! English

Jeu éducatif d’Halloween indépendant en TypeScript : **vingt mots**, chacun avec trois illustrations (original, couleur, artiste). **Quatre cartes au départ**, puis des découvertes par paires. Aucun compte requis.

[Jouer directement](https://girianshiido.github.io/halloween-english/)

## Un petit parcours guidé

**Continuer mon aventure** propose la compétence à travailler : écouter ou reconnaître les mots, en privilégiant les cartes les moins avancées. Mémo magique est suggéré régulièrement lorsqu’il est disponible. Les activités restent accessibles librement depuis l’accueil.

Une partie contient **quatre questions différentes**, suivies d’**une révision facultative** lorsqu’un mot raté ou une autre carte peu avancée mérite d’être revu. Le joueur peut terminer directement ou accepter ce bonus. Avec seulement trois cartes colorées, le mémo commence par trois questions plutôt que répéter un mot déjà trouvé.

Les quatre premières cartes sont **ghost, pumpkin, bat et witch**. Chaque paire de cartes colorées révèle deux nouvelles cartes. L’aventure présente les nouveautés **une par une** : image, mot et écoute libre, puis un premier défi contenant cette carte. Une carte révélée peut aussi être présentée en l’écoutant dans J’apprends. Les mots encore secrets ou jamais présentés ne sont ni cibles ni distracteurs.

## Les activités

- **J’apprends** : les cartes révélées à écouter librement ; des emplacements anonymes attendent les autres cartes.
- **J’écoute** : entendre un mot et choisir l’image, avec réécoute libre.
- **Je regarde** : regarder une image et choisir le mot ; chaque réponse touchée est prononcée.
- **Ma collection** : quatre petits compteurs par carte, trois versions, zoom au toucher et choix manuel de la version utilisée.
- **Mémo magique**, dès **trois cartes colorées** : alterner une image montrée une seconde puis cachée et un mot entendu une seule fois. Seules les cartes colorées sont interrogées. Une seule tentative et aucune réécoute audio.

La touche **a / an / the** active les articles dans la prononciation et les textes anglais, par défaut : « a ghost », « an owl », « the Moon ». Le réglage persiste sur l’appareil et actualise les propositions pendant une question.

## Quatre compétences, deux récompenses

Seule une **bonne réponse du premier coup** gagne une étoile et fait progresser une compétence. Les défis ordinaires permettent de corriger une erreur pour apprendre, sans faire monter la carte. Écouter librement, cliquer deux fois ou toucher un distracteur ne donne aucun progrès. Les compteurs sont plafonnés à trois, mais toutes les cartes restent jouables.

| Récompense | Conditions par carte |
| --- | --- |
| Couleur | **3 réussites J’écoute + 3 réussites Je regarde** |
| Artiste | **3 images éclair + 3 écoutes uniques** dans Mémo magique |
| Deux nouvelles cartes | Chaque **paire de cartes colorées** |
| Accès à Mémo magique | **3 cartes colorées** |

Les versions artiste sont des récompenses facultatives : elles ne bloquent pas les nouvelles cartes. Une récompense ne change jamais automatiquement la version choisie. Chaque déblocage est conservé sur l’appareil.

## Difficulté et révisions

Chaque carte a son propre niveau **dans chacune des quatre compétences** : deux réponses avec zéro réussite, trois après une réussite, quatre après deux réussites. La difficulté est recalculée à chaque question, indépendamment des autres cartes. Une nouvelle carte débute toujours à deux choix.

Les cibles sont tirées sans répétition avec une pondération inverse du carré du niveau actif augmenté de un. La carte la moins avancée dans sa compétence faible ouvre le défi guidé. En mémo, la première compétence favorise celle ayant le moins de réussites, puis les questions alternent.

Un mot trouvé ne revient jamais dans la même partie, même après correction. Une carte ratée peut revenir **une seule fois**, en révision, après au moins une autre question. Deux mots identiques ne se suivent jamais ; au maximum cinq questions, sans remplir artificiellement une partie avec des mots déjà trouvés.

Les images éclair sont d’abord entières. Après **une réussite en image éclair**, un cache noir ne laisse voir qu’un grand trou aléatoire ; après **deux**, le trou est plus petit. Le trou recherche une zone contenant réellement un détail dessiné. L’image disparaît toujours après une seconde, avant l’affichage des propositions.

## Sauvegardes et remise à zéro

Cette mise à jour **efface l’ancienne progression et les anciens records une seule fois** : nouvelle progression de format 5, scores v3, aucune migration des anciens compteurs. Les nouvelles réussites sont ensuite conservées après rechargement, avec les cartes présentées, les versions choisies et le parcours guidé. Ajouter un futur pack devra conserver ces identifiants et ce format pour garder les acquis.

Le bouton **Repartir de zéro**, dans l’aide « ? », demande confirmation avec **Annuler** sélectionné par défaut. Confirmer efface uniquement les données de ce jeu sur l’appareil et revient aux quatre cartes initiales, deux choix et articles activés. Annuler conserve les acquis. Les données des autres jeux ne sont jamais touchées.

Tout reste dans le navigateur, sans compte ni serveur de données de jeu. Les polices Google Fonts sont facultatives. Le verrouillage des illustrations est une règle locale de jeu.

## Installer comme application

Le bouton **Installer** explique les étapes adaptées à l’appareil. Sur Android avec Chrome ou Edge, confirmer l’installation proposée par le navigateur. Sur iPhone et iPad, ouvrir le lien dans Safari puis **Partager → Sur l’écran d’accueil → Ajouter**. Le manifeste utilise le mode autonome et fournit des icônes classiques, adaptatives et Apple.

Après la première ouverture connectée, le jeu, ses soixante images et ses icônes sont mis en cache. Le panneau d’installation indique quand le jeu est prêt hors ligne. La voix anglaise hors ligne dépend des voix disponibles sur l’appareil ; le mode « Je regarde » fonctionne sans son. Les polices système prennent le relais sans réseau. Aucune boutique d’applications n’est nécessaire.

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

ghost, vampire, pumpkin, monster, witch, bat, skeleton, spider, rat, frog, owl, snake, crow, wolf, Moon, skull, mask, candle, hat, sweet.

## Harmonisation graphique

Les dix cartes de départ ont été redessinées avec image_gen intégré dans le style des dix cartes suivantes : contours noirs lisses, formes arrondies, grands yeux expressifs et présentation enfantine. Leurs versions couleur et artiste suivent le nouveau dessin. Les trente anciennes images sont conservées localement dans `backups/illustrations-2026-10-14-before-style-refresh/`, avec un manifeste d’empreintes ; ce dossier est exclu du site et de Git. Les consignes exactes sont dans `style-refresh-prompts.json`.

L’accueil présente désormais trois cartes (fantôme, chauve-souris et citrouille). Fonds très discrets, ombres légères, boutons et contrastes sont harmonisés en CSS, sans nouvelle bibliothèque, police ou animation permanente. Les cartes restent lisibles de 320 px à la tablette. Cette harmonisation graphique est conservée dans le nouveau parcours.

## Vérifications

Tests automatisés : 600 parties générées, 300 parties avec erreurs et douze parcours guidés complets jusqu’aux vingt versions artiste. Vérifications des compétences séparées, seuils, découvertes, introductions, révision facultative, absence de répétitions consécutives, sauvegardes, articles, voix et cache hors ligne. Les essais de rendu sont consignés dans `VALIDATION.md`.

## Masque d’Halloween — 15 octobre 2026

Le masque théâtral a été remplacé par un masque de petit monstre que porterait un enfant : ouvertures pour les yeux, petites cornes, quatre dents arrondies et attache élastique visible. Les trois variantes conservent la même silhouette : noir et blanc, aplats verts/violets/orangés, puis illustration artiste avec volumes et texture. Création avec image_gen intégré ; consignes exactes dans `mask-refresh-prompts.json`. Les trois anciennes images sont sauvegardées localement dans `backups/mask-2026-10-15-before-halloween-redraw/`, hors Git et hors site.

## Voix anglaise

La sélection des voix et leur chargement suivent l’API documentée par [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Aucun microphone n’est requis.

Projet indépendant : aucune dépendance ni modification de « Fabrique des mots » ou d’un autre projet.
