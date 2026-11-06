"""Extract every contribution by a Reform UK member (while they sat for Reform) from
TheyWorkForYou / ParlParse scraped Hansard XML into JSONL + Markdown.
Usage: python3 -I extract_speeches.py <raw_twfy_dir> <out_dir>
"""
import sys, os, json, re, glob
from collections import defaultdict
from lxml import etree

raw, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
members = json.load(open(os.path.join(raw, 'reform_memberships.json')))
# person_id -> list of (start, end, house, area)
spans = defaultdict(list)
for m in members:
    spans[m['person_id']].append((m['start_date'], m['end_date'] or '9999-12-31', m['house'], m['area'], m['name']))

def reform_on(pid, date):
    for s, e, house, area, name in spans.get(pid, []):
        if s <= date <= e:
            return house, area, name
    return None

def text_of(el):
    paras = []
    for p in el.iter('p'):
        t = ''.join(p.itertext()).strip()
        t = re.sub(r'\s+', ' ', t)
        if t: paras.append(t)
    if not paras:
        t = re.sub(r'\s+', ' ', ''.join(el.itertext())).strip()
        if t: paras.append(t)
    return '\n\n'.join(paras)

COLLECTIONS = {'debates': ('House of Commons', 'https://www.theyworkforyou.com/debates/?id='),
               'westminhall': ('Westminster Hall', 'https://www.theyworkforyou.com/whall/?id='),
               'senedd': ('Senedd', None),
               'sp': ('Scottish Parliament', None)}
records = []
for coll, (chamber, urlbase) in COLLECTIONS.items():
    for f in sorted(glob.glob(os.path.join(raw, coll, '*.xml'))):
        date = re.search(r'(\d{4}-\d{2}-\d{2})', os.path.basename(f)).group(1)
        try:
            tree = etree.parse(f, etree.XMLParser(recover=True, huge_tree=True))
        except Exception as ex:
            print('PARSE FAIL', f, ex, file=sys.stderr); continue
        major = minor = ''
        for el in tree.getroot():
            tag = el.tag
            if tag in ('major-heading', 'oral-heading'):
                major = re.sub(r'\s+', ' ', ''.join(el.itertext())).strip(); minor = ''
            elif tag == 'minor-heading':
                minor = re.sub(r'\s+', ' ', ''.join(el.itertext())).strip()
            elif tag == 'speech':
                pid = el.get('person_id')
                if not pid: continue
                hit = reform_on(pid, date)
                if not hit: continue
                house, area, name = hit
                body = text_of(el)
                if not body: continue
                sid = el.get('id', '')
                url = el.get('url') or (urlbase + sid.split('/')[-1] if urlbase else '')
                records.append({
                    'id': sid, 'date': date, 'chamber': chamber, 'collection': coll,
                    'speaker': el.get('speakername') or name, 'person_id': pid, 'constituency': area,
                    'speech_type': el.get('type') or '', 'debate': major, 'section': minor,
                    'time': el.get('time') or '', 'url': url, 'text': body, 'words': len(body.split()),
                })
records.sort(key=lambda r: (r['date'], r['id']))
with open(os.path.join(out, 'reform_contributions.jsonl'), 'w') as fh:
    for r in records: fh.write(json.dumps(r, ensure_ascii=False) + '\n')
# Markdown: one file per speaker per chamber, chronological
by = defaultdict(list)
for r in records: by[(r['chamber'], r['speaker'])].append(r)
mdroot = os.path.join(out, 'markdown'); os.makedirs(mdroot, exist_ok=True)
index = []
for (chamber, speaker), rs in sorted(by.items()):
    slug = re.sub(r'[^a-z0-9]+', '-', (chamber + '-' + speaker).lower()).strip('-')
    path = os.path.join(mdroot, slug + '.md')
    with open(path, 'w') as fh:
        fh.write(f'# {speaker} — {chamber} contributions\n\n{len(rs)} contributions, {sum(r["words"] for r in rs):,} words. Source: TheyWorkForYou / ParlParse scraped Hansard.\n\n')
        for r in rs:
            head = ' / '.join(x for x in (r['debate'], r['section']) if x)
            fh.write(f'## {r["date"]} — {head}\n\n')
            if r['url']: fh.write(f'*{r["speech_type"] or "Speech"}* · [{r["url"]}]({r["url"]})\n\n')
            fh.write(r['text'] + '\n\n')
    index.append({'chamber': chamber, 'speaker': speaker, 'contributions': len(rs), 'words': sum(r['words'] for r in rs), 'file': 'markdown/' + slug + '.md', 'first': rs[0]['date'], 'last': rs[-1]['date']})
json.dump(index, open(os.path.join(out, 'index.json'), 'w'), indent=1)
print(f'{len(records)} contributions from {len(by)} speaker/chamber pairs')
for i in sorted(index, key=lambda x: -x['words'])[:40]: print(f"{i['chamber']:16} {i['speaker']:28} {i['contributions']:5} {i['words']:8,}  {i['first']}..{i['last']}")
