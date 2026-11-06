#!/bin/bash
# Download latest revision per sitting day of TWFY scraped Hansard XML from START date.
set -u
S=$SCRATCH
START=2024-03-11
for KIND in debates westminhall; do
  OUT=$S/raw/twfy/$KIND; mkdir -p $OUT
  curl -sS "https://www.theyworkforyou.com/pwdata/scrapedxml/$KIND/" \
    | grep -oE "${KIND}[0-9]{4}-[0-9]{2}-[0-9]{2}[a-z]?\.xml" | sort -u \
    | awk -v k="$KIND" -v s="$START" '{d=substr($0,length(k)+1,10); if (d>=s) print}' \
    | python3 -I -c '
import sys,re
latest={}
for f in sys.read if False else sys.stdin.read().split():
    m=re.match(r"(.*?)(\d{4}-\d{2}-\d{2})([a-z]?)\.xml",f); latest[m.group(2)]=f  # sorted, so last revision wins
print("\n".join(latest[d] for d in sorted(latest)))' > $OUT/_files.txt
  echo "$KIND: $(wc -l < $OUT/_files.txt) files"
  while read f; do
    [ -s "$OUT/$f" ] && continue
    curl -sS --retry 3 --retry-delay 2 -o "$OUT/$f" "https://www.theyworkforyou.com/pwdata/scrapedxml/$KIND/$f" || echo "FAIL $f"
    sleep 0.3
  done < $OUT/_files.txt
  echo "$KIND done: $(ls $OUT/*.xml | wc -l) files, $(du -sh $OUT | cut -f1)"
done
echo ALLDONE
