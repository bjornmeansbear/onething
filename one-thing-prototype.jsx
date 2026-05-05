import { useState, useEffect, useCallback } from "react";

const FONT = "'Geneva', 'Chicago', 'Charcoal', 'Lucida Grande', sans-serif";

const MANTRAS = [
  "Choosing isn't neglecting — it's sequencing.",
  "Doing one thing well moves everything forward more than agonizing over ten.",
];

function buildSortPrompt(tasks) {
  const list = tasks
    .map(
      (t, i) =>
        `${i + 1}. "${t.name}"${t.dueDate ? ` (due: ${t.dueDate})` : ""}${t.important ? " [important]" : ""}${t.urgent ? " [urgent]" : ""}${t.effort ? ` effort:${t.effort}` : ""}${t.impact ? ` impact:${t.impact}` : ""}`
    )
    .join("\n");

  return `You are a personal executive functioning coach. Sort these tasks into optimal order for TODAY using these criteria:

1. What breaks if I don't do this today?
2. Does this make other things easier?
3. Can I finish this in one sitting?
4. What's the best thing that happens if I DO this?

Tasks:
${list}

Return ONLY a JSON array: [{"index": 1, "reason": "short reason"}, ...] sorted highest priority first. No markdown, no extra text.`;
}

// ── Tiny components ──

function Btn({ children, black, onClick, disabled, style }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: FONT,
        fontSize: 12,
        padding: "6px 16px",
        cursor: disabled ? "default" : "pointer",
        border: "2px solid #000",
        background: black ? "#000" : "#e8e8e8",
        color: black ? "#fff" : "#000",
        fontWeight: black ? "bold" : "normal",
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
    />
  );
}

function Win({ title, children, footer }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "2px solid #000",
        boxShadow: "2px 2px 0px #000",
        margin: "16px auto",
        maxWidth: 520,
        width: "calc(100% - 32px)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(to bottom, #e8e8e8, #c0c0c0)",
          borderBottom: "2px solid #000",
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          userSelect: "none",
        }}
      >
        <div style={{ width: 12, height: 12, border: "1px solid #000", background: "#c0c0c0" }} />
        <div style={{ flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 12 }}>{title}</div>
        <div style={{ width: 12 }} />
      </div>
      <div style={{ padding: 16 }}>{children}</div>
      {footer && (
        <div
          style={{
            borderTop: "2px solid #000",
            background: "#e8e8e8",
            padding: "3px 8px",
            fontSize: 10,
            color: "#666",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// ── The card stack ──
function CardStack({ total, children }) {
  const behind = Math.min(total - 1, 8);
  const PX = 3;

  // Build array of background cards
  const bgCards = [];
  for (let i = behind; i >= 1; i--) {
    bgCards.push(
      <div
        key={i}
        style={{
          position: "absolute",
          top: i * PX,
          left: i * PX,
          right: -(i * PX),
          bottom: -(i * PX),
          border: "2px solid #000",
          background: i <= 2 ? "#f2f2f2" : "#e4e4e4",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "relative",
        marginBottom: behind * PX + 12,
        marginRight: behind * PX,
      }}
    >
      {bgCards}
      <div
        style={{
          position: "relative",
          border: "2px solid #000",
          background: "#fff",
          padding: 24,
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Fallback task data ──
function getFallbackTasks() {
  return [
    { name: "AACF By-laws", dueDate: null, important: true, urgent: true },
    { name: "Tanya visit May → guestlist", dueDate: null, important: true, urgent: true },
    { name: "Tax packet", dueDate: null, important: true, urgent: true },
    { name: "THE FUCKING HANDBOOK SHIT", dueDate: null, important: true, urgent: false },
    { name: "Benefit day pages — content?", dueDate: null, important: true, urgent: true },
    { name: "Organize ministers pages", dueDate: null, important: true, urgent: true },
    { name: "Organize images onto timeline", dueDate: null, important: true, urgent: true },
    { name: "Student Eval Question updates", dueDate: "2025-12-20", important: true, urgent: true },
    { name: "Check in with faculty re: dept evolution", dueDate: "2025-03-22", important: true, urgent: false, effort: "💦 Some", impact: "🧯 Low" },
    { name: "Finish wjerk shop site", dueDate: "2025-03-22", important: true, urgent: false, effort: "🌊 Lots", impact: "🔥 High" },
    { name: "Write and record daily mantras", dueDate: "2025-03-22", important: true, urgent: false, effort: "🌊 Lots", impact: "🚒 Medium" },
    { name: "Reschedule Dentist Appt.", dueDate: "2025-07-08", important: true, urgent: false, effort: "💧 Bit" },
    { name: "Contact Ellen re: storytelling class", dueDate: null, important: true, urgent: false },
    { name: "Follow up with Lyle re: collaboration", dueDate: null, important: true, urgent: false },
    { name: "8/22 design meeting → FigJam board", dueDate: null, important: true, urgent: false },
    { name: "List white teacher chair (free)", dueDate: null, important: false, urgent: true },
    { name: "List playground equipment (free)", dueDate: null, important: false, urgent: true },
    { name: "List jumperoo (free)", dueDate: null, important: false, urgent: true },
    { name: "List tow hook trailer", dueDate: null, important: false, urgent: true },
    { name: "Indistractible: Re-read and notate", dueDate: "2025-03-22", important: false, urgent: false, effort: "💦 Some" },
  ];
}

// ── Main ──

export default function OneThing() {
  const [phase, setPhase] = useState("loading");
  const [tasks, setTasks] = useState([]);
  const [sel, setSel] = useState(new Set());
  const [stack, setStack] = useState([]);
  const [idx, setIdx] = useState(0);
  const [doneN, setDoneN] = useState(0);
  const [sorting, setSorting] = useState(false);
  const [emailOk, setEmailOk] = useState(false);

  const load = useCallback(async () => {
    setPhase("loading");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          mcp_servers: [{ type: "url", url: "https://mcp.notion.com/mcp", name: "notion" }],
          messages: [{
            role: "user",
            content: `Query the Notion database view at: https://app.notion.com/p/13055aa28d7181f6a5bbc0d59cc62ded?v=13055aa2-8d71-8155-a2f9-000cb5a2d29b\n\nReturn ONLY a JSON array of objects with: name, dueDate (or null), important (bool), urgent (bool), effort (string or null), impact (string or null). No markdown, no extra text.`,
          }],
        }),
      });
      const d = await r.json();
      const txt = (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const m = txt.replace(/```json|```/g, "").match(/\[[\s\S]*\]/);
      if (m) setTasks(JSON.parse(m[0]));
      else setTasks(getFallbackTasks());
    } catch {
      setTasks(getFallbackTasks());
    }
    setPhase("triage");
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggle(i) {
    setSel((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  async function build() {
    setSorting(true);
    const picks = tasks.filter((_, i) => sel.has(i));
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildSortPrompt(picks) }],
        }),
      });
      const d = await r.json();
      const txt = (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const m = txt.replace(/```json|```/g, "").match(/\[[\s\S]*\]/);
      if (m) {
        const order = JSON.parse(m[0]);
        setStack(order.map((x) => ({ ...picks[x.index - 1], reason: x.reason })));
      } else {
        setStack(picks.map((t) => ({ ...t, reason: "" })));
      }
    } catch {
      setStack(picks.map((t) => ({ ...t, reason: "" })));
    }
    setIdx(0); setDoneN(0); setEmailOk(false); setSorting(false); setPhase("focus");
  }

  function advance(completed) {
    if (completed) setDoneN((n) => n + 1);
    if (!emailOk) setEmailOk(true);
    if (idx + 1 >= stack.length) setPhase("done");
    else setIdx((i) => i + 1);
  }

  return (
    <div style={{ fontFamily: FONT, fontSize: 12, background: "#c0c0c0", minHeight: "100vh", color: "#000" }}>

      {phase === "loading" && (
        <Win title="One Thing">
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Loading from Notion...</div>
        </Win>
      )}

      {phase === "triage" && (
        <Win
          title="One Thing"
          footer={<><span>{sel.size} selected</span><span>{tasks.length} total</span></>}
        >
          <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>
            What needs your attention today?
          </div>
          <div style={{ fontSize: 10, color: "#666", marginBottom: 12 }}>
            Not "is this important" — just "does it need to be today?"
          </div>

          <div style={{ maxHeight: 380, overflowY: "auto", border: "1px solid #ccc", background: "#fafafa", padding: 4 }}>
            {tasks.map((t, i) => (
              <label
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", padding: "5px 4px",
                  borderBottom: "1px dotted #ddd", gap: 6, cursor: "pointer",
                }}
              >
                <input type="checkbox" checked={sel.has(i)} onChange={() => toggle(i)} style={{ marginTop: 2, cursor: "pointer" }} />
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: t.important ? "bold" : "normal" }}>{t.name}</span>
                  {t.dueDate && <span style={{ fontSize: 10, color: "#888", marginLeft: 6 }}>due {t.dueDate}</span>}
                  {t.urgent && <span style={{ fontSize: 9, background: "#000", color: "#fff", padding: "1px 4px", marginLeft: 4 }}>URGENT</span>}
                </span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#888" }}>Aim for 3–7. Less is more.</span>
            <Btn black onClick={build} disabled={sel.size === 0 || sorting}>
              {sorting ? "Sorting..." : "Build Today's Stack →"}
            </Btn>
          </div>

          <div style={{ fontSize: 10, color: "#999", textAlign: "center", fontStyle: "italic", borderTop: "1px dotted #ccc", paddingTop: 10, marginTop: 14 }}>
            {MANTRAS[0]}
          </div>
        </Win>
      )}

      {phase === "focus" && stack[idx] && (
        <>
          {!emailOk && (
            <div style={{ maxWidth: 520, margin: "0 auto", width: "calc(100% - 32px)", background: "#000", color: "#fff", textAlign: "center", padding: "8px", fontSize: 11, fontWeight: "bold", letterSpacing: "0.05em" }}>
              Your focus is protected. No email until task 1 is done.
            </div>
          )}

          <Win
            title="One Thing"
            footer={<><span>{doneN} done</span><span>{emailOk ? "📬 unlocked" : "🔒 locked"}</span></>}
          >
            <CardStack total={stack.length - idx}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 8 }}>
                Do this now
              </div>
              <div style={{ fontSize: 20, fontWeight: "bold", lineHeight: 1.3, marginBottom: 8 }}>
                {stack[idx].name}
              </div>
              {stack[idx].dueDate && (
                <div style={{ fontSize: 10, color: "#888" }}>Due: {stack[idx].dueDate}</div>
              )}
              {stack[idx].reason && (
                <div style={{ fontSize: 11, color: "#555", fontStyle: "italic", borderTop: "1px solid #ddd", paddingTop: 8, marginTop: 10 }}>
                  ↳ {stack[idx].reason}
                </div>
              )}
            </CardStack>

            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <Btn onClick={() => advance(false)}>Skip →</Btn>
              <Btn black onClick={() => advance(true)}>✓ Done</Btn>
            </div>

            <div style={{ fontSize: 10, color: "#999", textAlign: "center", fontStyle: "italic", borderTop: "1px dotted #ccc", paddingTop: 10, marginTop: 14 }}>
              {MANTRAS[1]}
            </div>
          </Win>
        </>
      )}

      {phase === "done" && (
        <Win title="One Thing">
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>■</div>
            <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 6 }}>Stack complete.</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
              {doneN} task{doneN !== 1 ? "s" : ""} done today. Everything else can wait.
            </div>
            <Btn onClick={() => { setPhase("triage"); setSel(new Set()); setStack([]); }}>
              Start a new stack →
            </Btn>
          </div>
        </Win>
      )}
    </div>
  );
}
