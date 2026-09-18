#!/usr/bin/env node
/**
 * Newspeak House Order Paper — standalone server.
 *
 * Serves index.html and a small JSON API so anyone with the link can order,
 * no sign-in and no Claude organisation required.
 *
 *   node server.js
 *
 * Environment (all optional except where noted):
 *   PORT           port to listen on                      (default 3000)
 *   DATA_FILE      where orders are kept                  (default ./data.json)
 *   ADMIN_TOKEN    if set, the clerk's table and the email button require
 *                  ?admin=<token> on the URL. Leave unset to let anyone with
 *                  the link edit the menu and send the email.
 *   ORDER_EMAIL_TO comma-separated recipients
 *                  (default ed@newspeak.house,hannah@campaignlab.uk)
 *   SMTP_URL       e.g. smtps://user:pass@smtp.gmail.com:465  — required for
 *                  the email button to work
 *   SMTP_FROM      From: address (default: the SMTP user)
 */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const EMAIL_TO = (process.env.ORDER_EMAIL_TO || "ed@newspeak.house,hannah@campaignlab.uk")
  .split(",").map((s) => s.trim()).filter(Boolean);
const DEFAULT_CAP = 0; // 0 = no limit; the clerk's table can set one

/* ----------------------------------------------------------- storage ------ */
let state = { config: null, orders: {} };
try {
  state = Object.assign(state, JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
  console.log(`Loaded ${Object.keys(state.orders).length} orders from ${DATA_FILE}`);
} catch (e) {
  if (e.code !== "ENOENT") console.error(`Could not read ${DATA_FILE}:`, e.message);
}

let writing = false, dirty = false;
function persist() {
  if (writing) { dirty = true; return; }
  writing = true;
  const tmp = DATA_FILE + ".tmp";
  fs.writeFile(tmp, JSON.stringify(state, null, 2), (err) => {
    if (err) { console.error("Write failed:", err.message); writing = false; return; }
    fs.rename(tmp, DATA_FILE, (err2) => {
      if (err2) console.error("Rename failed:", err2.message);
      writing = false;
      if (dirty) { dirty = false; persist(); }
    });
  });
}

/** How many people are expected is a setting; 0 means no limit. */
function capOf() {
  const c = state.config;
  if (c && c.cap !== undefined && c.cap !== null && c.cap !== "") return Number(c.cap) || 0;
  return DEFAULT_CAP;
}

/* ------------------------------------------------------------ helpers ----- */
const send = (res, code, body, type) => {
  const payload = type ? body : JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": type || "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(payload);
};
const fail = (res, code, msg) => send(res, code, { error: msg });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "", size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 256 * 1024) { reject(new Error("Body too large")); req.destroy(); return; }
      raw += c;
    });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Bad JSON")); } });
    req.on("error", reject);
  });
}

const isAdmin = (req, url) =>
  !ADMIN_TOKEN ||
  req.headers["x-admin-token"] === ADMIN_TOKEN ||
  url.searchParams.get("admin") === ADMIN_TOKEN;

const slug = (s) => String(s || "").toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

/** Accept only the shape the page sends; never trust the client's arithmetic. */
function cleanOrder(input) {
  if (!input || typeof input !== "object") throw new Error("Malformed order");
  const name = String(input.name || "").trim().slice(0, 60);
  if (!name) throw new Error("An order needs a name");
  const nights = {};
  for (const key of Object.keys(input.nights || {}).slice(0, 1)) {
    const slot = input.nights[key] || {};
    const items = (Array.isArray(slot.items) ? slot.items : []).slice(0, 60).map((i) => ({
      key: String(i.key || "").slice(0, 120),
      course: String(i.course || "").slice(0, 40),
      name: String(i.name || "").slice(0, 80),
      qty: Math.max(1, Math.min(20, parseInt(i.qty, 10) || 1)),
    }));
    nights[String(key).slice(0, 12)] = { items, notes: String(slot.notes || "").slice(0, 400) };
  }
  if (!Object.keys(nights).length) throw new Error("An order needs at least one sitting");
  return { name, nights, updatedAt: new Date().toISOString() };
}

/* -------------------------------------------------------------- email ----- */
async function mail(text) {
  if (!process.env.SMTP_URL) {
    throw new Error("No SMTP_URL is set on the server, so it cannot send mail yet");
  }
  let nodemailer;
  try { nodemailer = require("nodemailer"); }
  catch { throw new Error("nodemailer is not installed — run: npm install"); }

  const transport = nodemailer.createTransport(process.env.SMTP_URL);
  const count = Object.keys(state.orders).length;
  await transport.sendMail({
    from: process.env.SMTP_FROM || undefined,
    to: EMAIL_TO,
    subject: `Bangkok Bites order — Newspeak House (${count} ${count === 1 ? "person" : "people"})`,
    text,
  });
  return EMAIL_TO.join(", ");
}

/* ------------------------------------------------------------- routes ----- */
const INDEX = path.join(__dirname, "index.html");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = url.pathname;

  try {
    if (req.method === "GET" && (route === "/" || route === "/index.html")) {
      return fs.readFile(INDEX, (err, buf) => {
        if (err) return fail(res, 500, "index.html is missing");
        send(res, 200, buf, "text/html; charset=utf-8");
      });
    }

    if (req.method === "GET" && route === "/api/state") {
      const orders = Object.entries(state.orders)
        .map(([id, o]) => Object.assign({ id }, o))
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return send(res, 200, { config: state.config, orders, cap: capOf(), admin: !ADMIN_TOKEN || isAdmin(req, url) });
    }

    if (req.method === "POST" && route === "/api/order") {
      const body = await readBody(req);
      const id = slug(body.id || (body.order && body.order.name));
      if (!id) return fail(res, 400, "That name needs at least one letter or number");
      if (state.config && state.config.closed) return fail(res, 409, "The list is closed");
      const cap = capOf();
      if (!state.orders[id] && cap > 0 && Object.keys(state.orders).length >= cap) {
        return fail(res, 409, "Every place is taken");
      }
      let order;
      try { order = cleanOrder(body.order); }
      catch (e) { return fail(res, 400, e.message); }
      state.orders[id] = order;
      persist();
      console.log(`[order] ${order.name} (${id})`);
      return send(res, 200, { ok: true, id });
    }

    if (req.method === "POST" && route === "/api/order/delete") {
      const body = await readBody(req);
      const id = slug(body.id);
      if (state.config && state.config.closed) return fail(res, 409, "The list is closed");
      if (!state.orders[id]) return fail(res, 404, "No order under that name");
      console.log(`[withdrawn] ${state.orders[id].name} (${id})`);
      delete state.orders[id];
      persist();
      return send(res, 200, { ok: true });
    }

    if (req.method === "POST" && route === "/api/config") {
      if (!isAdmin(req, url)) return fail(res, 403, "That needs the admin link");
      const body = await readBody(req);
      const c = body.config || {};
      state.config = {
        menu: Array.isArray(c.menu) ? c.menu.slice(0, 250).map((r) => [
          String(r[0] || "").slice(0, 40),
          String(r[1] || "").slice(0, 80),
        ]) : null,
        nights: Array.isArray(c.nights) ? c.nights.slice(0, 1).map((n) => ({
          id: "n1",
          label: String(n.label || "").slice(0, 60),
          date: String(n.date || "").slice(0, 60),
        })) : null,
        closed: !!c.closed,
        cap: (c.cap === undefined || c.cap === null || c.cap === "")
          ? DEFAULT_CAP : Math.max(0, Number(c.cap) || 0),
      };
      persist();
      return send(res, 200, { ok: true });
    }

    if (req.method === "POST" && route === "/api/email") {
      if (!isAdmin(req, url)) return fail(res, 403, "That needs the admin link");
      const body = await readBody(req);
      const text = String(body.text || "").slice(0, 100000);
      if (!text.trim()) return fail(res, 400, "Nothing to send");
      try {
        const to = await mail(text);
        console.log(`[emailed] ${to}`);
        return send(res, 200, { ok: true, to });
      } catch (e) {
        console.error("[email failed]", e.message);
        return fail(res, 502, e.message);
      }
    }

    return fail(res, 404, "No such route");
  } catch (e) {
    return fail(res, 400, e.message || "Bad request");
  }
});

server.listen(PORT, () => {
  console.log(`Order paper on http://localhost:${PORT}`);
  console.log(`Orders in ${DATA_FILE}`);
  console.log(ADMIN_TOKEN
    ? `Clerk's table at http://localhost:${PORT}/?admin=${ADMIN_TOKEN}`
    : "No ADMIN_TOKEN set — anyone with the link can edit the menu and send the email.");
  console.log(`Email goes to ${EMAIL_TO.join(", ")}${process.env.SMTP_URL ? "" : " (set SMTP_URL to enable)"}`);
});
