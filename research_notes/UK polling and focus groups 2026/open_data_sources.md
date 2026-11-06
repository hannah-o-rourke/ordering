# Open and downloadable raw data sources for UK public-opinion polling and survey research (2026)

Research date: 6 November 2026. Local archive: `/home/user/ordering/research_notes/UK polling and focus groups 2026/data/open_datasets/` (57 files, ~23 MB; inventory in the "Local archive" section below).

**Important caveat on what could be downloaded.** This session's outbound network was limited to GitHub (api.github.com, raw.githubusercontent.com, anonymous `git clone`), package registries (PyPI), `yougov.com` (the global site only, not `yougov.co.uk`, not the data API `api-test.yougov.com`, not the tables CDN `d3nkl3psvxxpe9.cloudfront.net`) and a handful of unrelated hosts. Every other polling host returned `CONNECT tunnel failed, response 403` from the egress proxy (markpack.org.uk, en.wikipedia.org, query.wikidata.org, politico.eu, ons.gov.uk, ukdataservice.ac.uk, britishelectionstudy.com, natcen.ac.uk, ipsos.com, moreincommon.org.uk, electoralcalculus.co.uk, commonslibrary.parliament.uk, data.parliament.uk, electoralcommission.org.uk, kaggle.com, huggingface.co, zenodo.org, docs.google.com, ourworldindata.org, data.gov.uk). Environment-change tools (to allow these hosts) were denied by the session's permission classifier, so I could not widen the network. The web-search budget for the whole run was also exhausted part-way through (the shared cap of 200 searches per turn), which limited verification of a few sources. Consequently the raw archive was assembled from **GitHub mirrors and derivatives of the primary sources** (Mark Pack's PollBase xlsx as redistributed in a public repo; Wikipedia polling tables scraped daily by public repos; YouGov article pages on yougov.com), and every primary source that could not be fetched is catalogued with its URL and exact access steps instead. Each downloaded file was verified by size and by parsing its head (row counts and date ranges are reported below).

---

## 1. Which hosts/sources were actually fetchable, and what did the local archive end up containing?

### Takeaway
Direct downloads from pollsters, UKDS, ONS, BES, Politico and Wikipedia were all blocked by the session's network policy; the archive was built from GitHub-hosted copies (anonymous clone via the session's git proxy worked for public repos) and from yougov.com article pages. The result is a usable 2026-current archive of GB voting-intention polls (PollBase Q4 2025 edition to 7 Jan 2026; Wikipedia-derived poll tables to 2 Nov 2026; Scottish Parliament and Senedd 2026 polls; YouGov/Times weekly VI for Sep–Nov 2026) plus long-run election results, but **no individual-level survey microdata** (BES, BSA, OPN, ESS etc. all require registration and were unreachable anyway).

### Cited Findings
- GitHub search API and anonymous git reads of public repositories worked; the proxy "serves anonymous git reads (clone/fetch) of public GitHub repositories directly" — confirmed by cloning 13 repositories, e.g. [samueljackson92/polls](https://github.com/samueljackson92/polls), [keithysimpson/UK_general_election_polls_stacked](https://github.com/keithysimpson/UK_general_election_polls_stacked), [jackobailey/britpol](https://github.com/jackobailey/britpol), [MaxHigdon44/Poll-of-polls](https://github.com/MaxHigdon44/Poll-of-polls), [data-john/voting-intention-analysis](https://github.com/data-john/voting-intention-analysis), [times/times-channel-britain-at-a-glance-data](https://github.com/times/times-channel-britain-at-a-glance-data), [ralphascott/UKGE24_wpc_census_summaries](https://github.com/ralphascott/UKGE24_wpc_census_summaries).
- `raw.githubusercontent.com` single-file fetches worked (HTTP 200), e.g. [vfillis/automated-polling R/polling.R](https://raw.githubusercontent.com/vfillis/automated-polling/main/R/polling.R), [cornelius-erfort politico-poll-of-polls.R](https://raw.githubusercontent.com/cornelius-erfort/automated-web-data-collection/main/examples/politico/politico-poll-of-polls.R).
- `yougov.com` (global domain) returned HTTP 200 for article pages such as [Voting intention, 1-2 November 2026](https://yougov.com/en-gb/articles/55883-voting-intention-1-2-november-2026-lab-26-con-24-ref-21-ld-11-grn-10), but tracker pages under `/en-gb/topics/politics/trackers/...` returned 404 on that domain (they live on yougov.co.uk, which was blocked).
- PyPI was reachable; `pyreadr 0.5.9` was installed to convert the britpol `.rda` files to CSV — [pyreadr on PyPI](https://pypi.org/pypi/pyreadr/json). No PyPI package named pollbase, ukpolls, britpol, polldata, uk-polls or yougov exists (all 404 at `pypi.org/pypi/<name>/json`).

### Inferences
- With an unrestricted network the same scripts in the cheat sheet (section 11) would fetch the primary files directly; the GitHub-derived copies here are faithful mirrors for PollBase (the xlsx is byte-for-byte Mark Pack's workbook, with his Introduction sheet intact) and for Wikipedia (raw HTML saved 6 Nov 2026).
- For the report writer: treat the Wikipedia-derived CSVs as "poll of record" lists compiled by Wikipedia editors from BPC pollsters' published tables, not as pollster-authored data.

### Gaps
- No raw files could be obtained from: BES, UK Data Service (BSA, Understanding Society, OPN, ESS, WVS), NatCen/What UK Thinks, YouGov tracker API, Ipsos, Opinium, More in Common, Survation, Politico, Electoral Calculus, ONS, HoC Library (except via GitHub redistribution), Electoral Commission, ARK/NILT, Scottish/Welsh Government, Reuters Institute, Kaggle, Hugging Face. Each is catalogued below with access steps.
- Web search budget exhaustion meant I could not run planned searches for: Opinium tables archive 2026, Britain Predicts data, National Survey for Wales 2025-26, Understanding Society wave 15 release, WVS wave 8 UK, Electoral Calculus poll list, BES 2024 face-to-face release details, Hansard Society Audit, KCL Policy Institute, UK in a Changing Europe trackers, Party Members Project, Centre for Social Investigation, Nuffield Politics Research Centre, Prolific/Focaldata marketplaces. These are listed as unverified in section 9.

---

## 2. British Election Study (BES): 2026 releases, access and codebooks

### Takeaway
BES Internet Panel **Wave 31** (fieldwork 8 May–3 June 2026, N = 31,392, run by YouGov) was released with a note dated 19 August 2026; the combined Waves 1–31 panel file (Feb 2014–June 2026, N = 126,709) is also listed. Data are free but require registration on britishelectionstudy.com and are supplied as SPSS/Stata files with PDF codebooks; the site was unreachable from this session.

### Cited Findings
- Release note for Wave 31 dated 19 August 2026: fielded by YouGov 8 May–3 June 2026; 31,392 respondents; 20,201 also completed Wave 30 (67% retention); updated "EconImpact" items referring to the conflict in Iran, piloted against earlier wording with no statistically significant difference — [BES release note, Wave 31](https://www.britishelectionstudy.com/uncategorized/release-note-for-wave-31-of-the-british-election-study-internet-panel/) (via search snippet; page itself unreachable).
- The BES data page lists Wave 31 (May–June 2026, online) and a combined Waves 1–31 dataset covering February 2014 to June 2026 with N = 126,709 — [BES data objects](https://www.britishelectionstudy.com/data-object/); individual wave pages e.g. [Wave 30](https://www.britishelectionstudy.com/data-object/wave-30-of-the-2014-2026-british-election-study-internet-panel/), [Wave 29](https://www.britishelectionstudy.com/data-object/wave-29-of-the-2014-2024-british-election-study-internet-panel/).
- The 2024 election "Provisional Panel Dataset" was released as a separate data object — [BES: Data Release: 2024 Election Provisional Panel Dataset](https://www.britishelectionstudy.com/uncategorized/data-release-2024-election-provisional-panel-dataset/); third-party GitHub projects analysing it confirm it is in circulation (e.g. [macyjohns10/Support-for-Redistribution-](https://github.com/macyjohns10/Support-for-Redistribution-), [bakered/uk-election-bayesian-multilevel-modelling](https://github.com/bakered/uk-election-bayesian-multilevel-modelling)).
- Search results found no announcement of a Wave 32 or any other 2026 wave beyond Wave 31 — [BES news page](https://www.britishelectionstudy.com/news/).
- Convenience tooling: the R package [jackobailey/BESTools](https://github.com/jackobailey/BESTools) and [dempseynoel/clbes](https://github.com/dempseynoel/clbes) are "tools for working with survey data from the British Election Study" (GitHub search descriptions).

### Inferences
- Wave 31 is the only 2026-fieldwork BES Internet Panel wave publicly released as of 6 Nov 2026; a post-May-2026 (Scottish/Welsh election) wave would be the obvious candidate for a next release but nothing was found.
- Access steps (standard BES procedure; the site could not be opened to re-verify wording): (1) create a free account at britishelectionstudy.com; (2) log in and open the Data page / the Wave 31 data object; (3) download the SPSS (.sav) or Stata (.dta) file and the PDF codebook; (4) load with `pandas.read_spss` / `pd.read_stata`. BES data are also deposited at the UK Data Service under its End User Licence for the face-to-face studies.

### Gaps
- Could not confirm the 2024 face-to-face (post-election probability sample) BES release date, N, or UKDS study number — britishelectionstudy.com and ukdataservice.ac.uk were both blocked, and the search budget ran out before the planned "BES 2024 face-to-face UK Data Service" query completed.
- Could not retrieve the Wave 31 codebook or variable list.

---

## 3. UK Data Service holdings: BSA, Understanding Society, ONS OPN, ESS, WVS

### Takeaway
UKDS is the registration-gated home for the main microdata (End User Licence; free for UK academic and most other users). The latest BSA deposit confirmed in search results is **BSA 2024 (SN 9478)**; BSA 2025 (fieldwork Aug–Oct 2025, reported by NatCen in Feb 2026) had no catalogue record visible in search. ESS Round 12 UK data were expected "in 2026" but no UK release date was confirmed.

### Cited Findings
- UKDS catalogue record "British Social Attitudes Survey, 2024" is SN 9478; its user guide was published October 2025 — [9478_bsa24_user_guide.pdf](https://doc.ukdataservice.ac.uk/doc/9478/mrdoc/pdf/9478_bsa24_user_guide.pdf). Earlier: BSA 2022 is SN 9283 — [9283_bsa_2022_user_guide.pdf](https://doc.ukdataservice.ac.uk/doc/9283/mrdoc/pdf/9283_bsa_2022_user_guide.pdf); BSA 2023 / BSA 41 metadata mirrored at [Harmony](https://harmonydata.ac.uk/search/items/british-social-attitudes-survey-2023-bsa-41).
- UKDS publishes open teaching materials for BSA on GitHub: [UKDataServiceOpen/Introduction_to_the_BSA](https://github.com/UKDataServiceOpen/Introduction_to_the_BSA) ("Quarto source files of the practical exercises for the Introduction to Social Attitudes Surveys UKDS Data Skills Module") — cloned; it contains code only, no data files (the exercises expect the user to download BSA from UKDS).
- A 2018 GitHub repo claims to hold "cumulative SPSS 'mother' files for all waves of the British Social Attitudes Survey from 1983 onwards" — [surveyresearcher/British-Social-Attitudes-SPSS-files](https://github.com/surveyresearcher/British-Social-Attitudes-SPSS-files). Not downloaded: BSA is distributed under the UKDS End User Licence, which does not permit redistribution, so this copy should not be relied on.
- ESS Round 12: fieldwork was planned for February–December 2025 with data "made available for analysis in 2026, exact dates to be confirmed" — [postgrad.ie ESS call](https://www.postgrad.ie/?p=138585); an April 2026 National Coordinators' Forum report said collection had concluded in 10 countries and was ongoing in 13 — [researchlatvia.gov.lv](https://www.researchlatvia.gov.lv/index.php/en/european-social-scientists-convene-athens-establish-new-standards-public-opinion-research); Round 12 uses a mixed in-person/self-completion design and repeats the immigration and wellbeing modules — [ESS Round 12 (ICS Lisboa)](https://www.ics.ulisboa.pt/en/node/111545); Round 11 release notice — [ESS: Round 11 data now available](https://europeansocialsurvey.org/node/430).
- ONS OPN-based "Public opinions and social trends, Great Britain" is monthly, each release with an "All data related to" page of xlsx tables; the April 2026 related-data page is at [ONS April 2026 related data](https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/april2026/relateddata); other 2026 editions: [February](https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/february2026/relateddata), [March](https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/march2026/relateddata), [May](https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/may2026/relateddata), [June](https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/june2026/relateddata), [July](https://ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/july2026/relateddata); release calendar entries exist for [August 2026](https://www.ons.gov.uk/releases/publicopinionsandsocialtrendsgreatbritainaugust2026) and [October 2026](https://www.ons.gov.uk/releases/publicopinionsandsocialtrendsgreatbritainoctober2026) (the October edition scheduled 20 Nov 2026). 2026 topics included cost of living, attitudes to AI (June), social mobility, flood risk, and water use (July). Also mirrored on gov.uk, e.g. [April 2026](https://www.gov.uk/government/statistics/public-opinions-and-social-trends-great-britain-april-2026).
- World Risk Poll (Lloyd's Register Foundation) aggregated data is available via the CRAN package `worldriskpollr` — [cran/worldriskpollr mirror](https://github.com/cran/worldriskpollr) (homepage wrp.lrfoundation.org.uk/data-resources/).

### Inferences
- Access steps for any UKDS study: (1) register at ukdataservice.ac.uk (UK HE users via institutional login; others create an account); (2) search the catalogue by SN; (3) accept the End User Licence; (4) add to a download order and fetch SPSS/Stata/tab zip; (5) `pd.read_spss()` / `pd.read_stata()`. OPN *microdata* is also EUL at UKDS, but the monthly OPN *tables* on ons.gov.uk are Open Government Licence and need no registration.
- The ONS related-data pages are the only OPN route that is fully open and scriptable (xlsx links on each `.../relateddata` page); the ONS API (`api.beta.ons.gov.uk`) does not carry OPN tables.

### Gaps
- No UKDS SN found for BSA 2025; the catalogue could not be queried directly (host blocked).
- Understanding Society (SN 6614) 2026 release (wave 15) and WVS wave 8 UK: searches were not completed before the budget was exhausted; no claims made.
- ESS Round 12 UK release date: unconfirmed.

---

## 4. NatCen: British Social Attitudes 43 (2026) and What UK Thinks / What Scotland Thinks

### Takeaway
BSA 43's "First Look" was published 10/12 February 2026 from fieldwork 26 Aug–6 Oct 2025 (push-to-web with telephone option), with further 2026 chapters on welfare, higher education, immigration polarisation, "Who supports Reform?" and NHS waiting. The report PDFs are open; the dataset follows the usual route to UKDS. What UK Thinks: EU hosts per-poll pages with "Download / access source data" links (e.g. Survation 19 May–1 June 2026). None of these hosts was reachable.

### Cited Findings
- BSA 43 landing page lists the chapters — [NatCen: British Social Attitudes 43](https://natcen.ac.uk/publications/british-social-attitudes-43). "First Look" PDF (taxation and spending, welfare, immigration, electoral reform, assisted dying; fieldwork 26 Aug–6 Oct 2025; authors Curtice, Scholes, Morton, Thaker) — [british-social-attitudes-43-1866.pdf](https://natcen.ac.uk/sites/default/files/2026-02/british-social-attitudes-43-1866.pdf); launch slides dated 12 Feb 2026 — [BSA First Look Presentation.pdf](https://natcen.ac.uk/sites/default/files/2026-02/BSA%20First%20Look%20Presentation.pdf). A copy of the First Look also circulated at [nen.press](https://nen.press/wp-content/uploads/2026/02/BSA_First_Look1-2.pdf).
- Welfare chapter: 63% say benefits for disabled people are a priority for extra spending — [BSA 43 attitudes to welfare](https://natcen.ac.uk/publications/bsa-43-attitudes-welfare). Higher education chapter: 18% say opportunities to go to HE should be reduced, up 7 points since 2017 — [BSA 43 higher education](https://natcen.ac.uk/publications/bsa-43-higher-education). Immigration: [growing polarisation](https://natcen.ac.uk/news/british-social-attitudes-growing-polarisation-attitudes-towards-immigration). Other BSA items listed: [BSA: a more dangerous world](https://natcen.ac.uk/publications/bsa-more-dangerous-world). Print edition listed by a bookseller as "British Social Attitudes 43 2026" — [Dandy Booksellers](https://www.dandybooksellers.com/acatalog/British-Social-Attitudes-43-2026.html).
- What UK Thinks: EU per-poll page example with fieldwork 19 May–1 June 2026 (Survation, GB) and a "Download / access source data" link — [whatukthinks.org/eu/poll/survation-1-6-2026](https://www.whatukthinks.org/eu/poll/survation-1-6-2026/). What Scotland Thinks analogous page — [whatscotlandthinks.org/poll/survation-28-6-2023](https://www.whatscotlandthinks.org/poll/survation-28-6-2023/).

### Inferences
- BSA 2025 microdata will appear at UKDS as the next SN after 9478, probably in late 2026 given BSA 2024's user guide was dated October 2025 (one year after fieldwork). Until then, only the report PDFs (with tables) are available.
- What UK Thinks/What Scotland Thinks "questions" pages expose time-series charts whose underlying data are downloadable per question (CSV via the site's chart export) — this could not be verified this session.

### Gaps
- Could not open whatukthinks.org to document the exact export mechanism (the first search for it returned only ONS pages).
- "Who supports Reform?" and "Waiting for treatment" (8 Sept 2026) chapter URLs were not captured individually.

---

## 5. YouGov: trackers, article data, PDF tables and API

### Takeaway
YouGov's UK trackers have a public, unauthenticated download endpoint — `https://api-test.yougov.com/public-data/v5/uk/trackers/<slug>/download/` — returning the full tracker as an xlsx workbook (one sheet per demographic breakdown); this is used in production by The Times data desk and by independent analysts. The host was blocked here, so instead six 2026 weekly Times/Sky voting-intention articles were fetched from yougov.com and parsed into a CSV; PDF tables live on `d3nkl3psvxxpe9.cloudfront.net/documents/`.

### Cited Findings
- Tracker download endpoint for voting intention, as used by an independent analysis repo: `YOUGOV_VOTING_INTENTION_URL = "https://api-test.yougov.com/public-data/v5/uk/trackers/voting-intention/download/"`; "YouGov's tracker download always returns the full current workbook (every week to date)"; workbook layout "one sheet per demographic breakdown (e.g. 18-24, Scotland, I voted to Leave), each sheet: rows = Con, Lab, Lib Dem, SNP, Plaid Cymru, Reform UK, Green, Other, Unweighted base, Base; columns = one weekly poll date each"; local copy covered 2025-01-13 to 2026-08-03 — [data-john/voting-intention-analysis downloader.py and data/README.md](https://github.com/data-john/voting-intention-analysis).
- The Times' "Britain at a glance" pipeline downloads `https://api-test.yougov.com/public-data/v5/uk/trackers/government-approval/download/` (net government approval sparkline) — [times/times-channel-britain-at-a-glance-data script.R](https://github.com/times/times-channel-britain-at-a-glance-data) (repo last pushed 6 Nov 2026).
- yougov.com pages embed references to the same public-data API (`api-test.yougov.com/public-data/v5`, `.../uk/search/content/entities/by_uuid/`) — observed in the HTML of [YouGov VI 1-2 Nov 2026 article](https://yougov.com/en-gb/articles/55883-voting-intention-1-2-november-2026-lab-26-con-24-ref-21-ld-11-grn-10).
- 2026 weekly Times/Sky VI articles fetched and parsed (all "online survey of N adults aged 18+ in GB", commissioned by The Times and Sky News): 27–28 Sep (N=2,310: Ref 25, Lab 24, Con 19, LD 12, Grn 11, RB 3) — [55640](https://yougov.com/en-gb/articles/55640-voting-intention-27-28-september-2026-ref-25-lab-24-con-19-ld-12-grn-11); 4–5 Oct (N=2,312: Lab 27, Ref 22, Con 20, LD 11, Grn 11) — [55688](https://yougov.com/en-gb/articles/55688-voting-intention-4-5-october-2026-lab-27-ref-22-con-20-ld-11-grn-11); 11–12 Oct (N=2,393: Lab 24, Con 23, Ref 21, LD 12, Grn 11) — [55731](https://yougov.com/en-gb/articles/55731-voting-intention-11-12-october-2026-lab-24-con-23-ref-21-ld-12-grn-11); 18–19 Oct (N=2,520: Lab 27, Con 23, Ref 22, LD 11, Grn 10) — [55781](https://yougov.com/en-gb/articles/55781-voting-intention-18-19-october-2026-lab-27-con-23-ref-22-ld-11-grn-10); 25–26 Oct (N=2,271: Lab 27, Con 22, Ref 20, LD 11, Grn 10; "Reform UK ... 20%, the lowest recorded for the party since our voting intention tracker restarted") — [55822](https://yougov.com/en-gb/articles/55822-voting-intention-25-26-october-2026-lab-27-con-22-ref-20-ld-11-grn-10); 1–2 Nov (N=2,355: Lab 26, Con 24, Ref 21, LD 11, Grn 10, RB 3, SNP 3, PC 2; "the highest share recorded for the Conservatives since our voting intention tracker restarted in January 2025"; "Having averaged at 18% of the vote over the first half of 2026, Labour have consistently polled between 24-27% in the last four weeks") — [55883](https://yougov.com/en-gb/articles/55883-voting-intention-1-2-november-2026-lab-26-con-24-ref-21-ld-11-grn-10). Saved as `yougov_times_sky_vi_2026_from_articles.csv`.
- YouGov tracker listing pages on yougov.co.uk: [voting-intention search within politics trackers](https://yougov.co.uk/topics/politics/trackers(popup:search/voting-intention)); example tracker pages: [Parliament understanding daily lives](https://yougov.co.uk/topics/politics/trackers/has-the-westminster-parliament-in-recent-years-has-done-a-good-job-or-a-bad-job-in-understanding-the-daily-lives-of-people), [How should parliament decide](https://yougov.co.uk/topics/politics/trackers/how-should-parliament-decide-on-the-biggest-policy-decisions).
- PDF tables CDN: YouGov MRP results for 2026 e.g. [VotingIntention_MRP_Results_260223_w.pdf](https://d3nkl3psvxxpe9.cloudfront.net/documents/VotingIntention_MRP_Results_260223_w.pdf) and `VotingIntention_MRP_Results_260209_w.pdf` (referenced in [principalfish yougov_import.py](https://raw.githubusercontent.com/principalfish/principalfish.github.io/master/data/polls/importers/westminster/yougov_import.py)); the economic tracker tables follow `https://d3nkl3psvxxpe9.cloudfront.net/documents/econTabReport_{hash}.pdf` ([wethervane parse_yougov_pdf.py](https://raw.githubusercontent.com/HaydenHaines/wethervane/main/scripts/parse_yougov_pdf.py)). Other YouGov asset hosts seen in a downloader: `yg-infographics-data.s3.amazonaws.com`, `ygo-assets-websites-editorial-emea.yougov.net/documents/` ([bakered download_external_mrp.py](https://raw.githubusercontent.com/bakered/uk-election-bayesian-multilevel-modelling/main/4.prediction_code/utils/download_external_mrp.py)).
- Derived file archived: `yougov_vi_tracker_demographic_summary_datajohn.csv` (158 rows: latest share, 4/12/52-week change and trend for each party x demographic group, latest poll 2026-09-28, from 90 weekly polls since 2025-01-13) — [data-john/voting-intention-analysis outputs/tables](https://github.com/data-john/voting-intention-analysis).

### Inferences
- Tracker slugs follow the yougov.co.uk URL: `.../trackers/<slug>` maps to `api-test.yougov.com/public-data/v5/uk/trackers/<slug>/download/`. Likely slugs (unverified): `voting-intention`, `government-approval`, plus favourability and most-important-issues trackers whose slugs should be read off the tracker page URL.
- The "api-test" hostname is YouGov's production public-data host despite the name (used by yougov.com itself and by The Times).
- Licence: YouGov tracker data are published for public use with attribution ("YouGov"); no formal open licence statement was captured.

### Gaps
- Could not download any tracker xlsx (host blocked); could not list all 2026 VI articles (yougov.com search page returned no article slugs to a non-JS client), so only the six articles whose URLs appeared in search results were archived.
- YouGov/Times weekly PDF tables for 2026 not fetched (CDN blocked).

---

## 6. Ipsos and other pollsters' table archives (machine-readable vs PDF)

### Takeaway
Among BPC pollsters, **More in Common** publishes weekly VI and tracker tables as Excel (.xls/.xlsx) on a single archive page; **Ipsos** publishes Political Monitor charts and tables as PDF (monthly, 2026 files confirmed); **YouGov** publishes PDF tables plus the xlsx tracker API (section 5); Survation, Opinium, Techne, Find Out Now, BMG, Focaldata, JL Partners, Deltapoll, Lord Ashcroft, Savanta, Freshwater, We Think and Verian are listed as pollsters in the Wikipedia-derived data, and the Principal Fish repo has per-pollster PDF importers for ten of them, implying PDF-only publication. None of these hosts was reachable this session.

### Cited Findings
- More in Common "Polling Tables" page lists weekly voting intention and tracker results as XLS files, with entries through June 2026 — [moreincommon.org.uk/polling-tables](https://www.moreincommon.org.uk/polling-tables/).
- Ipsos Political Monitor 2026 outputs (all PDF): [Jan 2026 charts release 1](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-01/Ipsos%20Jan%202026_Political%20Monitor%20charts_Release%201_V1_Int%20Use%20Only.pdf), [Jan 2026 charts release 2](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-02/Ipsos%20Jan%202026_Political%20Monitor%20charts_Release%202.pdf), [Mar 2026 charts](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-03/Ipsos%20Mar%202026_Political%20Monitor%20charts.pdf), [May 2026 EU referendum data tables (dated 20 May 2026)](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-06/Ipsos%20Jun%202026_EU%20Data%20Tables_Public.pdf), [June 2026 tables](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-07/politmkp_w6june2026web1.pdf), [June 2026 charts (N=1,045, fieldwork 25–30 June 2026)](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-07/Ipsos%20June%202026_Political%20Monitor%20charts_v1d7_IntUseOnly.pdf). Archive page: [Ipsos Political Monitor Archive](https://www.ipsos.com/en-uk/node/177896) ("each survey page links to topline results and detailed tables"); hub: [Ipsos UK opinion polls Insights Hub](https://www.ipsos.com/en-uk/uk-opinion-polls/insights-hub).
- Ipsos Veracity Index: latest UK edition found is **2025** (telephone poll of 1,022 British adults, 5–11 Nov 2025; influencers 6%, lowest since 1983) — [Ipsos Veracity Index 2025](https://www.ipsos.com/en-uk/ipsos-veracity-index-2025), charts PDF [Veracity index 2025_Charts.pdf](https://www.ipsos.com/sites/default/files/ct/news/documents/2025-12/Veracity%20index%202025_Charts.pdf). No 2026 UK Veracity Index found; the related 31-country Global Trustworthiness Index 2026 (fieldwork 19 June–3 July 2026, N=23,537) is at [Ipsos Global Trustworthiness Index 2026](https://www.ipsos.com/sites/default/files/ct/news/documents/2026-09/Ipsos-Global-Trustworthiness-Index-2026.pdf).
- Pollster counts in the Wikipedia-derived 2024–2026 GB VI list (628 polls, 12 Jul 2024–2 Nov 2026): More in Common 107, YouGov 105, Find Out Now 104, Opinium 63, Techne 43, Survation 30, BMG 24, Freshwater Strategy 23, Lord Ashcroft 20, Deltapoll 18, JL Partners 16, Ipsos 11, Focaldata 10, Trajectory 8, Savanta 7 — computed from [samueljackson92/polls polling_data.json](https://github.com/samueljackson92/polls).
- Principal Fish maintains Python importers that parse PDF tables for BMG, Focaldata, Find Out Now, YouGov, More in Common, Ipsos, Survation, Lord Ashcroft, Deltapoll, Opinium and Techne — [principalfish.github.io data/polls/importers/westminster](https://github.com/principalfish/principalfish.github.io).
- PollBase's "Abbreviations" sheet lists pollster codes (e.g. R+W = Redfield & Wilton Strategies; Gallup/BIPO) and publishers — `pollbase_markpack_Q4_2025.xlsx` sheet "Abbreviations" (from [keithysimpson repo copy](https://github.com/keithysimpson/UK_general_election_polls_stacked)).
- Opinium's Westminster polls appear with ~weekly/fortnightly frequency in the 2026 Wikipedia-derived list; PolitPro mirrors individual 2026 polls e.g. [Opinium 31 Jul 2026](https://politpro.eu/en/united-kingdom/opinion-polls/opinium-2026-07-31/parliamentary-election), [BMG 26 Mar 2026](https://politpro.eu/en/united-kingdom/opinion-polls/bmg-2026-03-26/parliamentary-election), [Ipsos 30 Jun 2026](https://politpro.eu/en/united-kingdom/opinion-polls/ipsos-2026-06-30/parliamentary-election), [Find Out Now 28 Jan 2026](https://politpro.eu/en/united-kingdom/opinion-polls/find-out-now-2026-01-28/parliamentary-election). PolitPro advertises an API — [politpro.eu/api](https://politpro.eu/el/api).

### Inferences
- Machine-readable (xlsx) tables: More in Common (weekly), YouGov (tracker API). PDF-only: Ipsos, Opinium, Survation, Techne, Find Out Now, BMG, Focaldata, JL Partners, Deltapoll, Lord Ashcroft, Savanta, Freshwater, Verian, We Think, Redfield & Wilton (the latter not seen in 2026 data). For PDFs, `pdfplumber`/`camelot` are needed; Principal Fish's importers are a working reference implementation.
- The Ipsos Political Monitor is monthly (Jan, Mar, May/Jun 2026 files found); each month yields a "charts" PDF and a "tables" PDF.

### Gaps
- Could not verify Survation's own data-archive page, Opinium's archive, Techne's tracker, Stonehaven/Merlin/Omnisis table formats (searches not run or returned nothing relevant).
- Did not verify whether Ipsos publishes any xlsx for Political Monitor in 2026 (only PDFs appeared).

---

## 7. Aggregator datasets: PollBase, Wikipedia, Politico, Electoral Calculus, GitHub/Kaggle/Hugging Face

### Takeaway
Mark Pack's PollBase (quarterly xlsx, GB VI since 1943, credit-only licence) is the canonical long-run dataset; the **Q4 2025 edition (running to 7 Jan 2026)** was obtained from a GitHub redistribution and tidied to CSV. Wikipedia's "Opinion polling for the next UK general election" page is the de facto 2026 poll list and is scraped daily by several public repos, one of which supplied a complete 2024–Nov 2026 JSON. Politico's Poll of Polls has an undocumented but stable JSON endpoint (`/wp-json/politico/v1/poll-of-polls/GB-parliament` and `GB-leadership-approval`). No Kaggle dataset of 2026 UK polls exists; one Hugging Face dataset covers 2024 polls only.

### Cited Findings
- PollBase: "my database of voting intention opinion polls since 1943, the largest such public dataset ... updated each quarter"; licence: "You are very welcome to use this data. I only ask two things in return - that if you spot any errors or omissions you let me know and that you credit the source of the data (including, if you make use of it online, a link back to https://www.markpack.org.uk/opinion-polls/)"; polls are GB not UK unless noted; seat projections included for MRPs — Introduction sheet of `pollbase_markpack_Q4_2025.xlsx`, obtained from [keithysimpson/UK_general_election_polls_stacked data/PollBase-Q4-2025.xlsx](https://github.com/keithysimpson/UK_general_election_polls_stacked). Landing page: [PollBase: British voting intention opinion polls since 1938](https://www.markpack.org.uk/opinion-polls/); update post: [Latest PollBase is out](https://www.markpack.org.uk/160619/pollbase-update/). The Q4 2025 workbook has 29 sheets ('38-45' ... '19-24', '24-', 'Monthly average', 'By election polls', '2014 Euros', 'YouGov rolling ratings 2006-7'); the '24-' sheet has 529 polls from 5 Jul 2024 to 7–8 Jan 2026 with columns Con/Lab/LD/Green/Reform, leader good/bad/net ratings (incl. Green co-leaders), Best PM, government approval, mode, geography, MRP flag and seat projections (verified locally).
- PollBasePro / britpol (Jack Bailey, Mark Pack, Jon Mellon): `pollbase` long-format (6,275 polls, 24 Jun 1945–9 Dec 2021; id, start, end, pollster, n, con, lab, lib), `pollbasepro` daily posterior estimates (24,364 days, 26 May 1955–6 Feb 2022), `house_effects` (143 pollster-election rows) — [jackobailey/britpol](https://github.com/jackobailey/britpol) (last commit 2 Aug 2023; package docs [rdrr.io britpol](https://rdrr.io/github/jackobailey/britpol/f/documentation/readme.md), paper [PollBasePro preprint](https://preprints.apsanet.org/engage/api-gateway/apsa/assets/orp/resource/item/60b37d368f58e887a03bbd89/original/poll-base-pro-daily-estimates-of-aggregate-voting-intention-in-britain-from-1955-to-the-present-day.pdf)). The repo also redistributes `PollBase-Q4-2020.xlsx` and the HoC Library file `1918-2019election_results_by_pcon.xlsx`.
- Wikipedia polling page: [Opinion polling for the next United Kingdom general election](https://en.wikipedia.org/wiki/Opinion_polling_for_the_next_United_Kingdom_general_election) (saved copy "last edited on 5 November 2026, at 21:27"; 25 HTML tables of which tables 1–3 are the 2026 (278 rows), 2025 (291) and 2024 (54) national VI tables, table 4 Wales sub-samples (e.g. More in Common 24–30 Sep 2026; YouGov/ITV Cymru Wales 7–13 Sep 2026 N=1,102), table 5 a rural CLA/Survation poll, table 7 Savanta/QMUL London polls (Aug 2026), table 8 a Find Out Now sub-national poll Jan 2026). Scraper repos: [samueljackson92/polls](https://github.com/samueljackson92/polls) (daily GitHub Action `curl`s the page; Bayesian B-spline aggregator; 628 polls 12 Jul 2024–2 Nov 2026 in `polling_data.json`), [keithysimpson/UK_general_election_polls_stacked](https://github.com/keithysimpson/UK_general_election_polls_stacked) (R/rvest; `GE_polls_all.csv` 3,774 polls 12 May 2010–6 Apr 2026 with Reform_UKIP/Con/LD/Lab/SNP/Green/Others shares), [Dokkaebiryu/Pollster](https://github.com/Dokkaebiryu/Pollster) (2016–2026 aggregator, data not committed), [JoeMc131/UK_polls](https://github.com/JoeMc131/UK_polls), [AndyLawton/uk_general_election_polls](https://github.com/AndyLawton/uk_general_election_polls), [PaddyAlton/PollingProjects](https://github.com/PaddyAlton/PollingProjects), [atlasmaps-lab/atlas build_polls.py](https://github.com/atlasmaps-lab/atlas), [nathanielvirgo/uk-pollbot](https://github.com/nathanielvirgo/uk-pollbot) (watches the Commons chart "Opinion polling graph for the next United Kingdom general election (post-2024).svg").
- Scottish Parliament 2026 and Senedd 2026 polls: [MaxHigdon44/Poll-of-polls](https://github.com/MaxHigdon44/Poll-of-polls) scrapes [Opinion polling for the 2026 Scottish Parliament election](https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Scottish_Parliament_election) and [Opinion polling for the 2026 Senedd election](https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Senedd_election); its frozen JSON (frozenAt 2026-05-07) holds 146 Holyrood constituency-vote and 146 regional-vote polls (6 May 2021–7 May 2026; e.g. YouGov 25 Apr–5 May 2026 N=6,453: SNP 39, Lab 18, Ref 18, LD 11, Con 10; Survation 20 Apr–5 May 2026 N=5,025) and 38 Senedd polls; plus `scotland-2026-results.json` (constituency results, generated 13 May 2026) and `local-2026-results.json` (English ward results from the Democracy Club export, 7 May 2026).
- Politico Poll of Polls JSON: `https://www.politico.eu/wp-json/politico/v1/poll-of-polls/GB-parliament` (fields `polls` with `parties` sub-object incl. Con, Lab, LibDem, BP (=Reform), Green, PLPW (=Plaid), ChUK, and `trends$kalmanSmooth`) — [vfillis/automated-polling polling.R](https://raw.githubusercontent.com/vfillis/automated-polling/main/R/polling.R); `.../GB-leadership-approval` — [approval-rating-UK.R](https://raw.githubusercontent.com/vfillis/automated-polling/main/R/approval-rating-UK.R); generic pattern `poll-of-polls/<ISO2>-parliament` across countries — [cornelius-erfort politico script](https://raw.githubusercontent.com/cornelius-erfort/automated-web-data-collection/main/examples/politico/politico-poll-of-polls.R); R wrapper package [petres/pollofpolls](https://github.com/petres/pollofpolls). Public page: [Politico UK Poll of Polls](https://www.politico.eu/europe-poll-of-polls/united-kingdom/).
- Electoral Calculus: poll list / model pages [dynamicmap.html](https://www.electoralcalculus.co.uk/dynamicmap.html) and MRP blog e.g. [ec_vipoll_20240626](https://www.electoralcalculus.co.uk/blogs/ec_vipoll_20240626.html) (from [inglesp/apogee build.py](https://raw.githubusercontent.com/inglesp/apogee/main/build.py), which also lists Britain Predicts [sotn.newstatesman.com/2024/05/britainpredicts](https://sotn.newstatesman.com/2024/05/britainpredicts), Election Maps UK [electionmaps.uk/nowcast](https://electionmaps.uk/nowcast), the FT and Economist 2024 forecasts and the BBC exit-poll JSON `static.files.bbci.co.uk/elections/data/news/election/2024/uk/exitPollProbabilities`). No machine-readable Electoral Calculus poll export was found.
- Other poll aggregators seen: [electionpolling.co.uk general election](https://electionpolling.co.uk/polls/general-election) and [Scottish Parliament](https://www.electoralcalculus.co.uk/polls.html) listings; [PolitPro UK polls](https://politpro.eu/en/united-kingdom/opinion-polls); [poliwave.com](https://www.poliwave.com/uk/gen/polls?lang=fr); SixFifty's 2017 CSV mirrors at `s3-eu-west-1.amazonaws.com/sixfifty/polls.csv` (and `_london`, `_scotland`, `_wales`, `_ni`) — [john-sandall/maven uk_polls.py](https://raw.githubusercontent.com/john-sandall/maven/master/maven/datasets/general_election/uk_polls.py) (likely stale). Europepolls (Pitas 2023) is a Wikipedia-derived EU+UK CSV dataset — [arXiv 2307.10022](https://ar5iv.labs.arxiv.org/html/2307.10022). Erik Gahner's PolData catalogue lists BES, BSA, PollBase, PollBasePro, UK Election Statistics (CBP-7529) and the Harvard Dataverse constituency results (doi:10.7910/DVN/S83HOA) — [erikgahner/PolData](https://github.com/erikgahner/PolData).
- Hugging Face: [AFOS-Analytics1/uk-2024-electoral-divergence](https://huggingface.co/datasets/AFOS-Analytics1/uk-2024-electoral-divergence) — long-format party vote-share polls, 7 parties, 293 polls, Jan–Jul 2024, plus Polymarket odds (2024 only). Kaggle: only 2024 results datasets found (e.g. "Uk 2024 General Election Data" per [baselight mirror](https://baselight.app/u/kaggle/dataset/kartik70_uk_2024_general_election_preliminary_data)); no 2026 polls dataset.
- Wikidata: not queried (host blocked); no evidence found of structured poll items.

### Inferences
- For a pandas user the best 2026-current, no-registration source stack is: PollBase xlsx (quarterly, authoritative back-series) + Wikipedia page scrape (weekly currency, all pollsters) + Politico JSON (clean per-poll JSON with pollster, dates, N, and a Kalman trend) + YouGov tracker xlsx API (demographic crosstabs). All four are scripted in section 11.
- The keithysimpson CSV and samueljackson92 JSON overlap for Jul 2024–Apr 2026; they differ in party columns (the former folds UKIP into Reform and codes shares as fractions; the latter keeps `rb` = Restore Britain as a separate column from 2026).

### Gaps
- The current (Q3 2026) PollBase edition could not be fetched; the archive holds Q4 2025 (to 7 Jan 2026). Code search found no newer edition on GitHub.
- Politico JSON could not be fetched (host blocked), so field names are taken from third-party scripts, not from a live response.

---

## 8. Official data: Electoral Commission, House of Commons Library, ONS, devolved governments, NILT

### Takeaway
Official election results and long-run constituency series are open (Open Parliament Licence / OGL): the HoC Library's 1918–2019 results workbook and 2024 results (CBP-10009) are redistributed on GitHub and were archived; Parliament runs a Datasette with CSV export. The Electoral Commission's annual public-attitudes research exists but its 2026 tables were not located; NILT 2025 data (fieldwork 26 Sep–14 Dec 2025, N=1,244) are published by ARK; the Scottish Household Survey 2025 (10,538 households) full tables were scheduled for the SHS Data Explorer on 30 Sep 2026.

### Cited Findings
- HoC Library historic results: `1918-2019election_results_by_pcon.xlsx` (29 sheets: University Seats, 1918 ... 2019) and a long CSV (17,698 constituency-election rows; latin-1 encoded; columns constituency_id, seats, constituency_name, country/region, electorate, con/lib/lab/natSW/oth votes and shares, total_votes, turnout, election, boundary_set) — redistributed in [keithysimpson repo](https://github.com/keithysimpson/UK_general_election_polls_stacked) and [jackobailey/britpol](https://github.com/jackobailey/britpol); original briefing [CBP-8647](https://commonslibrary.parliament.uk/research-briefings/cbp-8647/) (cited in britpol's data docs). UK Election Statistics briefing [CBP-7529](https://researchbriefings.parliament.uk/ResearchBriefing/Summary/CBP-7529).
- 2024 general election results by constituency from HoC Library [CBP-10009](https://commonslibrary.parliament.uk/research-briefings/cbp-10009/), integrated with Census 2021 summaries, Rallings & Thrasher 2019 notionals ([BBC results_spreadsheet.ods](https://downloads.bbc.co.uk/news/nol/shared/spl/xls_spreadsheets/results_spreadsheet.ods)), Hanretty EU-ref notionals and Miori indyref notionals in `2024-UK-General-Election-Census-Constituency-Summaries-File-v1.1.csv` (632 GB constituencies x 242 columns: Winner24, Con24...RUK24, Majority24, Turnout24, ...Vote24 counts, MP name/gender, 2019 notionals, census measures) — [ralphascott/UKGE24_wpc_census_summaries](https://github.com/ralphascott/UKGE24_wpc_census_summaries). HoC's own file names are `HoC-GE2024-results-by-constituency.csv` / `HoC-GE2024-results-by-candidate.csv` (referenced in many repos, e.g. [horankev/voteReproject](https://github.com/horankev/voteReproject), [mysociety/local-intelligence-hub](https://github.com/mysociety/local-intelligence-hub)).
- Parliament's election-results Datasette (2010–2024 general elections, Open Parliament Licence, CSV export) — [datasette.electionresults.parliament.uk/psephology/general_elections](https://datasette.electionresults.parliament.uk/psephology/general_elections).
- HoC Library GitHub organisation publishes tooling but no polling data: [clcharts](https://github.com/houseofcommonslibrary/clcharts), [clmnis](https://github.com/houseofcommonslibrary/clmnis), [uk-hex-cartograms-noncontiguous](https://github.com/houseofcommonslibrary/uk-hex-cartograms-noncontiguous), [dashboard_data](https://github.com/houseofcommonslibrary/dashboard_data).
- Electoral Commission: a Nov 2025 parliamentary written answer notes the Commission "publishes annual research on public attitudes to elections and democracy" — [westminsterbrief PQ 92022](https://westminsterbrief.co.uk/archive/pq/92022). Related gov.uk Ipsos data tables: [Electoral Integrity Programme public opinion research wave 3](https://www.gov.uk/government/publications/evaluation-of-electoral-integrity-programme-public-opinion-research-wave-3), [waves 1 and 2 data tables](https://www.gov.uk/government/publications/evaluation-of-the-electoral-integrity-programme-public-opinion-research-data-tables-waves-1-and-2), [Ipsos public opinion report (deposited paper DEP2025-0096)](https://data.parliament.uk/DepositedPapers/Files/DEP2025-0096/IPSOS_Public_Opinion_Research_Report.pdf). data.gov.uk has GLA poll results 2026 as ODS — [GLA poll results 2026](https://www.data.gov.uk/dataset/94847958-728e-4cc1-8874-83aad9f5c379/gla-poll-results-2026) and an old Home Office polls set — [Home Office public opinion polls](https://www.data.gov.uk/dataset/5b3d59c7-2d2f-47ed-9805-9042bd8b7dd6/home-office-public-opinion-polls).
- NILT 2025: fieldwork 26 Sep–14 Dec 2025, 1,244 adults 18+ — [IEF: NILT 2025](https://www.ief.org.uk/our-work/research/northern-ireland-life-and-times-survey-2025/); ARK says "Data and tables from the 2025 NI Life & Times survey are now available" and published "Words Matter" (Irish language / Ulster-Scots) — [ARK](https://ark.ac.uk/ARK/ARK25/), [ARK research update](https://www.community-relations.org.uk/node/1899), [ARKsar2025.pdf](https://www.ark.ac.uk/ARK/sites/default/files/2026-06/ARKsar2025.pdf); official-statistics releases based on NILT 2025: [Perceptions of the PPS](https://www.gov.uk/government/statistics/announcements/perceptions-of-the-pps-findings-from-the-nilts-2025), [Attitudes to refugees and asylum seekers in NI 2025 (NISRA)](https://datavis.nisra.gov.uk/executiveofficeni/attitudes-to-refugees-and-asylum-seekers-in-ni-2025-background-quality-report.html).
- Scottish Household Survey 2025: 10,538 households interviewed Jan 2025–Jan 2026; "The full set of SHS 2025 data tables will be published via the SHS Data Explorer on 30th September 2026" — [SHS 2025 methodology and fieldwork outcomes](https://www.gov.scot/publications/scottish-household-survey-2025-methodology-and-fieldwork-outcomes/); topic reports: [neighbourhoods and communities](https://www.gov.scot/publications/neighbourhoods-and-communities-2025-findings-from-the-scottish-household-survey/pages/introduction/), [perceptions of local councils](https://www.gov.scot/publications/scottish-household-survey-perceptions-of-local-councils-2025/), [volunteering](https://www.gov.scot/publications/scottish-household-survey-volunteering-2025/), [tourism sentiment (new in 2025)](https://www.gov.scot/publications/scottish-household-survey-tourism-sentiment-2025/pages/data-and-methodology/), [childcare](https://www.gov.scot/publications/scottish-household-survey-2025-childcare/); collection page [SHS](https://www.gov.scot/collections/scottish-household-survey/); microdata route [how to get results / data release procedures](https://gov.scot/publications/scottish-household-survey-how-to-get-results/pages/data-release-procedures).
- Scottish Parliament election held 7 May 2026 (polls page) — [Wikipedia: Opinion polling for the 2026 Scottish Parliament election](https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Scottish_Parliament_election); results JSON (generated 13 May 2026) archived from [MaxHigdon44/Poll-of-polls](https://github.com/MaxHigdon44/Poll-of-polls).
- Ofcom's 2026 news-consumption surveys (local news and media survey 2026 technical report) — [Ofcom technical report](https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/online-research/adult-and-childrens-news-consumption-survey-2026/local-news-and-media-survey-2026_technical-report.pdf).

### Inferences
- Electoral Commission "Public attitudes" 2026 tables most likely sit under electoralcommission.org.uk research pages (annual winter tracker, usually fielded Jan–Feb and published spring/summer); not verified.
- NILT microdata are normally deposited at UKDS (EUL) a year after fieldwork and the ARK site exposes online tables per variable; the 2025 tables are already live per ARK.

### Gaps
- Scottish Social Attitudes 2025/2026: search returned only SHS material; no SSA release found.
- National Survey for Wales 2025-26 results viewer: search not completed (budget exhausted).
- Electoral Commission 2026 public-attitudes tables: not located.
- OSR (Office for Statistics Regulation): not researched.

---

## 9. Academic and other sources (Reuters Institute DNR 2026, trackers, panel vendors)

### Takeaway
The Reuters Institute Digital News Report 2026 was published 16 June 2026 (48 markets) with an interactive data explorer but no confirmed bulk download; the other academic trackers requested (Nuffield, UKICE, KCL Policy Institute, Hansard Society, Party Members Project, CSI) could not be researched before the search budget was exhausted and are listed as unverified leads.

### Cited Findings
- DNR 2026 published 16 June 2026, fifteenth edition, 48 countries, 178-page PDF; interactive explorer covers "more than a decade of survey data across markets" — [Reuters Institute DNR interactive](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/interactive); coverage [theonlinecitizen](https://theonlinecitizen.com/2026/06/17/social-media-overtakes-news-websites-globally-as-trust-falls-to-record-low-reuters-institute-finds), [NDL Current Awareness](https://current.ndl.go.jp/car/280679); German country findings PDF [Leibniz-HBI](https://www.leibniz-hbi.de/en/hbi-publications/reuters-institute-digital-news-report-2026-findings-for-germany/); some charts expose a per-chart "Get the data" via Datawrapper, e.g. [datawrapper yD8G0](https://datawrapper.dwcdn.net/yD8G0/5/).
- Public First publishes polling pages with tables (e.g. [New polling on Andy Burnham](https://www.publicfirst.co.uk/new_polling_on_andy_burnham), [polling for SSE](https://www.publicfirst.co.uk/new_polling_for_sse)).
- BSA-based academic replication repos on GitHub (2026) illustrate that BSA 2014–2024 microdata are being used for Reform UK voter analysis — [BQ-Essex/reform-uk-two-electorates](https://github.com/BQ-Essex/reform-uk-two-electorates) ("Reform UK's 2024 voters split almost in half on political attitudes alone: 55% conventional right-authoritarian, 41% authoritarian-left"), [Nicksuciu7/right-wing-populism-britain](https://github.com/Nicksuciu7/right-wing-populism-britain), [omimir/bsa-institutional-trust](https://github.com/omimir/bsa-institutional-trust).
- Scottish Election Study ([scottishelections.ac.uk](https://scottishelections.ac.uk/)) and Welsh Election Study ([Cardiff Elections in Wales](http://blogs.cardiff.ac.uk/electionsinwales/researchresources/)) are listed in PolData as national election studies — [erikgahner/PolData](https://github.com/erikgahner/PolData).

### Inferences
- DNR raw microdata are normally not released; country-level percentages are accessible per chart. A UK-specific CSV would need to be assembled from the interactive explorer.

### Gaps
- Not researched (search budget): Nuffield Politics Research Centre, UK in a Changing Europe trackers, KCL Policy Institute, Hansard Society Audit of Political Engagement, ESRC Party Members Project, Centre for Social Investigation, Focaldata/Prolific attitude datasets, Our World in Data (host blocked; OWID's GitHub repos were not searched for UK attitude series).

---

## 10. Local archive inventory (what was downloaded, with verification)

### Takeaway
57 files (~23 MB) were saved under `data/open_datasets/`. Every file was parsed after download (row counts/sheet names/date ranges below). Nothing in the archive is individual-level microdata; everything is poll-level or constituency-level and is either credit-only (PollBase), CC BY-SA (Wikipedia-derived), Open Parliament Licence/OGL (HoC/ONS-derived results), or published-for-use pollster output (YouGov articles).

### Cited Findings
| File | Size | Content / verification | Source URL | Licence |
|---|---|---|---|---|
| `pollbase_markpack_Q4_2025.xlsx` | 2,447 KB | Mark Pack PollBase, Q4 2025 edition; 29 sheets; '24-' sheet = 529 polls 5 Jul 2024 – 7/8 Jan 2026 (Con, Lab, LD, Green, Reform, leader ratings, Best PM, govt approval, mode, geography, MRP seat projections) | [keithysimpson repo copy](https://github.com/keithysimpson/UK_general_election_polls_stacked) of [markpack.org.uk/opinion-polls](https://www.markpack.org.uk/opinion-polls/) | Credit Mark Pack + link back |
| `pollbase_markpack_Q4_2025_tidy_vi_1943-2026.csv` | 566 KB | My tidy long export: 9,438 polls, 21 cols (sheet, Year, Month, Fieldwork, Published, Polling, Publisher, Con, Lab, LD, Green, Reform, BXP/Reform, Ukip, Con lead, Con/Lab, Ref/Lab, Mode, Geography, MRP?); per-sheet CSVs in `pollbase_sheets/` (22 files) | derived from above | as above |
| `pollbase_markpack_Q4_2020.xlsx` | 1,508 KB | Older edition (28 sheets, to Jan 2021) used by britpol | [jackobailey/britpol](https://github.com/jackobailey/britpol) | Credit Mark Pack |
| `britpol_pollbase.csv` / `.rda` | 359 KB | 6,275 polls 1945-06-24 to 2021-12-09; id, start, end, pollster, n, con, lab, lib (fractions) | [jackobailey/britpol](https://github.com/jackobailey/britpol) | MIT (package); data credit Pack/Bailey |
| `britpol_pollbasepro.csv` / `.rda` | 2,708 KB | 24,364 daily rows 1955-05-26 to 2022-02-06; con/lab/lib posterior mean and error | same | same |
| `britpol_house_effects.csv` / `.rda` | 19 KB | 143 rows, pollster house effects by election 1955–2019 | same | same |
| `wikipedia_next_ge_polls_2024-2026_samueljackson92.json` / `.csv` | 230 / 61 KB | 628 GB VI polls 2024-07-12 to 2026-11-02; dates, pollster, client, area, sample_size, labour, conservative, reform, liberal_democrats, green, snp, plaid_cymru, rb (Restore Britain), others, lead, year, date | [samueljackson92/polls](https://github.com/samueljackson92/polls) scraping [Wikipedia](https://en.wikipedia.org/wiki/Opinion_polling_for_the_next_United_Kingdom_general_election) | CC BY-SA 4.0 (Wikipedia) |
| `wikipedia_next_ge_polls_raw_page_2026-11-06.html` | 2,527 KB | Raw Wikipedia page HTML, last edited 5 Nov 2026 21:27 | same | CC BY-SA 4.0 |
| `wikipedia_page_tables/table_00..08.csv` | ~65 KB | All 9 data tables parsed from the page: 01 = 2026 national (278 rows), 02 = 2025 (291), 03 = 2024 post-GE (54), 04 = Wales sub-samples (15), 05–08 = rural/London (Savanta-QMUL)/other sub-national | derived from above | CC BY-SA 4.0 |
| `wikipedia_ge_polls_2010-2026_keithysimpson.csv` | 439 KB | 3,774 polls 2010-05-12 to 2026-04-06; date, Pollster, Samplesize, Reform_UKIP, Conservative, Lib_Dem, Labour, SNP, Green, Others (fractions) + author's left/right split | [keithysimpson repo](https://github.com/keithysimpson/UK_general_election_polls_stacked) | CC BY-SA 4.0 |
| `uk_ge_results_1997-2024_vote_shares_keithysimpson.csv` | 3 KB | 29 rows of GB vote shares by party for general elections 1918–2024 | same | CC BY-SA 4.0 |
| `wikipedia_scottish_parliament_2026_polls_frozen_maxhigdon44.json` + `_constituencyPolls.csv`, `_regionalPolls.csv` | 93 + 11 + 11 KB | 146 constituency-vote and 146 regional-vote polls 2021-05-06 to 2026-05-07 (incl. the 7 May 2026 result row) | [MaxHigdon44/Poll-of-polls](https://github.com/MaxHigdon44/Poll-of-polls) | CC BY-SA 4.0 |
| `wikipedia_senedd_2026_polls_frozen_maxhigdon44.json` + `wikipedia_senedd_2026_polls.csv` | 12 + 3 KB | 38 Senedd polls 2021-05-06 to 2026-05-07 | same | CC BY-SA 4.0 |
| `scottish_parliament_2026_results_maxhigdon44.json` | 56 KB | Constituency results, seat counts, generated 2026-05-13 | same | derived from Wikipedia |
| `england_local_elections_2026_results_maxhigdon44.json` | 1,358 KB | Ward-level results 7 May 2026 ("Democracy Club candidate results export") | same | Democracy Club (open) |
| `yougov_times_sky_vi_2026_from_articles.csv` | 1 KB | 6 weekly Times/Sky VI polls 27 Sep–2 Nov 2026 parsed from yougov.com (fieldwork, N, party %) | yougov.com article URLs in section 5 | YouGov, attribution |
| `yougov_vi_tracker_demographic_summary_datajohn.csv` | 23 KB | 158 rows: party x demographic group latest share (2026-09-28), 4/12/52-week change, 90 weekly polls since 2025-01-13 (derived from YouGov tracker xlsx) | [data-john/voting-intention-analysis](https://github.com/data-john/voting-intention-analysis) | derived; YouGov attribution |
| `hoc_library_1918-2019_election_results_by_pcon.xlsx` | 5,417 KB | HoC Library constituency results 1918–2019, 29 sheets | via [britpol](https://github.com/jackobailey/britpol) / [keithysimpson](https://github.com/keithysimpson/UK_general_election_polls_stacked); original [CBP-8647](https://commonslibrary.parliament.uk/research-briefings/cbp-8647/) | Open Parliament Licence |
| `hoc_library_1918-2019_election_results_long.csv` | 1,844 KB | 17,698 rows (read with `encoding='latin-1'`) | same | OPL |
| `ge2024_results_census_constituency_summaries_ralphascott_v1.1.csv` | 708 KB | 632 constituencies x 242 cols: 2024 results (HoC CBP-10009), 2019 notionals, EU-ref and indyref notionals, Census 2021 | [ralphascott/UKGE24_wpc_census_summaries](https://github.com/ralphascott/UKGE24_wpc_census_summaries) | OPL / OGL / author |

### Inferences
- The two Wikipedia-derived national series disagree slightly in coverage (3,774 vs 628 rows for overlapping periods because keithysimpson stops at 6 Apr 2026 and samueljackson92 starts Jul 2024); for 2026 use samueljackson92 (updated daily) and PollBase for anything before 2024.

### Gaps
- None of the pollster-authored tables (PDF/xlsx) are in the archive.

---

## 11. Programmatic access cheat sheet (curl + pandas)

### Takeaway
The snippets below are the shortest reliable routes to each major source; those marked "verified this session" ran successfully here, the rest are reconstructed from the scripts cited above and need an unrestricted network.

### Cited Findings
```bash
# 0) Proxy-aware curl (this environment): keep HTTPS_PROXY; CA bundle is pre-set
export CURL_CA_BUNDLE=/root/.ccr/ca-bundle.crt
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36"

# 1) Mark Pack PollBase (quarterly xlsx; link is on the page, filename changes each quarter)
curl -sSL -A "$UA" https://www.markpack.org.uk/opinion-polls/ | grep -oE 'https://[^"]+PollBase[^"]+\.xlsx' | head -1 | xargs -I{} curl -sSL -A "$UA" -o pollbase_markpack.xlsx "{}"
# fallback (verified this session): git clone --depth 1 https://github.com/keithysimpson/UK_general_election_polls_stacked  # data/PollBase-Q4-2025.xlsx

# 2) Wikipedia polling table (verified pattern; used by samueljackson92/polls GitHub Action)
curl -sSL -A "$UA" "https://en.wikipedia.org/wiki/Opinion_polling_for_the_next_United_Kingdom_general_election" -o wiki_polls.html
curl -sSL -A "$UA" "https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Scottish_Parliament_election" -o wiki_scot.html
curl -sSL -A "$UA" "https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Senedd_election" -o wiki_wales.html

# 3) Politico Poll of Polls JSON (from vfillis/automated-polling and cornelius-erfort scripts)
curl -sSL -A "$UA" "https://www.politico.eu/wp-json/politico/v1/poll-of-polls/GB-parliament" -o politico_poll_of_polls_uk.json
curl -sSL -A "$UA" "https://www.politico.eu/wp-json/politico/v1/poll-of-polls/GB-leadership-approval" -o politico_uk_leadership_approval.json

# 4) YouGov tracker xlsx (from data-john/voting-intention-analysis and The Times' script.R)
curl -sSL -A "$UA" "https://api-test.yougov.com/public-data/v5/uk/trackers/voting-intention/download/" -o yougov_vi_tracker.xlsx
curl -sSL -A "$UA" "https://api-test.yougov.com/public-data/v5/uk/trackers/government-approval/download/" -o yougov_govt_approval_tracker.xlsx
#   other trackers: take <slug> from https://yougov.co.uk/topics/politics/trackers/<slug> and reuse the pattern
# YouGov PDF tables: https://d3nkl3psvxxpe9.cloudfront.net/documents/<name>.pdf  (e.g. VotingIntention_MRP_Results_260223_w.pdf)

# 5) ONS OPN monthly tables (Open Government Licence): list xlsx links on the related-data page
curl -sSL -A "$UA" "https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/latest/relateddata" | grep -oE '/file\?uri=[^"]+\.xlsx' | sed 's#^#https://www.ons.gov.uk#' | sort -u

# 6) Parliament election-results Datasette (Open Parliament Licence) -> CSV
curl -sSL "https://datasette.electionresults.parliament.uk/psephology/general_elections.csv?_size=max" -o parliament_general_elections.csv

# 7) GitHub mirrors that worked from this restricted session
git clone --depth 1 https://github.com/samueljackson92/polls            # data/processed/polling_data.json (daily, 2024->now)
git clone --depth 1 https://github.com/jackobailey/britpol               # data/pollbase.rda, pollbasepro.rda
git clone --depth 1 https://github.com/MaxHigdon44/Poll-of-polls         # public/data/scottish-polls-frozen.json, welsh-polls-frozen.json
```

```python
import pandas as pd, json, requests
# PollBase: each period sheet has a header row; Year is sparse (forward-fill)
x = pd.ExcelFile("pollbase_markpack_Q4_2025.xlsx")
pb = pd.read_excel(x, "24-", header=0)
pb["Year"] = pb["Year"].ffill()
# tidy version already built: pollbase_markpack_Q4_2025_tidy_vi_1943-2026.csv

# Wikipedia tables straight from HTML (needs lxml)
tabs = pd.read_html("wiki_polls.html")           # tables[1..3] = 2026, 2025, 2024 national VI
vi2026 = tabs[1]; vi2026.columns = [c[0] for c in vi2026.columns]

# Politico JSON -> long format
j = requests.get("https://www.politico.eu/wp-json/politico/v1/poll-of-polls/GB-parliament").json()
polls = pd.json_normalize(j["polls"])            # columns: date, firm, sample size, parties.Con, parties.Lab, parties.BP (Reform) ...
trend = pd.json_normalize(j["trends"]["kalmanSmooth"])

# YouGov tracker workbook: one sheet per breakdown, rows = parties, columns = poll dates
yg = pd.read_excel("yougov_vi_tracker.xlsx", sheet_name=None, index_col=0)
all_adults = yg[list(yg)[0]].T                   # transpose -> rows = dates

# britpol .rda without R
import pyreadr; pollbase = pyreadr.read_r("britpol_pollbase.rda")["pollbase"]

# HoC long results CSV is latin-1
hoc = pd.read_csv("hoc_library_1918-2019_election_results_long.csv", encoding="latin-1")

# UKDS / BES microdata after manual download (registration required)
bes = pd.read_stata("BES2019_W31_v31.0.dta", convert_categoricals=False)   # or pd.read_spss(...)
```

### Inferences
- `api-test.yougov.com` is the only pollster endpoint found that serves machine-readable multi-wave crosstabs without a login; everything else is PDF or page-scrape.
- For an always-current GB poll list with zero scraping, `git pull` on samueljackson92/polls (daily GitHub Action) is the lowest-effort route.

### Gaps
- Snippets 1–6 could not be executed here (hosts blocked) and should be re-tested on an open network; endpoint shapes for Politico and YouGov come from third-party code dated 2024–2026 and may change without notice.
