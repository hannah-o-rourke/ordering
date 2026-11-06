# Reform UK corpus

Speeches, parliamentary contributions and policy documents by Reform UK, collected on
6 November 2026. Everything here is either raw source material (PDFs, metadata) or a
mechanical extraction from it; nothing is summarised or paraphrased.

| Folder | What | Status |
|---|---|---|
| `hansard/` | Every Commons, Westminster Hall and Senedd contribution by a Reform UK member, from 11 Mar 2024 (first Reform MP) to 4 Nov 2026 | **Complete** |
| `policies/` | Reform UK policy documents (PDF + plain text) from the party's document host | **Partial**: 9 documents; 2025–26 documents served only via reformparty.uk could not be fetched |
| `youtube/` | The "Farage Full Speeches" playlist (`PLFhABSLDpHuQ`): titles, lengths, views, links | **Metadata only**: no transcripts |
| `news/` | reformparty.uk/news | **Not collected**: site blocks non-browser clients; scraper provided |
| `tools/` | The scripts that built this, so it can be re-run or extended | |

## hansard/

Source: TheyWorkForYou / ParlParse scraped Hansard XML
(`https://www.theyworkforyou.com/pwdata/scrapedxml/`), which is the open bulk form of
the official record. `hansard.parliament.uk` itself refuses non-browser requests.

- `reform_contributions.jsonl` — one record per contribution: `date`, `chamber`,
  `speaker`, `person_id`, `constituency`, `speech_type` (question / answer / speech),
  `debate`, `section`, `url` (link to the record), `text`, `words`.
- `markdown/<chamber>-<speaker>.md` — the same text, one file per speaker per chamber,
  chronological, with debate headings and links.
- `index.json` — per-speaker counts and date ranges.
- `reform_memberships.json` — who counted as Reform UK and when (from ParlParse
  `people.json`). A contribution is included only if the speaker sat for Reform on that
  date, so Rupert Lowe stops on 7 Mar 2025 and James McMurdock on 5 Jul 2025, Nigel Farage
  has a gap between his July 2026 resignation and August 2026 by-election, and the
  defectors (Kruger, Jenrick, Rosindell, Braverman) start from the day they joined.

Coverage: House of Commons main chamber and Westminster Hall (latest revision of every
sitting day, 11 Mar 2024 to 4 Nov 2026) and the Senedd (12 May 2026 onward, English
record). Totals: 2,516 contributions, about 416,000 words (Commons 962, Westminster Hall 264, Senedd 1,290). Not covered: Reform MSPs in
the Scottish Parliament (TheyWorkForYou's Scottish Parliament feed ends in 2011), the
House of Lords (no Reform peers in the Members API), and written questions.

## policies/

See `policies/README.md` and `policies/sources.json` for titles, dates and source URLs.
`policies/text/` has a plain-text copy of each PDF (OCR where the PDF is image-only).

## youtube/

`youtube/playlist.json` and `youtube/README.md`. YouTube answered every video-page
request from this environment with a sign-in / bot check, so subtitles were not
fetched. The `yt-dlp` command to add them from a normal machine is in the README.

## Re-running

```bash
# Hansard: download XML (needs curl, python3, lxml) then extract
SCRATCH=/some/dir bash tools/fetch_twfy.sh && bash tools/fetch_whall.sh && bash tools/fetch_senedd.sh
python3 tools/extract_speeches.py "$SCRATCH/raw/twfy" hansard/

# News (from a network reformparty.uk does not challenge)
python3 tools/scrape_reform_news.py --out news/
```

`tools/fetch_twfy.sh` expects `reform_memberships.json` next to the XML; it is derived
from `https://www.theyworkforyou.com/pwdata/people.json` (memberships with
`on_behalf_of_id == "reform"`).
