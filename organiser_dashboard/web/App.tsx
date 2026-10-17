import "./App.css";
import { useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import type { Dashboard, ParticipantSummary, Pattern, WeekSummary } from "../src/metrics";
import { getDashboard, importHistory } from "./requests";

type DashboardResult = Dashboard & { canImportHistory: boolean };

type Tip = { x: number; y: number; text: string } | null;

const patternInfo: { [pattern in Pattern]: { label: string; detail: string } } = {
  "new": { label: "Joined recently", detail: "Joined the group in the last two weeks." },
  "quieter": { label: "Quieter lately", detail: "Posted or reacted in at least two earlier weeks, but not in the last two weeks." },
  "not-seen": { label: "No visible activity", detail: "Hasn't posted or reacted while tracked. They may well be reading, which this tool can't see." },
  "mostly-reacts": { label: "Mostly reacts", detail: "Reacts at least twice as often as they post." },
  "starts-conversations": { label: "Starts conversations", detail: "Often the first to post after three or more quiet hours." },
  "draws-responses": { label: "Draws responses", detail: "Their messages get at least 1.5× the group's average replies and reactions." },
};

const notCaptured = [
  "Reading. Someone who reads every message but never posts looks the same as someone who has muted the group.",
  "What people write. Message text is never stored, only whether it had a link or question mark and roughly how long it was.",
  "Anything outside this chat, like meetings, DMs, other groups, or doing the actual work.",
  "Anything before the tool was switched on, unless an organiser imported earlier history.",
  "People who opted out. They're left out of every number here.",
];

const participantQuestions = [
  "What makes it easy or hard for you to post in this group?",
  "Is there a time of day or kind of message that works best for you?",
  "Would you rather take part in a different way, like reactions, polls, or one-to-one?",
  "How did it feel when you first joined? Did you know what the group was for?",
  "Is the group the right size and pace for you?",
];

function day(ts: number | null) {
  return ts ? new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "–";
}

function daysAgo(ts: number | null) {
  if (!ts) return "never";
  const days = Math.floor((Date.now() - ts) / 86400000);
  return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

function heatStep(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

function readStoredBoolean(key: string, fallback: boolean) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

function WeeklyChart({ weeks, onTip }: { weeks: WeekSummary[]; onTip: (tip: Tip) => void }) {
  const height = 160;
  const barWidth = 28;
  const gap = 10;
  const width = Math.max(weeks.length * (barWidth + gap), 200);
  const max = Math.max(1, ...weeks.map(w => w.messages + w.reactions));
  const scale = (n: number) => (n / max) * (height - 8);
  const labelEvery = Math.ceil(weeks.length / 8);

  return (
    <div className="chart-scroll">
      <svg viewBox={`0 0 ${width} ${height + 22}`} style={{ width: "100%", maxWidth: width, height: "auto" }} role="img" aria-label="Messages and reactions per week">
        <line x1={0} x2={width} y1={height} y2={height} className="axis" />
        {weeks.map((week, i) => {
          const x = i * (barWidth + gap) + gap / 2;
          const messageHeight = scale(week.messages);
          const reactionHeight = scale(week.reactions);
          const tip = `Week of ${day(week.weekStart)}: ${week.messages} messages, ${week.reactions} reactions, ${week.activeParticipants} people active${week.newParticipants ? `, ${week.newParticipants} joined` : ""}`;
          return (
            <g key={week.weekStart}
              onMouseMove={e => onTip({ x: e.clientX, y: e.clientY, text: tip })}
              onMouseLeave={() => onTip(null)}>
              <rect x={x - gap / 2} y={0} width={barWidth + gap} height={height} className="hit" />
              {week.messages > 0 && <rect x={x} y={height - messageHeight} width={barWidth} height={messageHeight} rx={3} className="series-1" />}
              {week.reactions > 0 && <rect x={x} y={height - messageHeight - reactionHeight} width={barWidth} height={Math.max(0, reactionHeight - 2)} rx={3} className="series-2" />}
              {i % labelEvery === 0 && <text x={x + barWidth / 2} y={height + 15} className="tick">{day(week.weekStart)}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Participants({ participants, weeks, hideNames, onTip }: { participants: ParticipantSummary[]; weeks: WeekSummary[]; hideNames: boolean; onTip: (tip: Tip) => void }) {
  const [sortKey, setSortKey] = useState<keyof ParticipantSummary>("messages");

  // anonymous labels follow join order, so they don't change when sorting
  const labels = useMemo(() => {
    const byFirstSeen = [...participants].sort((a, b) => a.firstSeen - b.firstSeen);
    return new Map(byFirstSeen.map((p, i) => [p.id, `Participant ${i + 1}`]));
  }, [participants]);

  const sorted = [...participants].sort((a, b) => {
    if (sortKey === "name") return (hideNames ? labels.get(a.id)! : a.name).localeCompare(hideNames ? labels.get(b.id)! : b.name);
    return (Number(b[sortKey]) || 0) - (Number(a[sortKey]) || 0);
  });

  const columns: [keyof ParticipantSummary, string][] = [
    ["messages", "Posts"],
    ["replies", "Replies"],
    ["reactions", "Reactions"],
    ["conversationsStarted", "Started"],
    ["responsesReceived", "Responses got"],
    ["lastActive", "Last active"],
  ];

  return (
    <div className="table-scroll">
      <table className="people">
        <thead>
          <tr>
            <th><button className="sort" onClick={() => setSortKey("name")}>Person</button></th>
            <th>Weekly activity</th>
            {columns.map(([key, label]) => (
              <th key={key} className="num">
                <button className={`sort ${sortKey === key ? "active" : ""}`} onClick={() => setSortKey(key)}>{label}</button>
              </th>
            ))}
            <th>Patterns</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(person => (
            <tr key={person.id}>
              <td className="name">{hideNames ? labels.get(person.id) : person.name}</td>
              <td>
                <div className="heat" style={{ gridTemplateColumns: `repeat(${person.weekly.length}, 12px)` }}>
                  {person.weekly.map((count, i) => (
                    <span key={i} className={`cell step-${heatStep(count)}`}
                      onMouseMove={e => onTip({ x: e.clientX, y: e.clientY, text: `Week of ${day(weeks[i]?.weekStart)}: ${count} posts and reactions` })}
                      onMouseLeave={() => onTip(null)} />
                  ))}
                </div>
              </td>
              <td className="num">{person.messages}</td>
              <td className="num">{person.replies}</td>
              <td className="num">{person.reactions}</td>
              <td className="num">{person.conversationsStarted}</td>
              <td className="num">{person.responsesReceived}</td>
              <td className="num">{daysAgo(person.lastActive)}</td>
              <td className="patterns">
                {person.patterns.map(pattern => (
                  <span key={pattern} className="chip" title={patternInfo[pattern].detail}>{patternInfo[pattern].label}</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [dashboard, setDashboard] = useState<DashboardResult | null>(null);
  const [error, setError] = useState("");
  const [hideNames, setHideNames] = useState(() => readStoredBoolean("engagement.hideNames", false));
  const [importDays, setImportDays] = useState(30);
  const [importStatus, setImportStatus] = useState("");
  const [tip, setTip] = useState<Tip>(null);

  async function loadDashboard(roomId: string) {
    try {
      setDashboard(await getDashboard(roomId));
    } catch {
      setError("Couldn't load the dashboard. Is the Engagement tool running?");
    }
  }

  useEffect(() => {
    if (roomId) {
      loadDashboard(roomId);
    }
  }, []);

  function toggleNames() {
    setHideNames(!hideNames);
    try {
      localStorage.setItem("engagement.hideNames", String(!hideNames));
    } catch { }
  }

  async function runImport() {
    if (!roomId) return;
    if (!confirm(`Import the last ${importDays} days of this group's activity? The tool will post a message in the group to say so.`)) return;

    setImportStatus("Importing…");
    const result = await importHistory(roomId, importDays);
    setImportStatus(result.success
      ? `Imported ${result.imported} events.${result.announced ? " The group has been told." : ` Couldn't post the announcement (${result.announcementError}), so please let the group know yourself.`}`
      : `Import failed: ${result.message}`);
    loadDashboard(roomId);
  }

  if (!roomId)
    return <main><h1>Engagement</h1><p>Open this page from the link the tool posts in your group (send <code>!engagement</code>).</p></main>;

  if (error)
    return <main><h1>Engagement</h1><p>{error}</p></main>;

  if (!dashboard)
    return <main><h1>Engagement</h1><p>Loading…</p></main>;

  const { coverage, weeks, participants, concentration, responsesByType, discussion } = dashboard;
  const maxResponses = Math.max(0.1, ...responsesByType.map(r => r.averageResponses));
  const coverageDays = Math.max(1, Math.round((coverage.to - coverage.from) / 86400000));

  return (
    <main>
      <header>
        <h1>📊 Engagement</h1>
        <p className="lede">
          How participation in this group has changed over time. It's a starting point for conversations with the group, not a judgement of anyone.
          Everyone in the group can see this page, and anyone can opt out with <code>!engagement optout</code>.
        </p>
        <label className="toggle">
          <input type="checkbox" checked={hideNames} onChange={toggleNames} /> Hide names (for screen sharing)
        </label>
      </header>

      <section>
        <h2>What this covers</h2>
        <div className="tiles">
          <div className="tile"><span className="value">{coverageDays}</span><span className="label">days, from {day(coverage.from)}</span></div>
          <div className="tile"><span className="value">{coverage.participants}</span><span className="label">people seen</span></div>
          <div className="tile"><span className="value">{coverage.liveEvents + coverage.importedEvents}</span><span className="label">posts, reactions and joins{coverage.importedEvents ? ` (${coverage.importedEvents} imported)` : ""}</span></div>
          <div className="tile"><span className="value">{coverage.optedOut}</span><span className="label">opted out</span></div>
        </div>
        <p className="note">
          Recording since {day(coverage.trackingSince)}{coverage.importedFrom ? `, with earlier history imported back to ${day(coverage.importedFrom)}` : ""}.
          Members who joined before then only appear once they post or react.
        </p>
        <details>
          <summary>What this can't see</summary>
          <ul>{notCaptured.map(item => <li key={item}>{item}</li>)}</ul>
        </details>
        {dashboard.canImportHistory && (
          <details>
            <summary>Import earlier history</summary>
            <p className="note">
              This adds messages sent before the tool was switched on. People weren't told about tracking when they sent them, so the tool posts a notice in the group when you import.
            </p>
            <div className="import">
              <label>Last <input type="number" min={1} max={365} value={importDays} onChange={e => setImportDays(Number(e.target.value))} /> days</label>
              <button onClick={runImport}>Import</button>
            </div>
            {importStatus && <p className="note">{importStatus}</p>}
          </details>
        )}
      </section>

      <section>
        <h2>Activity per week</h2>
        <div className="legend">
          <span><i className="swatch series-1" /> Posts</span>
          <span><i className="swatch series-2" /> Reactions</span>
        </div>
        <WeeklyChart weeks={weeks} onTip={setTip} />
        <details>
          <summary>As a table</summary>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Week of</th><th className="num">Posts</th><th className="num">Reactions</th><th className="num">People active</th><th className="num">Joined</th></tr></thead>
              <tbody>
                {weeks.map(w => (
                  <tr key={w.weekStart}><td>{day(w.weekStart)}</td><td className="num">{w.messages}</td><td className="num">{w.reactions}</td><td className="num">{w.activeParticipants}</td><td className="num">{w.newParticipants}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section>
        <h2>People</h2>
        <p className="note">
          Patterns describe what's visible in the chat and nothing more. Hover over one to see the rule behind it.
          {concentration.posters >= 2 && ` ${concentration.peopleForHalf} of ${concentration.posters} people who posted wrote half of all posts.`}
        </p>
        {participants.length
          ? <Participants participants={participants} weeks={weeks} hideNames={hideNames} onTip={setTip} />
          : <p>No activity recorded yet.</p>}
        <div className="legend heat-legend">
          <span>Fewer</span>
          {[1, 2, 3, 4].map(step => <i key={step} className={`cell step-${step}`} />)}
          <span>More posts and reactions per week</span>
        </div>
      </section>

      <section>
        <h2>What gets a response</h2>
        <p className="note">
          The average number of replies and reactions from other people, by kind of message. Who sends a message and when matters too, so read these as hints.
        </p>
        {responsesByType.length ? (
          <div className="bars">
            {responsesByType.map(r => (
              <div className="bar-row" key={r.type}
                onMouseMove={e => setTip({ x: e.clientX, y: e.clientY, text: `${r.type}: ${r.messages} messages, ${Math.round(r.shareWithResponse * 100)}% got at least one response` })}
                onMouseLeave={() => setTip(null)}>
                <span className="bar-label">{r.type}</span>
                <span className="bar-track"><span className="bar series-1" style={{ width: `${(r.averageResponses / maxResponses) * 100}%` }} /></span>
                <span className="bar-value">{r.averageResponses.toFixed(1)} <small>({r.messages} msgs)</small></span>
              </div>
            ))}
          </div>
        ) : <p>No messages recorded yet.</p>}
      </section>

      <section>
        <h2>Questions to discuss</h2>
        {discussion.length ? (
          <ul className="discussion">
            {discussion.map(point => (
              <li key={point.question}>
                <p className="observed"><strong>Observed:</strong> {point.observation}</p>
                <p><strong>Ask:</strong> {point.question}</p>
              </li>
            ))}
          </ul>
        ) : <p className="note">Nothing stands out yet. Come back once there's a few weeks of activity.</p>}
        <h3>Questions to ask participants</h3>
        <ul>{participantQuestions.map(q => <li key={q}>{q}</li>)}</ul>
      </section>

      {tip && <div className="tooltip" style={{ left: tip.x + 12, top: tip.y + 12 }}>{tip.text}</div>}
    </main>
  );
}
