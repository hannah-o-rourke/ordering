# reformparty.uk/news ("Reform Daily")

**Status: not collected.** `www.reformparty.uk` (including `/news`, `/news.rss`,
`/sitemap.xml` and the `/view-pdf/...` policy links) answers every request from this
environment with a Cloudflare "Attention Required" challenge page (HTTP 403). The
collector does not try to defeat that check, and the Internet Archive was not reachable
from this environment as an alternative.

What is known about the section from search-engine snippets (6 Nov 2026):

- Index: https://www.reformparty.uk/news — "News and views from Reform UK".
- Policy category: https://www.reformparty.uk/news/category/policy — 29 articles, 12 per page.
- Recent articles seen:
  - 2026-11-05 — "Reform's new Shadow Armed Forces Minister: I'll end the prosecution of veterans in 100 days or resign" — https://www.reformparty.uk/news/reform-angus-macintyre-end-veteran-prosecutions
  - 2026-11-03 — Farage pledges to review citizenship grants made under the migrant-settlement rule change (front page).
  - "Britain is broke, but Britain isn't beaten": Reform UK unveils sixty-four pro-growth measures — https://www.reformparty.uk/news/reform-economic-rescue-plan-jenrick-tax-free-overtime-growth
  - 2026-09-24 — Danny Kruger's plan to shrink the civil service (policy category).
  - 2026-09-22 — pledge to scrap the "holiday tax" (policy category).
- Other first-party pages: https://www.reformparty.uk/publications (includes the 7 Oct 2026 internal investigation report), https://reformuk.scot/category/press-releases/ (Scottish press releases).

## How to collect it from a normal machine

```bash
pip install requests beautifulsoup4
python3 tools/scrape_reform_news.py --out news/
```

`tools/scrape_reform_news.py` walks the paginated index, saves each article as JSON
(title, date, author, category, body) and Markdown, and downloads any linked PDFs. It
needs to be run from a network where reformparty.uk does not challenge the client.
