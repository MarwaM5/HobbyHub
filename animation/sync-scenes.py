"""Development-only: embed scene templates into the existing pages, without fetch()."""
from pathlib import Path
import re
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
def sync(page):
    source=(HERE/page/f'{page}-animation.html').read_text(encoding='utf-8')
    target=ROOT/'pages'/page/f'{page}.html'
    text=target.read_text(encoding='utf-8')
    for name,content in re.findall(r'<template data-hh-scene="([^"]+)">(.*?)</template>',source,re.S):
        pattern=rf'(<!-- HH_SCENE:{name}:START -->).*?(<!-- HH_SCENE:{name}:END -->)'
        text,count=re.subn(pattern,lambda m:m[1]+'\n'+content.strip()+'\n'+m[2],text,flags=re.S)
        if count!=1:raise ValueError(f'{page}: missing or duplicate slot {name}')
    target.write_text(text,encoding='utf-8')
if __name__=='__main__':
    for page in ['home','login','signup']:sync(page)
    print('Three scene sources synchronized.')
