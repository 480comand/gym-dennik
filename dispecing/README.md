# Dispečing

Pomocná webová appka pre dispečerské riadenie (záchranné a bezpečnostné zložky):
udalosti s prioritami, jednotky a ich stavy, mapa, denník a odovzdanie zmeny.
Čistý JavaScript bez inštalácie a bez servera, dáta sa ukladajú v prehliadači (localStorage).

## Súbory

| Súbor | Obsah |
|---|---|
| `index.html` | kostra stránky |
| `app.js` | celá logika aplikácie (JavaScript) |
| `style.css` | vzhľad, tmavá/svetlá téma, mobil, tlač |
| `sw.js`, `manifest.webmanifest`, ikony | offline režim a inštalácia ako appka |
| `vendor/leaflet/` | mapová knižnica Leaflet 1.9.4 (BSD-2-Clause) |

## Spustenie

- **Na počítači:** stiahni priečinok `dispecing` a otvor `index.html` v prehliadači (Chrome, Edge, Firefox).
  Mapa a vyhľadávanie adries potrebujú internet.
- **Na webe / v mobile:** po zlúčení do vetvy `main` ju zverejní GitHub Pages na
  `https://480comand.github.io/gym-dennik/dispecing/`. V mobile ju cez menu prehliadača
  pridáš na plochu a funguje aj offline.

Na vyskúšanie: Nastavenia → **Načítať ukážkové dáta**.

## Hra Linka 112

`hra.html` je samostatná 3D hra na dispečera integrovaného záchranného systému v **Košickom kraji**.
Zdvíhaš hovory na 112, určuješ druh udalosti a po kraji vysielaš posádky: záchranky (RZP, RLP, vrtuľník LZS),
hasičov, políciu, mestskú políciu, CBRN/biohazard tím a Horskú záchrannú službu. Služba nemá koniec ani
dennú/nočnú zmenu – hrá sa, kým kraju neklesne dôvera.

- **Mapa:** 3D terén kraja s hranicou, mestami (Košice, Michalovce, Spišská Nová Ves, Trebišov, Rožňava…),
  hlavnými cestami, riekami, Šíravou a Ružínom, Slovenským rajom, Volovskými vrchmi a Vihorlatom.
- **Udalosti:** zdravotné, dopravné, požiare, technické, polícia, mestská polícia, chemické a biologické
  ohrozenie (únik amoniaku, podozrivý prášok, podozrenie na nákazu…), horské a jaskynné záchrany.
- **Záchranná služba podľa skutočnosti:** stanice a typy posádok v Košickom kraji podľa
  vyhlášky MZ SR č. 116/2025 Z. z. – 9× RLP (rýchla lekárska pomoc), 1× RV (lekár v osobnom aute,
  stretávací systém, Košice-Západ) a 31× RZP. Pri ťažkých stavoch treba lekára: RLP príde so sanitkou,
  RV prevoz nezvládne, pacienta odvezie RZP. Ambulancie špecializovanej prepravy (AŠP, ŠRZP) v hre nie sú.
- **Progres:** za vyriešené udalosti získavaš XP a úrovne, body míňaš v strome schopností
  (záchranky po okresoch, vrtuľník, hasiči, CBRN, polícia, horská služba, dispečerské vylepšenia).
  Postup sa ukladá v prehliadači.
- **Telefón:** mapa cez celú obrazovku, dole panel so záložkami Hovory / Udalosti / Posádky,
  prichádzajúci hovor sa ukáže ako lišta nad mapou.

Ovládanie: `A` prijať hovor, `1`–`9` druh udalosti, `Enter` vyslať odporúčané posádky, `Esc` zrušiť výber,
medzerník pauza; mapu otáčaš a približuješ myšou alebo prstami. Potrebuje prehliadač s WebGL.

Knižnice a dáta: `vendor/three/` – three.js r147 (MIT), `vendor/amcharts-geodata/` – licencia amCharts
geodát (linkware), z ktorých je zjednodušená hranica kraja. Polohy obcí, ciest, riek a pohorí sú približné.
