# Newspeak House Order Paper

A dinner ordering sheet for two sittings, taking orders from up to 30 people for
[Bangkok Bites](https://www.bangkokbites.uk/) at 147 Bethnal Green Road — four
doors down from the house at 133.

`index.html` is the whole app. It runs two ways from the same file:

| | Who can open it | Storage |
|---|---|---|
| **Published artifact** | only people signed in to the same Claude organisation | the artifact `db` capability |
| **Self-hosted** (`server.js`) | **anyone with the link** | `data.json` on the server |

Because the thirty people ordering are outside the organisation, **self-hosted is
the one to use.** The page picks its backend at load: if it's running inside a
Claude artifact it uses `db`, otherwise it talks to the server it came from.

## Running it

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
edit, so people can change their minds without creating duplicates. Thirty
distinct names, each able to order for both sittings.

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

### About the starting menu

The session that built this could not reach `bangkokbites.uk` — the sandbox's
egress policy blocks it — so the menu carries only dishes and prices that could
be confirmed from public listings:

> Papaya Salad £7.50 · Salt & Pepper Chicken £8.50 · Green Curry (medium) £9.50 ·
> Massaman Curry (mild) £9.50 · Pad Thai £10.50 · Vegan Pad Thai £10.99 ·
> Kao Pad Kra Praw (medium hot) £10.99

Every other dish is listed with its price as *tbc* rather than invented. Paste
the real menu into the clerk's table and it's fixed everywhere at once.

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

The server re-validates everything a client sends: names are required,
quantities clamp to 1–20, prices must parse, the thirty-person cap and the
closed-list flag are enforced server-side.
