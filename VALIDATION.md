# Petite sorcellerie — vérifications du 15 octobre 2026

Cette extension conserve la progression v5 et les records v3 de la version précédente. Elle ajoute six cartes et dix-huit PNG, pour un total de 26 cartes et 78 illustrations.

- Compilation TypeScript stricte réussie ; **41 tests automatisés réussis**, dont 600 parties générées, 300 parties avec erreurs et douze parcours complets jusqu’aux vingt-six versions artiste.
- Pack fermé avant vingt couleurs du premier parcours, disponible ensuite sans points mémo requis. Ouverture volontaire, deux cartes initiales puis découvertes par paires selon les couleurs du pack.
- Sauvegarde v5 antérieure au pack : compteurs, nombre de parties, images choisies et records conservés ; nouveaux mots initialisés à zéro et pack encore fermé.
- Ouverture persistante, cartes introduites avant cible ou distracteur, accès mémo selon la couleur et récompenses normales/mémo indépendantes.
- Cache hors ligne : 78 PNG, jeu, manifeste et icônes ; isolation du service worker conservée.
- Navigateur sur une origine locale distincte avec données fictives : vingt couleurs et fantôme artiste choisis retrouvés ; ouverture de Petite sorcellerie, présentation du chat, bouton de défi désactivé avant écoute, première question sur le chat avec deux réponses, aucun balai inconnu parmi les propositions.
- Réussite du chat du premier coup : Mot 0 → 1. Partie terminée à 3/4, ancien record 4/4 conservé. Après rechargement : 22 cartes visibles, quatre emplacements secrets du pack, compteur du chat à 1, fantôme toujours en version artiste.
- Balai : Mot 2 → 3 avec Écoute 3/3, récompense couleur, deux nouvelles cartes révélées ; le chaudron est présenté ensuite.
- Écrans de packs : aucune largeur excédentaire à 320, 360, 390, 768 et 1024 px. Inspection visuelle sur 390 × 844.
- Lecture du grimoire avec quatre réponses à 320 × 568 : « a spellbook » et « a cauldron » lisibles sur deux lignes, aucun texte coupé ou débordement horizontal. Texte envoyé à la voix : « a spellbook ».
- Collection complète : 26 cartes, 78 images chargées, zoom artiste du grimoire accessible. Planche des dix-huit nouvelles illustrations inspectée : noir et blanc, aplats, artiste ; silhouettes et poses cohérentes.
- Libellé du chat précisé en « a black cat », traduction « chat noir » ; vérification navigateur des textes et demandes vocales « a black cat » puis « black cat » sans article. Identifiant `cat` conservé pour préserver les acquis et les choix de variantes.
- Corrections graphiques demandées intégrées : baguette en bois noueux sans étoile, ancien grimoire à fermoir et croissant de lune. Consignes finales : `sorcery-prompts.json`.

Les essais mobiles sont simulés dans le navigateur ; aucune nouvelle installation sur téléphone physique n’a été effectuée. Le journal vocal de test vérifie les textes demandés, pas la qualité de chaque voix installée.

---

# Vérifications de la refonte précédente — 15 octobre 2026

Cette version remplace les anciennes règles de progression. Les validations des versions antérieures restent disponibles dans l’historique Git.

## Vérifications automatisées

- Compilation TypeScript stricte de l’application et du service worker réussie ; 35 tests réussis.
- 600 sessions générées : cibles distinctes, bonnes réponses présentes, propositions uniques, positions variées et seuls mots connus utilisés.
- 300 parties avec erreurs : aucun mot trouvé ne revient, aucune répétition consécutive, au plus deux apparitions d’un mot raté, cinq questions au maximum.
- Douze parcours guidés complets jusqu’aux vingt versions artiste : aucun blocage, chaque carte présentée avant interrogation, sauvegarde et rechargement simulés à chaque partie.
- Couleurs : 3 écoutes ET 3 lectures ; artiste : 3 images éclair ET 3 écoutes uniques. Compteurs plafonnés à trois, erreurs et doubles réponses sans progrès.
- Départ à quatre cartes, découvertes par paires selon les couleurs, mémo dès trois couleurs et seulement avec les cartes colorées.
- Difficulté indépendante par carte et compétence : deux, trois, puis quatre réponses. Les cartes peu avancées sont statistiquement prioritaires.
- Révision facultative : finir après quatre questions ou ajouter une seule question utile ; exception mémo à trois cibles, sans répétition artificielle.
- Sauvegardes v4 et records v2 effacés ; nouvelles sauvegardes v5 et records v3 conservés. Les données des autres jeux restent intactes.
- Recherche d’un indice dessiné dans le trou mémo et nombre d’essais borné même avec une image entièrement blanche.
- Voix anglaises, chargement différé, erreurs audio, articles, cache des soixante illustrations, manifeste, icônes et isolation du service worker.

## Essais dans le navigateur

Origines locales de test séparées, avec sauvegardes fictives ; aucune progression publique utilisée pour les scénarios de déblocage.

- Départ : quatre cartes (ghost, pumpkin, bat, witch), seize emplacements secrets, mémo absent.
- Partie de lecture terminée à 3/4 : erreur puis correction sur ghost, compteur resté à zéro ; trois autres réussites, sans répétition ; conseil de compétence au bilan.
- Ancienne sauvegarde entièrement débloquée : retour aux quatre cartes à zéro ; nouvelle réussite enregistrée puis conservée après rechargement.
- Articles désactivés et réactivés en question ; libellés et réponses actualisés. Prononciations transmises vérifiées dans un journal de test, notamment « a pumpkin » et « a vampire ».
- Deux couleurs : deux nouvelles cartes révélées ; vampire présenté seul, lancement du défi impossible avant écoute, puis vampire ciblé d’abord avec deux réponses. Monster n’apparaît pas encore parmi les réponses.
- Mémo accessible à trois couleurs ; trois propositions en image éclair au niveau 1, quatre en écoute unique au niveau 2.
- Cache noir : grand trou de 30 % après une réussite, petit trou de 18 % après deux. Image et cache retirés après une seconde avant les réponses ; recherche d’une zone dessinée pour éviter un indice entièrement blanc.
- Écoute unique : bouton initial masqué, aucun bouton de réécoute, choisir l’image ne prononce pas le mot une deuxième fois.
- Réussite image éclair de ghost : 2 → 3 avec écoute unique à 3/3, artiste débloqué ; ouverture du zoom et choix manuel de cette version.
- Quatre questions mémo terminées : deux boutons, « Voir mes étoiles » et « Une petite révision ? ». Révision acceptée, cinquième question puis bilan 5/5.
- Remise à zéro : Annuler sélectionné par défaut et acquis conservés ; confirmer puis recharger revient aux quatre cartes à zéro et au mémo masqué.
- Rendu final : aucun débordement horizontal de l’accueil à 320, 360, 390, 768 et 1024 px. Lecture à quatre propositions contrôlée à 320 px. Collection contrôlée à 320 px ; zoom et images inspectés.

## Nouveau masque

- Trois variantes générées avec image_gen intégré puis inspectées : même masque intégral de petit monstre, ouvertures sans pupilles, quatre dents arrondies, deux cornes et attache visible.
- Noir et blanc à contours propres ; couleur à aplats verts/violets/orangés ; artiste avec volume, éclairage doux et texture propre.
- Collection fictive complète : vingt cartes et soixante images chargées ; trois nouveaux PNG de mask présents et zoom artiste vérifié.
- Anciennes variantes sauvegardées hors site et hors Git avec leurs empreintes SHA-256. Prompts exacts : `mask-refresh-prompts.json`.

## Limites

Les formats mobiles et tablettes sont simulés dans le navigateur. Aucun nouvel essai sur téléphone physique n’a été réalisé. La voix hors ligne dépend des voix anglaises installées sur l’appareil. Le journal de prononciation de test confirme les textes et la fréquence des demandes ; il ne remplace pas une écoute sur chaque appareil.
