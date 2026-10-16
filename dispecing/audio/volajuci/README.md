# Hlasy volajúcich

Sem patria nahrávky viet, ktoré hovoria volajúci na linke 155. Hra si ich prehrá cez telefónnu linku
(orezaný zvuk ako v telefóne). Veta bez nahrávky ostane len ako text, lebo hlas prehliadača je zatiaľ vypnutý.
Zatiaľ len po slovensky.

`scenar.csv` (alebo `scenar.html` v prehliadači) obsahuje všetkých 760 slovenských viet:

| Stĺpec | Význam |
|---|---|
| `subor` | názov súboru – napríklad `v1t3rarm.mp3` |
| `emocia` | panika, strach, plač, šok, nervozita, rozčúlenie, pokoj, úľava, zdesenie, zmätenosť, posmech |
| `ako_zahrat` | pokyn pre hlas, napríklad „kričí, hovorí rýchlo, zajakáva sa a lapá po dychu“ |
| `udalost`, `situacia` | kedy veta v hre zaznie |
| `text` | presné znenie vety |
| `hovori` | udalosť, ktorej volajúci vetu hovorí; `*` = spoločná veta pre všetkých volajúcich |
| `hlas` | `žena` alebo `muž`, ak volajúci hovorí v rode (napríklad „Prikryla som ju“); prázdne = ktokoľvek |

## Možnosť A: AI hlasy z ElevenLabs

Skript `generuj-hlasy.py` vytvorí všetky nahrávky naraz. Stačí Python 3, nič iné netreba inštalovať.

1. Na [elevenlabs.io](https://elevenlabs.io) si v **Developers → API Keys** vytvor kľúč
   (povoľ Text to Speech a čítanie Voices) a nastav ho:
   - Windows (PowerShell): `$env:ELEVENLABS_API_KEY = "tvoj_kluc"`
   - macOS / Linux: `export ELEVENLABS_API_KEY=tvoj_kluc`
2. `python3 generuj-hlasy.py --hlasy` vypíše hlasy z tvojho účtu a pripraví `hlasy.json` so štyrmi z nich
   (`a` až `d`) aj s pohlavím (`"pohlavie": "Ž"` alebo `"M"`). V súbore môžeš vymeniť `voice_id`, pridať hlasy `e` až `h` alebo priradiť hlas udalosti,
   napríklad `"udalosti": {"Pôrod": "b"}`. Prirodzenejšie znejú hlasy so slovenským prízvukom z Voice Library –
   pridaj si ich do svojich hlasov a spusti `--hlasy` znova.
3. `python3 generuj-hlasy.py --odhad` spočíta, koľko znakov (kreditov) generovanie spotrebuje.
   So štyrmi hlasmi je to asi 69 000 znakov aj so značkami emócií. Porovnaj to s kreditmi svojho plánu na elevenlabs.io.
4. `python3 generuj-hlasy.py --max 10` vyskúša prvých 10 nahrávok. Keď sa ti páčia,
   `python3 generuj-hlasy.py` dorobí zvyšok. Hotové súbory preskakuje, takže ho môžeš prerušiť a spustiť znova.
   `--len "Zástava"` vygeneruje len vety udalostí, ktorých názov obsahuje zadaný text.

Model `eleven_v4` dostane pred každou vetou značky emócie, napríklad `[panicked] [breathless]` alebo `[crying]`.
Vety, v ktorých volajúci hovorí ako žena alebo muž, dostanú hlas správneho pohlavia; spoločné vety sú bez rodu.
Značky si môžeš upraviť v slovníku `TAGS` na začiatku skriptu.

Každá udalosť má svoj hlas, takže volajúci hovorí počas celého hovoru rovnakým hlasom.
Spoločné vety, napríklad úvodné „Prosím, rýchlo, potrebujem pomoc!“, sa vytvoria v každom hlase.
Súbory majú na konci písmeno hlasu: `v1t3rarm-a.mp3`, `v1t3rarm-b.mp3`.

## Možnosť B: vlastné nahrávky

- Stačí mobil (Diktafón, Hlasové poznámky) v tichej miestnosti, asi 20 cm od úst.
- Hraj emóciu naplno: volajúci na 155 nečíta, ale je v strese. Lapanie po dychu, zajakanie a plač sú vítané.
- Každú vetu ulož ako samostatný súbor a pomenuj ho podľa stĺpca `subor`.
  Prípona môže byť `.mp3`, `.m4a`, `.ogg`, `.opus`, `.wav` alebo `.webm`.
  Ak nahráva viac ľudí, každý môže pridať svoje písmeno: `v1t3rarm-e.m4a`.
- Na začiatku a na konci nechaj najviac pol sekundy ticha.
- Začni úvodnými vetami a udalosťami P1 – tie počuť najčastejšie.

Súbory skopíruj do tohto priečinka a spusti `python3 urob-zoznam.py`. Zapíše ich do `zoznam.json`,
podľa ktorého ich hra hľadá. Bez Pythonu môžeš `zoznam.json` upraviť aj ručne: `["v1t3rarm.mp3", "v155krf5-a.m4a"]`.

## Ako ich počuť v hre

Otvor `hra.html` cez webový server – na GitHub Pages
(`https://480comand.github.io/gym-dennik/dispecing/hra.html`) alebo lokálne
(`python3 -m http.server` v priečinku `gym-dennik` a potom `http://localhost:8000/dispecing/hra.html`).
Pri otvorení súboru priamo z disku prehliadač nahrávky nenačíta. V hre nechaj zapnuté tlačidlá **Zvuk** a **Hlas**.
Verzia hry na claude.ai má nahrávky priložené len vtedy, keď sa zverejnia spolu s ňou.

Názov súboru vznikol z presného znenia vety. Keď sa veta v hre zmení, zmení sa aj názov.
Po úprave viet treba vytvoriť nový `scenar.csv` a chýbajúce vety dogenerovať.
