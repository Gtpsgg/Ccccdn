import { useState, useRef, useCallback, useEffect } from "react";

// ── Utility ────────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).slice(2, 9);
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};
const BASE_URL = "https://cdn-rey-ghx.vercel.app";

// ── Theme Definitions ──────────────────────────────────────────────────────
const THEMES = {
  blueDark: {
    label: "Blue Dark",
    vars: {
      "--bg": "#080c14",
      "--bg2": "#0d1525",
      "--bg3": "#101c35",
      "--border": "#1a2d55",
      "--border2": "#1e3568",
      "--accent": "#2563eb",
      "--accent2": "#3b82f6",
      "--accent3": "#60a5fa",
      "--glow": "rgba(37,99,235,0.45)",
      "--glow2": "rgba(59,130,246,0.2)",
      "--text": "#e2eaf8",
      "--text2": "#8fadd8",
      "--text3": "#4d6fa0",
      "--success": "#22c55e",
      "--danger": "#ef4444",
      "--slide": "linear-gradient(90deg, transparent, #3b82f6, transparent)",
    },
  },
  darkRed: {
    label: "Dark Red",
    vars: {
      "--bg": "#0e0707",
      "--bg2": "#180b0b",
      "--bg3": "#200e0e",
      "--border": "#3d1212",
      "--border2": "#511818",
      "--accent": "#dc2626",
      "--accent2": "#ef4444",
      "--accent3": "#f87171",
      "--glow": "rgba(220,38,38,0.45)",
      "--glow2": "rgba(239,68,68,0.2)",
      "--text": "#f5e2e2",
      "--text2": "#c48a8a",
      "--text3": "#7a3535",
      "--success": "#22c55e",
      "--danger": "#f97316",
      "--slide": "linear-gradient(90deg, transparent, #ef4444, transparent)",
    },
  },
};

// ── CSS injection ──────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Sora', sans-serif;
    min-height: 100vh;
    transition: background 0.4s, color 0.4s;
  }

  :root { font-size: 14px; }

  .mono { font-family: 'JetBrains Mono', monospace; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* Slide-light button */
  @keyframes slideLight {
    0% { left: -100%; }
    100% { left: 200%; }
  }
  .btn-slide {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--accent);
    background: var(--bg3);
    color: var(--accent2);
    padding: 0.55rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: background 0.2s, box-shadow 0.2s, color 0.2s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .btn-slide::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: var(--slide);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-slide:hover {
    background: var(--bg2);
    box-shadow: 0 0 16px var(--glow);
    color: var(--accent3);
  }
  .btn-slide:hover::after {
    opacity: 1;
    animation: slideLight 1.2s linear infinite;
  }
  .btn-slide.primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent2);
  }
  .btn-slide.primary:hover {
    background: var(--accent2);
    box-shadow: 0 0 20px var(--glow);
  }
  .btn-slide.danger {
    border-color: var(--danger);
    color: var(--danger);
  }
  .btn-slide.danger:hover {
    background: rgba(239,68,68,0.08);
    box-shadow: 0 0 12px rgba(239,68,68,0.3);
  }
  .btn-slide:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .btn-slide:disabled:hover::after { animation: none; opacity: 0; }

  /* Card */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.25rem 1.4rem;
    transition: border-color 0.3s;
  }
  .card:hover { border-color: var(--border2); }

  /* Input */
  .input {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-family: 'Sora', sans-serif;
    font-size: 0.85rem;
    padding: 0.55rem 0.9rem;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--glow2);
  }
  .input::placeholder { color: var(--text3); }

  /* Badge */
  .badge {
    font-size: 0.7rem;
    padding: 0.18rem 0.55rem;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 0.03em;
  }
  .badge-accent { background: var(--glow2); color: var(--accent3); border: 1px solid var(--border2); }
  .badge-success { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
  .badge-muted { background: var(--bg3); color: var(--text3); border: 1px solid var(--border); }

  /* Panel layout */
  .panel { display: flex; flex-direction: column; min-height: 100vh; }
  .topbar {
    position: sticky; top: 0; z-index: 100;
    background: rgba(8,12,20,0.88);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    padding: 0.75rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  }
  .logo { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em; display: flex; align-items: center; gap: 0.5rem; }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--glow); }

  .main { flex: 1; display: grid; grid-template-columns: 240px 1fr; }

  .sidebar {
    border-right: 1px solid var(--border);
    padding: 1.2rem 0.8rem;
    display: flex; flex-direction: column; gap: 0.3rem;
    background: var(--bg);
  }
  .sidebar-item {
    padding: 0.55rem 0.9rem;
    border-radius: 7px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text2);
    display: flex; align-items: center; gap: 0.6rem;
    transition: background 0.15s, color 0.15s;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .sidebar-item:hover { background: var(--bg3); color: var(--text); }
  .sidebar-item.active { background: var(--bg3); color: var(--accent3); border-color: var(--border2); }
  .sidebar-icon { font-size: 1rem; flex-shrink: 0; }

  .content { padding: 1.5rem; overflow-y: auto; }

  /* Table */
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th {
    text-align: left; padding: 0.6rem 0.9rem;
    color: var(--text3); font-weight: 500;
    border-bottom: 1px solid var(--border);
    font-size: 0.73rem; letter-spacing: 0.05em; text-transform: uppercase;
  }
  td { padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--border); color: var(--text2); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--bg3); }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed var(--border2);
    border-radius: 10px;
    padding: 2.5rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: var(--glow2); }

  /* Path preview */
  .path-preview {
    background: var(--bg3);
    border: 1px solid var(--border2);
    border-radius: 6px;
    padding: 0.65rem 1rem;
    font-size: 0.8rem;
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
    word-break: break-all;
  }

  /* Progress */
  .progress-bar {
    height: 3px; background: var(--border); border-radius: 2px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: var(--accent2);
    border-radius: 2px;
    box-shadow: 0 0 6px var(--glow);
    transition: width 0.3s;
  }

  /* Theme toggle */
  .theme-bar { display: flex; gap: 0.4rem; align-items: center; }
  .theme-btn {
    padding: 0.3rem 0.75rem; border-radius: 5px; cursor: pointer;
    font-size: 0.73rem; font-weight: 600;
    border: 1px solid var(--border);
    background: var(--bg3); color: var(--text2);
    transition: all 0.2s;
  }
  .theme-btn.active { background: var(--accent); color: #fff; border-color: var(--accent2); }

  /* RGB sliders */
  .rgb-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
  .rgb-label { width: 14px; font-size: 0.75rem; font-weight: 700; color: var(--text3); }
  .rgb-slider { flex: 1; accent-color: var(--accent); cursor: pointer; }
  .rgb-val { width: 32px; font-size: 0.72rem; color: var(--text2); text-align: right; font-family: 'JetBrains Mono', monospace; }

  /* Stats */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.9rem; }
  .stat-card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem 1.1rem;
  }
  .stat-value { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.03em; color: var(--accent3); }
  .stat-label { font-size: 0.72rem; color: var(--text3); margin-top: 0.2rem; letter-spacing: 0.04em; text-transform: uppercase; }

  /* Notification */
  .notif {
    position: fixed; bottom: 1.2rem; right: 1.2rem; z-index: 999;
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-left: 3px solid var(--accent);
    border-radius: 8px;
    padding: 0.8rem 1.2rem;
    font-size: 0.82rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: slideIn 0.25s ease;
    max-width: 280px;
  }
  @keyframes slideIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

  /* Modal */
  .overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .modal {
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: 12px;
    padding: 1.8rem;
    width: 100%; max-width: 420px;
  }
  .modal-title { font-size: 1rem; font-weight: 700; margin-bottom: 1.2rem; }

  /* Responsive */
  @media (max-width: 680px) {
    .main { grid-template-columns: 1fr; }
    .sidebar { flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 0.5rem; }
    .sidebar-item { white-space: nowrap; }
    .content { padding: 1rem; }
    .topbar { padding: 0.6rem 1rem; }
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ── Hook: Theme ────────────────────────────────────────────────────────────
function useTheme() {
  const [themeName, setThemeName] = useState("blueDark");
  const [customRGBA, setCustomRGBA] = useState({ r: 120, g: 80, b: 255, a: 1 });
  const [isCustom, setIsCustom] = useState(false);

  const applyTheme = useCallback((vars) => {
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, []);

  useEffect(() => {
    if (!isCustom) {
      applyTheme(THEMES[themeName].vars);
    } else {
      const { r, g, b, a } = customRGBA;
      const toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      const lighten = (n, amt) => Math.min(255, n + amt);
      const hex2 = `#${toHex(lighten(r, 30))}${toHex(lighten(g, 30))}${toHex(lighten(b, 30))}`;
      applyTheme({
        "--bg": "#090909",
        "--bg2": "#111111",
        "--bg3": "#181818",
        "--border": `rgba(${r},${g},${b},0.2)`,
        "--border2": `rgba(${r},${g},${b},0.35)`,
        "--accent": hex,
        "--accent2": hex2,
        "--accent3": hex2,
        "--glow": `rgba(${r},${g},${b},${a * 0.5})`,
        "--glow2": `rgba(${r},${g},${b},0.15)`,
        "--text": "#f0f0f0",
        "--text2": `rgba(${r},${g},${b},0.75)`,
        "--text3": `rgba(${r},${g},${b},0.4)`,
        "--success": "#22c55e",
        "--danger": "#ef4444",
        "--slide": `linear-gradient(90deg, transparent, ${hex2}, transparent)`,
      });
    }
  }, [themeName, customRGBA, isCustom, applyTheme]);

  return { themeName, setThemeName, customRGBA, setCustomRGBA, isCustom, setIsCustom };
}

// ── Components ─────────────────────────────────────────────────────────────

function Notification({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="notif">{msg}</div>;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button className="btn-slide" onClick={copy} style={{ fontSize: "0.72rem", padding: "0.3rem 0.7rem" }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ accounts, files }) {
  const totalFiles = Object.values(files).flat().length;
  const totalSize = Object.values(files).flat().reduce((s, f) => s + f.size, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>Overview</h2>
        <p style={{ color: "var(--text3)", fontSize: "0.8rem" }}>Vercel CDN Panel — Edge Cache ready</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{accounts.length}<span style={{ fontSize: "0.9rem" }}>/2</span></div>
          <div className="stat-label">Accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalFiles}</div>
          <div className="stat-label">Cached Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>{formatSize(totalSize)}</div>
          <div className="stat-label">Total Size</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--success)" }}>ON</div>
          <div className="stat-label">Edge CDN</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text2)" }}>
          Cache Paths
        </h3>
        {accounts.length === 0 ? (
          <p style={{ color: "var(--text3)", fontSize: "0.8rem" }}>No accounts yet. Create one to generate cache paths.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {accounts.map((acc) => (
              <div key={acc.id} className="path-preview">
                <span className="mono" style={{ color: "var(--accent3)", fontSize: "0.78rem" }}>
                  {BASE_URL}/{acc.name}/cache
                </span>
                <CopyBtn text={`${BASE_URL}/${acc.name}/cache`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem", color: "var(--text2)" }}>
          Cache Headers Active
        </h3>
        <pre className="mono" style={{ fontSize: "0.74rem", color: "var(--text2)", lineHeight: 1.7, overflowX: "auto" }}>
{`Cache-Control: public, max-age=31536000, immutable
s-maxage=86400, stale-while-revalidate=3600
X-CDN: Vercel-Edge`}
        </pre>
      </div>
    </div>
  );
}

// ── Accounts ───────────────────────────────────────────────────────────────
function Accounts({ accounts, setAccounts, setPage, notify }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", pass: "" });
  const [err, setErr] = useState("");

  const create = () => {
    if (!form.name.trim() || !form.email.trim() || !form.pass.trim()) { setErr("All fields required."); return; }
    if (!/^[a-z0-9_-]+$/i.test(form.name)) { setErr("Name: letters, numbers, _ - only."); return; }
    if (accounts.some((a) => a.name.toLowerCase() === form.name.toLowerCase())) { setErr("Name already taken."); return; }
    const newAcc = { id: generateId(), name: form.name.trim().toLowerCase(), email: form.email.trim(), createdAt: new Date().toLocaleDateString() };
    setAccounts((prev) => [...prev, newAcc]);
    setForm({ name: "", email: "", pass: "" });
    setModal(false);
    setErr("");
    notify(`Account "${newAcc.name}" created. Path: /${newAcc.name}/cache`);
  };

  const del = (id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    notify("Account deleted.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Accounts</h2>
          <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: "0.15rem" }}>Max 2 accounts allowed</p>
        </div>
        <button className="btn-slide primary" disabled={accounts.length >= 2} onClick={() => setModal(true)}>
          + New Account
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {accounts.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--text3)", fontSize: "0.82rem" }}>No accounts yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Cache Path</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id}>
                  <td>
                    <span style={{ color: "var(--text)", fontWeight: 600 }}>{acc.name}</span>
                  </td>
                  <td>{acc.email}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="mono" style={{ fontSize: "0.74rem", color: "var(--accent3)" }}>
                        /{acc.name}/cache
                      </span>
                      <CopyBtn text={`${BASE_URL}/${acc.name}/cache`} />
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{acc.createdAt}</span></td>
                  <td>
                    <button className="btn-slide danger" onClick={() => del(acc.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Create Account</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={{ fontSize: "0.73rem", color: "var(--text3)", marginBottom: "0.3rem", display: "block" }}>USERNAME (used as path)</label>
                <input className="input mono" placeholder="e.g. john_doe" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                {form.name && <div style={{ marginTop: "0.4rem", fontSize: "0.72rem", color: "var(--accent3)" }}>Path: {BASE_URL}/{form.name.toLowerCase()}/cache</div>}
              </div>
              <div>
                <label style={{ fontSize: "0.73rem", color: "var(--text3)", marginBottom: "0.3rem", display: "block" }}>EMAIL</label>
                <input className="input" type="email" placeholder="user@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "0.73rem", color: "var(--text3)", marginBottom: "0.3rem", display: "block" }}>PASSWORD</label>
                <input className="input" type="password" placeholder="••••••••" value={form.pass} onChange={(e) => setForm((f) => ({ ...f, pass: e.target.value }))} />
              </div>
              {err && <p style={{ color: "var(--danger)", fontSize: "0.78rem" }}>{err}</p>}
              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "0.4rem" }}>
                <button className="btn-slide" onClick={() => { setModal(false); setErr(""); }}>Cancel</button>
                <button className="btn-slide primary" onClick={create}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── File Manager ───────────────────────────────────────────────────────────
function FileManager({ accounts, files, setFiles, notify }) {
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    if (accounts.length > 0 && !selectedAcc) setSelectedAcc(accounts[0].id);
  }, [accounts, selectedAcc]);

  const acc = accounts.find((a) => a.id === selectedAcc);
  const accFiles = acc ? (files[acc.id] || []) : [];

  const handleFiles = (fileList) => {
    if (!acc) return;
    setUploading(true);
    setProgress(0);
    const arr = Array.from(fileList);
    let i = 0;
    const interval = setInterval(() => {
      i += Math.random() * 30 + 10;
      setProgress(Math.min(i, 95));
      if (i >= 95) clearInterval(interval);
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const newFiles = arr.map((f) => ({
        id: generateId(),
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        uploadedAt: new Date().toLocaleString(),
        path: `/${acc.name}/cache/${f.name}`,
      }));
      setFiles((prev) => ({ ...prev, [acc.id]: [...(prev[acc.id] || []), ...newFiles] }));
      notify(`${arr.length} file(s) cached to /${acc.name}/cache`);
      setTimeout(() => { setUploading(false); setProgress(0); }, 400);
    }, 1200);
  };

  const drop = (e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };
  const del = (fileId) => {
    setFiles((prev) => ({ ...prev, [acc.id]: prev[acc.id].filter((f) => f.id !== fileId) }));
    notify("File removed from cache.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Cache Files</h2>

      {accounts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--text3)", fontSize: "0.85rem" }}>Create an account first to upload files.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {accounts.map((a) => (
              <button key={a.id} className={`btn-slide ${selectedAcc === a.id ? "primary" : ""}`} onClick={() => setSelectedAcc(a.id)}>
                {a.name}
              </button>
            ))}
          </div>

          {acc && (
            <div className="path-preview">
              <span className="mono" style={{ color: "var(--accent3)", fontSize: "0.78rem" }}>
                Upload path: {BASE_URL}/{acc.name}/cache
              </span>
              <CopyBtn text={`${BASE_URL}/${acc.name}/cache`} />
            </div>
          )}

          <div
            className={`upload-zone ${dragging ? "drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={drop}
            onClick={() => fileRef.current.click()}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>☁</div>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.3rem" }}>Drop files or click to upload</p>
            <p style={{ fontSize: "0.74rem", color: "var(--text3)" }}>Files will be cached at /{acc?.name}/cache/filename</p>
          </div>
          <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />

          {uploading && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.3rem", color: "var(--text2)" }}>
                <span>Uploading to cache...</span><span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {accFiles.length === 0 ? (
              <p style={{ padding: "1.8rem", textAlign: "center", color: "var(--text3)", fontSize: "0.8rem" }}>No files in cache yet.</p>
            ) : (
              <table>
                <thead><tr><th>Filename</th><th>Size</th><th>CDN URL</th><th>Uploaded</th><th></th></tr></thead>
                <tbody>
                  {accFiles.map((f) => (
                    <tr key={f.id}>
                      <td style={{ color: "var(--text)", fontWeight: 500 }}>{f.name}</td>
                      <td><span className="badge badge-muted">{formatSize(f.size)}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--accent3)" }}>{f.path}</span>
                          <CopyBtn text={`${BASE_URL}${f.path}`} />
                        </div>
                      </td>
                      <td style={{ fontSize: "0.75rem" }}>{f.uploadedAt}</td>
                      <td><button className="btn-slide danger" onClick={() => del(f.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Settings / Theme ───────────────────────────────────────────────────────
function Settings({ themeName, setThemeName, customRGBA, setCustomRGBA, isCustom, setIsCustom }) {
  const { r, g, b, a } = customRGBA;
  const previewColor = `rgba(${r},${g},${b},${a})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Settings & Theme</h2>
        <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: "0.15rem" }}>Customize appearance</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.9rem" }}>Preset Themes</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              className={`theme-btn ${themeName === key && !isCustom ? "active" : ""}`}
              onClick={() => { setThemeName(key); setIsCustom(false); }}
            >
              {t.label}
            </button>
          ))}
          <button className={`theme-btn ${isCustom ? "active" : ""}`} onClick={() => setIsCustom(true)}>
            Custom RGBA
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.9rem" }}>Custom RGBA Theme</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: previewColor, border: "2px solid var(--border2)", boxShadow: `0 0 12px ${previewColor}`, flexShrink: 0 }} />
          <span className="mono" style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{previewColor}</span>
        </div>
        {[["R", "r", 255, "#ef4444"], ["G", "g", 255, "#22c55e"], ["B", "b", 255, "#3b82f6"], ["A", "a", 1, "#a78bfa"]].map(([lbl, key, max, col]) => (
          <div className="rgb-row" key={key}>
            <span className="rgb-label" style={{ color: col }}>{lbl}</span>
            <input
              className="rgb-slider"
              type="range" min={0} max={max} step={key === "a" ? 0.01 : 1}
              value={customRGBA[key]}
              style={{ accentColor: col }}
              onChange={(e) => {
                setCustomRGBA((p) => ({ ...p, [key]: key === "a" ? parseFloat(e.target.value) : parseInt(e.target.value) }));
                setIsCustom(true);
              }}
            />
            <span className="rgb-val">{key === "a" ? customRGBA[key].toFixed(2) : customRGBA[key]}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.8rem" }}>Vercel Cache Config</h3>
        <pre className="mono" style={{ fontSize: "0.73rem", color: "var(--text2)", lineHeight: 1.8, overflowX: "auto" }}>
{`{
  "headers": [
    {
      "source": "/:customer/cache/(.*)",
      "headers": [
        { "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable" },
        { "key": "X-CDN", "value": "Vercel-Edge" }
      ]
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [accounts, setAccounts] = useState([]);
  const [files, setFiles] = useState({});
  const [notif, setNotif] = useState(null);
  const theme = useTheme();

  const notify = (msg) => { setNotif(msg); };

  const NAV = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "accounts", icon: "◈", label: "Accounts" },
    { id: "files", icon: "⊞", label: "Cache Files" },
    { id: "settings", icon: "◎", label: "Settings" },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="panel">
        {/* Topbar */}
        <header className="topbar">
          <div className="logo">
            <div className="logo-dot" />
            <span>CDN Panel</span>
            <span className="badge badge-accent" style={{ marginLeft: "0.2rem" }}>Vercel</span>
          </div>
          <div className="theme-bar">
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                className={`theme-btn ${theme.themeName === key && !theme.isCustom ? "active" : ""}`}
                onClick={() => { theme.setThemeName(key); theme.setIsCustom(false); }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="main">
          {/* Sidebar */}
          <nav className="sidebar">
            {NAV.map((n) => (
              <div key={n.id} className={`sidebar-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <span className="sidebar-icon">{n.icon}</span>
                {n.label}
                {n.id === "accounts" && <span className="badge badge-muted" style={{ marginLeft: "auto" }}>{accounts.length}/2</span>}
              </div>
            ))}
          </nav>

          {/* Content */}
          <main className="content">
            {page === "dashboard" && <Dashboard accounts={accounts} files={files} />}
            {page === "accounts" && <Accounts accounts={accounts} setAccounts={setAccounts} setPage={setPage} notify={notify} />}
            {page === "files" && <FileManager accounts={accounts} files={files} setFiles={setFiles} notify={notify} />}
            {page === "settings" && <Settings {...theme} />}
          </main>
        </div>
      </div>

      {notif && <Notification msg={notif} onClose={() => setNotif(null)} />}
    </>
  );
}
