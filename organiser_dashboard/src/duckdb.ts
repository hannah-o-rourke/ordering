import { DuckDBConnection, DuckDBInstance, DuckDBValue } from "@duckdb/node-api";
import path from "node:path";
import { Activity, RoomSettings } from "../types";

let connection: DuckDBConnection;
let instance: DuckDBInstance;

async function rows(sql: string, values: DuckDBValue[] = []) {
    const reader = await connection.runAndReadAll(sql, values);
    return reader.getRowObjectsJS();
}

export async function startDuckDB(fileName = "engagement_duckdb.db") {
    const dataDir = process.env.DUCKDB_DATA_DIR ?? path.resolve(__dirname, "../..");
    const dbPath = fileName === ":memory:" ? fileName : path.join(dataDir, fileName);

    instance = await DuckDBInstance.create(dbPath);
    connection = await instance.connect();

    // timestamps are DOUBLE rather than BIGINT so they come back as plain JS numbers.
    // They're bound as strings and cast, because a bound JS number is taken as a
    // 32-bit INTEGER and millisecond timestamps overflow it.
    await connection.run(`CREATE TABLE IF NOT EXISTS Activity (
        event_id VARCHAR,
        room_id VARCHAR,
        sender VARCHAR,
        display_name VARCHAR,
        ts DOUBLE,
        kind VARCHAR,
        format VARCHAR,
        target_event_id VARCHAR,
        target_sender VARCHAR,
        has_link BOOLEAN,
        has_question BOOLEAN,
        length_bucket VARCHAR,
        source VARCHAR,
        PRIMARY KEY (room_id, event_id)
    );`);
    await connection.run(`CREATE TABLE IF NOT EXISTS Rooms (
        room_id VARCHAR PRIMARY KEY,
        tracking_since DOUBLE,
        imported_from DOUBLE
    );`);
    await connection.run(`CREATE TABLE IF NOT EXISTS OptOuts (
        room_id VARCHAR,
        sender VARCHAR,
        PRIMARY KEY (room_id, sender)
    );`);
}

export async function insertActivity(activity: Activity) {
    await connection.run(
        `INSERT OR IGNORE INTO Activity VALUES ($1, $2, $3, $4, $5::DOUBLE, $6, $7, $8, $9, $10, $11, $12, $13);`,
        [
            activity.event_id, activity.room_id, activity.sender, activity.display_name, String(activity.ts),
            activity.kind, activity.format, activity.target_event_id, activity.target_sender,
            activity.has_link, activity.has_question, activity.length_bucket, activity.source,
        ]
    );
}

export async function getActivity(roomId: string) {
    return await rows(`SELECT * FROM Activity WHERE room_id = $1 ORDER BY ts;`, [roomId]) as Activity[];
}

export async function deleteActivityEvent(roomId: string, eventId: string) {
    await connection.run(`DELETE FROM Activity WHERE room_id = $1 AND event_id = $2;`, [roomId, eventId]);
}

export async function getRoom(roomId: string) {
    const [room] = await rows(`SELECT * FROM Rooms WHERE room_id = $1;`, [roomId]);
    return room as RoomSettings | undefined;
}

export async function insertRoom(roomId: string, trackingSince: number) {
    await connection.run(`INSERT OR IGNORE INTO Rooms VALUES ($1, $2::DOUBLE, NULL);`, [roomId, String(trackingSince)]);
}

export async function setImportedFrom(roomId: string, importedFrom: number) {
    await connection.run(`UPDATE Rooms SET imported_from = $2::DOUBLE WHERE room_id = $1;`, [roomId, String(importedFrom)]);
}

export async function isOptedOut(roomId: string, sender: string) {
    const found = await rows(`SELECT 1 FROM OptOuts WHERE room_id = $1 AND sender = $2;`, [roomId, sender]);
    return found.length > 0;
}

export async function getOptOutCount(roomId: string) {
    const [{ count }] = await rows(`SELECT COUNT(*)::INTEGER AS count FROM OptOuts WHERE room_id = $1;`, [roomId]);
    return count as number;
}

// Opting out removes everything already held about that person in this group,
// including their name on other people's replies and reactions to them.
export async function optOut(roomId: string, sender: string) {
    await connection.run(`INSERT OR IGNORE INTO OptOuts VALUES ($1, $2);`, [roomId, sender]);
    await connection.run(`DELETE FROM Activity WHERE room_id = $1 AND sender = $2;`, [roomId, sender]);
    await connection.run(`UPDATE Activity SET target_sender = NULL WHERE room_id = $1 AND target_sender = $2;`, [roomId, sender]);
}

export async function optIn(roomId: string, sender: string) {
    await connection.run(`DELETE FROM OptOuts WHERE room_id = $1 AND sender = $2;`, [roomId, sender]);
}

export async function forgetRoom(roomId: string) {
    await connection.run(`DELETE FROM Activity WHERE room_id = $1;`, [roomId]);
    await connection.run(`DELETE FROM Rooms WHERE room_id = $1;`, [roomId]);
}
