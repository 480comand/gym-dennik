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
Odpoveď: …

**Q14 – Štruktúra kurzu** (nadväzuje na Q10 a).
Lekcie po kategóriách, napríklad: 1. zástava a porucha vedomia, 2. dýchanie a alergia, 3. kardio a bolesť,
4. neurológia a diabetes, 5. úrazy a dopravné nehody, 6. intoxikácie a psychické ťažkosti, 7. pôrod a gynekológia,
8. odkladné hovory a hovory mimo 155. Každá lekcia: krátka karta s kritériami a 4 hovory; ďalšia sa odomkne
pri aspoň 3 správnych zo 4.
Odporúčanie: áno.
Odpoveď: …

**Q15 – Kazuistiky** (nadväzuje na Q10 b).
Jedna kazuistika = jeden hovor od zdvihnutia po príchod posádky a rozbor krok po kroku. Prvých 10 napíšem ja
podľa katalógu, ďalšie doplníš z vlastných anonymizovaných prípadov.
Odporúčanie: áno.
Odpoveď: …

**Q16 – Skúška** (nadväzuje na Q10 c).
10 hovorov, strom kritérií skrytý, hodnotí sa naliehavosť, čas do vyslania, TANR, súčinnosť a pokyny.
Výsledok v percentách, hranica úspechu 80 %, na konci obrázok s výsledkom na ukázanie učiteľovi.
Odporúčanie: áno.
Odpoveď: …

**Q17 – Čas počas príjmu v jednotlivých režimoch.**
Teraz beží príjem 2× rýchlejšie ako naozaj. Návrh: voľná služba 2×; kurz 2× a v prvých dvoch lekciách
bez trestu za 90 s; kazuistiky a skúška v reálnom čase (1×).
Odporúčanie: áno.
Odpoveď: …

**Q18 – Obsah rozboru hovoru** (nadväzuje na Q11).
a) správna kategória a naliehavosť s kritériom, ktoré rozhodlo, b) ktoré otázky chýbali a ktoré boli zbytočné,
c) časová os – zdvihnutie, kategória, vyslanie, TANR, d) správne a chybné pokyny volajúcemu.
Odporúčanie: všetko, stručne na jednu obrazovku.
Odpoveď: …

**Q19 – Vysielanie na mobile** (nadväzuje na Q12).
Pri vysielaní je hlavný zoznam posádok s dojazdom, mapa sa dá otvoriť, ale nie je nutná.
Odporúčanie: áno.
Odpoveď: …

**Q20 – Kde bude tabuľa na kontrolu obsahu** (nadväzuje na Q9).
a) súkromná stránka na claude.ai (kolega potrebuje účet a zdieľanie), b) súbor Excel so stĺpcom na pripomienky,
ktorý pošleš e-mailom, c) dokument v Claude Docs.
Odporúčanie: b) Excel – kolega nepotrebuje žiadny účet.
Odpoveď: …

**Q21 – Verejnosť** (nadväzuje na Q1).
a) zatiaľ žiadny osobitný režim, b) neskôr jednoduchý režim, v ktorom hráč je volajúci a učí sa, čo robiť,
keď volá 155 (TANR, poloha, AED).
Odporúčanie: b) neskôr, po kurze a skúške.
Odpoveď: …
