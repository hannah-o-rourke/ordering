/**
 * Newspeak House Order Paper — Google Apps Script backend.
 *
 * Stores orders in a Google Sheet and emails the list to Ed and Hannah.
 * Pairs with index.html hosted on GitHub Pages.
 *
 * SETUP
 *  1. Go to https://script.google.com and start a new project.
 *  2. Delete whatever is in Code.gs and paste this file in.
 *  3. Run the function `setup` once (Run ▸ setup). Google will ask you to
 *     authorise it — that is it asking permission to make a spreadsheet and
 *     send mail as you. Accept.
 *  4. Deploy ▸ New deployment ▸ Web app.
 *       Execute as:        Me
 *       Who has access:    Anyone
 *     Press Deploy and copy the URL ending in /exec.
 *  5. Send that /exec URL back and it gets wired into the page.
 *
 * The admin token guards the menu editor and the email button. Run `setup`
 * and it prints one in the log; put it after ?admin= on your own link.
 */

var DEFAULT_CAP = 0; // 0 means no limit; set one in the clerk's table
var EMAIL_TO = 'ed@newspeak.house,hannah@campaignlab.uk';
var SHEET_NAME = 'Orders';
var CONFIG_SHEET = 'Config';
var HEADERS = ['id', 'name', 'updated', 'faculty dinner', 'welcome dinner', 'total', 'json'];

/* ------------------------------------------------------------ setup ------ */

/** Run this once by hand. Creates the spreadsheet and an admin token. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('ADMIN_TOKEN');
  if (!token) {
    token = Utilities.getUuid().slice(0, 8);
    props.setProperty('ADMIN_TOKEN', token);
  }
  var ss = openBook_();
  Logger.log('Spreadsheet: ' + ss.getUrl());
  Logger.log('Admin token: ' + token);
  Logger.log('Your admin link will be:  <your pages url>/?admin=' + token);
  Logger.log('Order list will be emailed to: ' + EMAIL_TO);
  Logger.log('Places: ' + (cap_() ? cap_() : 'no limit') + ' (set one in the clerk\'s table)');
  return { sheet: ss.getUrl(), token: token };
}

function openBook_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('Newspeak House — Bangkok Bites orders');
    props.setProperty('SHEET_ID', ss.getId());
  }
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(4, 280);
    sheet.setColumnWidth(5, 280);
    sheet.hideColumns(7); // the json column is machinery, not for reading
  }
  if (!ss.getSheetByName(CONFIG_SHEET)) ss.insertSheet(CONFIG_SHEET).hideSheet();
  var first = ss.getSheetByName('Sheet1');
  if (first && first.getSheetId() !== sheet.getSheetId() && first.getLastRow() === 0) {
    ss.deleteSheet(first);
  }
  return ss;
}

var sheet_ = function () { return openBook_().getSheetByName(SHEET_NAME); };
var configSheet_ = function () { return openBook_().getSheetByName(CONFIG_SHEET); };

/* ---------------------------------------------------------- plumbing ----- */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function fail_(msg) { return json_({ error: msg }); }

function isAdmin_(token) {
  var want = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  return !want || String(token || '') === want;
}

function slug_(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

/** Accept only the shape the page sends; never trust the client's arithmetic. */
function cleanOrder_(input) {
  if (!input || typeof input !== 'object') throw new Error('Malformed order');
  var name = String(input.name || '').trim().slice(0, 60);
  if (!name) throw new Error('An order needs a name');
  var nights = {}, keys = Object.keys(input.nights || {}).slice(0, 2);
  for (var i = 0; i < keys.length; i++) {
    var slot = input.nights[keys[i]] || {};
    var raw = Object.prototype.toString.call(slot.items) === '[object Array]' ? slot.items : [];
    var items = raw.slice(0, 60).map(function (it) {
      var price = (it.price === null || it.price === undefined || isNaN(Number(it.price)))
        ? null : Number(it.price);
      return {
        key: String(it.key || '').slice(0, 120),
        course: String(it.course || '').slice(0, 40),
        name: String(it.name || '').slice(0, 80),
        price: price,
        qty: Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1))
      };
    });
    nights[String(keys[i]).slice(0, 12)] = { items: items, notes: String(slot.notes || '').slice(0, 400) };
  }
  if (!Object.keys(nights).length) throw new Error('An order needs at least one sitting');
  return { name: name, nights: nights, updatedAt: new Date().toISOString() };
}

/* ------------------------------------------------------------- store ----- */

function readOrders_() {
  var sh = sheet_(), last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues(), out = [];
  for (var i = 0; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    try {
      var o = JSON.parse(rows[i][6]);
      o.id = String(rows[i][0]);
      out.push(o);
    } catch (e) { /* a row someone edited by hand — skip it rather than fall over */ }
  }
  out.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  return out;
}

function findRow_(id) {
  var sh = sheet_(), last = sh.getLastRow();
  if (last < 2) return 0;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return i + 2;
  return 0;
}

/** Human-readable summary of one sitting, for the spreadsheet columns. */
function describe_(slot) {
  if (!slot || !slot.items || !slot.items.length) return '';
  var line = slot.items.map(function (i) { return i.qty + ' × ' + i.name; }).join(', ');
  return slot.notes ? line + '  (' + slot.notes + ')' : line;
}
function total_(order) {
  var t = 0;
  for (var k in order.nights) {
    (order.nights[k].items || []).forEach(function (i) { if (i.price != null) t += i.price * i.qty; });
  }
  return t;
}

function cap_() {
  var cfg = readConfig_();
  if (cfg && cfg.cap !== undefined && cfg.cap !== null && cfg.cap !== '') return Number(cfg.cap) || 0;
  return DEFAULT_CAP;
}

function writeOrder_(id, order) {
  var sh = sheet_(), row = findRow_(id), cap = cap_();
  if (!row && cap > 0 && readOrders_().length >= cap) throw new Error('Every place is taken');
  var values = [[
    id, order.name, order.updatedAt,
    describe_(order.nights.n1), describe_(order.nights.n2),
    total_(order), JSON.stringify(order)
  ]];
  if (row) sh.getRange(row, 1, 1, HEADERS.length).setValues(values);
  else sh.appendRow(values[0]);
}

function readConfig_() {
  var raw = configSheet_().getRange('A1').getValue();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function writeConfig_(cfg) {
  configSheet_().getRange('A1').setValue(JSON.stringify(cfg));
}

/* ------------------------------------------------------------ routes ----- */

function handle_(action, data) {
  if (action === 'state') {
    return json_({
      config: readConfig_(),
      orders: readOrders_(),
      cap: cap_(),
      admin: isAdmin_(data.token)
    });
  }

  if (action === 'order') {
    var cfg = readConfig_();
    if (cfg && cfg.closed) return fail_('The list is closed');
    var id = slug_(data.id || (data.order && data.order.name));
    if (!id) return fail_('That name needs at least one letter or number');
    var order;
    try { order = cleanOrder_(data.order); } catch (e) { return fail_(e.message); }
    writeOrder_(id, order);
    return json_({ ok: true, id: id });
  }

  if (action === 'delete') {
    var cfg2 = readConfig_();
    if (cfg2 && cfg2.closed) return fail_('The list is closed');
    var row = findRow_(slug_(data.id));
    if (!row) return fail_('No order under that name');
    sheet_().deleteRow(row);
    return json_({ ok: true });
  }

  if (action === 'config') {
    if (!isAdmin_(data.token)) return fail_('That needs the admin link');
    var c = data.config || {};
    writeConfig_({
      menu: Object.prototype.toString.call(c.menu) === '[object Array]'
        ? c.menu.slice(0, 200).map(function (r) {
            var p = (r[2] === null || r[2] === undefined || isNaN(Number(r[2]))) ? null : Number(r[2]);
            return [String(r[0] || '').slice(0, 40), String(r[1] || '').slice(0, 80), p];
          })
        : null,
      nights: Object.prototype.toString.call(c.nights) === '[object Array]'
        ? c.nights.slice(0, 2).map(function (n, i) {
            return {
              id: i === 0 ? 'n1' : 'n2',
              label: String(n.label || '').slice(0, 60),
              date: String(n.date || '').slice(0, 60)
            };
          })
        : null,
      closed: !!c.closed,
      cap: (c.cap === undefined || c.cap === null || c.cap === '') ? DEFAULT_CAP : Math.max(0, Number(c.cap) || 0)
    });
    return json_({ ok: true });
  }

  if (action === 'email') {
    if (!isAdmin_(data.token)) return fail_('That needs the admin link');
    var text = String(data.text || '').slice(0, 100000);
    if (!text.replace(/\s/g, '')) return fail_('Nothing to send');
    var n = readOrders_().length;
    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: 'Bangkok Bites order — Newspeak House (' + n + (n === 1 ? ' person)' : ' people)'),
      body: text + '\n\nOrders sheet: ' + openBook_().getUrl() + '\n'
    });
    return json_({ ok: true, to: EMAIL_TO });
  }

  return fail_('No such action');
}

/** Serialised so two people ordering at the same moment cannot clobber a row. */
function route_(action, data) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) { return fail_('Busy — try that again'); }
  try { return handle_(action, data); }
  catch (err) { return fail_(err.message || 'Something went wrong'); }
  finally { lock.releaseLock(); }
}

/**
 * Also accepts the POST body as a `payload` query parameter, so the page can
 * fall back to GET where a browser refuses the cross-origin POST.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var data = p;
  if (p.payload) {
    try { data = JSON.parse(p.payload); }
    catch (err) { return fail_('Bad payload'); }
  }
  return route_(data.action || p.action || 'state', data);
}

/**
 * The page posts text/plain on purpose: it keeps the request "simple" under
 * CORS, so the browser sends it straight through instead of firing a preflight
 * that Apps Script has no way to answer.
 */
function doPost(e) {
  var data = {};
  try { data = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return fail_('Bad JSON'); }
  return route_(data.action || 'state', data);
}
