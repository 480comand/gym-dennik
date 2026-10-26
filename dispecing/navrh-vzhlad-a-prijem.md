# Návrh: nový vzhľad a príjem hovoru (Linka 155)

Schválené používateľom 26. 10. 2026 po častiach. Nadväzuje na `grilovanie-155.md` (krok 2 plánu – prehľadnosť na mobile)
a rozširuje ho o typ volajúceho, otázky k problému a radu pri odkladných hovoroch.

## Čo chce používateľ (jeho slová, skrátene)

- Pri H1 (volá sám pacient) je nezmysel overovať vedomie a strhávať za to body. Pridať aj hovory H2 a H3.
- Otázky majú súvisieť s problémom a logicky nadväzovať – napríklad pri vysokom tlaku nie hneď „kardio – O“ a až
  potom všeobecná rada.
- Voľný výber otázok: najprv vedomie, dýchanie, obeh, úraz, krvácanie, potom otázky k zdravotnému problému.
  Operátor nekladie sugestívne otázky.
- Celý vizuál sa mu nepáči – prerobiť inak. Vybral návrh A (pracovná stanica) a mapu b (svetlá 3D) s doplneným
  Prešovským krajom, aby mapa nebola prázdna a osekaná.

Návrhy vzhľadu (plátno): https://claude.ai/artifact/KymduvAAYGFi4JDVVyC8FG

## Poradie

1. **Etapa 1 – vzhľad a mapa.** Logika hry sa nemení, všetky doterajšie testy musia prejsť.
2. **Etapa 2 – príjem hovoru** v novom vzhľade: kroky, H1/H2/H3, otázky k problému, chytáky, rada pri O.
3. Potom pokračuje plán z grilovania: rozbor hovoru, kurz, kazuistiky, skúška, AED / odklad / konzultácia s lekárom OS.

## Časť 1 – priebeh príjmu a typ volajúceho

Príjem má 5 krokov, medzi ktorými sa dá kedykoľvek prepínať:

1. **Rozhovor** – posledné vety, riadok „Zistené“ (dôležité odpovede sa zbierajú automaticky), adresa, čo sa stalo,
   typ volajúceho H1/H2/H3, „Ste pri pacientovi?“, základné otázky: vedomie, dýchanie, koža a obeh, úraz, krvácanie.
2. **Problém** – kategória a otázky k nej; strom K/N/M/O je viditeľný ako pomôcka.
3. **Naliehavosť** – K/N/M/O.
4. **Vyslanie / riešenie** – pri K/N/M posádky a súčinnosť IZS, pri O spôsob vybavenia a konkrétna rada.
5. **Pokyny** – pri K a N povinné, pri M bonus, pri H3 sa nedávajú.

Typ volajúceho (hra pozná správny typ zo situácie):

- Hráč ho označí tlačidlom H1/H2/H3: správne +5, nesprávne −5.
- **H1 – volá pacient:** otázka na vedomie je vypnutá, za nezistené vedomie ani dýchanie sa nestrháva.
  Ak hráč označí H1 nesprávne a vedomie vynechá, trest za vedomie platí.
- **H2 – volajúci je pri pacientovi:** všetky otázky aj pokyny.
- **H3 – volajúci nie je pri pacientovi:** na vitálne funkcie odpovie „neviem, nie som pri ňom“ – bez trestu; pokyny sa
  nedávajú.
  - Hráč má zistiť, že volajúci nie je pri pacientovi (otázka „Ste pri pacientovi?“). Niektoré H3 sú **skryté** –
    z úvodu to nie je poznať a volajúci odpovedá z pamäti. Ak sa hráč nespýta: −10 a vysvetlenie v rozbore.
  - Hráč sa pokúsi získať **kontakt na H1/H2** („Máte číslo na pacienta alebo na niekoho pri ňom?“). Ak je, zavolá
    späť – zdvihne pacient (H1) alebo niekto pri ňom (H2) a rozhovor pokračuje aj s vitálnymi funkciami a pokynmi.
    Ak nie je, vyslať posádku a podľa situácie hasičov na otvorenie bytu. Získaný kontakt plus body, neskúsený pri H3 −10.
  - Asi 5 nových situácií H3 (napr. dcéra z iného mesta – mama nedvíha a ráno ju bolel hrudník; sused počul pád cez
    stenu; syn na videohovore videl, ako otec spadol zo stoličky).

## Časť 2 – otázky k problému

- Každá kategória má 6–8 neutrálnych, otvorených otázok vlastnými slovami (napr. srdce a obeh: kde presne bolí a kam
  vystreľuje, odkedy to trvá, koľko namerali na tlakomere, ako sa dýcha, liečba srdca či tlaku, lieky a či ich dnes vzal,
  iné ťažkosti).
- Situácia má odpovede na otázky, ktoré sa jej týkajú; na ostatné volajúci odpovie neutrálne („Nie, to nie.“).
  Doterajšie doplňujúce otázky sa presunú pod správnu kategóriu.
- Otázka stojí pár sekúnd hovoru, body sa za ňu nestrhávajú. Rozbor ukáže, na čo sa hráč nespýtal a prečo to rozhodovalo.
- **Sugestívne chytáky** – v každej kategórii 1–2 („Bolesť na hrudi nemáte, však?“, „Ale nič vážne to nie je, však?“):
  −5 a vysvetlenie; volajúci často pritaká, aj keď to nie je pravda.
- Zlá kategória dáva málo informácií; kategória sa dá kedykoľvek zmeniť.
- Excel na kontrolu dostane hárok „Otázky k problému“.

## Časť 3 – riešenie pri O s konkrétnou radou

1. Spôsob vybavenia (body ako doteraz): rada doma, 116117 / všeobecný lekár, NTIC, linka psychologickej pomoci, úmrtie
   doma (prehliadka), úmrtie na verejnosti alebo nejasné (prehliadka a polícia), odovzdať na 112.
2. Konkrétne vety k problému: 2–3 správne, 1–2 chybné (s vysvetlením). Operátor nerozhoduje o liekoch ani dávkach.
3. Povinná bezpečnostná veta („ak sa to zhorší alebo pribudne …, volajte hneď znova“) – znenie podľa varovných
   príznakov problému.

Body: správna veta +5, chybná −10, chýbajúca bezpečnostná veta −10; O pri K/N ostáva (volajúci zavolá znova, −40).
Pri NTIC a 116117 kratšie vety (napr. pripraviť obal od lieku a hmotnosť dieťaťa). Excel dostane hárok „Rady pri O“.

## Časť 4 – vzhľad a mapa

- **Vzhľad A v celej hre** (menu, lišta, karty, hlásenia, súhrn, strom zručností, rozbor): svetlé pozadie, biele karty,
  jedna modrá ako hlavná farba; červená, oranžová, zelená a modrošedá len pre naliehavosť K/N/M/O. Písmo IBM Plex Sans,
  hodiny a čísla IBM Plex Mono.
- **Mobil:** príjem cez celú obrazovku v 5 krokoch (hore len hodiny hovoru a pauza). Pri vysielaní mapa hore, vysúvací
  panel s kartou udalosti a záložky Hovory / Udalosti / Posádky. Naraz jedno hlásenie, staršie v zozname.
- **Počítač:** veľká mapa vľavo, panely vpravo v rovnakom štýle.
- **Mapa:** svetlá 3D zo skutočného reliéfu; Košický kraj zvýraznený modrou hranicou; Prešovský kraj a okolie
  (Banskobystrický kraj, Maďarsko, Ukrajina) s mestami, hlavnými cestami, čiarkovanou hranicou a oparom na obzore.
  Prešovský kraj je len okolie – bez hovorov a posádok (patrí pod OS Prešov). Značky udalostí a posádok na stopkách,
  popisy miest s bielym lemom. Satelitná snímka odpadá.

## Časť 5 – kontrola

- Etapa 1: všetky doterajšie testy bez zmeny, snímky mobilu a počítača, zverejnenie, commit a push.
- Etapa 2: testy na každé nové pravidlo (H1 bez trestu za vedomie, skryté H3 −10, kontakt a zavolanie späť, chyták −5,
  chýbajúca bezpečnostná veta −10), Excel s novými hárkami, zverejnenie, commit a push.
