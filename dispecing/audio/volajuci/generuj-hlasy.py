"""Vygeneruje hlasy volajúcich cez ElevenLabs podľa scenar.csv (len slovenčina).

Potrebuješ Python 3 (nič iné netreba inštalovať) a kľúč k ElevenLabs:
ElevenLabs → Developers → API Keys → Create (povoľ Text to Speech a čítanie Voices).

  Windows (PowerShell):  $env:ELEVENLABS_API_KEY = "tvoj_kluc"
  macOS / Linux:         export ELEVENLABS_API_KEY=tvoj_kluc

  python3 generuj-hlasy.py --hlasy           vypíše tvoje hlasy a pripraví hlasy.json
  python3 generuj-hlasy.py --odhad           koľko znakov (kreditov) bude generovanie stáť
  python3 generuj-hlasy.py --max 10          vyskúša 10 viet
  python3 generuj-hlasy.py                   vygeneruje všetko, čo ešte chýba
  python3 generuj-hlasy.py --len "Zástava"   len vety udalostí, ktorých názov obsahuje text

Hotové nahrávky sa preskočia, takže skript môžeš kedykoľvek prerušiť a spustiť znova.
Na konci obnoví zoznam.json, podľa ktorého ich hra nájde.
"""
import argparse, csv, json, os, pathlib, re, sys, time, urllib.error, urllib.request

HERE = pathlib.Path(__file__).resolve().parent


def nahravky(n):
    return f'{n} nahrávka' if n == 1 else f'{n} nahrávky' if 2 <= n <= 4 else f'{n} nahrávok'

BASE = os.environ.get('ELEVENLABS_BASE', 'https://api.elevenlabs.io').rstrip('/')
FORMAT = 'mp3_44100_64'           # telefónna kvalita stačí a súbory sú malé
LETTERS = 'abcdefgh'

# Emócia zo scenára → zvukové značky pre modely eleven_v4 a eleven_v3 (v hranatých zátvorkách, po anglicky).
# Môžeš ich upraviť; staršie modely (eleven_multilingual_v2 a pod.) značky nepoznajú a skript ich vynechá.
TAGS = {
    'panika': '[panicked] [breathless]', 'strach': '[scared] [trembling voice]', 'plač': '[crying]',
    'šok': '[in shock] [slowly]', 'nervozita': '[nervous]', 'rozčúlenie': '[frustrated]', 'pokoj': '',
    'úľava': '[relieved] [exhales]', 'zdesenie': '[horrified] [gasps]', 'zmätenosť': '[confused] [cautiously]',
    'posmech': '[giggles] [mischievously]',
}
TAG_MODELS = ('eleven_v4', 'eleven_v3')


def api(path, body=None, accept='application/json'):
    key = os.environ.get('ELEVENLABS_API_KEY', '').strip()
    if not key:
        sys.exit('Chýba kľúč: nastav premennú ELEVENLABS_API_KEY (pozri návod na začiatku skriptu).')
    req = urllib.request.Request(BASE + path, method='POST' if body is not None else 'GET',
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': accept})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'replace')[:400]
            if e.code == 401:
                sys.exit('ElevenLabs odmietol kľúč (401). Skontroluj ELEVENLABS_API_KEY a jeho práva.\n' + msg)
            if e.code == 429 or e.code >= 500:
                wait = 5 * 2 ** attempt
                print(f'  ElevenLabs je vyťažený ({e.code}), skúšam znova o {wait} s…')
                time.sleep(wait)
                continue
            sys.exit(f'ElevenLabs vrátil chybu {e.code}:\n{msg}')
        except urllib.error.URLError as e:
            wait = 5 * 2 ** attempt
            print(f'  Spojenie zlyhalo ({e.reason}), skúšam znova o {wait} s…')
            time.sleep(wait)
    sys.exit('ElevenLabs neodpovedá ani po niekoľkých pokusoch. Skús to neskôr.')


def load_lines():
    with open(HERE / 'scenar.csv', encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f, delimiter=';'))


def load_config():
    p = HERE / 'hlasy.json'
    if not p.exists():
        sys.exit('Chýba hlasy.json. Najprv spusti:  python3 generuj-hlasy.py --hlasy')
    cfg = json.loads(p.read_text(encoding='utf-8'))
    voices = {k: v for k, v in cfg.get('hlasy', {}).items() if v.get('voice_id')}
    if not voices:
        sys.exit('V hlasy.json nie je žiadny hlas s voice_id.')
    return cfg, voices


def plan(lines, cfg, voices, only=None):
    """Ktoré súbory treba: veta udalosti v hlase jej volajúceho (žena/muž podľa scenára),
    spoločná veta v každom hlase."""
    letters = sorted(voices)
    events, gender = [], {}
    for l in lines:
        if l['hovori'] != '*' and l['hovori'] not in events:
            events.append(l['hovori'])
            gender[l['hovori']] = {'žena': 'Ž', 'muž': 'M'}.get(l.get('hlas', ''), '')
    used = {}
    def pick(e):
        if cfg.get('udalosti', {}).get(e) in voices:
            return cfg['udalosti'][e]
        pool = [k for k in letters if gender[e] and voices[k].get('pohlavie') == gender[e]] or letters
        n = used.get(tuple(pool), 0); used[tuple(pool)] = n + 1
        return pool[n % len(pool)]
    assign = {e: pick(e) for e in events}
    jobs = []
    for l in lines:
        if only and only.lower() not in (l['udalost'] + ' ' + l['hovori']).lower():
            continue
        stem = l['subor'].rsplit('.', 1)[0]
        for v in (letters if l['hovori'] == '*' else [assign[l['hovori']]]):
            if v in voices:
                jobs.append((l, v, HERE / f'{stem}-{v}.mp3'))
    return jobs, assign


def text_for(line, model):
    tag = TAGS.get(line['emocia'], '') if model.startswith(TAG_MODELS) else ''
    return (tag + ' ' + line['text']).strip()


def write_index():
    files = sorted(p.name for p in HERE.iterdir()
                   if p.is_file() and re.fullmatch(r'v[0-9a-z]+(-[a-z0-9]{1,8})?\.(mp3|m4a|ogg|oga|opus|wav|webm|aac)', p.name, re.I))
    (HERE / 'zoznam.json').write_text(json.dumps(files, indent=1) + '\n', encoding='utf-8')
    print(f'zoznam.json: {nahravky(len(files))} – hra ich pri ďalšom spustení nájde.')


def cmd_voices():
    data = json.loads(api('/v1/voices'))
    vs = data.get('voices', [])
    if not vs:
        sys.exit('Na účte nie sú žiadne hlasy. Pridaj si nejaké vo Voice Library na elevenlabs.io.')
    print('Tvoje hlasy (voice_id – meno – popis):')
    for v in vs:
        lab = v.get('labels') or {}
        print(f"  {v['voice_id']}  {v.get('name', '')}  ({', '.join(str(x) for x in lab.values() if x)})")
    p = HERE / 'hlasy.json'
    if p.exists():
        print('\nhlasy.json už existuje – nechávam ho, uprav ho podľa zoznamu vyššie.')
        return
    pick = vs[:4]
    sex = lambda v: {'female': 'Ž', 'male': 'M'}.get((v.get('labels') or {}).get('gender', ''), '')
    cfg = {'model': 'eleven_v4',
           'hlasy': {LETTERS[i]: {'voice_id': v['voice_id'], 'meno': v.get('name', ''), 'pohlavie': sex(v)} for i, v in enumerate(pick)},
           'udalosti': {}}
    p.write_text(json.dumps(cfg, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'\nVytvoril som hlasy.json so {len(pick)} hlasmi ({", ".join(v.get("name", "") for v in pick)}).')
    print('Môžeš v ňom zmeniť voice_id, pridať hlasy (e–h) alebo do "udalosti" priradiť hlas udalosti, napr. "Pôrod": "b".')
    print('Pri každom hlase nech je "pohlavie": "Ž" alebo "M" – vety, v ktorých volajúci hovorí ako žena alebo muž, dostanú hlas správneho pohlavia.')


def main():
    ap = argparse.ArgumentParser(description='Hlasy volajúcich pre hru Linka 112 cez ElevenLabs')
    ap.add_argument('--hlasy', action='store_true', help='vypíše hlasy z účtu a pripraví hlasy.json')
    ap.add_argument('--odhad', action='store_true', help='len spočíta znaky chýbajúcich viet')
    ap.add_argument('--len', metavar='TEXT', help='len udalosti, ktorých názov obsahuje TEXT')
    ap.add_argument('--max', type=int, default=0, help='najviac toľko nových súborov')
    ap.add_argument('--model', help='model ElevenLabs (predvolene z hlasy.json, inak eleven_v4)')
    a = ap.parse_args()
    if a.hlasy:
        return cmd_voices()
    cfg, voices = load_config()
    model = a.model or cfg.get('model') or 'eleven_v4'
    jobs, assign = plan(load_lines(), cfg, voices, a.len)
    todo = [j for j in jobs if not j[2].exists()]
    chars = sum(len(text_for(l, model)) for l, v, f in todo)
    print(f'Model {model}, hlasy: {", ".join(f"{k} = {v.get("meno") or v["voice_id"]}" for k, v in sorted(voices.items()))}')
    print(f'Súborov spolu {len(jobs)}, chýba {len(todo)} – asi {chars} znakov.')
    if a.odhad:
        return
    if a.max:
        todo = todo[:a.max]
    for n, (l, v, f) in enumerate(todo, 1):
        body = {'text': text_for(l, model), 'model_id': model}
        if not model.startswith(TAG_MODELS):
            body['voice_settings'] = {'stability': .35, 'similarity_boost': .75, 'style': .55, 'use_speaker_boost': True}
        audio = api(f"/v1/text-to-speech/{voices[v]['voice_id']}?output_format={FORMAT}", body, accept='audio/mpeg')
        f.write_bytes(audio)
        print(f'[{n}/{len(todo)}] {f.name}  {l["emocia"]}: {l["text"][:60]}')
    write_index()


if __name__ == '__main__':
    main()
