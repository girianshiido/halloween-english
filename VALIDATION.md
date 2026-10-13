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
