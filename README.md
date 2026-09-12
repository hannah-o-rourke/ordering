# Newspeak House Order Paper

A dinner ordering sheet for two sittings, taking orders from up to 30 people for
[Bangkok Bites](https://www.bangkokbites.uk/) at 147 Bethnal Green Road — four
doors down from the house at 133.

`index.html` is the whole app. It runs three ways from the same file, picking
its backend at load:

| | Who can open it | Storage |
|---|---|---|
| **GitHub Pages + Apps Script** | **anyone with the link** | a Google Sheet |
| **Self-hosted** (`server.js`) | **anyone with the link** | `data.json` on the server |
| **Published artifact** | only people in the same Claude organisation | the artifact `db` capability |

GitHub Pages on its own cannot run this. Pages serves static files, so there is
nowhere for thirty people's orders to be *shared* — each person would build an
order that never left their own browser. Pages hosts the page; Apps Script holds
the orders and sends the email.

## Deploying on GitHub Pages

### 1. The backend

Everything is in [`apps-script/Code.gs`](apps-script/Code.gs), and the setup
steps are in the comment at the top of that file. In short: paste it into a new
project at [script.google.com](https://script.google.com), run `setup` once,
then **Deploy ▸ New deployment ▸ Web app** with *Execute as: Me* and *Who has
access: Anyone*. Copy the URL ending in `/exec`.

Running `setup` creates the spreadsheet the orders live in and prints an admin
token to the log. Keep that token; it guards the menu editor and the email
button.

Why "Anyone" is safe here: the script only ever exposes the five actions below,
it re-validates everything sent to it, and the menu editor and email button are
behind the admin token. Nobody gets access to your Google account.

### 2. The page

Paste the `/exec` URL into `API_URL` near the top of the script block in
`index.html`:

```js
var API_URL = "https://script.google.com/macros/s/AKfy.../exec";
```

Then in the repo, **Settings ▸ Pages ▸ Source: GitHub Actions**. Pushing
`index.html` to `main` publishes it via
[`.github/workflows/pages.yml`](.github/workflows/pages.yml), which deploys the
page alone — the Node server and the Apps Script source stay in the repo but are
not part of the site.

Your ordering link is then `https://<you>.github.io/ordering/`, and your own
admin link is that plus `?admin=<token>`.

### A note on CORS

The page posts to Apps Script as `text/plain` on purpose. That keeps the request
"simple" under CORS, so the browser sends it straight through; a JSON content
type would trigger a preflight `OPTIONS` that Apps Script has no way to answer.
`Code.gs` parses the body itself. Don't "fix" the content type.

## Running it without GitHub Pages

`server.js` is the same app against a Node backend, if you would rather not use
Apps Script. Leave `API_URL` empty and it talks to whichever server sent it.

```bash
npm install          # one dependency, nodemailer, only needed for the email button
npm start            # http://localhost:3000
```

Then put it anywhere that runs Node — Railway, Render, Fly, a VPS. There's no
database to provision; orders land in `data.json` next to the server. Point
`DATA_FILE` at a persistent volume if the host has an ephemeral filesystem.

### Settings

Copy `.env.example` to `.env`, or export these before `npm start`:

| Variable | What it does |
|---|---|
| `PORT` | Port to listen on (default `3000`) |
| `DATA_FILE` | Where orders are kept (default `./data.json`) |
| `ADMIN_TOKEN` | If set, the clerk's table and the email button need `?admin=<token>`. Share the plain link with everyone; keep the `?admin=` one to yourself. |
| `ORDER_EMAIL_TO` | Recipients (default `ed@newspeak.house,hannah@campaignlab.uk`) |
| `SMTP_URL` | e.g. `smtps://user:pass@smtp.gmail.com:465` — needed for the email button. For Gmail use an [App Password](https://myaccount.google.com/apppasswords), not your account password. |
| `SMTP_FROM` | `From:` address |

## Using it

**Ordering.** Pick a sitting, put your name down, tap dishes up and down, table
the order. Typing a name that's already on the roll pulls that order back up to
edit, so people can change their minds without creating duplicates. Each person
can order for both sittings.

Name only — no email is asked for or stored, since nobody is being invoiced.

**How many places.** Clerk's table → **Places**. Defaults to 30; set it to `0`
for no limit. The limit is enforced on the server, not just in the page.

**Emailing the list.** Open the clerk's table with your `?admin=` link and press
**Email it to Ed & Hannah**. It sends both sittings — the tally and the
who-ordered-what — to `ORDER_EMAIL_TO`. Ed can do this himself whenever he wants
it; nobody has to be standing by.

**Setting the dates.** Clerk's table → the two sittings. Whatever you type is
what everyone sees.

**Editing the menu.** Clerk's table → the menu. One dish per line:

```
Course | Dish | Price
Starters | Vegetable Spring Rolls | 6.50
Curries | Green Curry (medium) | 9.50
Sushi | Vegetarian Sushi
```

Leave the price off and the dish shows as *tbc*. Saving replaces the menu for
everyone.

### The menu as shipped

182 dishes across 29 courses, as supplied by the restaurant. Two carry no price
on their menu — Sweet Pumpkin (6 pieces) and Crispy Aromatic Roasted Duck — and
show as *tbc* rather than being guessed at.

Courses written `Category · Dish` hold the protein choices for one dish, so the
row reads just "Chicken" under a "Thai Curries · Green Curry (medium)" heading.
On the roll, the tally and the email that same row reads "Green Curry (medium) —
Chicken", because "2 × Chicken" is not something a kitchen can cook from.

Note that Bangkok Bites run 50% off Monday–Thursday evenings, so these full list
prices should overstate the actual bill.

## API

Used by the page; useful if you want to script against it.

| Route | Does |
|---|---|
| `GET /api/state` | `{config, orders, cap, admin}` |
| `POST /api/order` | `{id, order}` — upsert one person's order |
| `POST /api/order/delete` | `{id}` — withdraw |
| `POST /api/config` | `{config}` — menu, dates, open/closed *(admin)* |
| `POST /api/email` | `{text}` — send the list *(admin)* |

The Apps Script backend takes the same five as `{action: "state"|"order"|
"delete"|"config"|"email", token, ...}` posted to the one `/exec` URL.

The server re-validates everything a client sends: names are required,
quantities clamp to 1–20, prices must parse, the thirty-person cap and the
closed-list flag are enforced server-side.
