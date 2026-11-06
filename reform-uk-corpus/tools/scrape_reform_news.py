"""Scrape reformparty.uk/news into JSON + Markdown. Run from a network that the site
does not challenge (it refused this collector's environment with a Cloudflare check).

    python3 scrape_reform_news.py --out news/ [--max-pages N] [--delay 1.5]
"""
import argparse, json, os, re, sys, time
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

BASE = 'https://www.reformparty.uk'
UA = 'reform-uk-corpus-collector/0.1 (+research archive)'

def get(url, delay):
    r = requests.get(url, headers={'User-Agent': UA}, timeout=30)
    time.sleep(delay)
    if r.status_code != 200 or 'Attention Required' in r.text[:2000]:
        raise RuntimeError(f'{url} -> HTTP {r.status_code} (challenge page?)')
    return r.text

def article_links(html):
    s = BeautifulSoup(html, 'lxml')
    links = []
    for a in s.select('a[href]'):
        h = urljoin(BASE, a['href'])
        if re.match(rf'{re.escape(BASE)}/news/[^/?#]+$', h) and '/category/' not in h and h not in links:
            links.append(h)
    nxt = s.find('a', string=re.compile(r'next|older|›|»', re.I)) or s.select_one('a[rel=next]')
    return links, (urljoin(BASE, nxt['href']) if nxt and nxt.get('href') else None)

def parse_article(url, html):
    s = BeautifulSoup(html, 'lxml')
    title = (s.find('h1') or s.title).get_text(' ', strip=True)
    date = ''
    t = s.find('time')
    if t: date = t.get('datetime') or t.get_text(strip=True)
    if not date:
        m = s.find('meta', attrs={'property': 'article:published_time'})
        date = m['content'] if m else ''
    body_el = s.find('article') or s.select_one('.content, .page-content, .blog-post, main') or s.body
    paras = [p.get_text(' ', strip=True) for p in body_el.find_all(['p', 'h2', 'h3', 'li'])]
    pdfs = sorted({urljoin(BASE, a['href']) for a in body_el.find_all('a', href=True) if '.pdf' in a['href'].lower() or '/view-pdf/' in a['href']})
    return {'url': url, 'title': title, 'date': date, 'paragraphs': [p for p in paras if p], 'pdf_links': pdfs}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default='news'); ap.add_argument('--max-pages', type=int, default=200); ap.add_argument('--delay', type=float, default=1.5)
    a = ap.parse_args(); os.makedirs(os.path.join(a.out, 'articles'), exist_ok=True)
    url, seen, pages = BASE + '/news', [], 0
    while url and pages < a.max_pages:
        links, url = article_links(get(url, a.delay)); pages += 1
        seen += [l for l in links if l not in seen]
        if not links: break
    print(f'{len(seen)} article URLs over {pages} index pages', file=sys.stderr)
    index = []
    for u in seen:
        slug = u.rstrip('/').split('/')[-1]
        try: art = parse_article(u, get(u, a.delay))
        except Exception as ex: print('SKIP', u, ex, file=sys.stderr); continue
        json.dump(art, open(os.path.join(a.out, 'articles', slug + '.json'), 'w'), indent=1, ensure_ascii=False)
        with open(os.path.join(a.out, 'articles', slug + '.md'), 'w') as f:
            f.write(f"# {art['title']}\n\n{art['date']} · {u}\n\n" + '\n\n'.join(art['paragraphs']) + '\n')
        index.append({'url': u, 'title': art['title'], 'date': art['date'], 'pdf_links': art['pdf_links']})
    json.dump(index, open(os.path.join(a.out, 'index.json'), 'w'), indent=1, ensure_ascii=False)

if __name__ == '__main__': main()
