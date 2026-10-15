# Retouches des illustrations

Outil utilisé : **image_gen intégré**, une retouche séparée pour chaque illustration.

Consigne commune : conserver le personnage, son expression et sa pose en noir et blanc ; retirer le cadre extérieur et la légende imprimée ; centrer le dessin entier sur fond blanc, sans ajout de décor. Pour le fantôme et la citrouille : retirer les points parasites et reconstruire des contours noirs continus.

Les consignes exactes de chaque appel sont dans [image-edits.json](image-edits.json). Les images finales sont dans [public/images](public/images) : ghost.png, pumpkin.png, vampire.png, monster.png, witch.png, bat.png, skeleton.png, spider.png, rat.png et frog.png. Les originaux restent disponibles dans le commit initial du dépôt.

## Versions couleur et artiste

Vingt retouches supplémentaires ont été réalisées avec **image_gen intégré**, à partir des dix dessins nettoyés. Une version couleur conserve les contours et utilise des aplats ; la version artiste conserve la pose et ajoute des couleurs, ombres et reflets plus raffinés.

Fichiers livrés : `public/images/color/` et `public/images/art/`, chacun avec ghost.png, vampire.png, pumpkin.png, monster.png, witch.png, bat.png, skeleton.png, spider.png, rat.png et frog.png. Consignes exactes dans [variant-prompts.json](variant-prompts.json). Les trente illustrations ont été inspectées ensemble dans la collection.

## Extension à vingt cartes — 14 octobre 2026

Trente nouvelles images produites avec **image_gen intégré** : dix dessins noir et blanc, dix mises en couleur fidèles et dix versions artiste. Les consignes exactes, références et chemins sont dans [expansion-prompts.json](expansion-prompts.json).

Fichiers finaux : `public/images/{owl,snake,crow,wolf,moon,skull,mask,candle,hat,sweet}.png`, et les mêmes noms dans `public/images/color/` et `public/images/art/`. Générations conservées dans le dossier d’images de Codex et copies finales enregistrées dans ce dépôt. Aucun ancien dessin remplacé.

## Harmonisation des dix cartes de départ — 14 octobre 2026

Trente images recréées avec **image_gen intégré**. Les dix dessins noir et blanc utilisent `owl.png` et `snake.png` comme références de style. Chaque nouveau dessin sert ensuite de cible pour ses variantes couleur et artiste, avec la version correspondante du hibou comme référence de finition. Les sujets restent ghost, vampire, pumpkin, monster, witch, bat, skeleton, spider, rat et frog.

Fichiers finaux : mêmes noms dans `public/images/`, `public/images/color/` et `public/images/art/`. Les anciennes trente images ont été copiées et vérifiées à l’octet près contre le dépôt avant remplacement dans `backups/illustrations-2026-10-14-before-style-refresh/` (copie locale hors du site). Consignes exactes dans [style-refresh-prompts.json](style-refresh-prompts.json).

## Masque — 15 octobre 2026

Remplacement du masque théâtral par un masque intégral de petit monstre, costume d’enfant pour Halloween. Deux ouvertures pour les yeux sans pupilles, quatre dents arrondies, deux cornes et attache visible. Les variantes couleur et artiste dérivent du même dessin. Outil image_gen intégré ; prompts et fichiers dans `mask-refresh-prompts.json`. Sauvegarde des trois anciens PNG et empreintes SHA-256 dans `backups/mask-2026-10-15-before-halloween-redraw/` (local uniquement).

## Petite sorcellerie — 15 octobre 2026

Six nouveaux sujets, chacun en noir et blanc, couleur et artiste : cat, broom, cauldron, wand, potion, spellbook. Image_gen intégré, dix-huit appels finaux distincts et variantes dérivées de leur dessin d’origine. La baguette étoilée initialement proposée a été remplacée à la demande de l’utilisateur par du bois noueux ; le grimoire arbore désormais un fermoir et un croissant de lune. Consignes exactes, fichiers générés et chemins finaux dans `sorcery-prompts.json`. Les essais abandonnés sont exclus du site et de Git.

## La maison mystérieuse — 15 octobre 2026

Dix-huit nouvelles illustrations créées avec image_gen intégré : maison hantée, porte, clé, coffre, lanterne et cloche, chacune en noir et blanc, couleur et artiste. Silhouettes cohérentes, fond blanc, objets anciens et détails Halloween adaptés aux enfants. Consignes exactes et chemins : `mystery-house-prompts.json`. Les fichiers sont dans `public/images/`, `public/images/color/` et `public/images/art/`, puis copiés dans `docs/images/`.
