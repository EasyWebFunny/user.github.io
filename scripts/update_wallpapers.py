#!/usr/bin/env python3
"""Met à jour astro/sun.jpg et astro/moon.jpg selon la position du Soleil
et de la Lune dans le zodiaque tropical (mêmes positions qu'Astro Tab+).

Calculs basés sur les formules de Paul Schlyter ("Computing planetary
positions"), précision ~0.01° pour le Soleil et ~0.3° pour la Lune,
largement suffisante pour déterminer un signe de 30°.
"""

import json
import math
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

# Dimensions de l'écran du téléphone cible (Xiaomi, 1220×2712).
WALL_W, WALL_H = 1220, 2712
# Zoom léger du tableau : >1 agrandit (rogne un peu les bords gauche/droit).
ZOOM = 1.12

SIGNS = [
    ("aries", "Bélier"),
    ("taurus", "Taureau"),
    ("gemini", "Gémeaux"),
    ("cancer", "Cancer"),
    ("leo", "Lion"),
    ("virgo", "Vierge"),
    ("libra", "Balance"),
    ("scorpio", "Scorpion"),
    ("sagittarius", "Sagittaire"),
    ("capricorn", "Capricorne"),
    ("aquarius", "Verseau"),
    ("pisces", "Poissons"),
]

ROOT = Path(__file__).resolve().parent.parent
ASTRO = ROOT / "astro"


def rev(deg):
    return deg % 360.0


def days_since_j2000(dt):
    """Jours depuis le 0 janvier 2000, 0h TU (époque de Schlyter)."""
    j2000 = datetime(1999, 12, 31, 0, 0, 0, tzinfo=timezone.utc)
    return (dt - j2000).total_seconds() / 86400.0


def sun_longitude(d):
    w = rev(282.9404 + 4.70935e-5 * d)
    e = 0.016709 - 1.151e-9 * d
    M = rev(356.0470 + 0.9856002585 * d)

    Mr = math.radians(M)
    E = M + math.degrees(e) * math.sin(Mr) * (1.0 + e * math.cos(Mr))
    Er = math.radians(E)
    xv = math.cos(Er) - e
    yv = math.sqrt(1.0 - e * e) * math.sin(Er)
    v = math.degrees(math.atan2(yv, xv))
    return rev(v + w)


def moon_longitude(d):
    N = rev(125.1228 - 0.0529538083 * d)
    i = 5.1454
    w = rev(318.0634 + 0.1643573223 * d)
    a = 60.2666
    e = 0.054900
    M = rev(115.3654 + 13.0649929509 * d)

    # Équation de Kepler (itération)
    Mr = math.radians(M)
    E = M + math.degrees(e) * math.sin(Mr) * (1.0 + e * math.cos(Mr))
    for _ in range(10):
        Er = math.radians(E)
        E = E - (E - math.degrees(e) * math.sin(Er) - M) / (1.0 - e * math.cos(Er))
    Er = math.radians(E)

    xv = a * (math.cos(Er) - e)
    yv = a * (math.sqrt(1.0 - e * e) * math.sin(Er))
    v = math.degrees(math.atan2(yv, xv))
    r = math.sqrt(xv * xv + yv * yv)

    # Coordonnées écliptiques
    Nr = math.radians(N)
    vwr = math.radians(rev(v + w))
    ir = math.radians(i)
    xh = r * (math.cos(Nr) * math.cos(vwr) - math.sin(Nr) * math.sin(vwr) * math.cos(ir))
    yh = r * (math.sin(Nr) * math.cos(vwr) + math.cos(Nr) * math.sin(vwr) * math.cos(ir))
    lon = rev(math.degrees(math.atan2(yh, xh)))

    # Perturbations principales (évection, variation, équation annuelle…)
    Ms = rev(356.0470 + 0.9856002585 * d)  # anomalie moyenne du Soleil
    ws = rev(282.9404 + 4.70935e-5 * d)
    Ls = rev(Ms + ws)          # longitude moyenne du Soleil
    Lm = rev(N + w + M)        # longitude moyenne de la Lune
    D = rev(Lm - Ls)           # élongation moyenne
    F = rev(Lm - N)            # argument de latitude

    rad = math.radians
    lon += (
        -1.274 * math.sin(rad(M - 2 * D))
        + 0.658 * math.sin(rad(2 * D))
        - 0.186 * math.sin(rad(Ms))
        - 0.059 * math.sin(rad(2 * M - 2 * D))
        - 0.057 * math.sin(rad(M - 2 * D + Ms))
        + 0.053 * math.sin(rad(M + 2 * D))
        + 0.046 * math.sin(rad(2 * D - Ms))
        + 0.041 * math.sin(rad(M - Ms))
        - 0.035 * math.sin(rad(D))
        - 0.031 * math.sin(rad(M + Ms))
        - 0.015 * math.sin(rad(2 * F - 2 * D))
        + 0.011 * math.sin(rad(M - 4 * D))
    )
    return rev(lon)


def sign_of(longitude):
    return SIGNS[int(longitude // 30) % 12]


def make_wallpaper(src, dest):
    """Compose un fond d'écran aux dimensions exactes de l'écran : le tableau
    entier (non rogné) centré sur un fond fait de la même image floutée."""
    painting = Image.open(src).convert("RGB")

    background = ImageOps.fit(painting, (WALL_W, WALL_H))
    background = background.filter(ImageFilter.GaussianBlur(60))
    background = ImageEnhance.Brightness(background).enhance(0.45)

    fg_w = round(WALL_W * ZOOM)
    fg_h = round(fg_w * painting.height / painting.width)
    foreground = painting.resize((fg_w, fg_h), Image.LANCZOS)
    background.paste(foreground, ((WALL_W - fg_w) // 2, (WALL_H - fg_h) // 2))

    import io
    buf = io.BytesIO()
    background.save(buf, "JPEG", quality=90)
    data = buf.getvalue()
    if not dest.exists() or dest.read_bytes() != data:
        dest.write_bytes(data)


def main():
    now = datetime.now(timezone.utc)
    d = days_since_j2000(now)

    sun_lon = sun_longitude(d)
    moon_lon = moon_longitude(d)
    sun_key, sun_fr = sign_of(sun_lon)
    moon_key, moon_fr = sign_of(moon_lon)

    make_wallpaper(ASTRO / "images" / f"{sun_key}.jpg", ASTRO / "sun.jpg")
    make_wallpaper(ASTRO / "images" / f"{moon_key}.jpg", ASTRO / "moon.jpg")

    # Volontairement sans horodatage ni degrés : le fichier ne change que
    # lorsqu'un signe change, donc le workflow ne committe qu'à ce moment-là.
    status = {
        "sun": {"sign": sun_key, "sign_fr": sun_fr},
        "moon": {"sign": moon_key, "sign_fr": moon_fr},
    }
    (ASTRO / "status.json").write_text(
        json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Soleil : {sun_fr} ({sun_lon:.2f}°, {sun_lon % 30:.2f}° dans le signe)")
    print(f"Lune   : {moon_fr} ({moon_lon:.2f}°, {moon_lon % 30:.2f}° dans le signe)")


if __name__ == "__main__":
    main()
