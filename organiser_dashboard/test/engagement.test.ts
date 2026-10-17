import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "../src/classify";
import { computeDashboard, weekStart } from "../src/metrics";
import { Activity, MatrixEvent } from "../types";

const BOT = "@chathackers:matrix.campaignlab.uk";
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 17, 12);

function message(id: string, sender: string, ts: number, body: string, { content, ...extra }: any = {}): MatrixEvent {
    return {
        type: "m.room.message",
        event_id: id,
        sender,
        origin_server_ts: ts,
        room_id: "!room",
        displayname: sender.slice(1, 4),
        content: { body, msgtype: "m.text", ...content },
        ...extra,
    };
}

function row(event: MatrixEvent) {
    const activity = classify(event, BOT, "live");
    assert.ok(activity, `expected ${event.event_id} to be recorded`);
    return activity;
}

test("classify keeps flags but never the message text", () => {
    const activity = row(message("$1", "@ana:x", NOW, "Anyone free Thursday? details at https://example.org/secret-plan"));
    assert.equal(activity.has_question, true);
    assert.equal(activity.has_link, true);
    assert.equal(activity.length_bucket, "medium");
    assert.ok(!JSON.stringify(activity).includes("Thursday"));
    assert.ok(!JSON.stringify(activity).includes("secret-plan"));
});

test("classify ignores the bot, commands, edits and redacted messages", () => {
    assert.equal(classify(message("$1", BOT, NOW, "hello"), BOT, "live"), null);
    assert.equal(classify(message("$2", "@ana:x", NOW, "!engagement me"), BOT, "live"), null);
    assert.equal(classify(message("$3", "@ana:x", NOW, "* fixed", { content: { "m.relates_to": { rel_type: "m.replace", event_id: "$1" } } }), BOT, "live"), null);
    assert.equal(classify({ ...message("$4", "@ana:x", NOW, ""), content: {} }, BOT, "imported"), null);
});

test("classify ignores reactions to the bot's own messages", () => {
    const reaction: MatrixEvent = {
        type: "m.reaction", event_id: "$r", sender: "@ana:x", origin_server_ts: NOW, room_id: "!room",
        content: { "m.relates_to": { event_id: "$botmsg", key: "🗑️" } },
        prevEvent: { sender: BOT },
    };
    assert.equal(classify(reaction, BOT, "live"), null);
});

test("quoted text in a reply doesn't count towards the reply's flags", () => {
    const reply = row(message("$2", "@ben:x", NOW, "> <@ana:x> Anyone free Thursday?\n\nyes", {
        content: { "m.relates_to": { "m.in_reply_to": { event_id: "$1" } } },
        prevEvent: { sender: "@ana:x" },
    }));
    assert.equal(reply.has_question, false);
    assert.equal(reply.target_sender, "@ana:x");
});

test("membership changes record joins but not profile updates", () => {
    const join: MatrixEvent = {
        type: "m.room.member", event_id: "$j", sender: "@ana:x", state_key: "@ana:x", origin_server_ts: NOW, room_id: "!room",
        content: { membership: "join", displayname: "Ana" },
    };
    assert.equal(row(join).kind, "join");
    assert.equal(classify({ ...join, unsigned: { prev_content: { membership: "join" } } }, BOT, "live"), null);
});

function activity(partial: Partial<Activity> & Pick<Activity, "event_id" | "sender" | "ts" | "kind">): Activity {
    return {
        room_id: "!room", display_name: partial.sender.slice(1, 4), format: partial.kind === "message" ? "text" : null,
        target_event_id: null, target_sender: null, has_link: false, has_question: false,
        length_bucket: partial.kind === "message" ? "short" : null, source: "live", ...partial,
    };
}

test("someone active for weeks then silent shows as quieter, not as a conclusion", () => {
    const rows: Activity[] = [];
    for (let week = 6; week >= 3; week--) {
        rows.push(activity({ event_id: `$q${week}`, sender: "@quinn:x", ts: NOW - week * 7 * DAY, kind: "message" }));
    }
    rows.push(activity({ event_id: "$a", sender: "@ana:x", ts: NOW - DAY, kind: "message" }));

    const dashboard = computeDashboard(rows, { room_id: "!room", tracking_since: NOW - 50 * DAY, imported_from: null }, 0, NOW);
    const quinn = dashboard.participants.find(p => p.id === "@quinn:x")!;

    assert.ok(quinn.patterns.includes("quieter"));
    assert.ok(!dashboard.participants.find(p => p.id === "@ana:x")!.patterns.includes("quieter"));
    assert.ok(dashboard.discussion.some(d => d.question.includes("check-in")));
});

test("members with no visible activity are listed rather than dropped", () => {
    const rows = [
        activity({ event_id: "$j", sender: "@rae:x", ts: NOW - 3 * DAY, kind: "join" }),
        activity({ event_id: "$m", sender: "@ana:x", ts: NOW - DAY, kind: "message" }),
    ];
    const dashboard = computeDashboard(rows, { room_id: "!room", tracking_since: NOW - 20 * DAY, imported_from: null }, 0, NOW);
    const rae = dashboard.participants.find(p => p.id === "@rae:x")!;

    assert.deepEqual(rae.patterns, ["new", "not-seen"]);
    assert.ok(dashboard.discussion.some(d => d.observation.includes("Reading isn't visible")));
});

test("responses are credited to the author, resolving reply targets by event id", () => {
    const rows = [
        activity({ event_id: "$q", sender: "@ana:x", ts: NOW - 5 * DAY, kind: "message", has_question: true }),
        activity({ event_id: "$r1", sender: "@ben:x", ts: NOW - 5 * DAY + 1000, kind: "message", target_event_id: "$q" }),
        activity({ event_id: "$r2", sender: "@cat:x", ts: NOW - 5 * DAY + 2000, kind: "reaction", target_event_id: "$q" }),
        activity({ event_id: "$self", sender: "@ana:x", ts: NOW - 5 * DAY + 3000, kind: "reaction", target_event_id: "$q" }),
    ];
    const dashboard = computeDashboard(rows, undefined, 0, NOW);
    const ana = dashboard.participants.find(p => p.id === "@ana:x")!;

    assert.equal(ana.responsesReceived, 2);
    assert.equal(ana.conversationsStarted, 1);
    assert.equal(dashboard.responsesByType.find(r => r.type === "Question")!.averageResponses, 2);
});

test("people who left are not listed", () => {
    const rows = [
        activity({ event_id: "$m", sender: "@lee:x", ts: NOW - 5 * DAY, kind: "message" }),
        activity({ event_id: "$l", sender: "@lee:x", ts: NOW - 2 * DAY, kind: "leave" }),
    ];
    assert.equal(computeDashboard(rows, undefined, 0, NOW).participants.length, 0);
});

test("weeks start on Monday and cover the whole period", () => {
    assert.equal(new Date(weekStart(NOW)).getUTCDay(), 1);
    const rows = [activity({ event_id: "$m", sender: "@ana:x", ts: NOW - 20 * DAY, kind: "message" })];
    const dashboard = computeDashboard(rows, undefined, 0, NOW);
    assert.equal(dashboard.weeks.length, 4);
    assert.equal(dashboard.weeks.reduce((s, w) => s + w.messages, 0), 1);
});
