const { origin, pathname } = window.location;
const BASE_URL = `${origin}${pathname}`.replace(/\/$/, "");

export async function getDashboard(roomId: string) {
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard?roomId=${encodeURIComponent(roomId)}`);
    return await dashboardResponse.json();
}

export async function importHistory(roomId: string, days: number) {
    const importResponse = await fetch(`${BASE_URL}/api/import?roomId=${encodeURIComponent(roomId)}`, {
        method: "POST",
        body: JSON.stringify({ days }),
        headers: {
            "Content-type": "application/json"
        }
    });
    return await importResponse.json();
}
