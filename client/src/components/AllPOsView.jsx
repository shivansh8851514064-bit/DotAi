import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Search, AlertTriangle, CheckCircle, Clock,
  ChevronRight, ChevronDown, ExternalLink, Filter, X, Calendar,
  FolderKanban, Plus, Pencil, Check, Tag
} from 'lucide-react';
import { parseAiDate, getDaysLeft, getDeadlineColor } from '../utils/helpers.js';

// ── Project tag colors ────────────────────────────────────────────────────────
// Deterministic per project id, so the same project always renders the same
// color anywhere in the app (sidebar, calendar, this list).
const PROJECT_TAG_PALETTE = [
  { bg: 'rgba(99,102,241,0.16)',  border: 'rgba(99,102,241,0.35)',  text: '#a5b4fc' },
  { bg: 'rgba(16,185,129,0.16)',  border: 'rgba(16,185,129,0.35)',  text: '#6ee7b7' },
  { bg: 'rgba(236,72,153,0.16)',  border: 'rgba(236,72,153,0.35)',  text: '#f9a8d4' },
  { bg: 'rgba(245,158,11,0.16)',  border: 'rgba(245,158,11,0.35)',  text: '#fcd34d' },
  { bg: 'rgba(6,182,212,0.16)',   border: 'rgba(6,182,212,0.35)',   text: '#67e8f9' },
  { bg: 'rgba(217,70,239,0.16)',  border: 'rgba(217,70,239,0.35)',  text: '#e879f9' },
];

const projectTagStyle = (projectId) => {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) hash = (hash * 31 + projectId.charCodeAt(i)) >>> 0;
  return PROJECT_TAG_PALETTE[hash % PROJECT_TAG_PALETTE.length];
};

const ProjectTag = ({ project }) => {
  if (!project) return null;
  const c = projectTagStyle(project.id);
  return (
    <span
      title={project.name}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.02em',
        padding: '2px 8px', borderRadius: 99,
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      }}
    >
      <Tag size={9} />
      {project.name}
    </span>
  );
};

// ── Project management panel ──────────────────────────────────────────────────
const ProjectManager = ({ projects, onCreateProject, onDeleteProject, onRenameProject, poCountByProject }) => {
  const [open, setOpen]           = useState(false);
  const [newName, setNewName]     = useState('');
  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed || !onCreateProject) return;
    setCreating(true);
    await onCreateProject(trimmed);
    setCreating(false);
    setNewName('');
  };

  const startEdit = (p) => { setEditingId(p.id); setEditName(p.name); };
  const cancelEdit = () => { setEditingId(null); setEditName(''); };
  const saveEdit = async (id) => {
    const trimmed = editName.trim();
    if (!trimmed || !onRenameProject) return cancelEdit();
    await onRenameProject(id, trimmed);
    cancelEdit();
  };

  return (
    <div className="mac-glass-card" style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <FolderKanban size={15} color="#a78bfa" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Projects</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>({projects.length})</span>
        </div>
        {open ? <ChevronDown size={15} color="rgba(255,255,255,0.4)" /> : <ChevronRight size={15} color="rgba(255,255,255,0.4)" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>

              {projects.length === 0 && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', padding: '8px 0' }}>
                  No projects yet — create one below to start tagging POs.
                </div>
              )}

              {projects.map(p => {
                const c = projectTagStyle(p.id);
                const isEditing = editingId === p.id;
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(p.id); if (e.key === 'Escape') cancelEdit(); }}
                        className="mac-glass-input"
                        style={{ flex: 1, padding: '4px 8px', fontSize: 12.5, height: 28 }}
                      />
                    ) : (
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: '#e5e5e5' }}>
                        {p.name}
                        <span style={{ marginLeft: 8, fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                          {poCountByProject[p.id] || 0} PO{(poCountByProject[p.id] || 0) === 1 ? '' : 's'}
                        </span>
                      </span>
                    )}

                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(p.id)} title="Save" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34d399', padding: 4 }}><Check size={14} /></button>
                        <button onClick={cancelEdit} title="Cancel" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)} title="Rename" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDeleteProject && onDeleteProject(p.id)} title="Delete project" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                  placeholder="New project name…"
                  className="mac-glass-input"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 12.5, height: 32 }}
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="mac-btn-primary"
                  style={{ padding: '0 14px', height: 32, borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, opacity: (creating || !newName.trim()) ? 0.5 : 1 }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Status pill (expiry-based) ────────────────────────────────────────────────
const ExpiryPill = ({ status, daysLeft, hasDate }) => {
  if (status === 'Closed') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
        <CheckCircle size={10} /> Closed
      </span>
    );
  }
  if (!hasDate) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
        <Clock size={10} /> No expiry
      </span>
    );
  }
  const isExpired = daysLeft < 0;
  const isUrgent  = daysLeft >= 0 && daysLeft <= 30;
  const color  = getDeadlineColor(daysLeft);
  const bg     = isExpired ? 'rgba(239,68,68,0.1)' : isUrgent ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
  const border = isExpired ? 'rgba(239,68,68,0.2)' : isUrgent ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)';
  const Icon   = isExpired ? AlertTriangle : isUrgent ? Clock : CheckCircle;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, background: bg, color, padding: '3px 10px', borderRadius: 99, fontWeight: 700, border: `1px solid ${border}` }}>
      <Icon size={10} />
      {isExpired ? `Expired ${Math.abs(daysLeft)}d` : `${daysLeft}d left`}
    </span>
  );
};

// ── Inline action history panel ───────────────────────────────────────────────
const ACTION_ICONS = {
  UPLOAD: '📤', AI_EXTRACTION: '🤖', AI_EXTRACTION_UPGRADE: '⚡',
  MANUAL_EDIT: '✍️', NOTE: '💬', STATUS_CHANGE: '🔄',
  CUSTOM_FIELD_ADDED: '✨', CUSTOM_FIELD_UPDATED: '🔁', FIELD_DELETED: '🗑️',
  Uploaded: '📤',
};

const InlineHistory = ({ actions }) => {
  if (!actions || actions.length === 0) {
    return (
      <div style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontStyle: 'italic' }}>
        No action history recorded for this PO.
      </div>
    );
  }
  return (
    <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
        Action History — {actions.length} event{actions.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
        {[...actions].reverse().map((act, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>{ACTION_ICONS[act.action_type] || '📋'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5' }}>{act.description}</div>
              {act.reason && (
                <div style={{ fontSize: 11, color: 'rgba(251,191,36,0.8)', fontStyle: 'italic', marginTop: 2 }}>
                  Reason: {act.reason}
                </div>
              )}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                {new Date(act.timestamp + (act.timestamp?.endsWith('Z') ? '' : 'Z')).toLocaleString('en-IN')}
                {act.field && <span style={{ marginLeft: 6, color: 'rgba(123,97,255,0.7)' }}>· {act.field}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'complete', label: 'Complete' },
  { id: 'missing',  label: 'Missing Fields' },
  { id: 'closed',   label: 'Closed' },
];

const AllPOsView = ({
  history, projects = [], onLoadPO, onDeletePO,
  onCreateProject, onDeleteProject, onRenameProject, onAssignProject,
}) => {
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [projectFilter,  setProjectFilter]  = useState('all'); // 'all' | 'none' | project id
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [expandedId,     setExpandedId]     = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [assigningId,    setAssigningId]    = useState(null); // po id currently showing the project dropdown

  const projectsById = useMemo(
    () => Object.fromEntries(projects.map(p => [p.id, p])),
    [projects]
  );

  const poCountByProject = useMemo(() => {
    const counts = {};
    history.forEach(po => {
      if (po.project_id) counts[po.project_id] = (counts[po.project_id] || 0) + 1;
    });
    return counts;
  }, [history]);

  // Enrich
  const enriched = history.map(po => {
    const parsedDate = parseAiDate(po.lapse_expiry_date, po.effective_date);
    const daysLeft   = parsedDate ? getDaysLeft(parsedDate) : null;
    return { ...po, parsedDate, daysLeft, hasDate: parsedDate !== null };
  });

  const sorted = [...enriched].sort((a, b) => b.id - a.id);

  // Apply all filters together
  const filtered = sorted.filter(po => {
    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (po.po_name     || '').toLowerCase().includes(q) ||
        (po.description || '').toLowerCase().includes(q) ||
        (po.po_number   || '').toLowerCase().includes(q) ||
        (po.vendor_name || '').toLowerCase().includes(q) ||
        (po.filename    || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter === 'complete'  && po.has_missing_fields)              return false;
    if (statusFilter === 'missing'   && !po.has_missing_fields)             return false;
    if (statusFilter === 'closed'    && po.status !== 'Closed')             return false;

    // Project filter
    if (projectFilter === 'none' && po.project_id)                          return false;
    if (projectFilter !== 'all' && projectFilter !== 'none' && po.project_id !== projectFilter) return false;

    // Date range — checks both effective_date and lapse_expiry_date
    if (dateFrom || dateTo) {
      const dates = [po.effective_date, po.lapse_expiry_date]
        .filter(Boolean)
        .map(d => parseAiDate(d, null))
        .filter(Boolean);
      if (dates.length === 0) return false;
      if (dateFrom && !dates.some(d => d >= new Date(dateFrom))) return false;
      if (dateTo   && !dates.some(d => d <= new Date(dateTo + 'T23:59:59'))) return false;
    }

    return true;
  });

  const hasActiveFilters = search || statusFilter !== 'all' || projectFilter !== 'all' || dateFrom || dateTo;

  const clearAllFilters = () => {
    setSearch(''); setStatusFilter('all'); setProjectFilter('all'); setDateFrom(''); setDateTo('');
  };

  const handleDeleteClick = (id, e) => { e.stopPropagation(); setConfirmDeleteId(id); };
  const confirmDelete = (e) => {
    e.stopPropagation();
    onDeletePO(confirmDeleteId, { stopPropagation: () => {} });
    setConfirmDeleteId(null);
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleAssignChange = async (poId, value, e) => {
    if (e) e.stopPropagation();
    if (value === '__new__') {
      const name = window.prompt('New project name:');
      if (!name || !name.trim()) { setAssigningId(null); return; }
      const newId = onCreateProject && await onCreateProject(name.trim());
      if (newId && onAssignProject) await onAssignProject(poId, newId);
    } else if (onAssignProject) {
      await onAssignProject(poId, value);
    }
    setAssigningId(null);
  };

  // Stats
  const totalCount   = history.length;
  const expiredCount = enriched.filter(p => p.hasDate && p.daysLeft < 0).length;
  const urgentCount  = enriched.filter(p => p.hasDate && p.daysLeft >= 0 && p.daysLeft <= 30).length;
  const missingCount = enriched.filter(p => p.has_missing_fields).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total POs',      value: totalCount,   color: '#7B61FF' },
          { label: 'Expired',        value: expiredCount, color: '#EF4444' },
          { label: 'Urgent (≤30d)',  value: urgentCount,  color: '#F59E0B' },
          { label: 'Missing Fields', value: missingCount, color: 'rgba(255,255,255,0.45)' },
        ].map(s => (
          <div key={s.label} className="mac-glass-card" style={{ padding: '14px 18px', borderLeft: `3px solid ${s.color}`, borderRadius: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Project management ── */}
      <ProjectManager
        projects={projects}
        onCreateProject={onCreateProject}
        onDeleteProject={onDeleteProject}
        onRenameProject={onRenameProject}
        poCountByProject={poCountByProject}
      />

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Row 1: search + clear */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by PO name, description, or vendor…"
              className="mac-glass-input"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 36, height: 40 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            )}
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Row 2: status chips + date range */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status pills */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4 }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '4px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: statusFilter === f.id ? 'rgba(123,97,255,0.25)' : 'transparent',
                  color: statusFilter === f.id ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.15s',
                }}
              >{f.label}</button>
            ))}
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <Calendar size={13} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="mac-glass-input"
              style={{ padding: '4px 10px', fontSize: 12, colorScheme: 'dark', height: 34, width: 140 }}
              title="Effective/expiry date from"
            />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="mac-glass-input"
              style={{ padding: '4px 10px', fontSize: 12, colorScheme: 'dark', height: 34, width: 140 }}
              title="Effective/expiry date to"
            />
          </div>
        </div>

        {/* Row 3: project chips */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', marginRight: 2 }}>
              Project
            </span>
            <button
              onClick={() => setProjectFilter('all')}
              style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                background: projectFilter === 'all' ? 'rgba(123,97,255,0.2)' : 'rgba(255,255,255,0.03)',
                color: projectFilter === 'all' ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${projectFilter === 'all' ? 'rgba(123,97,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >All</button>
            {projects.map(p => {
              const c = projectTagStyle(p.id);
              const active = projectFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setProjectFilter(p.id)}
                  style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                    background: active ? c.bg : 'rgba(255,255,255,0.03)',
                    color: active ? c.text : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.08)'}`,
                  }}
                >{p.name}</button>
              );
            })}
            <button
              onClick={() => setProjectFilter('none')}
              style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                background: projectFilter === 'none' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                color: projectFilter === 'none' ? '#e5e5e5' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${projectFilter === 'none' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >Unassigned</button>
          </div>
        )}
      </div>

      {/* Result count */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, color: filtered.length > 0 ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontSize: 14 }}>{filtered.length}</span>
        <span>of {totalCount} PO{totalCount !== 1 ? 's' : ''} match{filtered.length === 1 ? 'es' : ''}</span>
        {hasActiveFilters && <span style={{ color: 'rgba(255,255,255,0.25)' }}>· filters active</span>}
      </div>

      {/* Table */}
      <div className="mac-glass-card" style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20 }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 28px 1.5fr 0.9fr 1.1fr 1.1fr 1.1fr 70px', padding: '12px 20px', gap: 12, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['', '', 'PO Name', 'Project', 'Effective Date', 'Expiry Date', 'Status', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>{h}</div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <Filter size={28} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              {hasActiveFilters ? 'No POs match the current filters' : 'No purchase orders uploaded yet'}
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} style={{ marginTop: 12, fontSize: 12, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear all filters</button>
            )}
          </div>
        )}

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((po, idx) => {
            const isDeleting = confirmDeleteId === po.id;
            const isExpanded = expandedId === po.id;
            const project = po.project_id ? projectsById[po.project_id] : null;

            return (
              <motion.div
                key={po.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.025 }}
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                {/* Main row */}
                <div
                  onClick={() => !isDeleting && onLoadPO(po.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 28px 1.5fr 0.9fr 1.1fr 1.1fr 1.1fr 70px',
                    padding: '13px 20px', gap: 12, alignItems: 'center',
                    cursor: isDeleting ? 'default' : 'pointer',
                    background: isDeleting ? 'rgba(239,68,68,0.06)' : isExpanded ? 'rgba(123,97,255,0.04)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!isDeleting && !isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { if (!isDeleting && !isExpanded) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Row index */}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontWeight: 700, fontFamily: 'monospace' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Expand chevron */}
                  <button
                    onClick={e => toggleExpand(po.id, e)}
                    title={isExpanded ? 'Collapse history' : 'View action history'}
                    style={{ width: 22, height: 22, borderRadius: 6, background: isExpanded ? 'rgba(123,97,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isExpanded ? 'rgba(123,97,255,0.3)' : 'rgba(255,255,255,0.08)'}`, color: isExpanded ? '#a78bfa' : 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>

                  {/* PO name + description */}
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {po.po_name || <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontWeight: 400 }}>Untitled PO</span>}
                      {po.has_missing_fields && (
                        <AlertTriangle size={10} style={{ color: '#f59e0b', flexShrink: 0 }} title="Some fields missing" />
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {po.description || <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.25)' }}>No description generated</span>}
                    </div>
                  </div>

                  {/* Project tag — click to assign/reassign without opening the PO */}
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ overflow: 'visible', position: 'relative' }}
                  >
                    {assigningId === po.id ? (
                      <select
                        autoFocus
                        value={po.project_id || ''}
                        onChange={e => handleAssignChange(po.id, e.target.value, e)}
                        onBlur={() => setAssigningId(null)}
                        onClick={e => e.stopPropagation()}
                        className="mac-glass-input"
                        style={{ padding: '3px 6px', fontSize: 11.5, height: 28, colorScheme: 'dark', maxWidth: 150 }}
                      >
                        <option value="">Unassigned</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        <option value="__new__">+ New project…</option>
                      </select>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setAssigningId(po.id); }}
                        title={project ? `Reassign project (currently ${project.name})` : 'Assign to a project'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
                      >
                        {project ? <ProjectTag project={project} /> : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                            color: 'rgba(255,255,255,0.35)', border: '1px dashed rgba(255,255,255,0.18)',
                          }}>
                            <Plus size={9} /> Assign
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Effective date */}
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
                    {po.effective_date || <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                  </div>

                  {/* Expiry date */}
                  <div style={{ fontSize: 12, color: po.hasDate ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                    {po.lapse_expiry_date || '—'}
                  </div>

                  {/* Expiry status */}
                  <div>
                    <ExpiryPill daysLeft={po.daysLeft} hasDate={po.hasDate} status={po.status} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                    {isDeleting ? (
                      <>
                        <button onClick={confirmDelete} className="mac-btn-danger" style={{ padding: '3px 8px', fontSize: 11, borderRadius: 7 }}>Yes</button>
                        <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }} className="mac-btn-secondary" style={{ padding: '3px 8px', fontSize: 11, borderRadius: 7 }}>No</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); onLoadPO(po.id); }}
                          title="Open PO"
                          style={{ width: 26, height: 26, borderRadius: 7, background: 'none', border: '1px solid transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,97,255,0.1)'; e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(123,97,255,0.25)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'transparent'; }}
                        ><ExternalLink size={12} /></button>
                        <button
                          onClick={e => handleDeleteClick(po.id, e)}
                          title="Delete"
                          style={{ width: 26, height: 26, borderRadius: 7, background: 'none', border: '1px solid transparent', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor = 'transparent'; }}
                        ><Trash2 size={12} /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expandable history panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <InlineHistory actions={po.actions_history} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllPOsView;