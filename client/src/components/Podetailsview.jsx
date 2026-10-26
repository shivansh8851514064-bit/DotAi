import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Hash, Building, MapPin, Clock, AlertTriangle,
  DollarSign, Shield, List, Edit3, FileText, Sparkles, Check, X,
  Edit2, History, Calendar, Zap, ArrowRight, Save, RefreshCw, Send, Lock, Unlock, ChevronDown, ChevronUp
} from 'lucide-react';

const parseAnchor = (text) => {
  if (!text) return null;
  const match = text.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!match) return null;
  return { amount: parseInt(match[1]), unit: match[2].toLowerCase() };
};

const addTime = (baseDateStr, offset) => {
  if (!baseDateStr || !offset) return null;
  const d = new Date(baseDateStr);
  if (isNaN(d)) return null;
  if (offset.unit.startsWith('day')) d.setDate(d.getDate() + offset.amount);
  if (offset.unit.startsWith('week')) d.setDate(d.getDate() + (offset.amount * 7));
  if (offset.unit.startsWith('month')) d.setMonth(d.getMonth() + offset.amount);
  if (offset.unit.startsWith('year')) d.setFullYear(d.getFullYear() + offset.amount);
  return d.toISOString().split('T')[0];
};

const ProfileRow = ({ icon, label, fieldKey, data, dbId, onUpdate, setActiveSource }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(data?.value || "");
  const [editReason, setEditReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const val = data?.value || "Not found";
  const quote = data?.source_quote || "No source quote extracted.";
  const isMissing = !val || val === "Not found" || val === "N/A" || val === "not_found" || val === "";
  const historyLog = data?.history || [];
  const hasHistory = historyLog.length > 0;

  const handleSave = async () => {
    if (tempVal !== val) {
      if (!editReason.trim()) {
        alert("Please provide a reason for this edit.");
        return;
      }
      await onUpdate(dbId, fieldKey, tempVal, editReason);
    }
    setIsEditing(false);
    setEditReason("");
  };

  return (
    <div id={`field-row-${fieldKey}`} className="group border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.01]" style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 20px', gap: 0 }}>
      <div style={{ flexShrink: 0, width: 156, display: 'flex', alignItems: 'flex-start', gap: 9, paddingTop: 1 }}>
        <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: 'rgba(123, 97, 255, 0.1)', color: '#7B61FF', border: '1px solid rgba(123, 97, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.4, paddingTop: 6 }}>{label}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingLeft: 12, paddingTop: 2 }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea value={tempVal} onChange={e => setTempVal(e.target.value)} autoFocus className="mac-glass-input" style={{ width: '100%', minHeight: 56, resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
            <input type="text" placeholder="Reason for change (required)" value={editReason} onChange={e => setEditReason(e.target.value)} className="mac-glass-input" style={{ fontSize: 11, padding: '6px 10px', width: '100%', boxSizing: 'border-box' }} />
          </div>
        ) : isMissing ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontStyle: 'italic', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}><AlertTriangle size={11} /> Not found</span>
        ) : (
          <>
            <span style={{ fontSize: 13.5, color: '#ffffff', lineHeight: 1.65, wordBreak: 'break-word', display: 'block', fontWeight: 500 }}>{val}</span>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-start' }}>
              <button onClick={() => setActiveSource({ label, quote, locate: true })} title="Open source location" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '99px', color: '#4F8CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '4px 12px', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(79, 140, 255, 0.4)'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#4F8CFF'; }}><span>🔗</span> View in PDF</button>
              {hasHistory && <button onClick={() => setShowHistory(!showHistory)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.45)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><History size={11} /> {showHistory ? 'Hide history' : `History (${historyLog.length})`}</button>}
            </div>

            {showHistory && hasHistory && (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {historyLog.map((hist, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontWeight: 500 }}>{hist.old_value !== null && hist.old_value !== undefined ? `"${hist.old_value}"` : 'None'}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>➔</span>
                      <span style={{ color: '#4F8CFF' }}>"{hist.new_value}"</span>
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(hist.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', gap: 5, paddingLeft: 10, paddingTop: 1 }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} className="mac-btn-primary" style={{ width: 28, height: 28, padding: 0 }}><Check size={14} /></button>
            <button onClick={() => { setTempVal(val); setEditReason(""); setIsEditing(false); }} className="mac-btn-secondary" style={{ width: 28, height: 28, padding: 0 }}><X size={14} /></button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} title="Edit" style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background='rgba(123,97,255,0.12)'; e.currentTarget.style.color='#7B61FF'; e.currentTarget.style.borderColor='rgba(123,97,255,0.4)'; }}><Edit2 size={12} /></button>
        )}
      </div>
    </div>
  );
};

const DateProfileRow = ({ icon, label, fieldKey, data, dbId, onUpdate, setActiveSource }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(data?.value || "");
  const [editReason, setEditReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const val = data?.value || "Not found";
  const quote = data?.source_quote || "No source quote extracted.";
  const isMissing = !val || val === "Not found" || val === "N/A" || val === "not_found" || val === "";
  const historyLog = data?.history || [];
  const hasHistory = historyLog.length > 0;

  const handleSave = async () => {
    if (tempVal !== val) {
      if (!editReason.trim()) {
        alert("Please provide a reason for this edit.");
        return;
      }
      await onUpdate(dbId, fieldKey, tempVal, editReason);
    }
    setIsEditing(false);
    setEditReason("");
  };

  const toInputDate = (str) => {
    if (!str) return '';
    const d = new Date(str);
    return isNaN(d) ? '' : d.toISOString().split('T')[0];
  };

  const handleCalendarChange = (e) => {
    const raw = e.target.value;
    if (!raw) return;
    const formatted = new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    setTempVal(formatted);
  };

  return (
    <div id={`field-row-${fieldKey}`} className="group border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.01]" style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 20px', gap: 0 }}>
      <div style={{ flexShrink: 0, width: 156, display: 'flex', alignItems: 'flex-start', gap: 9, paddingTop: 1 }}>
        <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#6366F1', boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.4, paddingTop: 6 }}>{label}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingLeft: 12, paddingTop: 2 }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={tempVal} onChange={e => setTempVal(e.target.value)} autoFocus className="mac-glass-input" style={{ width: '100%', minHeight: 38, padding: '7px 11px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Or pick:</span>
              <input type="date" value={toInputDate(tempVal)} onChange={handleCalendarChange} className="mac-glass-input" style={{ padding: '4px 9px', fontSize: 12, colorScheme: 'dark', minHeight: 'unset', width: 'auto' }} />
            </div>
            <input type="text" placeholder="Reason for change (required)" value={editReason} onChange={e => setEditReason(e.target.value)} className="mac-glass-input" style={{ fontSize: 11, padding: '6px 10px', width: '100%', boxSizing: 'border-box' }} />
          </div>
        ) : isMissing ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}><AlertTriangle size={11} /> Not found</span>
        ) : (
          <>
            <span style={{ fontSize: 13.5, color: '#ffffff', display: 'block', fontWeight: 500 }}>{val}</span>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-start' }}>
              <button onClick={() => setActiveSource({ label, quote, locate: true })} title="Open source location" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '99px', color: '#4F8CFF', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '4px 12px', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(79, 140, 255, 0.4)'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#4F8CFF'; }}><span>🔗</span> View in PDF</button>
              {hasHistory && <button onClick={() => setShowHistory(!showHistory)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.45)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><History size={11} /> {showHistory ? 'Hide history' : `History (${historyLog.length})`}</button>}
            </div>

            {showHistory && hasHistory && (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {historyLog.map((hist, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontWeight: 500 }}>{hist.old_value !== null && hist.old_value !== undefined ? `"${hist.old_value}"` : 'None'}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>➔</span>
                      <span style={{ color: '#4F8CFF' }}>"{hist.new_value}"</span>
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(hist.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', gap: 5, paddingLeft: 10, paddingTop: 1 }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} className="mac-btn-primary" style={{ width: 28, height: 28, padding: 0 }}><Check size={14} /></button>
            <button onClick={() => { setTempVal(val); setEditReason(""); setIsEditing(false); }} className="mac-btn-secondary" style={{ width: 28, height: 28, padding: 0 }}><X size={14} /></button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} title="Edit" style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background='rgba(123,97,255,0.12)'; e.currentTarget.style.color='#7B61FF'; e.currentTarget.style.borderColor='rgba(123,97,255,0.4)'; }}><Edit2 size={12} /></button>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => (
  <motion.section initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mac-glass-card overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px 20px', background: 'rgba(255, 255, 255, 0.01)' }}>
      <span style={{ display: 'flex', width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.15) 0%, rgba(79, 140, 255, 0.15) 100%)', color: '#7B61FF', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(123, 97, 255, 0.25)' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.75)' }}>{title}</h2>
    </header>
    <div style={{ flex: 1 }}>{children}</div>
  </motion.section>
);

// ── This is the dedicated "PO Details" section: viewing/editing an already-processed PO.
// It is intentionally separate from ExtractionView (the New Upload flow) so that loading a
// past PO, or silently refreshing after an edit/status-change/note, never falls back to or
// flashes the "Upload a PDF" dropzone.
const PODetailsView = ({ result, dbId, loading, setActiveSource, onUpdate, onStatusChange, onAddNote, customFields = [], scrollToField = null, onScrollToFieldDone = () => {} }) => {
  const deepAnalysis = result?._deep_analysis || null;
  const hasRawFields = deepAnalysis?.raw_fields && Object.keys(deepAnalysis.raw_fields).length > 0;
  const hasAnomalies = deepAnalysis?.anomalies && deepAnalysis.anomalies.length > 0;
  const hasDeadlines = deepAnalysis?.deadlines && deepAnalysis.deadlines.length > 0;

  // ── STATE ──
  const [triggerDates, setTriggerDates] = useState({});
  const [savingIdx, setSavingIdx] = useState(null);

  // ── TITLE EDIT STATE ──
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");
  const [titleReason, setTitleReason] = useState("");

  // ── ACTION HISTORY STATE ──
  const [noteText, setNoteText] = useState("");
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    if (!scrollToField || !result) return;
    const elId = scrollToField.startsWith('deadline_') ? scrollToField : `field-row-${scrollToField}`;
    const el = document.getElementById(elId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const prevTransition = el.style.transition;
      const prevBackground = el.style.background;
      el.style.transition = 'background 0.3s ease';
      el.style.background = 'rgba(123,97,255,0.18)';
      setTimeout(() => {
        el.style.background = prevBackground;
        setTimeout(() => { el.style.transition = prevTransition; }, 350);
      }, 1200);
    }
    if (onScrollToFieldDone) onScrollToFieldDone();
  }, [scrollToField, result, onScrollToFieldDone]);

  const handleTitleSave = async () => {
    if (!titleReason.trim()) { alert("Please provide a reason for changing the document title."); return; }
    await onUpdate(dbId, 'filename', titleVal, titleReason);
    setIsEditingTitle(false); setTitleReason("");
  };

  const handleTriggerChange = (idx, dateStr, description) => {
    const newDates = { ...triggerDates, [idx]: dateStr };
    const lowerDesc = (description || "").toLowerCase();
    const keywords = ['invoice', 'delivery', 'dispatch', 'completion', 'receipt'];
    const matchedKeyword = keywords.find(k => lowerDesc.includes(k));

    if (matchedKeyword && deepAnalysis?.deadlines) {
      deepAnalysis.deadlines.forEach((dl, i) => {
        const isPending = !dl.computed_date || String(dl.computed_date).toLowerCase() === 'null';
        if (i !== idx && (isPending || newDates[i + "_edit"]) && dl.anchor_description?.toLowerCase().includes(matchedKeyword)) {
          newDates[i] = dateStr;
        }
      });
    }
    setTriggerDates(newDates);
  };

  const handleSaveDeadline = async (idx, calculatedResult, triggerDate) => {
    if (!calculatedResult) return;
    setSavingIdx(idx);
    const updatedDeepAnalysis = JSON.parse(JSON.stringify(deepAnalysis));
    updatedDeepAnalysis.deadlines[idx].computed_date = calculatedResult;
    updatedDeepAnalysis.deadlines[idx].trigger_date = triggerDate;
    try {
      await onUpdate(dbId, "_deep_analysis", updatedDeepAnalysis, "Recalculated offset trigger date");
      setTriggerDates(prev => ({ ...prev, [idx + "_edit"]: false }));
    } catch (e) { console.error("Failed to save deadline", e); }
    setSavingIdx(null);
  };

  // No PO loaded yet and nothing in flight — nothing to show.
  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ flex: 1, padding: '80px 20px', color: '#737373' }}>
        <FileText size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
        <p style={{ fontSize: 14 }}>Select a purchase order from Deadlines or All POs to view its details here.</p>
      </div>
    );
  }

  // A PO is already open and we're just silently refreshing after an edit/status-change/note —
  // keep showing the existing data instead of collapsing the view, so nothing flashes.
  if (!result && loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ flex: 1, padding: '80px 20px', color: '#737373' }}>
        <RefreshCw size={28} className="animate-spin" style={{ marginBottom: 16, opacity: 0.5 }} />
        <p style={{ fontSize: 13 }}>Loading purchase order…</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 flex flex-col gap-6" style={{ flex: 1 }}>

      {/* ── EDITABLE TITLE HEADER ── */}
      <div className="flex items-center justify-between pb-5 mb-2 pt-1">
        {isEditingTitle ? (
          <div className="flex items-center gap-3 w-full max-w-3xl">
            <input
              value={titleVal} onChange={e => setTitleVal(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white font-bold flex-1"
              placeholder="Enter PO Name or Number" autoFocus
            />
            <input
              value={titleReason} onChange={e => setTitleReason(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-64"
              placeholder="Reason for change (required)"
            />
            <button onClick={handleTitleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 h-10 w-10 flex items-center justify-center rounded-lg transition-colors"><Check size={18}/></button>
            <button onClick={() => { setIsEditingTitle(false); setTitleReason(""); }} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-2 h-10 w-10 flex items-center justify-center rounded-lg transition-colors"><X size={18}/></button>
          </div>
        ) : (
          <div className="flex items-center gap-4 group">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <FileText className="text-indigo-400" size={24} />
              {result.filename?.value && result.filename?.value !== 'not_found' && result.filename?.value !== ''
                ? result.filename.value
                : (result.po_number?.value !== 'not_found' && result.po_number?.value ? result.po_number.value : "Untitled Purchase Order")}
            </h2>
            <button
              onClick={() => {
                const name = result.filename?.value;
                const num = result.po_number?.value;
                setTitleVal(name && name !== 'not_found' && name !== '' ? name : (num !== 'not_found' && num ? num : ""));
                setTitleReason(""); setIsEditingTitle(true);
              }}
              title="Edit Document Name"
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-indigo-400 transition-all text-zinc-400 cursor-pointer"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── STATUS + ACTION HISTORY ── */}
      <div className="w-full flex flex-col gap-5 mb-4">

        {/* 1. CURRENT STATUS CARD */}
        <div className="rounded-xl border border-white/5 bg-[#121212] overflow-hidden">
          <div className="px-6 py-4">
            <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-4">Current Status</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#1a1a1a]">
                <span>{result.status?.value === "Closed" ? '🔒' : '🟢'}</span>
                <span className="text-sm font-medium text-zinc-300">{result.status?.value === "Closed" ? 'Closed' : 'Open'}</span>
              </div>
              <button
                onClick={() => {
                  const curr = result.status?.value === "Closed" ? "Closed" : "Open";
                  const newStat = curr === "Closed" ? "Open" : "Closed";
                  onStatusChange(dbId, newStat);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-transparent hover:bg-[#2e2e2e] transition-colors text-sm font-medium text-zinc-300"
              >
                {result.status?.value === "Closed" ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{result.status?.value === "Closed" ? 'Reopen PO' : 'Close PO'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. PO ACTION HISTORY & NOTES CARD */}
        <div className="rounded-xl border border-white/5 bg-[#121212] overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <History size={13} className="text-indigo-400" />
              </div>
              <div className="text-[11px] font-bold tracking-widest text-white uppercase">PO Action History & Notes</div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <input
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a manual note or update log..."
                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={() => {
                  if (!noteText.trim()) return;
                  onAddNote(dbId, noteText);
                  setNoteText("");
                }}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Send size={15} /> Save Event
              </button>
            </div>

            {/* TIMELINE VIEW */}
            <div className="relative pl-5 border-l border-white/10 ml-2 space-y-7">
              {(() => {
                const allLogs = result.action_log || [];
                const visibleLogs = showAllLogs ? allLogs : allLogs.slice(0, 1);
                const hiddenCount = allLogs.length - visibleLogs.length;

                return (
                  <>
                    {visibleLogs.map((log, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full border-[2.5px] border-[#4F8CFF] bg-[#121212]" />
                        <div className="text-[10px] text-zinc-500 font-mono mb-2">
                          {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="inline-block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-300 font-medium mb-3">
                          {log.action_type === 'MANUAL_NOTE' ? 'Manual Note'
                            : log.action_type === 'STATUS_CHANGE' ? 'Status Change'
                            : log.action_type === 'UPLOAD' ? 'Upload'
                            : 'System Update'}
                        </div>
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-3.5 text-sm text-zinc-300">
                          {log.reason ? log.reason : log.description}
                          {log.field && log.field !== 'status' && <div className="mt-2 text-xs text-zinc-500">Field: {log.field}</div>}
                        </div>
                      </div>
                    ))}

                    {hiddenCount > 0 && (
                      <button
                        onClick={() => setShowAllLogs(true)}
                        className="text-[11px] text-[#4F8CFF] hover:text-blue-300 font-medium flex items-center gap-1.5 mt-4 transition-colors"
                      >
                        <ChevronDown size={14} /> View {hiddenCount} earlier actions
                      </button>
                    )}
                    {showAllLogs && allLogs.length > 1 && (
                      <button
                        onClick={() => setShowAllLogs(false)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-400 font-medium flex items-center gap-1.5 mt-4 transition-colors"
                      >
                        <ChevronUp size={14} /> Hide earlier actions
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN FIELD GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ alignItems: 'start' }}>
        <Card title="Document Headers" icon={<FileText size={13} />}>
          <ProfileRow icon={<Hash size={14} />} label="PO Number" fieldKey="po_number" data={result.po_number} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          <ProfileRow icon={<Building size={14} />} label="Vendor Name" fieldKey="vendor_name" data={result.vendor_name} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          <ProfileRow icon={<MapPin size={14} />} label="Contact & Address" fieldKey="vendor_contact_address" data={result.vendor_contact_address} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          <DateProfileRow icon={<Clock size={14} />} label="Effective Date" fieldKey="effective_date" data={result.effective_date} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          <DateProfileRow icon={<AlertTriangle size={14}/>} label="Lapse / Expiry" fieldKey="lapse_expiry_date" data={result.lapse_expiry_date} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          <ProfileRow icon={<DollarSign size={14} />} label="Total Value" fieldKey="total_value" data={result.total_value} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Terms & Conditions" icon={<Shield size={13} />}>
            <ProfileRow icon={<Shield size={14} />} label="Conditions" fieldKey="conditions_of_agreement" data={result.conditions_of_agreement} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
            <ProfileRow icon={<DollarSign size={14} />} label="Payment Terms" fieldKey="conditions_of_payment" data={result.conditions_of_payment} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          </Card>

          <Card title="Signatures" icon={<Edit3 size={13} />}>
            <ProfileRow icon={<Edit3 size={14} />} label="Signatory" fieldKey="authorising_signatory" data={result.authorising_signatory} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
          </Card>
        </div>

        {customFields && customFields.length > 0 && (
          <Card title="Global Custom Fields" icon={<Sparkles size={13} />}>
            {customFields.map(cf => (
              <ProfileRow key={cf.key} icon={<Sparkles size={14} />} label={cf.name} fieldKey={cf.key} data={result[cf.key]} dbId={dbId} onUpdate={onUpdate} setActiveSource={setActiveSource} />
            ))}
          </Card>
        )}

        {hasRawFields && (
          <Card title="PO-Specific Attributes" icon={<Zap size={13} className="text-yellow-450"/>}>
            <div className="flex flex-col">
              {Object.entries(deepAnalysis.raw_fields).map(([key, val], idx) => (
                <div key={key} className={`flex gap-4 p-4 ${idx !== Object.keys(deepAnalysis.raw_fields).length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.01] transition-colors`}>
                  <div className="w-1/3 text-xs font-bold text-zinc-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                  <div className="w-2/3 text-sm text-zinc-200">{String(val)}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="xl:col-span-2">
          <Card title="Line Items" icon={<List size={13} />}>
            <div className="p-5">
              {(() => {
                const raw = result.line_items;
                const lineItemsArray = Array.isArray(raw) ? raw : (raw?.status === "found" && Array.isArray(raw.value) ? raw.value : []);
                return lineItemsArray.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                    <table className="w-full border-collapse text-sm text-zinc-100">
                      <thead>
                        <tr className="bg-white/[0.03] text-left">
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Description</th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">Qty</th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-400">Unit Price</th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">Src</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItemsArray.map((item, idx) => (
                          <tr key={idx} className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.01]">
                            <td className="px-4 py-3 leading-relaxed text-sm">{item.description}</td>
                            <td className="px-4 py-3 text-center font-mono text-zinc-300 text-sm">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-450 text-sm">{Number(item.unit_price || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => setActiveSource({ label: `Line Item ${idx + 1}`, quote: item.source_quote || "No quote found.", locate: true })} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#4F8CFF', fontSize: 10, fontWeight: 700, cursor: 'pointer', padding: '4px 12px', borderRadius: '99px', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(79, 140, 255, 0.3)'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#4F8CFF'; }}>View in PDF</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <div className="text-zinc-500 italic text-sm py-8 text-center border border-dashed border-white/5 rounded-lg">No line items parsed.</div>;
              })()}
            </div>
          </Card>
        </div>

        {hasDeadlines && (
          <div className="xl:col-span-2">
            <Card title="Contract Deadlines & Milestones" icon={<Calendar size={13} className="text-orange-400"/>}>
              <div className="p-4 flex flex-col gap-3">
                {deepAnalysis.deadlines.map((dl, i) => {
                  const isNull = !dl.computed_date || String(dl.computed_date).toLowerCase() === 'null';
                  const isEditing = triggerDates[i + "_edit"];
                  const showCalculator = isNull || isEditing;

                  const baseDateInput = triggerDates[i] !== undefined ? triggerDates[i] : (dl.trigger_date || '');

                  const offsetSearchText = [
                    dl.anchor_description,
                    ...(dl.reasoning_chain || []).map(s => s.description)
                  ].filter(Boolean).join(' ');
                  const offset = showCalculator ? parseAnchor(offsetSearchText) : null;
                  const calculatedResult = offset ? addTime(baseDateInput, offset) : null;

                  return (
                    <div key={i} id={`deadline_${i}`} className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-zinc-200 text-sm">{dl.label}</div>

                        {!isNull && !isEditing ? (
                          <div className="flex items-center gap-2">
                            {dl.trigger_date && <span className="text-[10px] text-zinc-500" title="Trigger date used to calculate this">from {dl.trigger_date}</span>}
                            <div className="text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]">{dl.computed_date}</div>
                            <button onClick={() => setTriggerDates(prev => ({...prev, [i + "_edit"]: true}))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', cursor: 'pointer' }} title="Edit Date"><Edit2 size={12} /></button>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {isEditing ? "Editing Trigger..." : "Awaiting Trigger"}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-zinc-400 flex items-center gap-2">
                        <span className="uppercase tracking-wider text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-350 font-bold">{dl.anchor_type}</span>
                        {dl.anchor_description}

                        {dl.reasoning_chain?.length > 0 && (
                          <button onClick={() => setActiveSource({ label: dl.label, quote: dl.reasoning_chain.map(s => s.source_clause).filter(Boolean).join('\n') })} title="View Source" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#4F8CFF', cursor: 'pointer', marginLeft: 'auto' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}><Hash size={12} /></button>
                        )}
                      </div>

                      {showCalculator && (
                        <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                          <div className="flex flex-col gap-1 w-[160px]">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Trigger Date</label>
                            <input type="date" value={baseDateInput} onChange={(e) => handleTriggerChange(i, e.target.value, dl.anchor_description)} className="mac-glass-input" style={{ colorScheme: 'dark', padding: '6px 10px', fontSize: 12, minHeight: 'unset' }} />
                          </div>
                          <ArrowRight size={14} className="text-zinc-650 mt-4" />
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-550 font-bold">Calculated Offset {offset ? `(+${offset.amount} ${offset.unit}s)` : '(Manual)'}</label>
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${calculatedResult ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-650'}`}>{calculatedResult || 'YYYY-MM-DD'}</div>
                              {calculatedResult && <button onClick={() => handleSaveDeadline(i, calculatedResult, baseDateInput)} disabled={savingIdx === i} title="Save this calculated date" className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">{savingIdx === i ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}</button>}
                              {isEditing && <button onClick={() => setTriggerDates(prev => ({...prev, [i + "_edit"]: false}))} title="Cancel Editing" className="p-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"><X size={14} /></button>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {hasAnomalies && (
          <div className="xl:col-span-2">
            <Card title="Detected Anomalies & Risks" icon={<AlertTriangle size={13} className="text-red-400"/>}>
              <div className="p-4 flex flex-col gap-3">
                {deepAnalysis.anomalies.map((an, i) => (
                  <div key={i} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-200 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div style={{ flex: 1 }}>
                      <div className="font-bold text-sm mb-1 text-red-400">{an.type}</div>
                      <div className="text-sm opacity-90">{an.description} <span className="opacity-75 text-xs ml-1">(Page {an.page})</span></div>
                    </div>
                    {an.page && <button onClick={() => setActiveSource({ label: an.type, quote: an.source_clause || an.description, page: an.page })} title="View Source" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}><Hash size={13} /></button>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default PODetailsView;