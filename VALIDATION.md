# Vérifications — version du 14 octobre 2026

## Harmonisation visuelle — 14 octobre 2026

- Trois cartes décoratives réelles à l’accueil : ghost, bat et pumpkin. Leurs libellés suivent le réglage des articles.
- Fonds CSS très discrets, ombres et contrastes harmonisés, sans bibliothèque, police ou animation permanente supplémentaire.
- Rendu de l’accueil inspecté à 320 × 568 et 390 × 844. Largeur de contenu égale à la fenêtre à 320, 360, 390, 768 et 1024 px ; trois cartes présentes dans chaque format.
- Les vingt dessins noir et blanc comparés dans une planche de contrôle : les dix premiers ont été recréés pour correspondre au style des dix suivants.
- Trente nouvelles images inspectées en parallèle original/couleur/artiste avec le hibou de référence : poses et identités conservées, versions couleur à aplats et artiste avec volume et textures propres.
- Les dix originaux recréés chargent dans J’apprends, avec dix emplacements secrets anonymes.
- Sauvegarde locale des trente anciennes images : empreintes et comparaison à l’octet près contre le dépôt avant remplacement, toutes conformes. Dossier hors site et ignoré par Git.
- Compilation stricte réussie ; 29 tests automatisés réussis, dont la mise en cache des soixante illustrations. Aucun changement de clé ou de règles de progression dans cette mise à jour.


Dernière correction : 29 tests passent. Bouton « Repartir de zéro » dans l’aide, confirmation avec Annuler par défaut. Test navigateur sur sauvegarde fictive entièrement débloquée : annuler conserve le mémo et quatre choix ; confirmer puis recharger revient à deux choix, dix cartes originales à zéro, dix emplacements vides, articles activés et mémo masqué. Les mots trouvés ne reviennent plus dans la partie ; les mots ratés peuvent revenir une fois après une question intermédiaire. Cent parties avec erreurs alternées vérifient l’absence de répétitions consécutives ou de mots déjà trouvés. L’ancienne progression (formats 1 à 3) et les anciens scores sont effacés ; les nouvelles sauvegardes restent intactes après plusieurs ouvertures. Mémo reste fermé si une seule des dix cartes originales n’a que cinq réussites, indépendamment des autres cartes. J’apprends affiche dix cartes originales et dix emplacements anonymes, puis onze cartes et neuf emplacements après une découverte.

Les règles et résultats ci-dessous remplacent les seuils des versions historiques conservées plus bas.

- Catalogue de vingt mots ; dix cibles officielles au départ, dix nouvelles cartes en distracteurs seulement avant leur découverte.
- 24 tests automatisés réussis, dont la mise en cache des soixante illustrations.
- Les trente nouvelles illustrations inspectées ensemble : identité, contours, marges blanches et distinction entre aplats et rendu artiste.
- Collection complète : vingt cartes et soixante images chargées. Zoom de la version artiste du hibou, sélection manuelle puis image artiste retrouvée dans J’apprends ; voix confirmée « an owl ».
- TypeScript strict : compilation de l’application et du service worker réussie.
- Règles testées : seuil couleur 6, seuil artiste/mémo 6, dix chaînes de découverte, sauvegardes et migration des acquis, une réponse corrigée après erreur sans progrès, doubles clics ignorés.
- Difficulté : deux choix au départ, trois à la moitié des cartes au niveau 2, quatre au niveau 4 ; compteurs ordinaires et mémo indépendants. Moitié arrondie au supérieur.
- Sélection : priorité statistique aux cartes faibles et au maximum deux apparitions d’une même cible dans dix questions, 600 sessions et 200 tirages de contrôle de pondération.
- Navigateur, sauvegardes temporaires sur une origine locale séparée : erreur sur « skeleton », correction ensuite et compteur resté à zéro ; réussite « a frog » du premier coup, compteur 2 → 3 et prononciation exacte confirmée.
- Articles : propositions « a ghost », « a spider », « a candle » ; désactivation pendant la question retire les articles immédiatement, réactivation les rétablit. La voix reçoit « a spider » et « a vampire ».
- Mémo au niveau 2 : trois choix ; masque noir avec trou aléatoire de rayon 30 %, image et masque retirés après une seconde avant de révéler les mots.
- Mémo au niveau 4 : quatre choix et petit trou de rayon 18 %. Inspection visuelle sur 390 × 844 : aucun débordement horizontal (largeur page = fenêtre = 390 px).
- Alternance mémo : mot prononcé une fois, trois images, bouton initial masqué et zéro bouton de réécoute.
- À cinq points mémo : succès « monster » → six points, récompense artiste et découverte de « wolf ». Onze cartes visibles dans J’apprends, « owl » encore absente. Nouvelle carte conservée après rechargement.

## Limites

Les formats mobiles sont simulés dans le navigateur. Aucun nouvel essai d’installation sur téléphone physique n’a été réalisé. La voix hors ligne dépend des voix anglaises installées sur l’appareil. Les anciens compteurs sont conservés ; leur historique ne permet pas d’identifier rétroactivement les réponses obtenues du premier coup.

## Historique des versions précédentes

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
