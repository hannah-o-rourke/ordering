# Newspeak House Order Paper

A dinner ordering sheet for two sittings at Newspeak House, taking orders from up
to 30 people for [Bangkok Bites](https://www.bangkokbites.uk/), 147 Bethnal Green
Road — four doors down from the house at 133.

**Live page:** https://claude.ai/code/artifact/081dc60c-27a4-4fae-88a6-774cd9ae29d7

## What it does

- Two sittings, each with its own roll of names and its own tally.
- Up to 30 distinct people. A person is identified by their name: typing a name
  that is already on the roll pulls that order back up for editing, so people can
  change their minds without creating duplicates.
- Per-person notes for allergies and spice level.
- A **tally** view that adds up every dish across a sitting — the list you read
  down the phone to the restaurant.
- A **Clerk's table** (admin panel) to set the two dates, replace the menu, and
  close the list.
- Plain-text export of both sittings for emailing.

## Editing the menu

The starting menu carries only the prices that could be verified; everything else
is marked *price TBC*. To replace it, open the page → **Clerk's table** → **The
menu**, and paste one dish per line:

```
Course | Dish | Price
Starters | Vegetable Spring Rolls | 6.50
Curries | Green Curry (medium) | 9.50
Sushi | Vegetarian Sushi
```

Leave the price off and the dish shows as *price TBC*. Saving replaces the menu
for everyone.

## Storage

Orders live in the artifact's `db` capability, not in this repo:

- `config/settings` — `{ menu, nights, closed }`, editable by people with edit
  access to the artifact.
- `orders/<name-slug>` — one document per person, holding both sittings.

## Caveat on access

An artifact that declares `db` is organisation-internal: everyone who opens it
has to be signed in and in the same Claude organisation as the owner. If the
thirty people ordering are not, this page cannot be the thing they go to, and the
app needs hosting somewhere public instead. `index.html` is the whole app and
carries no secrets, so it ports cleanly to any host once the two `claude.use("db")`
calls are swapped for an ordinary backend.
