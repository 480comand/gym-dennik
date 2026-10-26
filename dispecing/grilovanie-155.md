# Grilovanie: kam smeruje hra Linka 155

Záznam otázok a odpovedí, aby sa nestratil kontext. Každé kolo obsahuje otázky, ktoré sa dajú rozhodnúť hneď.
Pri každej otázke je odporúčanie; „áno“ znamená súhlas s odporúčaním.

## Už rozhodnuté (z predošlých rozhovorov)

- Hra je o práci operátora a dispečera linky 155 (OS ZZS, Košický kraj).
- Vysielajú sa len posádky ZZS: RZP, RLP, RV, vrtuľník (LZS), Horská záchranná služba.
- Hasiči, polícia a mestská polícia sú len súčinnosť – operátor o ne požiada cez KS IZS.
- Naliehavosť K kritický, N naliehavý, M menej naliehavý, O odkladný.
- Pravidlá vysielania: K – najbližšia posádka a lekár (RLP, alebo RZP s RV či RLP); N a M – RZP, RLP len keď je bližšie.
- Ku K a N vyslanie do 90 sekúnd, TANR čo najskôr.
- Cieľové skupiny: študenti záchranárstva (zábava), tréning operátorov, verejnosť.
- Hlasy volajúcich zatiaľ vypnuté, ElevenLabs odložené; len slovenčina.
- Prvá fáza je hotová (štruktúrovaný rozhovor, formulár K/N/M/O, TANR, súčinnosť IZS, rozbor príjmu).

## Zistené fakty

- Metodiku štruktúrovaného rozhovoru OS ZZS SR som verejne nenašiel – pravdepodobne ide o interný materiál.
- OS ZZS SR v roku 2024 asistovalo pri 3 309 TANR, AED bolo aktivované v 1 257 prípadoch a použité v 527
  (zdroj: [SITA](https://sita.sk/operatori-tiesnovej-linky-155-vlani-asistovali-pri-niekolkych-tisickach-resuscitacii-cez-telefon/),
  [TASR](https://www.teraz.sk/slovensko/operatori-tiesnovej-linky-pomahali-pr/848556-clanok.html)).
- Vyhláška MZ SR 30/2006 Z. z. upravuje činnosť operačného strediska (príjem tiesňových volaní na 155, riadenie posádok, súčinnosť s IZS).

## Kolo 1

**Q1 – Hlavná cieľová skupina.** Keď sa realizmus a zábava pobijú, kto má prednosť?
a) študenti záchranárstva, b) operátori v zaškolení, c) verejnosť.
Odporúčanie: a) študenti záchranárstva; verejnosť dostane jednoduchší režim, tréning operátorov neskôr.
Odpoveď: a) študenti záchranárstva majú prednosť.

**Q2 – Zverejnenie a metodika.** Metodika rozhovoru nie je verejná. Ako s hrou naložíme?
a) verejne na GitHub Pages s vlastnými, zjednodušenými kritériami, b) len súkromne, kým OS ZZS SR nedá súhlas,
c) požiadať OS ZZS SR o spoluprácu a potom verejne.
Odporúčanie: a) teraz verejne s vlastnými kritériami bez textov z obrazoviek, súbežne c).
Odpoveď: b) + c) súkromne, kým OS ZZS SR nedá súhlas, a požiadať OS o spoluprácu.

**Q3 – Jadro hry.** Čo je hlavná činnosť hráča?
a) príjem hovoru (rozhovor, naliehavosť, pokyny), b) riadenie posádok na mape, c) oboje rovnako.
Odporúčanie: a) príjem hovoru je jadro, mapa a vysielanie ho dopĺňajú.
Odpoveď: a) jadrom je príjem hovoru.

**Q4 – Kto schvaľuje odborný obsah.** Situácie, kritériá a pokyny volajúcim musia byť správne.
a) len ty, b) ja pripravím návrh (aj cez skill partak-155) a ty schváliš, c) navyše druhý odborník z OS.
Odporúčanie: b) a pri TANR, pôrode a dusení aj c).
Odpoveď: a) + b) + c) ja pripravím návrh, ty schváliš, kritické veci prejde aj druhý odborník z OS.

**Q5 – Hlavné zariadenie.** Na čom sa bude hrať najčastejšie?
a) mobil, b) počítač, c) oboje rovnako.
Odporúčanie: a) mobil, počítač plnohodnotne.
Odpoveď: a) mobil.

**Q6 – Termín a rozsah.** Je pevný cieľ, dokedy má byť hra hotová (napríklad ukážka na škole či na stredisku)?
a) bez termínu, hobby projekt, b) konkrétny termín a udalosť.
Odporúčanie: b), ak taký termín je – podľa neho zoradíme priority.
Odpoveď: a) bez termínu, hobby projekt.

### Zistené po kole 1

- Repozitár `480comand/gym-dennik` je **verejný**. Na vetve `main` je len aplikácia gym denníka (GitHub Pages),
  hra je na vetve `claude/vigilant-thompson-aa6dg5` a v otvorenom PR #1 – teda je verejne viditeľná.
- Artefakt hry na claude.ai je súkromný.

## Kolo 2

**Q7 – Čo s hrou vo verejnom repozitári** (nadväzuje na Q2 b).
a) nový súkromný repozitár (napr. `linka-155`), hru presunúť tam, v `gym-dennik` zatvoriť PR #1 a zmazať vetvu,
b) celý `gym-dennik` prepnúť na súkromný (gym denník na GitHub Pages bez platenia prestane fungovať),
c) nechať tak.
Pozn.: aj po zmazaní vetvy ostane história zatvoreného PR viditeľná; úplne ju odstráni len súkromný repozitár alebo podpora GitHubu.
Odporúčanie: a), a ak treba, požiadať podporu GitHubu o odstránenie PR.
Odpoveď: c) nechať tak – repozitár ostáva verejný (vedome, napriek Q2 b).

**Q8 – Oslovenie OS ZZS SR** (nadväzuje na Q2 c).
Pripravím krátky návrh spolupráce (čo hra je, pre koho, o čo žiadame: súhlas s použitím metodiky, odborná kontrola)
a odkaz na ukážku; pošleš ho ty.
Odporúčanie: áno, adresát vedenie OS alebo oddelenie vzdelávania.
Odpoveď: zatiaľ nič neposielať, doriešime, keď to bude treba.

**Q9 – Druhý odborník a forma kontroly** (nadväzuje na Q4).
Máš konkrétneho kolegu (lekár OS, skúsený operátor)? Kontrolu by som pripravil ako prehľadnú tabuľu situácií
(úvodná veta, odpovede, správna naliehavosť, súčinnosť, pokyny) s možnosťou komentovať.
Odporúčanie: áno, tabuľa s komentármi; meno kolegu doplníš.
Odpoveď: áno – tabuľa s komentármi, meno kolegu doplní používateľ.

**Q10 – Režimy pre študentov** (nadväzuje na Q1, Q3).
Čo pridať k voľnej službe? a) kurz po kategóriách s rastúcou náročnosťou, b) kazuistiky – pripravené hovory
s rozborom, c) skúška bez pomôcok s hodnotením.
Odporúčanie: všetky tri; poradie a) → b) → c).
Odpoveď: áno – kurz, kazuistiky aj skúška, v poradí a) → b) → c).

**Q11 – Kedy dostane študent rozbor hovoru.**
a) až keď posádka príde na miesto (teraz), b) hneď po ukončení príjmu s vysvetlením, ktoré kritérium rozhodlo,
c) až na konci služby.
Odporúčanie: b) v kurze a kazuistikách, a) vo voľnej službe.
Odpoveď: áno – b) v kurze a kazuistikách, a) vo voľnej službe.

**Q12 – Príjem hovoru na mobile** (nadväzuje na Q3, Q5).
Počas príjmu by hovor zabral celú obrazovku (rozhovor, formulár, strom), mapa sa ukáže až pri vysielaní.
Odporúčanie: áno.
Odpoveď: áno – príjem hovoru na celú obrazovku mobilu, mapa až pri vysielaní.

## Kolo 3

**Q13 – Obsah hry vo verejnom repozitári** (nadväzuje na Q2, Q7).
Keďže repozitár ostáva verejný: do hry dávam len vlastné formulácie kritérií, nič doslovne z obrazoviek OS,
a fotky obrazoviek nikam neukladám.
Odporúčanie: áno.
Odpoveď: áno.

**Q14 – Štruktúra kurzu** (nadväzuje na Q10 a).
Lekcie po kategóriách, napríklad: 1. zástava a porucha vedomia, 2. dýchanie a alergia, 3. kardio a bolesť,
4. neurológia a diabetes, 5. úrazy a dopravné nehody, 6. intoxikácie a psychické ťažkosti, 7. pôrod a gynekológia,
8. odkladné hovory a hovory mimo 155. Každá lekcia: krátka karta s kritériami a 4 hovory; ďalšia sa odomkne
pri aspoň 3 správnych zo 4.
Odporúčanie: áno.
Odpoveď: áno – používateľ je zvedavý, ako to bude fungovať.

**Q15 – Kazuistiky** (nadväzuje na Q10 b).
Jedna kazuistika = jeden hovor od zdvihnutia po príchod posádky a rozbor krok po kroku. Prvých 10 napíšem ja
podľa katalógu, ďalšie doplníš z vlastných anonymizovaných prípadov.
Odporúčanie: áno.
Odpoveď: áno; čerpať sa dá aj z voľne dostupných kazuistík na internete a z ÚDZS.

**Q16 – Skúška** (nadväzuje na Q10 c).
10 hovorov, strom kritérií skrytý, hodnotí sa naliehavosť, čas do vyslania, TANR, súčinnosť a pokyny.
Výsledok v percentách, hranica úspechu 80 %, na konci obrázok s výsledkom na ukázanie učiteľovi.
Odporúčanie: áno.
Odpoveď: áno.

**Q17 – Čas počas príjmu v jednotlivých režimoch.**
Teraz beží príjem 2× rýchlejšie ako naozaj. Návrh: voľná služba 2×; kurz 2× a v prvých dvoch lekciách
bez trestu za 90 s; kazuistiky a skúška v reálnom čase (1×).
Odporúčanie: áno.
Odpoveď: áno.

**Q18 – Obsah rozboru hovoru** (nadväzuje na Q11).
a) správna kategória a naliehavosť s kritériom, ktoré rozhodlo, b) ktoré otázky chýbali a ktoré boli zbytočné,
c) časová os – zdvihnutie, kategória, vyslanie, TANR, d) správne a chybné pokyny volajúcemu.
Odporúčanie: všetko, stručne na jednu obrazovku.
Odpoveď: „a“ – treba potvrdiť, či to znamená áno (všetko a–d), alebo len bod a) (pozri Q22).

**Q19 – Vysielanie na mobile** (nadväzuje na Q12).
Pri vysielaní je hlavný zoznam posádok s dojazdom, mapa sa dá otvoriť, ale nie je nutná.
Odporúčanie: áno.
Odpoveď: áno.

**Q20 – Kde bude tabuľa na kontrolu obsahu** (nadväzuje na Q9).
a) súkromná stránka na claude.ai (kolega potrebuje účet a zdieľanie), b) súbor Excel so stĺpcom na pripomienky,
ktorý pošleš e-mailom, c) dokument v Claude Docs.
Odporúčanie: b) Excel – kolega nepotrebuje žiadny účet.
Odpoveď: súhlas – b) Excel.

**Q21 – Verejnosť** (nadväzuje na Q1).
a) zatiaľ žiadny osobitný režim, b) neskôr jednoduchý režim, v ktorom hráč je volajúci a učí sa, čo robiť,
keď volá 155 (TANR, poloha, AED).
Odporúčanie: b) neskôr, po kurze a skúške.
Odpoveď: zatiaľ len jeden režim – osobitný režim pre verejnosť nebude.

## Kolo 4

**Q22 – Potvrdenie Q18.** Pri rozbore hovoru si napísal „a“. Znamená to áno – rozbor obsahuje všetko
(kategória a naliehavosť s kritériom, chýbajúce a zbytočné otázky, časová os, pokyny)?
Odporúčanie: áno, všetko.
Odpoveď: áno – rozbor obsahuje všetko (a–d).

**Q23 – Zdroje kazuistík** (nadväzuje na Q15).
Verejné kazuistiky (odborné články, prípady ÚDZS) použijem len ako inšpiráciu: prerozprávam ich vlastnými slovami,
anonymizujem a pod rozborom uvediem zdroj. Vyhľadám ich ja.
Odporúčanie: áno.
Odpoveď: áno.

**Q24 – Čo pôjde do Excelu na kontrolu** (nadväzuje na Q9, Q20).
Hárok 1: situácie (úvodná veta, odpovede, kategória, naliehavosť, súčinnosť, nemocnica, pokyny volajúcemu).
Hárok 2: stromy kritérií K/N/M/O pre každú kategóriu. Hárok 3: kroky TANR. Každý riadok so stĺpcom na pripomienky.
Odporúčanie: áno, všetky tri hárky.
Odpoveď: áno – všetky tri hárky.

**Q25 – Poradie práce** (nadväzuje na Q6, Q10–Q20).
1. kontrola obsahu (partak-155 a Excel), 2. rozbor hovoru, 3. mobil – príjem na celú obrazovku a vysielanie zo zoznamu,
4. kurz, 5. kazuistiky, 6. skúška.
Odporúčanie: áno, v tomto poradí.
Odpoveď: áno – v tomto poradí.

**Q26 – Ďalšie funkcie po skúške.** Ktoré z návrhov druhej fázy chceš?
a) AED na mape a navedenie volajúceho k nemu, b) odklad, keď nie je voľná posádka, c) konzultácia s lekárom
operačného strediska, d) hromadné nešťastie s triedením START, e) sekundárne prevozy, f) nočná zmena.
Odporúčanie: a), b), c); ostatné neskôr.
Odpoveď: áno – a) AED, b) odklad, c) konzultácia s lekárom OS; ostatné neskôr. („Po skúške“ = po dokončení režimu skúšky z Q16, nie po vyskúšaní hry.)

**Q27 – Hra na mobile.** Skúšal si hru na svojom mobile? Ide 3D mapa plynulo, alebo sa seká?
(Fakt, ktorý zistiť neviem – podľa neho rozhodneme o úspornom režime.)
Odpoveď: neodpovedané – opakovať v kole 5.

**Q28 – Výsledky pre učiteľa** (nadväzuje na Q16).
a) študent ukáže obrázok s výsledkom (bez servera, výsledky ostávajú v jeho prehliadači), b) spoločná tabuľa
výsledkov triedy (potrebuje prihlásenie a ukladanie na serveri).
Odporúčanie: a).
Odpoveď: zatiaľ vynechať – výsledky pre učiteľa nebudú, len hodnotenie po skončení hry.

**Q29 – Hlasy volajúcich.** Hlasy a ElevenLabs nechávame mimo plánu, kým nebude hotový kurz a skúška.
Odporúčanie: áno.
Odpoveď: neodpovedané – opakovať v kole 5.

## Kolo 5

**Q27 (znova) – Hra na mobile.** Skúšal si hru na svojom mobile? Ide 3D mapa plynulo, alebo sa seká?
Ak si ju neskúšal, vyskúšaj ju prosím – podľa toho rozhodneme o úspornom režime.
Odpoveď: na telefóne ide plynulo, ale je dosť neprehľadná.

**Q29 (znova) – Hlasy volajúcich.** Hlasy a ElevenLabs nechávame mimo plánu, kým nebude hotový kurz a skúška.
Odporúčanie: áno.
Odpoveď: áno.

**Q30 – Obrázok s výsledkom skúšky** (zosúladenie Q16 a Q28).
V Q16 si súhlasil s obrázkom na ukázanie učiteľovi, v Q28 si výsledky pre učiteľa vynechal.
Obrázok vynecháme a po skúške ostane len hodnotenie na obrazovke.
Odporúčanie: áno.
Odpoveď: áno – obrázok vynechať, len hodnotenie na obrazovke.

**Q31 – Prvé spustenie.** Nový hráč začne lekciou 1 kurzu (dá sa preskočiť), skúsený ide rovno do menu.
Odporúčanie: áno.
Odpoveď: áno.

**Q32 – Herné prvky.** Schopnosti a odomykanie posádok, výzvy s hviezdičkami, denná výzva a medaily ostávajú.
Odporúčanie: áno.
Odpoveď: áno.

**Q33 – Chýbajúce kategórie.** Strom pre úrazy nechám svoj (overíš ho v Exceli). Asistencie a neodkladnú
prepravu osoby zatiaľ do hry nedávam.
Odporúčanie: áno.
Odpoveď: áno – asistencie a neodkladnú prepravu osoby netreba vôbec.

**Q34 – Hovory v cudzom jazyku.** Hovory po maďarsky, ukrajinsky a anglicky s tlmočníkom ostávajú (text, bez hlasu).
Odporúčanie: áno.
Odpoveď: áno.

### Zistené po kole 5 – rýchly audit hry na mobile (390 × 844)

1. Počas príjmu hovoru zaberá mapa asi 40 % výšky, na rozhovor ostáva menej ako polovica – veľa posúvania.
2. Horná lišta má dva riadky (hodiny, úroveň, skóre, dôvera, pauza, menu) – zaberá miesto a nie je dôležitá pri hovore.
3. Tlačidlá otázok vyzerajú ako bubliny rozhovoru – otázky a odpovede sa ťažko rozlišujú, rozhovor odsúva tlačidlá nadol.
4. V karte udalosti je najdôležitejšie tlačidlo (Vyslať) až dole – pred ním je dlhý text o súčinnosti a pokyny prvej pomoci.
5. Hlásenia (toasty) prekrývajú mapu a pri rýchlom hraní sa hromadia.

## Kolo 6

**Q35 – Čo je na mobile neprehľadné.** Sedí audit vyššie s tým, čo ti prekáža? Ak ťa trápi ešte niečo iné, dopíš to.
Odporúčanie: áno, všetkých 5 bodov.
Odpoveď: áno – všetkých 5 bodov sedí.

**Q36 – Poradie práce po zistení z mobilu** (mení Q25).
1. pripraviť Excel na kontrolu obsahu (kým ho kontroluješ ty a kolega, robím ďalej), 2. prehľadnosť na mobile,
3. rozbor hovoru, 4. kurz, 5. kazuistiky, 6. skúška, 7. AED, odklad, konzultácia s lekárom.
Odporúčanie: áno.
Odpoveď: áno – nové poradie práce platí.

## Kolo 7 – riešenie prehľadnosti na mobile

**Q37 – Príjem hovoru na mobile.** Hovor zaberie celú obrazovku (bez mapy) a ide po krokoch s lištou hore:
Rozhovor → Formulár → Naliehavosť → Vysielanie → Pokyny. Medzi krokmi sa dá ľubovoľne prepínať,
posledné dve vety rozhovoru sú vždy viditeľné a otázky majú iný vzhľad ako bubliny rozhovoru.
Odporúčanie: áno.
Odpoveď: áno.

**Q38 – Horná lišta počas hovoru.** Počas príjmu ostanú hore len hodiny hovoru a pauza; skóre, úroveň a dôvera
sa ukážu po skončení príjmu.
Odporúčanie: áno.
Odpoveď: áno.

**Q39 – Hlásenia.** Na mobile vždy len jedno hlásenie naraz; staršie sa dajú pozrieť v zozname hlásení.
Odporúčanie: áno.
Odpoveď: áno.

**Q40 – Poradie v karte udalosti.** 1. posádky a tlačidlo Vyslať, 2. TANR (pri K), 3. súčinnosť IZS ako tri
tlačidlá bez dlhého textu (vysvetlenie pod tlačidlom „?“), 4. pokyny volajúcemu (zbalené).
Odporúčanie: áno.
Odpoveď: áno, ale pokyny volajúcemu sú POVINNÉ (nie zbalené, nie voliteľné).

**Q41 – Počítač.** Na počítači ostáva rozloženie s mapou v strede; zmení sa len poradie v karte udalosti,
vzhľad otázok a hlásenia. Kroky budú len na mobile.
Odporúčanie: áno.
Odpoveď: áno.

## Kolo 8 – povinné pokyny volajúcemu (nadväzuje na Q40)

**Q42 – Čo znamená „povinné“.**
a) príjem sa nedá ukončiť, kým operátor nedá pokyn, b) príjem sa dá ukončiť, ale bez pokynu je trest
a pacientovi sa priťaží, c) povinné len pri K a N, pri M odporúčané.
Odporúčanie: b) + c) – pri K a N aspoň jeden správny pokyn, inak −20 a horší stav; pri M body navyše;
v kurze krok „Pokyny“ svieti ako nesplnený, kým pokyn nedáš.
Odpoveď: b) + c) – pri K a N aspoň jeden správny pokyn, inak −20 a horší stav; pri M body navyše; v kurze krok „Pokyny“ svieti ako nesplnený.

**Q43 – Kedy sa pokyny dávajú.** Príjem sa už neukončí automaticky po vyslaní posádky, ale až tlačidlom
„Ukončiť príjem“ (pri zástave po spustení TANR). Pokyny sa dávajú počas príjmu; po jeho ukončení len pri
opakovanom hovore.
Odporúčanie: áno.
Odpoveď: áno.

## Zhrnutie – spoločné porozumenie (čaká na potvrdenie)

**Smer hry**
- Primárne pre študentov záchranárstva; jadrom je príjem hovoru, mapa a vysielanie ho dopĺňajú.
- Hlavné zariadenie je mobil; hobby projekt bez termínu.
- Repozitár ostáva verejný; v hre len vlastné formulácie kritérií, nič doslovne z obrazoviek OS, fotky obrazoviek sa neukladajú.
- OS ZZS SR zatiaľ neoslovujeme; výsledky pre učiteľa a režim pre verejnosť zatiaľ nebudú; hlasy odložené.

**Odborný obsah**
- Návrh pripravím ja (aj cez partak-155), schvaľuješ ty, kritické veci (TANR, pôrod, dusenie) aj kolega z OS.
- Kontrola cez Excel: hárok situácií, hárok stromov K/N/M/O, hárok krokov TANR, každý so stĺpcom na pripomienky.
- Strom úrazov ostáva môj (overíš ho); asistencie a neodkladná preprava osoby do hry nepatria.

**Poradie práce**
1. Excel na kontrolu obsahu.
2. Prehľadnosť na mobile: príjem na celú obrazovku po krokoch (Rozhovor → Formulár → Naliehavosť → Vysielanie → Pokyny),
   hore len hodiny hovoru a pauza, jedno hlásenie naraz, v karte udalosti poradie posádky → TANR → súčinnosť (tlačidlo „?“)
   → povinné pokyny; na počítači ostáva mapa v strede.
3. Rozbor hovoru: kategória a naliehavosť s rozhodujúcim kritériom, chýbajúce a zbytočné otázky, časová os, pokyny;
   hneď po príjme v kurze a kazuistikách, vo voľnej službe po príchode posádky.
4. Kurz: 8 lekcií po kategóriách, karta s kritériami a 4 hovory, ďalšia lekcia pri 3 zo 4; nový hráč začína lekciou 1.
5. Kazuistiky: jeden hovor od zdvihnutia po príchod posádky s rozborom; prvých 10 napíšem ja, aj podľa verejných
   kazuistík a ÚDZS (prerozprávané, anonymizované, so zdrojom).
6. Skúška: 10 hovorov, strom skrytý, výsledok v percentách, úspech od 80 %, len hodnotenie na obrazovke.
7. AED na mape, odklad pri nedostatku posádok, konzultácia s lekárom OS.

**Pravidlá**
- Čas príjmu: voľná služba a kurz 2× (prvé dve lekcie bez trestu za 90 s), kazuistiky a skúška v reálnom čase.
- Povinné pokyny: pri K a N aspoň jeden správny pokyn, inak −20 a horší stav; pri M body navyše.
- Príjem sa končí tlačidlom „Ukončiť príjem“ (pri zástave až po spustení TANR); pokyny sa dávajú počas príjmu.
- Ostávajú schopnosti, výzvy, denná výzva, medaily a hovory v cudzom jazyku (text, bez hlasu).

**Neskôr / odložené:** oslovenie OS ZZS SR, výsledky pre učiteľa, režim pre verejnosť, hlasy, hromadné nešťastie
s triedením START, sekundárne prevozy, nočná zmena.

**Potvrdené používateľom** – zhrnutie platí, začína sa krokom 1.

## Rozhodnutia po predkontrole obsahu (Excel)

- Doplniť všetko, čo chýbalo: krok TANR „Zapnite reproduktor“, TANR pri utopenom a dojčati (nová situácia Dojča nedýcha),
  pokyny „ak vie kašľať, nech kašle“ a „merajte čas záchvatu“.
- Rozpor „chrčí“ opravený: pri bezvedomí „dýcha pravidelne, len trochu chrápe“, v strome NZO len lapavé dychy.
- Krátky kolaps: pacientka má 25 rokov. Vysoký tlak: nová situácia M (180/100 s miernou bolesťou hlavy), odkladná situácia je teraz
  konzultácia zabudnutej tabletky.
- **Aspirín sa po telefóne nepodáva** – v hre je chybný pokyn.
- **Polícia ide k dopravným nehodám, k resuscitácii a bezvedomiu na verejnosti** (pri ležiacom mužovi pri obchodnom centre je PZ bez trestu).
- Ostáva na overenie v Exceli: strom pre úrazy (vlastný, obrazovku Úrazy som nemal). Osobitný postup UHPO je odložený.

### Doplňujúce odpovede

- **Isté známky smrti:** prehliadka mŕtveho tela. Políciu informovať, len ak je to na verejnosti alebo sú nejasné známky
  s podozrením na cudzie zavinenie. V hre sú dve riešenia: „Úmrtie doma – prehliadka“ a „Úmrtie na verejnosti alebo nejasné –
  prehliadka a polícia“. Nové situácie: Mŕtvy na lavičke, Nájdený mŕtvy v byte (rana, nejasné okolnosti). Chýbajúca polícia −20.
- **Bolesť chrbta s mravčením:** N, ale len pri istých príznakoch zistených doplňujúcimi otázkami. V hre sú dve situácie s podobnou
  úvodnou vetou: M (moč a stolicu udrží, v rozkroku cíti) a N (únik moču, necitlivosť v rozkroku). Strom bolesti je upravený.
