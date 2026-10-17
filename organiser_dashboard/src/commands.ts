import { MatrixEvent } from "../types";
import { commandArgs } from "./classify";
import { forgetRoom, getActivity, getRoom, isOptedOut, optIn, optOut } from "./duckdb";
import { dashboardLink } from "./hub";
import { computeDashboard } from "./metrics";

export const FORGET_EMOJI = "🗑️";

type Reply = string | { message: string; context?: object; recipient?: string };

export const whatIsTracked =
    "📊 The Engagement tool keeps a record of *when* people post, react, reply and join or leave this group, so organisers can see how participation changes over time.\n\n" +
    "It does NOT store what anyone writes, read receipts, or anything from private chats. Organisers will use it to ask better questions and check in with people, not to rate anyone.\n\n" +
    "Commands:\n" +
    "• !engagement me: get a private message with what's held about you\n" +
    "• !engagement optout: stop tracking you here and delete what's held\n" +
    "• !engagement optin: start tracking you again\n" +
    "• !engagement forget: delete everything held for this group";

function dashboardLine(roomId: string) {
    const link = dashboardLink(roomId);
    return link ? `\n\nEveryone in the group can see the same dashboard: ${link}` : "";
}

function day(ts: number | null) {
    return ts ? new Date(ts).toISOString().slice(0, 10) : "never";
}

async function describeMe(event: MatrixEvent): Promise<Reply> {
    if (await isOptedOut(event.room_id, event.sender)) {
        return {
            recipient: event.sender,
            message: "You've opted out of the Engagement tool in that group, so nothing is held about you there. Send !engagement optin in the group if you change your mind.",
        };
    }

    const dashboard = computeDashboard(await getActivity(event.room_id), await getRoom(event.room_id), 0);
    const me = dashboard.participants.find(p => p.id === event.sender);

    const summary = me
        ? `Since ${day(dashboard.coverage.from)} it has counted ${me.messages} messages (${me.replies} of them replies), ${me.reactions} reactions, and ${me.responsesReceived} replies or reactions from others to your messages. You were last active on ${day(me.lastActive)}.`
        : "It hasn't recorded any activity from you yet.";

    return {
        recipient: event.sender,
        message: `Here's what the Engagement tool holds about you in that group. ${summary}\n\nIt never stores what you write. Send !engagement optout in the group to delete this and stop tracking.`,
    };
}

export async function handleCommand(event: MatrixEvent): Promise<Reply> {
    const args = commandArgs(event);
    const roomId = event.room_id;

    if (args === "me")
        return await describeMe(event);

    if (args === "optout" || args === "opt out") {
        await optOut(roomId, event.sender);
        return `Done, ${event.displayname ?? "you"} won't be tracked by the Engagement tool here, and what was held has been deleted.`;
    }

    if (args === "optin" || args === "opt in") {
        await optIn(roomId, event.sender);
        return `Thanks, ${event.displayname ?? "you"} will be included from now on.`;
    }

    if (args === "forget") {
        return {
            message: `React to this message with ${FORGET_EMOJI} to delete everything the Engagement tool holds for this group. Tracking starts afresh afterwards unless the tool is also removed (⚙️, then 🙏).`,
            context: { engagementConfirm: "forget" },
        };
    }

    return whatIsTracked + dashboardLine(roomId);
}

export async function handleConfirmation(event: MatrixEvent): Promise<Reply | undefined> {
    const confirming = event.prevEvent?.content?.context?.engagementConfirm;
    const emoji = event.content?.["m.relates_to"]?.key ?? "";

    if (confirming === "forget" && emoji.includes(FORGET_EMOJI.replace("️", ""))) {
        await forgetRoom(event.room_id);
        return "Everything the Engagement tool held for this group has been deleted.";
    }

    return undefined;
}

export function firstContactNotice(roomId: string) {
    return whatIsTracked + dashboardLine(roomId);
}
