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
Zdvíhaš hovory na 112, vypytuješ sa volajúcich, určuješ druh udalosti a po kraji vysielaš posádky:
záchranky (RZP, RLP, RV, vrtuľník), hasičov, políciu, mestskú políciu, CBRN tím a Horskú záchrannú službu.

**Hovory**
- **Vypytovanie:** otázky „Čo sa stalo?“, „Kde ste?“, „Je niekto zranený?“, „Hrozí ešte niečo?“. Odpovede odhalia
  skryté komplikácie (ďalší zranený, šíriaci sa oheň, ozbrojený útočník). Čo nezistíš, nahlási až posádka z miesta.
- **Neznáma poloha:** volajúci nevie, kde je – mobil hlási len kruh. Podľa jeho opisu ho nájdeš ťuknutím na mapu.
- **Cudzí jazyk a tiché hovory:** maďarčina, ukrajinčina a angličtina pri hraniciach (s tlmočníkom),
  tichý hovor, keď volajúci nemôže hovoriť a odpovedá ťuknutím.

**Vysielanie**
- Posádky vyberáš sám, za presné vyslanie je bonus, posádka navyše alebo lekár k drobnosti stojí body.
  Asistenta vysielania (tlačidlo „Vyslať odporúčané“) odomkneš v schopnostiach.
- **Pokrytie kraja:** podiel obyvateľov, ku ktorým dorazí záchranka do 15 minút; voľné posádky môžeš presunúť do zálohy.
- **Nemocnice:** pacienta pošleš do správneho centra – kardiocentrum VÚSCH, traumacentrum UNLP, Detská FN
  alebo najbližšia nemocnica; príjem má obmedzenú kapacitu.
- **Následky zlých rozhodnutí:** každá udalosť má stav (v poriadku → zhoršuje sa → kritický).
  - Posádka z ďaleka, keď bližšia bola voľná, zdrží pomoc a stav sa zhorší. Pacient môže mať komplikácie
    alebo trvalé následky, čo znamená menej bodov aj dôvery. Pri P1 ho pre veľké zdržanie nemusíš zachrániť.
    Ak dodatočne pošleš bližšiu posádku, zdržanie sa nezaráta.
  - Nevhodná posádka (polícia k zástave srdca, RV bez sanitky, vrtuľník k drobnosti) stojí body aj dôveru
    a na mieste sa otočí naprázdno.
  - Za stiahnutie posádky z cesty k vážnejšiemu prípadu dostaneš trest a pôvodná udalosť sa zhorší.
    Trest dostaneš aj vtedy, keď pošleš k menej vážnemu prípadu posádku, ktorú potreboval čakajúci P1.
  - Keď z okolia odíde k drobnosti posledná voľná záchranka, hra ťa varuje. Ak tam potom príde vážny prípad,
    hra ukáže dôsledok tvojho rozhodnutia a pomoc pôjde z ďaleka.
  - Pacient v nemocnici bez potrebného centra musí ísť ďalej, takže posádka je 12 minút dlhšie mimo prevádzky.
  - Súhrn služby obsahuje rozbor vysielania (koľkokrát a akú chybu si urobil). Za službu bez chyby
    dostaneš medailu Čistý štít.

**Živý kraj**
- Udalosti, ku ktorým pomoc mešká, sa zhoršia a volajúci zavolá znova. Posádky podávajú hlásenia rádiom.
- **Mimoriadne udalosti** vo fázach (povodeň na Bodrogu, víchrica, hromadná nehoda autobusu, výbuch plynu,
  požiar chemického podniku) s výpomocou z Prešovského kraja.
- **Počasie** (dážď, hmla, poľadovica, búrka, horúčava) mení rýchlosť jázd, vrtuľník aj druhy udalostí;
  v Košiciach býva dopravná špička.

**Mapa a tempo:** terén je skutočný reliéf kraja (výškové dáta Terrain Tiles – SRTM, EU-DEM) potiahnutý
satelitnou snímkou z družíc Copernicus Sentinel-2 (letá 2022–2025, mozaika upravená na farby;
`img/kosicky-kraj-satelit.jpg`). Pri otvorení súboru priamo z disku (file://) prehliadač satelitnú snímku
nenačíta a ukáže sa kreslená mapa. Hra beží pokojným tempom: pri ×1 je sekunda pol minúty hry a hovory chodia
zhruba každých 15 minút hry, neskôr každých 9; zrýchliť sa dá tlačidlom ×2/×4.

**Ciele**
- Voľná služba bez konca, 8 výziev s hviezdičkami (Dni mesta Košice, Leto na Šírave, Povodeň na Bodrogu…)
  a denná výzva s rovnakými hovormi pre všetkých v daný deň.
- Séria úspechov násobí body, na konci služby sú medaily. Postup, schopnosti, hviezdičky a medaily sa ukladajú v prehliadači.
- Rádiové zvuky, siréna, typované odpovede volajúcich a voliteľný hlas volajúceho (syntéza reči prehliadača).

**Záchranná služba podľa skutočnosti:** stanice a typy posádok podľa vyhlášky MZ SR č. 116/2025 Z. z. –
9× RLP, 1× RV (Košice-Západ, stretávací systém) a 31× RZP. RLP pokryje lekára aj prevoz, RV prevoz nezvládne.

Ovládanie: `A` prijať hovor, `Q` `W` `E` `R` otázky, `T` tlmočník, `1`–`9` druh udalosti, `Enter` vyslať odporúčané
(so schopnosťou), `Esc` zrušiť výber, medzerník pauza. Na telefóne je mapa cez celú obrazovku a dole panel so záložkami.
Potrebuje prehliadač s WebGL.

Knižnice a dáta: `vendor/three/` – three.js r147 (MIT), `vendor/amcharts-geodata/` – licencia amCharts
geodát (linkware), z ktorých je zjednodušená hranica kraja. Satelitná snímka obsahuje upravené dáta Copernicus
Sentinel-2 (2022–2025); reliéf: Terrain Tiles (Mapzen/AWS; SRTM, EU-DEM – Copernicus). Polohy obcí, ciest, riek a pohorí aj špecializácie
nemocníc sú zjednodušené.
