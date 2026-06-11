# ☉ ☾ Fonds d'écran astrologiques automatiques

Ce dépôt change automatiquement les fonds d'écran du téléphone selon le ciel
du moment (mêmes positions que l'application **AstroTab+**, zodiaque tropical,
peintures de Johfra Bosschart) :

- **Écran de verrouillage** ← signe où se trouve le **Soleil** (change ~1×/mois)
- **Écran d'accueil** ← signe où se trouve la **Lune** (change ~tous les 2,5 jours)

## Comment ça marche

Toutes les 2 heures, un robot GitHub (`.github/workflows/astro-wallpapers.yml`)
exécute `scripts/update_wallpapers.py`, qui calcule la longitude écliptique du
Soleil et de la Lune et copie le tableau du signe correspondant vers deux
adresses **fixes** :

| Image | Adresse |
|---|---|
| Soleil (verrouillage) | `https://raw.githubusercontent.com/EasyWebFunny/user.github.io/claude/astro-lockscreen-homescreen-sync-863mgt/astro/sun.jpg` |
| Lune (accueil) | `https://raw.githubusercontent.com/EasyWebFunny/user.github.io/claude/astro-lockscreen-homescreen-sync-863mgt/astro/moon.jpg` |

Le fichier `astro/status.json` indique les signes actuels, et la page
`index.html` affiche le tout en direct.

## Configuration sur le téléphone (une seule fois)

Un site web ne peut pas modifier lui-même les fonds d'écran d'Android : il faut
une petite appli d'automatisation **gratuite** qui télécharge les deux images et
les applique. Recommandé : **MacroDroid** (Play Store).

### Macro MacroDroid « Fonds d'écran astro »

1. Installer **MacroDroid**, créer une macro.
2. **Déclencheur** : *Jour/Heure* → tous les jours à **06:00** (ajouter
   éventuellement un 2ᵉ déclencheur à 18:00, la Lune bouge vite).
3. **Actions**, dans cet ordre :
   1. *Requête HTTP (GET)* → URL **sun.jpg** ci-dessus → « Enregistrer la
      réponse dans un fichier » → `sun.jpg`
   2. *Définir le fond d'écran* → **Écran de verrouillage** → choisir le
      fichier `sun.jpg` téléchargé
   3. *Requête HTTP (GET)* → URL **moon.jpg** ci-dessus → fichier `moon.jpg`
   4. *Définir le fond d'écran* → **Écran d'accueil** → fichier `moon.jpg`
4. Tester la macro (bouton ▶), puis l'activer.

### Réglages Xiaomi (MIUI/HyperOS) importants

- Paramètres → Applis → MacroDroid → **Démarrage automatique : activé** et
  Économie de batterie : **Aucune restriction** (sinon la macro ne tournera pas
  la nuit).
- Désactiver le **carrousel de fonds d'écran** de verrouillage Xiaomi s'il est
  actif, sinon il écrasera l'image.

*Alternative : l'appli gratuite **Automate** (LlamaLab) fait la même chose avec
les blocs « HTTP request » + « Wallpaper set » (qui accepte un chemin de
fichier et l'écran de verrouillage).*

## Lancer / vérifier à la main

```bash
python3 scripts/update_wallpapers.py   # met à jour astro/sun.jpg, astro/moon.jpg, astro/status.json
```

Le workflow peut aussi être lancé manuellement : onglet **Actions** du dépôt →
« Fonds d'écran astro (Soleil / Lune) » → *Run workflow*.

> **Note** : GitHub désactive les workflows planifiés après ~60 jours sans
> activité sur le dépôt ; si les images ne bougent plus, ouvrir l'onglet
> Actions et réactiver le workflow.
