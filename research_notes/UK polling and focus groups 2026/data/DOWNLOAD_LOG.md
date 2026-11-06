# Download log (6 Nov 2026)

All external downloads failed: the session's HTTPS proxy returned `CONNECT tunnel failed, response 403` for every non-allowlisted host (yougov.com, yougov.co.uk, ipsos.com, en.wikipedia.org, ons.gov.uk, whatukthinks.org). WebFetch failed the same way (`getaddrinfo ENOTFOUND` / policy denial). No raw files could be saved. The three CSVs in this folder were hand-built from figures captured via WebSearch result snippets (see leaders_approval_issues.md for citations).

URLs that should be downloaded once network access is allowed:

| Intended filename | Source URL | Description |
|---|---|---|
| yougov_starmer_approval_tracker.csv | https://yougov.com/en-gb/trackers/keir-starmer-prime-minister-approval | YouGov "How well is Keir Starmer doing as PM" tracker 2024-2026 (download-data link on page) |
| yougov_government_approval_tracker.csv | https://yougov.com/en-gb/trackers/government-approval | YouGov government approval 2011-2026 |
| yougov_voting_system_tracker.csv | https://yougov.com/en-gb/trackers/should-we-change-our-current-british-voting-system | Biannual PR vs FPTP tracker 2019-2026 |
| yougov_welfare_handling_tracker.csv | https://yougov.com/en-gb/trackers/how-the-government-is-handling-the-issue-of-welfare-benefits-in-the-uk | Government handling of welfare 2019-2026 |
| ipsos_issues_index_jan2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-02/Ipsos%20Issues%20Index_Jan26_v1_PUBLIC.pdf | Ipsos Issues Index January 2026 tables |
| ipsos_issues_index_may2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-05/Ipsos%20Issues%20Index_May%2026_v1d2_IUO_EDI.pdf | Ipsos Issues Index May 2026 tables |
| ipsos_political_monitor_jan2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-01/Ipsos%20Jan%202026_Political%20Monitor%20charts_Release%201_V1_Int%20Use%20Only.pdf | Ipsos Political Monitor charts, Jan 2026 (fieldwork 22-27 Jan, n=1,104) |
| ipsos_political_monitor_mar2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-03/Ipsos%20Mar%202026_Political%20Monitor%20charts.pdf | Ipsos Political Monitor charts, Mar 2026 (5-11 Mar, n=1,062) |
| ipsos_political_monitor_apr2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-04/Ipsos%20Apr%202026_Political%20Monitor%20charts_Public.pdf | Ipsos Political Monitor charts, Apr 2026 |
| ipsos_political_monitor_may2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-05/Ipsos%20May%202026_Political%20Monitor%20charts_Release%201_IntUseOnly.pdf | Ipsos Political Monitor charts, May 2026 (14-20 May, n=1,137) |
| ipsos_political_monitor_julaug2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-08/Ipsos%20Jul-Aug%202026_Political%20Monitor%20charts.pdf | Ipsos Political Monitor charts, Jul/Aug 2026 (first Burnham reading) |
| ipsos_political_pulse_apr2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-04/Ipsos_APR%2026_Political%20Pulse_Public.pdf | Ipsos Political Pulse April 2026 |
| ipsos_political_pulse_aug2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-09/Ipsos_%20Aug%2026_Political%20Pulse_v1d5_Int%20Use%20Only.pdf | Ipsos Political Pulse Aug 2026 (right direction/wrong track) |
| ipsos_scotland_political_monitor_mar2026.pdf | https://www.ipsos.com/sites/default/files/ct/news/documents/2026-03/Scotland%20Political%20Monitor%20March%202026%20Charts%20.pdf | Ipsos Scotland Political Monitor Mar 2026 |
| edelman_trust_barometer_2026_uk.pdf | https://www.edelman.com/sites/g/files/aatuss191/files/uk/2026-01/2026%20Edelman%20Trust%20Barometer_UK%20Report%20(1).pdf | Edelman Trust Barometer 2026 UK report |
| edelman_trust_barometer_2026_uk_top10.pdf | https://www.edelman.com/sites/g/files/aatuss191/files/uk/2026-01/Trust%20Barometer%202026_Top10_UK.pdf | Edelman 2026 UK top-10 findings |
| electoral_commission_postpoll_2026_technical.pdf | https://www.electoralcommission.org.uk/sites/default/files/2026-09/Electoral%20Commission%20-%20Post%20Poll%20Public%20Opinion%20Survey%20May%202026%20Technical%20Report_0.pdf | EC post-poll survey May 2026 (YouGov, fieldwork 8 May-2 Jun 2026) |
| british_future_tracker_2026.pdf | https://www.britishfuture.org/wp-content/uploads/2026/05/Tracker-report-2026.Final_-1.pdf | British Future/Focaldata Immigration Attitudes Tracker 2026 (n=3,003) |
| more_in_common_no_overall_control_2026.pdf | https://www.moreincommon.org.uk/wp-content/uploads/2026/05/no-overall-control_-british-politics-in-an-era-of-fragmentation-1.pdf | More in Common post-local-elections report May 2026 |
| ons_opn_may2026.pdf | https://www.ons.gov.uk/peoplepopulationandcommunity/wellbeing/bulletins/publicopinionsandsocialtrendsgreatbritain/may2026/pdf | ONS Public opinions and social trends, May 2026 |
| ipsos_what_worries_the_world_aug2026.pdf | https://resources.ipsos.com/rs/297-CXJ-795/images/What-Worries-the-World-August-26-WEB.pdf?version=0 | Ipsos What Worries the World Aug 2026 (UK right-direction) |

## Added by the devolved/local/by-election researcher (6 Nov 2026)

Network note: in this researcher's session the egress proxy returned 403 for en.wikipedia.org, www.parliament.scot, www.lucidtalk.co.uk, britpolls.co.uk, electionscentre.uk and andrewspreviews.substack.com (environment allowlist), and a request to add those hosts was rejected; the shared WebSearch budget was then exhausted. The Wikipedia polling tables for "Opinion polling for the 2026 Scottish Parliament election", "Opinion polling for the 2026 Senedd election" and "2026 United Kingdom local elections" could therefore NOT be scraped. Official Electoral Commission / Scottish Parliament / Senedd / Open Council Data CSVs could not be downloaded either.

Files that WERE saved (all from hosts on the allowlist: members-api.parliament.uk and www.theyworkforyou.com):
- parliament_members_api_byelections_2026_summary.csv — 12 rows (6 by-elections of 2026 + the 2024 GE baseline for each); cols: constituency, election_date, election_title, result, electorate, turnout_votes, turnout_pct, majority, winning_party, source. Source: https://members-api.parliament.uk/api/Location/Constituency/{id}/ElectionResult/{electionId} (ids 4066/554, 4165/558, 4450/557, 4455/556, 3989/559, 4105/560; GE = 422).
- parliament_members_api_byelections_2026_candidates.csv — 134 candidate rows; cols: constituency, election_date, election_title, election_id, is_general, candidate, party, party_abbr, votes, vote_share_pct (fraction 0-1), rank, result_change (pp change vs 2024 GE for by-elections; string with % for GE rows). Same source.
- parliament_members_api_raw/ — 25 raw JSON responses (res_*.json candidate-level results, er_*.json election lists, rep_*.json representation history, new_mps_2026.json = Members/Search?House=1&MembershipStartedSince=2026-01-01).
- holyrood_first_minister_selection_2026-05-19_official_report.csv — 15 rows (3 rounds); Scottish Parliament Official Report via https://www.theyworkforyou.com/sp/?id=2026-05-19.8.0
- holyrood_presiding_officer_election_2026-05-14_official_report.csv — 9 rows; https://www.theyworkforyou.com/sp/?id=2026-05-14.4.0
- senedd_first_minister_nomination_2026-05-12_official_record.csv — 4 rows; Senedd Record via https://www.theyworkforyou.com/wales/?id=2026-05-12.3.762202.h
- theyworkforyou_official_report_raw/ — plain-text dumps of the four debates above (sp_fm_20260519, senedd_fm_20260512, sp_ministers_20260521 [Scottish Cabinet appointments], sp_po_20260514).
- compiled_headline_results_from_websearch_2026.csv — 23 rows of headline seat/share figures compiled from WebSearch result summaries (Wikipedia, IfG, Swansea Bay News, Britpolls, Andrew's Previews, Yahoo/Westminster). NOT scraped from the pages; each row carries its source URL and caveat. Treat as secondary until checked against the pages.

## Added by the gap-fill researcher (6 Nov 2026, later session; allowlist widened)

Nearly all of the URLs in the table above (and in segmentation/UNFETCHED_URLS.txt) have now been downloaded into `data/gapfill_trackers/` (318 files, 213 MB; per-folder `_download_log.tsv` records HTTP code, size and file type for every attempt). Still unreachable from this environment: api-test.yougov.com (YouGov tracker CSV endpoint), yougov.co.uk (use yougov.com/en-gb/articles/<id>), techneuk.com/tracker and /archive, bmgresearch.com, cdn.survation.com, freshwaterstrategy.com, cms.findoutnow.co.uk, landing.focaldata.com, lordashcroftpolls.com, nationbuilder (Public First), squarespace (JL Partners), convergent-opinion.com, edelman.com, electoralcommission.org.uk, britishfuture.org, ons.gov.uk, resources.ipsos.com (not retried). The Ipsos Issues Index October 2026 edition does not appear to have been published on ipsos.com as of 6 Nov. See `gapfill_leaders_issues_crosstabs.md` for the file inventory and for the rows appended to leader_ratings_2026.csv (+855), government_approval_2026.csv (+32), issues_trackers_2026.csv (+929) and vi_by_demographic_2026.csv (+633); pre-append copies are in `gapfill_trackers/BACKUP_pre_gapfill_*.csv`.
