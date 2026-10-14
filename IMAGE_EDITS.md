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
