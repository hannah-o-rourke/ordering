import { MatrixEvent } from "../types";
import { commandArgs } from "./classify";
import { forgetRoom, getActivity, getRoom, isOptedOut, optIn, optOut, setThemesAllowed } from "./duckdb";
import { isAdmin, issueKey } from "./access";
import { dashboardLink } from "./hub";
import { computeDashboard } from "./metrics";

export const FORGET_EMOJI = "🗑️";

export type Reply = string | { message: string; context?: object; recipient?: string };

export const whatIsTracked =
    "📊 The Engagement tool keeps a record of *when* people post, react, reply and join or leave this group, so the group's admins can see how participation changes over time.\n\n" +
    "It does NOT store what anyone writes, read receipts, or anything from private chats. Only group admins can see the dashboard, and it's for asking better questions and checking in with people, not rating anyone. Anyone can see what's held about themselves.\n\n" +
    "An admin can also ask for a month's main themes. The tool then sends that month's messages, without names, to Anthropic's Claude for a summary, keeps only the summary, and posts here when it does.\n\n" +
    "Commands:\n" +
    "• !engagement me: get a private message with what's held about you\n" +
    "• !engagement optout: stop tracking you here and delete what's held\n" +
    "• !engagement optin: start tracking you again\n" +
    "• !engagement themes off / on: stop or allow theme summaries for this group\n" +
    "• !engagement forget: delete everything held for this group (admins)\n" +
    "• !engagement dashboard: admins get a private link to the dashboard";

const notAdmin = "Only this group's admins can open the Engagement dashboard. Send !engagement me to see what's held about you.";
const adminsUnknown = "The Engagement tool can't check who this group's admins are yet, so the dashboard is locked. Ask whoever runs the tool hub to apply its power-levels update.";

// Admins get a personal link by DM; the group is told one was sent, so it's
// visible who is looking at the dashboard.
async function sendDashboardLink(event: MatrixEvent): Promise<Reply[] | Reply> {
    const admin = await isAdmin(event.room_id, event.sender);
    if (admin === null) return adminsUnknown;
    if (!admin) return notAdmin;

    const link = dashboardLink(event.room_id, await issueKey(event.room_id, event.sender));
    if (!link) return "The dashboard link isn't set up on this server (hub_url is missing).";

    return [
        { message: `Sent ${event.displayname ?? "you"} a private link to the Engagement dashboard.` },
        { recipient: event.sender, message: `Here's your link to the Engagement dashboard for that group. It's personal, so please don't share it, and it stops working if you stop being an admin or ask for a new one:\n${link}` },
    ];
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

export async function handleCommand(event: MatrixEvent): Promise<Reply | Reply[]> {
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

    if (args === "themes off") {
        await setThemesAllowed(roomId, false);
        return "Theme summaries are now off for this group. No messages will be sent to Claude. (!engagement themes on to allow them again.)";
    }

    if (args === "themes on") {
        await setThemesAllowed(roomId, true);
        return "Theme summaries are allowed again. An organiser can ask for a month's main themes, and the tool will post here when they do.";
    }

    if (args === "dashboard" || args === "organiser" || args === "organizer")
        return await sendDashboardLink(event);

    if (args === "forget") {
        const admin = await isAdmin(roomId, event.sender);
        if (!admin) return admin === null ? adminsUnknown : "Only this group's admins can delete the group's data. Send !engagement optout to delete your own.";

        return {
            message: `React to this message with ${FORGET_EMOJI} to delete everything the Engagement tool holds for this group. Tracking starts afresh afterwards unless the tool is also removed (⚙️, then 🙏).`,
            context: { engagementConfirm: "forget" },
        };
    }

    return whatIsTracked;
}

export async function handleConfirmation(event: MatrixEvent): Promise<Reply | undefined> {
    const confirming = event.prevEvent?.content?.context?.engagementConfirm;
    const emoji = event.content?.["m.relates_to"]?.key ?? "";

    if (confirming === "forget" && emoji.includes(FORGET_EMOJI.replace("️", ""))) {
        if (!await isAdmin(event.room_id, event.sender))
            return "Only this group's admins can delete the group's data.";

        await forgetRoom(event.room_id);
        return "Everything the Engagement tool held for this group has been deleted.";
    }

    return undefined;
}

export function firstContactNotice() {
    return whatIsTracked;
}
