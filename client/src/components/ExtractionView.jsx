import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud, Hash, Building, MapPin, Clock, AlertTriangle,
  DollarSign, Shield, List, Edit3, FileText, Sparkles, Check, X,
  Edit2, History, ChevronDown, ChevronUp, Calendar, Zap, ArrowRight, Save, RefreshCw,
  Lock, Unlock, Send, Star, Trash2, Plus, Briefcase
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

const EditablePOHeader = ({ dbId, value, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const normalizedVal = typeof value === 'string' ? value : (value?.value || "");
  const [tempVal, setTempVal] = useState(normalizedVal);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setTempVal(normalizedVal);
  }
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (tempVal !== value) {
      setSaving(true);
      try {
        await onUpdate(dbId, "_po_name", tempVal);
      } finally {
        setSaving(false);
      }
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3">
      {isEditing ? (
        <div className="flex items-center gap-2 w-full max-w-2xl">
          <input
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            autoFocus
            disabled={saving}
            className="mac-glass-input text-2xl font-bold px-3 py-1 flex-1"
            placeholder="Enter PO Name..."
          />
          <button onClick={handleSave} disabled={saving} className="mac-btn-primary p-2 flex-shrink-0">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button onClick={() => { setTempVal(value); setIsEditing(false); }} disabled={saving} className="mac-btn-secondary p-2 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="group flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-white m-0">
            {typeof value === 'string' ? value : (value?.value || <span className="text-zinc-500 italic text-2xl">Unnamed PO</span>)}
          </h2>
          <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white" title="Edit PO Name"><Edit2 size={16} /></button>
        </div>
      )}
    </div>
  );
};

const EditableDescription = ({ dbId, value, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const normalizedVal = typeof value === 'string' ? value : (value?.value || "");
  const [tempVal, setTempVal] = useState(normalizedVal);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setTempVal(normalizedVal);
  }
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (tempVal !== value) {
      setSaving(true);
      try {
        await onUpdate(dbId, "_description", tempVal);
      } finally {
        setSaving(false);
      }
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3 mt-2">
      {isEditing ? (
        <div className="flex items-start gap-2 w-full max-w-3xl">
          <textarea
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            autoFocus
            disabled={saving}
            className="mac-glass-input text-sm px-3 py-2 flex-1"
            style={{ resize: 'vertical', minHeight: 60 }}
            placeholder="Enter a brief summary of the agreement..."
          />
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button onClick={handleSave} disabled={saving} className="mac-btn-primary p-2">
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => { setTempVal(value); setIsEditing(false); }} disabled={saving} className="mac-btn-secondary p-2">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="group flex items-start gap-3 max-w-3xl">
          <p className="text-sm text-zinc-300 leading-relaxed m-0">
            {typeof value === 'string' && value ? value : <span className="text-zinc-500 italic">No description generated.</span>}
          </p>
          <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white mt-0.5 flex-shrink-0" title="Edit Description"><Edit2 size={12} /></button>
        </div>
      )}
    </div>
  );
};

const ProjectSelector = ({ dbId, currentProjectId, projects = [], onUpdate, onCreateProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [saving, setSaving] = useState(false);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleSelect = async (e) => {
    const val = e.target.value;
    if (val === "NEW") {
      setIsEditing(true);
    } else {
      setSaving(true);
      try {
        await onUpdate(dbId, "_project_id", val);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreate = async () => {
    const trimmed = newProjectName.trim();
    if (trimmed) {
      setSaving(true);
      try {
        const newId = await onCreateProject(trimmed);
        if (newId) {
          await onUpdate(dbId, "_project_id", newId);
        }
      } finally {
        setSaving(false);
      }
    }
    setIsEditing(false);
    setNewProjectName("");
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-emerald-400" />
          <input
            autoFocus
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="New project name..."
            disabled={saving}
            className="mac-glass-input text-xs px-2 py-1"
          />
          <button onClick={handleCreate} disabled={saving || !newProjectName.trim()} className="mac-btn-primary p-1.5">
            {saving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
          </button>
          <button onClick={() => { setIsEditing(false); setNewProjectName(""); }} disabled={saving} className="mac-btn-secondary p-1.5">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Briefcase size={14} className={saving ? "text-emerald-400/50 animate-pulse" : "text-emerald-400"} />
          <select
            value={currentProjectId || ""}
            onChange={handleSelect}
            disabled={saving}
            className="mac-glass-input text-xs font-semibold cursor-pointer disabled:opacity-50"
            style={{ padding: '4px 10px', colorScheme: 'dark', color: currentProject ? '#34d399' : '#a1a1aa' }}
          >

            <option value="" style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>No Project Assigned</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>{p.name}</option>
            ))}
            <option disabled style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>──────────</option>
            <option value="NEW" style={{ backgroundColor: '#1e1e1e', color: '#fff' }}>+ Create New Project</option>

          </select>
          {saving && <RefreshCw size={12} className="text-zinc-500 animate-spin ml-1" />}
        </div>
      )}
    </div>
  );
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
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historyLog.map((hist, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: i < historyLog.length - 1 ? 10 : 0, borderBottom: i < historyLog.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontWeight: 500 }}>{hist.old_value !== null && hist.old_value !== undefined ? `"${hist.old_value}"` : 'None'}</span>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>➔</span>
                        <span style={{ color: '#4F8CFF' }}>"{hist.new_value}"</span>
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(hist.timestamp).toLocaleDateString()}</span>
                    </div>
                    {hist.reason && (
                      <div style={{ fontSize: 11, color: 'rgba(251,191,36,0.75)', fontStyle: 'italic', paddingLeft: 2 }}>
                        Reason: {hist.reason}
                      </div>
                    )}
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
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historyLog.map((hist, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: i < historyLog.length - 1 ? 10 : 0, borderBottom: i < historyLog.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontWeight: 500 }}>{hist.old_value !== null && hist.old_value !== undefined ? `"${hist.old_value}"` : 'None'}</span>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>➔</span>
                        <span style={{ color: '#4F8CFF' }}>"{hist.new_value}"</span>
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(hist.timestamp).toLocaleDateString()}</span>
                    </div>
                    {hist.reason && (
                      <div style={{ fontSize: 11, color: 'rgba(251,191,36,0.75)', fontStyle: 'italic', paddingLeft: 2 }}>
                        Reason: {hist.reason}
                      </div>
                    )}
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

const ExtractionView = ({ file, error, result, projects = [], fileInputRef, handleFileSelection, setActiveSource, dbId, onUpdate, onCreateProject, onStatusChange, onAddNote, onAddCustomDate, onDeleteCustomDate, customFields = [], scrollToField = null, onScrollToFieldDone = () => {}, loadPastPO }) => {
  const deepAnalysis    = result?._deep_analysis    || null;
  const paymentSchedule = result?._payment_schedule || null;
  const meta            = result?._meta || { status: 'Open', actions_history: [] };
  const currentStatus   = meta.status || 'Open';
  const actionsHistory  = meta.actions_history || [];
  const customDates     = result?._custom_dates || [];

  const hasRawFields       = deepAnalysis?.raw_fields && Object.keys(deepAnalysis.raw_fields).length > 0;
  const hasAnomalies       = deepAnalysis?.anomalies && deepAnalysis.anomalies.length > 0;
  const hasDeadlines       = deepAnalysis?.deadlines && deepAnalysis.deadlines.length > 0;
  const hasPaymentSchedule = paymentSchedule?.schedule && paymentSchedule.schedule.length > 0;

  const [triggerDates, setTriggerDates] = useState({});
  const [savingIdx, setSavingIdx] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [newCustomDate, setNewCustomDate] = useState("");
  const [newCustomDesc, setNewCustomDesc] = useState("");
  const [savingCustomDate, setSavingCustomDate] = useState(false);
  const [extractionMode, setExtractionMode] = useState('primary'); 
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    if (!scrollToField || !result) return;
    const elId = (scrollToField.startsWith('deadline_') || scrollToField.startsWith('custom_'))
      ? scrollToField
      : `field-row-${scrollToField}`;
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
    } catch (e) {
      console.error("Failed to save deadline:", e);
      alert("Failed to save deadline. Please check connection.");
    } finally {
      setSavingIdx(null);
    }
  };

  const handleSaveCustomDate = async () => {
    if (!newCustomDate || !newCustomDesc.trim() || !onAddCustomDate) return;
    setSavingCustomDate(true);
    try {
      await onAddCustomDate(dbId, newCustomDate, newCustomDesc.trim());
      setNewCustomDate("");
      setNewCustomDesc("");
    } catch (e) {
      console.error("Failed to save custom date:", e);
    } finally {
      setSavingCustomDate(false);
    }
  };

  const runPipeline = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPipelineProgress(5);
    setPipelineStatus("Initializing Pipeline...");
    setLocalError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('extraction_mode', extractionMode);

      const res = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.cached && !data.needs_deep_upgrade) {
        if (loadPastPO && data.db_id) loadPastPO(data.db_id);
        return;
      }

      const taskId = data.task_id;
      const interval = setInterval(async () => {
        const statusRes = await fetch(`http://localhost:8000/api/upload-status/${taskId}`);
        const statusData = await statusRes.json();

        setPipelineStatus(statusData.status);
        setPipelineProgress(statusData.progress);

        if (statusData.progress >= 100 || statusData.progress === -1) {
            clearInterval(interval);
            setIsProcessing(false);
            if (statusData.progress === 100) {
               if (loadPastPO && statusData.db_id) loadPastPO(statusData.db_id); 
            } else {
               setLocalError(statusData.status);
            }
        }
      }, 800);

    } catch (err) {
      console.error(err);
      setPipelineStatus("Error occurred connecting to server.");
      setLocalError("Error occurred connecting to server.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {!result ? (
        <div onClick={() => !isProcessing && fileInputRef.current.click()} className={`group relative overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] backdrop-blur-xl px-10 py-24 text-center transition-all duration-300 ${!isProcessing ? 'cursor-pointer hover:border-indigo-500/40 hover:bg-white/[0.02]' : ''}`} style={{ borderRadius: 24 }}>
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileSelection(e.target.files[0])} />
          <div className="relative max-w-lg mx-auto">
            {!isProcessing ? (
              <>
                <UploadCloud size={48} className="mx-auto mb-6 text-indigo-400" />
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-white">{file ? file.name : "Upload Purchase Order"}</h3>

                {file && (
                  <div onClick={(e) => e.stopPropagation()} className="mt-8 flex flex-col items-center gap-6">
                    <div className="flex w-full gap-4">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setExtractionMode('primary'); }} style={{ flex: 1, borderRadius: 16, padding: '16px', textAlign: 'left', cursor: 'pointer', background: extractionMode === 'primary' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${extractionMode === 'primary' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s', boxShadow: extractionMode === 'primary' ? '0 4px 20px rgba(99,102,241,0.15)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><FileText size={16} color={extractionMode === 'primary' ? '#818cf8' : '#71717a'} /><span style={{ fontSize: 13, fontWeight: 700, color: extractionMode === 'primary' ? '#e0e7ff' : '#a1a1aa' }}>Primary Fields</span></div>
                        <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.5 }}>Extracts 10 core fields. Fast & cost-effective. <br /> Estimated time: 30s</div>
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setExtractionMode('deep'); }} style={{ flex: 1, borderRadius: 16, padding: '16px', textAlign: 'left', cursor: 'pointer', background: extractionMode === 'deep' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${extractionMode === 'deep' ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s', boxShadow: extractionMode === 'deep' ? '0 4px 20px rgba(168,85,247,0.15)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Sparkles size={16} color={extractionMode === 'deep' ? '#c084fc' : '#71717a'} /><span style={{ fontSize: 13, fontWeight: 700, color: extractionMode === 'deep' ? '#f3e8ff' : '#a1a1aa' }}>Deep Analysis</span></div>
                        <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.5 }}>Adds deadlines, anomaly detection & PO-specific fields. <br/>Estimated time: 90s</div>
                      </button>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); runPipeline(); }} className="mac-btn-primary w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40"><Zap size={18} /> Start AI Pipeline</button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8">
                <RefreshCw size={36} className="mx-auto mb-6 text-indigo-400 animate-spin" />
                <h3 className="mb-6 text-xl font-bold tracking-tight text-white">Processing Document...</h3>
                <div className="w-full bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-300">{pipelineStatus}</span>
                    <span className="text-sm font-bold text-indigo-400">{pipelineProgress}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out" style={{ width: `${pipelineProgress}%` }} />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                    <span className={pipelineProgress >= 10 ? "text-indigo-400" : ""}>Chunking</span>
                    <span className={pipelineProgress >= 30 ? "text-purple-400" : ""}>Gemini & Groq</span>
                    <span className={pipelineProgress >= 75 ? "text-pink-400" : ""}>Deep Learning</span>
                  </div>
                </div>
              </div>
            )}
            {(localError || error) && <div className="mt-6 text-red-400 text-sm font-medium p-3 bg-red-500/10 rounded-lg border border-red-500/20">{localError || error}</div>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ alignItems: 'start' }}>

          {/* ── DOCUMENT IDENTITY HEADER ── */}
          <div className="xl:col-span-2 mb-4">
            <EditablePOHeader dbId={dbId} value={result._po_name || file?.name} onUpdate={onUpdate} />
            <EditableDescription dbId={dbId} value={result._description || ""} onUpdate={onUpdate} />
            <ProjectSelector dbId={dbId} currentProjectId={result._project_id} projects={projects} onUpdate={onUpdate} onCreateProject={onCreateProject} />
          </div>

          {/* ── STATUS TOGGLE & HISTORY ── */}
          <div className="xl:col-span-2 flex justify-between items-center bg-white/[0.02] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Current Status</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentStatus === 'Closed' ? 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {currentStatus === 'Closed' ? <Lock size={12} /> : <Unlock size={12} />}
                    {currentStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
               {currentStatus === 'Closed' ? (
                 <button onClick={() => onStatusChange(dbId, 'Open')} className="mac-btn-secondary flex items-center gap-2 text-xs py-1.5 px-3">
                   <Unlock size={14} /> Reopen PO
                 </button>
               ) : (
                 <button onClick={() => onStatusChange(dbId, 'Closed')} className="mac-btn-secondary flex items-center gap-2 text-xs py-1.5 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50">
                   <Lock size={14} /> Close PO
                 </button>
               )}
            </div>
          </div>

          {/* ── ACTION HISTORY & NOTES ── */}
          <div className="xl:col-span-2">
            <Card title="PO Action History & Notes" icon={<History size={13} className="text-blue-400"/>}>
              <div className="p-5 flex flex-col gap-5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a manual note or update log..."
                    className="mac-glass-input flex-1"
                    style={{ minHeight: 42, padding: '0 16px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && noteInput.trim()) {
                        onAddNote(dbId, noteInput.trim());
                        setNoteInput("");
                      }
                    }}
                  />
                  <button
                    onClick={() => { if (noteInput.trim()) { onAddNote(dbId, noteInput.trim()); setNoteInput(""); } }}
                    disabled={!noteInput.trim()}
                    className="mac-btn-primary flex items-center gap-2 px-5 disabled:opacity-50"
                  >
                    <Send size={15} /> Save Note
                  </button>
                </div>
                <div className="flex flex-col gap-0 border-l-2 border-white/5 ml-4 mt-2 pl-6 relative">
                  {actionsHistory.length > 0 ? (
                    <>
                      <div className="relative pb-6 last:pb-0">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-400" />
                        <div className="text-[14px] text-white-500 font-mono mb-1">
                          {new Date(actionsHistory[0].timestamp + (actionsHistory[0].timestamp.endsWith('Z') ? '' : 'Z')).toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">{actionsHistory[0].action_type}</span>
                        </div>
                        <div className="text-sm text-zinc-200 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">{actionsHistory[0].description}</div>
                      </div>
                      {actionsHistory.length > 1 && (
                        <button onClick={() => setIsHistoryExpanded(!isHistoryExpanded)} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold mb-4 transition-colors bg-transparent border-none cursor-pointer p-0" style={{ outline: 'none' }}>
                          {isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isHistoryExpanded ? "Collapse history" : `View ${actionsHistory.length - 1} earlier actions`}
                        </button>
                      )}
                      {isHistoryExpanded && actionsHistory.slice(1).map((act, i) => (
                        <div key={i} className="relative pb-6 last:pb-0">
                          <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-400 opacity-50" />
                          <div className="text-[10px] text-zinc-500 font-mono mb-1">{new Date(act.timestamp + (act.timestamp.endsWith('Z') ? '' : 'Z')).toLocaleString('en-IN')}</div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10 opacity-80">{act.action_type}</span>
                          </div>
                          <div className="text-sm text-zinc-400 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/[0.03]">{act.description}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-sm text-zinc-500 italic pb-2">No actions recorded yet.</div>
                  )}
                </div>
              </div>
            </Card>
          </div>

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

          {/* ── FEATURE 3: CUSTOM CALENDAR DATES ── */}
          <div className="xl:col-span-2">
            <Card title="Custom Dates" icon={<Star size={13} className="text-yellow-400"/>}>
              <div className="p-4 flex flex-col gap-3">

                {/* Add new custom date */}
                <div className="flex gap-3 items-end p-3 rounded-xl bg-white/[0.01] border border-white/[0.05]">
                  <div className="flex flex-col gap-1" style={{ width: 160 }}>
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Date</label>
                    <input
                      type="date"
                      value={newCustomDate}
                      onChange={(e) => setNewCustomDate(e.target.value)}
                      className="mac-glass-input"
                      style={{ colorScheme: 'dark', padding: '6px 10px', fontSize: 12, minHeight: 'unset' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Description</label>
                    <input
                      type="text"
                      value={newCustomDesc}
                      onChange={(e) => setNewCustomDesc(e.target.value)}
                      placeholder="e.g. Follow up call with vendor"
                      className="mac-glass-input"
                      style={{ padding: '6px 10px', fontSize: 12, minHeight: 'unset' }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCustomDate(); }}
                    />
                  </div>
                  <button
                    onClick={handleSaveCustomDate}
                    disabled={!newCustomDate || !newCustomDesc.trim() || savingCustomDate}
                    className="mac-btn-primary flex items-center gap-1.5 px-4 disabled:opacity-50"
                    style={{ minHeight: 34, fontSize: 12 }}
                  >
                    {savingCustomDate ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                    Add
                  </button>
                </div>

                {/* List of existing custom dates */}
                {customDates.length > 0 ? (
                  customDates
                    .slice()
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((cd) => (
                      <div
                        key={cd.id}
                        id={`custom_${cd.id}`}
                        className="rounded-xl border p-3.5 flex items-center gap-3"
                        style={{ borderColor: 'rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)' }}
                      >
                        <Star size={15} style={{ color: '#d4af37', flexShrink: 0 }} />
                        <div className="text-xs font-mono px-2 py-1 rounded-md" style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>
                          {cd.date}
                        </div>
                        <div className="text-sm text-zinc-200 flex-1">{cd.description}</div>
                        <button
                          onClick={() => onDeleteCustomDate && onDeleteCustomDate(dbId, cd.id)}
                          title="Remove custom date"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', cursor: 'pointer', flexShrink: 0
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-zinc-500 italic px-1">No custom dates added yet. These are dates you want to track that aren't extracted by the pipeline — they'll also show up on the calendar in gold.</div>
                )}
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
                    const calculatedResult = offset ? addTime(baseDateInput, offset) : (baseDateInput || null);

                    return (
                      <div key={i} id={`deadline_${i}`} className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-zinc-200 text-sm">{dl.label}</div>

                          {!isNull && !isEditing ? (
                            <div className="flex items-center gap-2">
                              {dl.trigger_date && (
                                <span className="text-[10px] text-zinc-500" title="Trigger date used to calculate this">
                                  from {dl.trigger_date}
                                </span>
                              )}
                              <div className="text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]">
                                {dl.computed_date}
                              </div>
                              <button
                                onClick={() => setTriggerDates(prev => ({...prev, [i + "_edit"]: true}))}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', cursor: 'pointer' }}
                                title="Edit Date"
                              >
                                <Edit2 size={12} />
                              </button>
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
          {hasPaymentSchedule && (
            <div className="xl:col-span-2">
              <Card title="Payment Schedule" icon={<DollarSign size={13} className="text-emerald-400"/>}>
                {paymentSchedule.payment_summary && (
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                    {paymentSchedule.payment_summary}
                  </div>
                )}
                <div className="p-4 flex flex-col gap-3">
                  {paymentSchedule.schedule.map((item, i) => {
                    const TYPE_COLORS = {
                      RECURRING: '#6366f1', MILESTONE: '#f59e0b',
                      ONE_TIME: '#3b82f6', RETENTION: '#d946ef', PBG: '#8b5cf6'
                    };
                    const badgeColor = TYPE_COLORS[item.payment_type] || '#6b7280';
                    return (
                      <div key={i} id={`payment_${i}`} className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-zinc-200 text-sm">{item.label}</div>
                          <div className="flex items-center gap-2">
                            {item.computed_start_date && (
                              <div className="text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {item.computed_start_date}
                              </div>
                            )}
                            {item.source_clause && (
                              <button
                                onClick={() => setActiveSource({ label: item.label, quote: item.source_clause, page: item.source_page, locate: true })}
                                title="View Source"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)', color: '#4F8CFF', cursor: 'pointer'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                              >
                                <Hash size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 4, background: `${badgeColor}22`, color: badgeColor, border: `1px solid ${badgeColor}44` }}>
                            {item.payment_type}
                          </span>
                          {item.frequency && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                              {item.frequency}{item.total_instalments ? ` × ${item.total_instalments}` : ''}
                            </span>
                          )}
                          {item.amount_pct != null && (
                            <span className="text-xs font-mono text-zinc-300">{item.amount_pct}%</span>
                          )}
                          {item.amount_per_instalment_inr != null && (
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              ₹{Number(item.amount_per_instalment_inr).toLocaleString('en-IN', { maximumFractionDigits: 0 })} / instalment
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <span className="uppercase tracking-wider text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-bold">
                            {item.trigger_type}
                          </span>
                          {item.trigger_description}
                          {item.anchor_required && !item.computed_start_date && (
                            <span className="ml-1 text-[9px] font-bold uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Anchor Required: {item.anchor_required}
                            </span>
                          )}
                        </div>
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
      )}
    </div>
  );
};
export default ExtractionView;