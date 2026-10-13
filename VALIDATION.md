# Vérifications — 13 octobre 2026

- Compilation TypeScript stricte de l’application et du service worker.
- 14 tests automatisés réussis : 600 parties générées (deux modes × trois nombres de choix × 100 graines), scores, erreurs et nouvelles tentatives, doubles réponses, fin de partie, choix et chargement des voix anglaises, erreurs audio, ressources hors ligne, limites du service worker et icônes PNG.
- Parcours dans le navigateur : parties complètes dans les deux modes, avec 2, 3 et 4 réponses. Partie parfaite à 10/10 ; partie avec une erreur à 9/10 et une carte « À revoir ».
- Formats vérifiés : 320 × 568, 360 × 800, 390 × 844, 768 × 1024 et 1024 × 768. Contrôles du nombre de choix et de l’absence de débordement horizontal pendant les parcours. Inspection visuelle de l’accueil, des questions et du bilan.
- Les dix illustrations originales sont chargées et identifiées. La légende imprimée est masquée dans les questions ; les fichiers originaux restent intacts.
- Meilleurs scores retrouvés après rechargement, séparément pour chaque défi.
- Le panneau d’installation confirme la disponibilité hors ligne après la mise en cache.
- Serveurs locaux arrêtés, puis nouvel onglet ouvert sur le jeu : une partie de dix questions du mode « Je regarde » terminée à 10/10, avec les dix illustrations accessibles depuis le cache.

## Limites de vérification

Les dimensions mobiles et tablettes sont simulées dans le navigateur de test. L’installation depuis les menus d’un véritable iPhone ou d’un téléphone Android n’a pas été effectuée. Le manifeste, les icônes, le service worker et le parcours d’aide à l’installation sont vérifiés. La disponibilité de la prononciation hors ligne dépend d’une voix anglaise présente sur l’appareil.

## Mise à jour — illustrations et mode J’apprends

- Dix illustrations retouchées avec image_gen : cadres et légendes imprimées retirés ; contours du fantôme et de la citrouille nettoyés. Les dessins complets sont affichés sans recadrage.
- Nouveau mode « J’apprends » accessible depuis l’accueil, dix cartes avec prononciation au toucher. Le choix du nombre de réponses est masqué pour cette activité.
- Les cartes ont été retirées du bilan des défis ; score, record et boutons de relance sont conservés.
- Compilation réussie et 14 tests automatisés toujours au vert, dont la mise en cache des dix nouvelles images.
- Mode J’apprends ouvert et inspecté dans le navigateur ; rendu des dix cartes contrôlé. L’utilisateur a également vérifié le fonctionnement et demandé de terminer.

## Collection progressive et Mémo magique — 13 octobre 2026

- Trente illustrations inspectées dans la collection de test : silhouettes et expressions conservées entre original, couleur et artiste.
- 23 tests automatisés réussis, incluant les seuils, sauvegardes, déblocages et la mise en cache des trente images.
- Compteur par carte : une bonne réponse enregistrée, conservée après rechargement ; trois écoutes supplémentaires n’ont pas changé le compteur.
- Collection : dix originaux et vingt emplacements verrouillés au départ ; aucune image couleur ou artiste dans les vignettes verrouillées.
- Sauvegarde de test isolée : dix cartes à neuf réussites, puis partie parfaite à 10/10. Les dix couleurs ont été débloquées, Mémo magique est apparu, les dix versions artistes sont restées verrouillées et les dix choix actifs sont restés « Original ».
- Mémo magique : image observée après déclenchement, retirée avant les trois mots ; trois propositions seulement ; aucun bouton de réécoute. Question suivante audio, déclencheur masqué après usage et trois images affichées. Après une tentative, les trois réponses sont désactivées.
- À neuf réussites Mémo pour une carte, une bonne réponse a affiché la récompense artiste à 10/10. Tests moteur de dix parties normales suivies de dix parties Mémo : exactement vingt récompenses, sans changement automatique de version.
- Zoom ouvert sur une version artiste sans modifier le choix ; sélection manuelle d’une couleur retrouvée dans J’apprends après rechargement.
- Géométrie de téléphone 390 px : largeur de page et de contenu identiques ; rendu de la collection inspecté. Les tests utilisent un autre serveur et des sauvegardes temporaires, sans modifier la progression publique.

Les règles finales remplacent le premier prototype : une version artiste exige dix réussites **dans Mémo magique**, et non vingt réussites dans les défis classiques.
