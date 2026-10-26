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

## Hra Linka 155

`hra.html` je samostatná 3D hra na operátora a dispečera záchrannej zdravotnej služby v **Košickom kraji**.
Zdvíhaš hovory na linku 155, vedieš štruktúrovaný rozhovor, určuješ naliehavosť a vysielaš posádky ZZS:
RZP, RLP, RV (lekár v stretávacom systéme), vrtuľník a Horskú záchrannú službu. Hasičov, políciu a mestskú
políciu nevysielaš – len o ne požiadaš cez KS IZS (súčinnosť).

Hra nie je oficiálnou pomôckou operačného strediska. Kritériá naliehavosti sú zjednodušené a napísané vlastnými slovami.

**Príjem hovoru v piatich krokoch** (na mobile cez celú obrazovku, krok po kroku; na počítači pod sebou)
1. **Rozhovor:** posledné dve vety sú vždy na očiach, celý prepis sa dá rozbaliť; riadok „Zistené“ zbiera dôležité
   odpovede. Označíš **typ volajúceho** a pýtaš sa základné otázky: adresa, čo sa stalo, „Ste pri pacientovi?“,
   vedomie, dýchanie, koža a obeh, úraz, krvácanie, prístup.
2. **Problém:** vyberieš kategóriu a voľne sa pýtaš **neutrálne otázky k problému** (6 až 9 v každej kategórii).
   Medzi nimi je aj **sugestívna otázka** („Bolesť na hrudi nemá, však?“) – stojí −5 a volajúci na ňu pritaká.
3. **Naliehavosť:** strom kategórie s kritériami K kritický, N naliehavý, M menej naliehavý, O odkladný.
4. **Vyslanie / riešenie:** pri K, N a M vznikne udalosť a vysielaš posádky, nasleduje TANR a súčinnosť IZS.
   Pri O vyberieš spôsob (rada, 116117, NTIC, linka psychologickej pomoci, prehliadka mŕtveho tela, odovzdanie na
   112) a pri rade aj **konkrétne vety** – správne +5, chybné −10 a povinná veta „ak sa to zhorší, volajte znova“
   (bez nej −10).
5. **Pokyny:** pri K a N sú pokyny volajúcemu **povinné** – bez aspoň jedného správneho −20 a stav sa zhorší.
   Príjem končí len tlačidlom **Ukončiť príjem**, príchodom posádky alebo prijatím ďalšieho hovoru.

**Typ volajúceho:** H1 volá sám pacient (vedomie sa nepýta, za vedomie ani dýchanie sa nestrháva), H2 je pri
pacientovi, H3 nie je pri pacientovi. Správne označenie +5, nesprávne −5. Pri H3 treba zistiť, že volajúci nie je
pri pacientovi (inak −10), opýtať sa na kontakt na niekoho pri ňom (inak −10) a zavolať späť – potom sa dajú dať
pokyny aj TANR. Dve situácie sú **skryté H3**: z úvodu to nie je poznať a volajúci odpovedá z pamäti.

- Počas príjmu beží čas takmer naozaj: 2 sekundy hry za sekundu. Hodiny hovoru ukazujú čas od prijatia.
- V katalógu je 87 situácií. Asi štvrtina z nich je odkladných alebo na 155 nepatrí.

**Vysielanie posádok**
- K: najbližšia voľná posádka a k nej lekár – RLP, alebo RZP spolu s RV či RLP.
- N: RZP, RLP len vtedy, keď je bližšie. M: RZP bez majákov (jazdí o niečo pomalšie).
- Ku K a N treba vyslať posádku **do 90 sekúnd** od prijatia hovoru (+20 bodov, inak trest a pri K horší stav).
- **Vrtuľník:** neprístupný terén, ťažký úraz, šetrný a rýchly prevoz do centra (napríklad poranenie chrbtice
  na neurochirurgiu do Košíc) alebo veľká vzdialenosť. Bez indikácie je to chyba.
- **Nemocnice:** PCI – VÚSCH a Nemocnica Košice-Šaca; iktové centrá – UNLP, Šaca, Michalovce, Trebišov,
  Rožňava; traumacentrum a neurochirurgia – UNLP (Rastislavova). Zlá nemocnica znamená prevoz navyše.

**Posádka na mieste vyhodnotí príjem**
- Až keď posádka dorazí, ukáže sa skutočný stav a rozbor: kategória a naliehavosť.
- Podhodnotenie (napríklad K určené ako M): posádka ide bez lekára a bez majákov, lekára si vyžiada z miesta
  a pacientovi sa priťaží. Nadhodnotenie: zbytočne viazaný lekár sa uvoľní a dostaneš menší trest.
- Keď hovor vybavíš bez výjazdu (O), hoci pacient pomoc potreboval, volajúci zavolá znova a stav je horší
  (−40, −4 dôvery).

**Súčinnosť IZS** (tlačidlá v karte udalosti)
- Hasiči: vyslobodenie z auta, otvorenie bytu, ťažký pacient, oheň, voda, plyn.
- Polícia: dopravná nehoda, resuscitácia alebo bezvedomie na verejnosti, úmrtie na verejnosti alebo za nejasných okolností,
  agresia, nútený prevoz, opitý maloletý. Pri úmrtí doma bez podozrenia stačí prehliadka mŕtveho tela.
- Mestská polícia: preverenie, keď volajúci neostane na mieste.
- Včas vyžiadaná zložka: +15. Zabudnutá zložka: posádka ju vyžiada z miesta a čaká (−20, horší stav).
  Zbytočne vyžiadaná zložka: −10.

**TANR – telefonicky asistovaná resuscitácia**
- Pri zástave vyberieš štyri správne pokyny (reproduktor, poloha, ruky na hrudník, stláčanie) a ťukaním udávaš
  tempo stláčania. Dospelý dostane len stláčanie; pri utopenom a dojčati (dva prsty, asi 4 cm) aj úvodné vdychy, ak to volajúci vie. Hra meria tempo (100–120/min) a čas od prijatia hovoru po prvé stlačenie (do 60 s +40).
- Výsledok zástavy závisí od času bez obehu, kvality TANR a príchodu posádky. Bez TANR pacient väčšinou neprežije.
- Pri ďalších stavoch sú telefonické pokyny (stabilizovaná poloha, adrenalínové pero, zastavenie krvácania,
  vedenie pôrodu a ďalšie). Dobrý pokyn pomôže, zlý ublíži. Lieky (napríklad aspirín) operátor po telefóne neodporúča.
- Kontrola odborného obsahu: `kontrola/Linka155-kontrola-obsahu.xlsx` (situácie, otázky k problému, rady pri O,
  stromy K/N/M/O, TANR, stĺpce na pripomienky).

**Ďalej v hre:** opakované hovory pri zhoršení, režim jednej udalosti, posádka z ďaleka a dôsledky zlého vyslania,
pokrytie kraja, neznáma poloha volajúceho, hovory v cudzom jazyku s tlmočníkom, zneužitie linky,
mimoriadne udalosti s hromadným postihnutím osôb (UHPO) – pri nich hasičov a políciu riadi KS IZS sama.

**Hlasy volajúcich** (tlačidlo **Hlas**, predvolene vypnuté)
- Hra prehrá len nahrávky z priečinka `audio/volajuci/`, buď vlastné, alebo z ElevenLabs (skript `generuj-hlasy.py`).
  Zvuk ide cez telefónnu linku. Vety bez nahrávky ostanú len ako text.
- Hlas prehliadača a umelé zvuky z miesta sú vypnuté (prepínače `USE_TTS` a `USE_AMBIENCE` v kóde hry).
- Scenár všetkých 1146 slovenských viet s emóciou a návod sú v `audio/volajuci/` (`scenar.csv`, `scenar.html`, `README.md`).

**Vzhľad a mapa:** svetlý vzhľad „pracovná stanica“ (biele karty, jedna modrá, farby len pre naliehavosť K/N/M/O,
písmo IBM Plex). Mapa je svetlá 3D zo skutočného reliéfu (výškové dáta Terrain Tiles – SRTM, EU-DEM). Košický kraj
je zvýraznený modrou hranicou; okolie – Prešovský a Banskobystrický kraj, Maďarsko a Ukrajina – je len na orientáciu
(mestá, hlavné cesty, čiarkované hranice, opar na obzore). Na mobile je počas príjmu hovoru hore len čas a pauza,
naraz je vidno jedno hlásenie a staršie sú v zozname „Hlásenia“. Návrh: `navrh-vzhlad-a-prijem.md`.

**Tempo:** hra beží pokojným tempom: pri ×1 je sekunda pol minúty hry a hovory chodia
zhruba každých 15 minút hry, neskôr každých 9; zrýchliť sa dá tlačidlom ×2/×4.

**Ciele**
- Voľná služba bez konca, 8 výziev s hviezdičkami (Dni mesta Košice, Leto na Šírave, Povodeň na Bodrogu…)
  a denná výzva s rovnakými hovormi pre všetkých v daný deň.
- Séria úspechov násobí body, na konci služby je rozbor príjmu (naliehavosť, čas do vyslania, TANR, súčinnosť)
  a medaily (napríklad Stláčaj!, 90 sekúnd, Súčinnosť). Postup sa ukladá v prehliadači.

**Záchranná služba podľa skutočnosti:** stanice a typy posádok podľa vyhlášky MZ SR č. 116/2025 Z. z. –
9× RLP, 1× RV (Košice-Západ, stretávací systém) a 31× RZP. RLP pokryje lekára aj prevoz, RV prevoz nezvládne.
Zdroje k nemocniciam: kardiocentrum AGEL Košice-Šaca (program STEMI), iktové jednotky s trombolýzou podľa
prehľadu [SITA](https://sita.sk/vzdravotnictve/vo-svidniku-vlani-liecili-najviac-pacientov-s-mozgovou-prihodou-podanim-trombolyzy/);
zjednodušené.

Ovládanie: `A` prijať hovor, `1`–`8` otázky rozhovoru, `Z` `X` `C` doplňujúce otázky, `K` `N` `M` `O` naliehavosť,
`S` TANR a tempo stláčania, `T` tlmočník, `Enter` vyslať odporúčané (so schopnosťou), `Esc` zrušiť výber, medzerník pauza. Na telefóne je mapa cez celú obrazovku a dole panel so záložkami.
Potrebuje prehliadač s WebGL.

Knižnice a dáta: `vendor/three/` – three.js r147 (MIT), `vendor/amcharts-geodata/` – licencia amCharts
geodát (linkware), z ktorých je zjednodušená hranica kraja. Satelitná snímka obsahuje upravené dáta Copernicus
Sentinel-2 (2022–2025); reliéf: Terrain Tiles (Mapzen/AWS; SRTM, EU-DEM – Copernicus). Polohy obcí, ciest, riek a pohorí aj špecializácie
nemocníc sú zjednodušené.
