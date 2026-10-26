// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Trash2, ChevronLeft, ChevronRight, UploadCloud } from 'lucide-react';
import { parseAiDate, getDaysLeft, getDeadlineColor } from '../utils/helpers.js';

// A small set of readable accent colors, assigned deterministically per project id
// so a given project always renders with the same tag color across the app.
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

const ProjectTag = ({ project, compact = false }) => {
  if (!project) return null;
  const c = projectTagStyle(project.id);
  return (
    <span
      title={project.name}
      style={{
        display: 'inline-flex', alignItems: 'center',
        maxWidth: compact ? 90 : 130,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontSize: 9.5, fontWeight: 700, letterSpacing: '0.02em',
        padding: '2px 7px', borderRadius: 99,
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      }}
    >
      {project.name}
    </span>
  );
};

// Individual card with hover state and Framer Motion lift
const DeadlineCard = ({ po, project, onLoadPO, onDeletePO }) => {
  const [hovered, setHovered] = useState(false);
  const color = getDeadlineColor(po.daysLeft);
  const isClosed = po.status === 'Closed';
  return (
    <motion.div
      onClick={() => onLoadPO(po.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="mac-glass-card"
      style={{
        padding: '11px 12px 11px 14px', borderRadius: 12,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderLeft: `3px solid ${isClosed ? '#71717a' : color}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: isClosed ? 'rgba(255,255,255,0.5)' : '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: isClosed ? 'line-through' : 'none' }}>
          {po.po_name || 'Untitled PO'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: isClosed ? '#a1a1aa' : color }}>
            {isClosed
              ? 'Closed'
              : (po.daysLeft < 0
                  ? `Expired ${Math.abs(po.daysLeft)}d ago`
                  : `Expires in ${po.daysLeft}d`)}
          </span>
          <ProjectTag project={project} compact />
        </div>
      </div>

      <button
        onClick={e => onDeletePO(po.id, e)}
        title="Delete"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, borderRadius: 6, flexShrink: 0,
          opacity: hovered ? 1 : 0,
          color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none'; }}
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
};

const Sidebar = ({ history, projects = [], onNewUpload, onLoadPO, onDeletePO }) => {
  const [collapsed, setCollapsed] = useState(false);

  const projectsById = React.useMemo(
    () => Object.fromEntries(projects.map(p => [p.id, p])),
    [projects]
  );

  const upcomingDeadlines = history
    .map(po => {
      const parsedDate = parseAiDate(po.lapse_expiry_date, po.effective_date);
      if (!parsedDate) return null;
      const daysLeft = getDaysLeft(parsedDate);
      return { ...po, parsedDate, daysLeft };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const urgentCount = upcomingDeadlines.filter(po => po.daysLeft <= 30).length;

  return (
    <motion.aside
      className="mac-glass-panel"
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
      style={{
        flexShrink: 0, height: '100%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      {/* Header Section */}
      <div style={{ 
        padding: collapsed ? '18px 0 14px' : '18px 16px 14px', 
        display: 'flex', flexDirection: 'column', 
        alignItems: collapsed ? 'center' : 'stretch', 
        flexShrink: 0, gap: 14 
      }}>
        
        {/* Toggle Collapse */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', boxSizing: 'border-box', padding: collapsed ? 0 : '0 4px' }}>
          {!collapsed && (
            <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Clock size={16} className="text-indigo-400" />
              Upcoming Expiries
              {urgentCount > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                }}>
                  {urgentCount > 99 ? '99+' : urgentCount}
                </span>
              )}
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="mac-btn-secondary"
            style={{
              width: 26, height: 26, padding: 0, borderRadius: 8,
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* New PO Action */}
        <button
          onClick={onNewUpload}
          className="mac-btn-primary"
          style={{
            width: collapsed ? 36 : '100%',
            height: collapsed ? 36 : 'auto',
            padding: collapsed ? 0 : '10px 14px',
            borderRadius: collapsed ? 99 : 12,
            fontSize: 13,
            boxSizing: 'border-box'
          }}
          title="New PO Upload"
        >
          <Plus size={16} strokeWidth={2.5} />
          {!collapsed && <span>New PO Upload</span>}
        </button>
      </div>

      {/* Expiry Cards list */}
      <div style={{ 
        flex: 1, overflowY: 'auto', 
        padding: collapsed ? '0 12px 14px' : '0 16px 16px', 
        display: 'flex', flexDirection: 'column', gap: 8 
      }}>
        {upcomingDeadlines.length === 0 ? (
          !collapsed && (
            <div style={{ padding: '36px 12px', textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
                background: 'rgba(123, 97, 255, 0.1)', border: '1px solid rgba(123, 97, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UploadCloud size={20} color="#7B61FF" />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.5 }}>
                No expiries detected
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.35)', marginTop: 5, lineHeight: 1.7 }}>
                Upload a PO, or manually<br />edit the Lapse / Expiry
              </div>
            </div>
          )
        ) : (
          upcomingDeadlines.map(po => {
            const isClosed = po.status === 'Closed';
            const project = po.project_id ? projectsById[po.project_id] : null;
            const tooltip = `${po.po_name || 'Untitled PO'}${project ? ` · ${project.name}` : ''} · ${isClosed ? 'Closed' : (po.daysLeft < 0 ? `Expired ${Math.abs(po.daysLeft)}d ago` : `${po.daysLeft}d left`)}`;
            return collapsed ? (
              <motion.button
                key={po.id}
                onClick={() => onLoadPO(po.id)}
                whileHover={{ scale: 1.25 }}
                title={tooltip}
                style={{
                  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                  background: isClosed ? '#71717a' : getDeadlineColor(po.daysLeft),
                  border: 'none', cursor: 'pointer', padding: 0, margin: '6px auto',
                  boxShadow: `0 0 8px ${isClosed ? 'transparent' : getDeadlineColor(po.daysLeft)}`,
                }}
              />
            ) : (
              <DeadlineCard key={po.id} po={po} project={project} onLoadPO={onLoadPO} onDeletePO={onDeletePO} />
            )
          })
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;