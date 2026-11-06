#!/bin/bash
S=$SCRATCH
OUT=$S/raw/twfy/senedd; mkdir -p $OUT
curl -sS "https://www.theyworkforyou.com/pwdata/scrapedxml/senedd/en/" | grep -oE 'href="[^"?/]+\.xml"' | sed 's/href="//;s/"//' | sort -u \
 | python3 -I -c '
import sys,re
latest={}
for f in sys.stdin.read().split():
    m=re.search(r"(\d{4}-\d{2}-\d{2})([a-z]?)\.xml$",f)
    if m and m.group(1)>="2026-05-08": latest[m.group(1)]=f
print("\n".join(latest[d] for d in sorted(latest)))' > $OUT/_files.txt
echo "senedd: $(wc -l < $OUT/_files.txt) files"; head -2 $OUT/_files.txt
while read f; do [ -s "$OUT/$f" ] && continue; curl -sS --retry 3 -o "$OUT/$f" "https://www.theyworkforyou.com/pwdata/scrapedxml/senedd/en/$f" || echo FAIL $f; sleep 0.3; done < $OUT/_files.txt
echo "senedd done $(ls $OUT/*.xml 2>/dev/null | wc -l)"
