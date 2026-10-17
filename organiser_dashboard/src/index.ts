import "dotenv/config";
import express from "express";
import * as fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { MatrixEvent } from "../types";
import { forgetCachedPowerLevels, organiserFor } from "./access";
import { classify, isCommand } from "./classify";
import { firstContactNotice, handleCommand, handleConfirmation, Reply } from "./commands";
import { deleteActivityEvent, getActivity, getOptOutCount, getRoom, getThemes, insertActivity, insertRoom, isOptedOut, savePowerLevels, startDuckDB, themesAllowed } from "./duckdb";
import { canImportHistory, TOOL_ID } from "./hub";
import { importHistory } from "./history";
import { computeDashboard } from "./metrics";
import { canFindThemes, findThemes } from "./themes";

const { engagement_secret, tool_url } = process.env;

const port = Number(process.env.PORT ?? 5065);

// the hub tells us its Matrix user with every event; remembered so history
// imports can leave out the bot's own messages
let botUserId: string | undefined = process.env.bot_user_id;

const moduleRegistration = {
  id: TOOL_ID,
  uuid: uuidv4(),
  url: tool_url || `http://localhost:${port}`,
  emoji: "📊",
  introduction: "This records when people post, react, reply and join, but never what they write, so organisers can see how participation changes over time. Organisers can also ask for a month's main themes, summarised by Claude without names. Send !engagement to see exactly what's tracked, get your own data, or opt out.",
  title: "Engagement",
  description: "Shows organisers how participation changes over time, with questions to discuss with the group",
  secret: engagement_secret,
  event_types: [
    "m.room.message", "m.reaction", "m.room.member", "m.room.redaction", "m.room.power_levels"
  ]
}

function generateRegistrationFile() {
  fs.writeFileSync(`./${moduleRegistration.id}.json`, JSON.stringify(moduleRegistration, null, 2));
}

async function handleEvent(event: MatrixEvent): Promise<Reply | Reply[] | undefined> {
  // admins can change at any time; remembered for hubs that can't be asked directly
  if (event.type === "m.room.power_levels") {
    await savePowerLevels(event.room_id, event.content);
    forgetCachedPowerLevels(event.room_id);
    return;
  }

  if (event.type === "m.room.redaction") {
    const redacts = event.redacts ?? event.content?.redacts;
    if (redacts) await deleteActivityEvent(event.room_id, redacts);
    return;
  }

  if (isCommand(event))
    return await handleCommand(event);

  if (event.type === "m.reaction" && event.prevEvent?.sender === botUserId)
    return await handleConfirmation(event);

  const activity = classify(event, botUserId, "live");
  if (activity && !await isOptedOut(event.room_id, activity.sender))
    await insertActivity(activity);
}

async function start() {
  const app = express();
  app.use(express.json());
  await startDuckDB();

  app.get("/", async (req, res) => {
    const htmlPath = path.resolve(__dirname, "../../web/dist/index.html")

    res.sendFile(htmlPath);
  })

  app.post("/", async (req, res) => {
    const { event } = req.body;
    botUserId = req.body.botUserId ?? botUserId;

    const isNewRoom = !await getRoom(event.room_id);
    if (isNewRoom)
      await insertRoom(event.room_id, Date.now());

    const reply = await handleEvent(event);

    // the first time the tool hears from a group, it says what it records
    const replies = (Array.isArray(reply) ? reply : reply ? [reply] : []).map(r => typeof r === "string" ? { message: r } : r);
    const response = isNewRoom && !isCommand(event)
      ? [{ message: firstContactNotice() }, ...replies]
      : Array.isArray(reply) ? replies : reply;

    res.send({ success: true, response });
  });

  // everything under /api is for the group's admins only: the key in their
  // personal link must match the group, and its owner must still be an admin
  app.use("/api", async (req, res, next) => {
    const roomId = String(req.query.roomId ?? "");
    const key = req.get("x-engagement-key") ?? undefined;

    if (!await organiserFor(roomId, key))
      return res.status(401).send({ success: false, message: "This link isn't valid any more. Group admins can get a new one by sending !engagement dashboard in the group." });

    next();
  });

  app.get("/api/dashboard", async (req, res) => {
    const { roomId } = req.query;

    const activity = await getActivity(roomId as string);
    const room = await getRoom(roomId as string);
    const optedOut = await getOptOutCount(roomId as string);

    res.send({ ...computeDashboard(activity, room, optedOut), canImportHistory: canImportHistory() });
  })

  app.post("/api/import", async (req, res) => {
    const { roomId } = req.query;
    const days = Math.min(365, Math.max(1, Number(req.body.days) || 30));

    if (!canImportHistory())
      return res.send({ success: false, message: "Set hub_url and engagement_secret to import history" });

    try {
      const result = await importHistory(roomId as string, days, botUserId);
      res.send({ success: true, ...result });
    } catch (err) {
      console.error("history import failed", err);
      res.send({ success: false, message: String(err) });
    }
  })

  app.get("/api/themes", async (req, res) => {
    const { roomId } = req.query;

    res.send({
      months: await getThemes(roomId as string),
      canFindThemes: canFindThemes(),
      allowed: await themesAllowed(roomId as string),
    });
  })

  app.post("/api/themes", async (req, res) => {
    const { roomId } = req.query;

    if (!canFindThemes())
      return res.send({ success: false, message: "Set ANTHROPIC_API_KEY, hub_url and engagement_secret to find themes" });

    try {
      const result = await findThemes(roomId as string, String(req.body.month), botUserId);
      res.send({ success: true, ...result });
    } catch (err) {
      console.error("finding themes failed", err);
      res.send({ success: false, message: err instanceof Error ? err.message : String(err) });
    }
  })

  app.listen(port);
};

generateRegistrationFile();
start();
