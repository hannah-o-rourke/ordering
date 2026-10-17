import { MatrixEvent } from "../types";

const { hub_url, engagement_secret } = process.env;

export const TOOL_ID = "engagement";

export function dashboardLink(roomId: string) {
    return hub_url ? `${hub_url}/${TOOL_ID}/?roomId=${encodeURIComponent(roomId)}` : null;
}

export function canImportHistory() {
    return Boolean(hub_url && engagement_secret);
}

export async function fetchHistory(roomId: string, since: number) {
    const params = new URLSearchParams({ roomId, since: new Date(since).toISOString() });
    const response = await fetch(`${hub_url}/api/room/history?${params}`);
    if (!response.ok)
        throw new Error(`tool hub returned ${response.status} for room history`);

    const { events } = await response.json() as { events: MatrixEvent[] };
    return events;
}

// Only works while the tool is switched on in that room.
export async function sendToGroup(roomId: string, message: string) {
    const params = new URLSearchParams({ roomId, toolId: TOOL_ID, secret: engagement_secret ?? "" });
    const response = await fetch(`${hub_url}/api/send?${params}`, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: { "Content-type": "application/json" },
    });
    return await response.json() as { success: boolean; message?: string };
}
