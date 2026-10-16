"""Zapíše do zoznam.json všetky nahrávky volajúcich v tomto priečinku, aby ich hra našla.

Spusti po pridaní alebo premenovaní nahrávok:  python3 urob-zoznam.py
"""
import json, pathlib, re


def nahravky(n):
    return f'{n} nahrávka' if n == 1 else f'{n} nahrávky' if 2 <= n <= 4 else f'{n} nahrávok'


here = pathlib.Path(__file__).resolve().parent
files = sorted(p.name for p in here.iterdir()
               if p.is_file() and re.fullmatch(r'v[0-9a-z]+(-[a-z0-9]{1,8})?\.(mp3|m4a|ogg|oga|opus|wav|webm|aac)', p.name, re.I))
(here / 'zoznam.json').write_text(json.dumps(files, indent=1) + '\n', encoding='utf-8')
print(f'zoznam.json: {nahravky(len(files))}')
