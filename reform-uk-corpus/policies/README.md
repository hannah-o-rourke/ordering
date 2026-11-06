# Reform UK policy documents

Every PDF here was downloaded from Reform UK's own document host
(`assets.nationbuilder.com/reformuk/...`). `sources.json` records the source URL,
date and page count for each file. `text/` holds a plain-text version of each PDF:
native text extraction (`pdftotext -layout`) where the PDF has a text layer, and
Tesseract OCR where it is image-only (marked in `sources.json`; expect OCR noise).

| File | Document | Date |
|---|---|---|
| `manifesto_2024_our_contract_with_you.pdf` | Our Contract with You, 2024 general election manifesto | Jun 2024 |
| `operation_restoring_justice_2025-08.pdf` | Operation Restoring Justice (deportation plan) | Aug 2025 |
| `healthcare_needs_reform_2024-04.pdf` | Healthcare Needs Reform | Apr 2024 |
| `bring_on_the_election_2024-01.pdf` | Bring on the Election! | Jan 2024 |
| `reform_is_essential_2023-10.pdf` | Reform is Essential (Oct 2023) | Oct 2023 |
| `reform_is_essential_2023-07.pdf` | Reform is Essential (Jul 2023) | Jul 2023 |
| `reform_is_essential_2022-12.pdf` | Reform is Essential (Dec 2022) | Dec 2022 |
| `reform_is_essential_2022-11.pdf` | Reform is Essential (Nov 2022) | Nov 2022 |
| `emergency_energy_plan_2022-08.pdf` | Emergency Energy Plan / 5 Year Energy Plan | Aug 2022 |

## Not collected (and why)

The current policy documents listed on https://www.reformparty.uk/policies are served
only through `reformparty.uk` itself, which sits behind a Cloudflare bot check that
refused every non-browser request from this environment. Known items still to fetch
from a normal browser session:

- The First 100 Days: Our Pledges to You — https://www.reformparty.uk/policies/the-first-100-days-our-pledges-to-you
- Economic Rescue Plan (64 measures, Nov 2026) — https://www.reformparty.uk/policies/economic-rescue-plan/pdf
- Ending the Asylum Scam — listed on https://www.reformparty.uk/policies
- Operation Fortress (Aug 2026) — https://www.reformparty.uk/view-pdf/operation-fortress
- Making Welfare Work (Aug 2026) — https://www.reformparty.uk/view-pdf/making-welfare-work
- Britannia Card proposal (Jun 2025) — not hosted on the asset CDN; a third-party copy is at https://taxpolicy.org.uk/wp-content/uploads/2025/06/Card.pdf
- Reform UK Scotland manifesto 2026 — https://reformuk.scot/wp-content/uploads/2026/04/Reform-UK-Scotland-Manifesto-2026.pdf
- Reform UK Wales "Our Contract with You" 2026 (Senedd) — via https://manifesto-cymru.cavendishconsulting.com/reform-uk-2026-welsh-manifesto/
