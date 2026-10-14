# Boo! English

Jeu éducatif d’Halloween indépendant en TypeScript : **vingt mots**, chacun avec trois illustrations (original, couleur, artiste). Dix amis sont disponibles au départ, dix autres se découvrent progressivement. Aucun compte requis.

[Jouer directement](https://girianshiido.github.io/halloween-english/)

## Les activités

- **J’apprends** : toutes les cartes déjà découvertes, à écouter librement.
- **J’écoute** : entendre un mot et choisir l’image.
- **Je regarde** : regarder une image et choisir le mot ; chaque réponse touchée est prononcée.
- **Ma collection** : compteurs, trois versions, zoom au toucher et choix manuel de la version utilisée.
- **Mémo magique**, une fois les dix premières couleurs débloquées : cinq images montrées une seconde puis cachées et cinq mots entendus une seule fois. Une seule tentative, aucune réécoute audio.

La touche **a / an / the** active les articles dans les prononciations et les textes anglais, par défaut : « a ghost », « an owl », « the Moon ». Le réglage persiste sur l’appareil et actualise les propositions même pendant une question.

## Progression

Seule une **bonne réponse du premier coup** gagne une étoile et augmente le compteur. Les défis ordinaires permettent de corriger une erreur pour apprendre, sans faire monter la carte. Écouter une carte, cliquer deux fois ou répondre à un distracteur ne donne aucun progrès.

**Six réussites normales** débloquent la couleur. Les dix premières couleurs ouvrent définitivement l’accès à Mémo magique. Les cartes découvertes rejoignent ce mode quand leur couleur est débloquée. **Six réussites mémo** débloquent la version artiste, et pour chaque carte officielle une nouvelle carte :

| Ami officiel | Nouvelle carte |
| --- | --- |
| ghost | owl |
| vampire | snake |
| pumpkin | crow |
| monster | wolf |
| witch | Moon |
| bat | skull |
| skeleton | mask |
| spider | candle |
| rat | hat |
| frog | sweet |

Les cartes secrètes peuvent apparaître comme distracteurs mais ne deviennent jamais des cibles avant leur découverte. Elles restent absentes des galeries jusque-là. Une récompense ne change jamais automatiquement la version choisie.

## Difficulté progressive et révisions

Deux propositions au départ. Trois dès qu’au moins la moitié des cartes éligibles atteint **deux réussites**, quatre dès que la moitié atteint **quatre réussites**. Le seuil est arrondi au supérieur pour un nombre impair de cartes. Les défis ordinaires utilisent les cartes découvertes et leur compteur normal ; le mémo utilise les cartes avec couleur et leur compteur mémo. La difficulté est recalculée à chaque question.

Chaque partie comporte dix questions. Les cibles sont tirées avec une pondération inverse du carré de leur niveau augmenté de un : les cartes peu trouvées sont prioritaires. Une carte trouvée ne revient jamais dans la même partie, même si elle a été corrigée après une erreur. Une carte ratée peut revenir une seule fois, après au moins une autre question. Deux mots identiques ne se suivent jamais. La sélection reste aléatoire ; une partie ne garantit pas de présenter toutes les cartes.

Au niveau mémo **2**, un cache noir masque l’image, sauf un trou placé aléatoirement près du centre du dessin. Au niveau **4**, ce trou est plus petit. Dans les deux cas, l’image disparaît toujours après une seconde et les propositions apparaissent ensuite.

## Sauvegardes et confidentialité

Deux compteurs indépendants par carte : normal et mémo. À partir de cette mise à jour, **l’ancienne progression et les anciens scores sont effacés**. Le nouveau jeu utilise des clés dédiées (progression format 4 et scores v2), sans migration des anciens compteurs. La remise à zéro n’efface jamais les acquis enregistrés ensuite, les préférences d’articles ou les données d’autres jeux. J’apprends affiche les dix cartes originales et des emplacements anonymes pour les dix nouvelles cartes ; chaque emplacement devient une carte jouable uniquement après son déblocage.

Tout reste dans le navigateur, sans compte ni serveur de données de jeu. Les polices Google Fonts sont facultatives. Le verrouillage des illustrations est une règle locale de jeu, pas une protection de fichiers privés.

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

## Vérifications

Tests automatisés du moteur : 600 parties couvrant les deux modes et les trois difficultés, cibles découvertes, répétition limitée à deux et priorité aux cartes faibles, présence de la bonne réponse, diversité des positions, scores, erreurs, doubles réponses et fin de partie. Les vérifications de rendu et de parcours sont consignées dans `VALIDATION.md`.

## Voix anglaise

La sélection des voix et leur chargement suivent l’API documentée par [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). Aucun microphone n’est requis.

Projet indépendant : aucune dépendance ni modification de « Fabrique des mots » ou d’un autre projet.
