import { useState, useEffect } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parseAiDate, getDaysLeft, getDeadlineColor } from '../utils/helpers.js';

// ── FEATURE 2: PREMIUM WEEK VIEW UI ─────────────────────────────
const CALENDAR_CUSTOM_CSS = `
  /* Month View Fixes */
  .rbc-month-view { min-height: 600px; border: none !important; }
  .rbc-month-row { overflow: visible; min-height: 90px; }
  .rbc-row-content { overflow: visible; }
  .rbc-event { overflow: visible; }

  /* --- 🔥 PREMIUM WEEK VIEW FIXES --- */
  .rbc-time-view {
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    background: rgba(10, 10, 12, 0.6) !important;
    overflow: hidden;
  }
  
  /* The Top Header Area (Where our All-Day deadlines sit) */
  .rbc-allday-cell {
    background: rgba(255, 255, 255, 0.02) !important;
    min-height: 120px !important; /* Gives deadlines a lot of room to breathe */
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  
  /* Day Column Headers */
  .rbc-time-header {
    background: rgba(0, 0, 0, 0.2);
  }
  .rbc-time-header.rbc-overflowing {
    border-right: none !important;
  }
  .rbc-header {
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    font-size: 13px !important;
    padding: 12px 0 !important;
    color: #a1a1aa !important;
    font-weight: 600 !important;
  }
  .rbc-time-header-content {
    border-left: 1px solid rgba(255,255,255,0.03) !important;
  }

  /* Clean up the Empty Time Grid Below */
  .rbc-time-content {
    border-top: none !important;
  }
  .rbc-timeslot-group {
    border-bottom: 1px solid rgba(255, 255, 255, 0.02) !important;
    min-height: 60px !important; /* Taller, cleaner rows */
  }
  .rbc-day-slot .rbc-time-slot {
    border-top: none !important; /* Removes the confusing mid-hour dashed lines */
  }
  .rbc-time-column {
    border-right: 1px solid rgba(255, 255, 255, 0.03) !important;
  }
  .rbc-time-gutter .rbc-time-slot {
    color: rgba(255, 255, 255, 0.3) !important;
    font-size: 11px !important;
    font-weight: 500;
    padding-right: 12px !important;
  }

  /* Today Highlight Setup */
  .rbc-day-bg.rbc-today {
    background: rgba(123, 97, 255, 0.03) !important;
  }
  .rbc-time-header-cell.rbc-today .rbc-header {
    color: #ffffff !important;
    background: rgba(123, 97, 255, 0.15) !important;
    border-bottom: 2px solid #7B61FF !important;
  }
  
  /* Make week view events look like 3D floating cards */
  .rbc-time-view .rbc-event {
    border-radius: 8px !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    margin: 2px 4px !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .rbc-time-view .rbc-event:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 20px rgba(0,0,0,0.5) !important;
    z-index: 10 !important;
    filter: brightness(1.1);
  }
`;

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// ── FEATURE 1: CATEGORY COLOR CODING ───────────────────────────────────────
const SOURCE_COLORS = {
  lapse_expiry_date: null,   // Controlled by Urgency (Red/Amber/Green)
  effective_date: '#2563eb', // Blue
  payment: '#8b5cf6',        // Purple (Payment milestones)
  delivery: '#06b6d4',       // Cyan/Teal (Delivery/Dispatch dates)
  warranty: '#d946ef',       // Pink/Magenta (Warranty/DLP periods)
  deadline: '#6366f1',       // Indigo (General deadlines fallback)
  custom: '#d4af37',         // 🌟 Gold — user-added custom dates
};

const GOLD = '#d4af37';

const CalendarView = ({ onSelectEvent, poList = [], onAddCustomDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [rawEvents, setRawEvents] = useState([]);

  // ── FEATURE 3: CUSTOM DATE MODAL STATE ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [selectedPoId, setSelectedPoId] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEvents = () => {
    fetch('http://localhost:8000/api/calendar-events')
      .then(res => res.json())
      .then(data => setRawEvents(Array.isArray(data) ? data : []))
      .catch(() => setRawEvents([]));
  };

  useEffect(() => { loadEvents(); }, []);

  const openModalForDate = (date) => {
    setModalDate(date);
    setSelectedPoId('');
    setDescription('');
    setModalOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
    openModalForDate(slotInfo.start);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalDate(null);
    setSelectedPoId('');
    setDescription('');
  };

  const handleSaveCustomDate = async () => {
    if (!selectedPoId || !description.trim() || !modalDate || !onAddCustomDate) return;
    setSaving(true);
    const dateStr = format(modalDate, 'yyyy-MM-dd');
    const ok = await onAddCustomDate(selectedPoId, dateStr, description.trim());
    setSaving(false);
    if (ok !== false) {
      closeModal();
      loadEvents();
    }
  };

  const events = rawEvents.map((e, i) => {
    const parsedDate = parseAiDate(e.date);
    if (!parsedDate) return null;
    return {
      id: i,
      poId: e.po_id,
      fieldKey: e.field_key,
      source: e.source,
      title: e.label,
      start: parsedDate,
      end: parsedDate,
      allDay: true, // Deadlines render in the top All-Day header
    };
  }).filter(Boolean);

  const eventStyleGetter = (event) => {
    const isCustom = event.source === 'custom';
    const backgroundColor = event.source === 'lapse_expiry_date'
      ? getDeadlineColor(getDaysLeft(event.start))
      : (SOURCE_COLORS[event.source] || '#6b7280');
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: isCustom ? '#1a1400' : '#fff',
        border: isCustom ? '1px solid rgba(255,255,255,0.5)' : 'none',
        display: 'block',
        padding: '4px 8px',
        fontSize: '11.5px',
        fontWeight: isCustom ? 700 : 600,
        boxShadow: isCustom
          ? '0 0 0 1px rgba(212,175,55,0.5), 0 2px 8px rgba(212,175,55,0.35)'
          : '0 2px 6px rgba(0,0,0,0.3)'
      }
    };
  };

  return (
    <div
      className="h-full rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm ring-1 ring-white/5 animate-in fade-in duration-300"
      style={{ height: '100%', minHeight: '650px', display: 'flex', flexDirection: 'column' }}
    >
      <style>{CALENDAR_CUSTOM_CSS}</style>

      {/* ── VISUAL LEGEND ── */}
      <div className="flex flex-wrap items-center gap-5 mb-4 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300">
           <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> Urgent Expiry
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300">
           <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: SOURCE_COLORS.effective_date}}></span> Effective Dates
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300">
           <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: SOURCE_COLORS.payment}}></span> Payments
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300">
           <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: SOURCE_COLORS.delivery}}></span> Deliveries
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300">
           <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: SOURCE_COLORS.warranty}}></span> Warranty
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300">
           <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: GOLD, boxShadow: '0 0 8px rgba(212,175,55,0.6)'}}></span> Custom Date
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-500 italic">
          <CalendarPlus size={13} /> Click any date to add a custom reminder
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', color: '#e5e5e5' }}
          views={['month', 'week', 'agenda']}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView}
          onView={(newView) => setCurrentView(newView)}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => onSelectEvent(event.poId, event.fieldKey)}
          selectable
          onSelectSlot={handleSelectSlot}
          step={60}
          timeslots={1}
        />
      </div>

      {/* ── FEATURE 3: ADD CUSTOM DATE MODAL ── */}
      {modalOpen && (
        <>
          <div
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 70, width: 380,
            background: 'linear-gradient(135deg, #18181b 0%, #131316 100%)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 16, padding: 22,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarPlus size={16} color={GOLD} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e5e5e5' }}>
                  Add Custom Date
                </h3>
              </div>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 16 }}>
              {modalDate ? format(modalDate, 'EEEE, MMMM d, yyyy') : ''}
            </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#737373' }}>
                Purchase Order
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '9px 10px',
                  fontSize: 13,
                  color: '#e5e5e5',
                  colorScheme: 'dark',
                }}
              >
                <option value="" style={{ background: '#1a1a1a', color: '#e5e5e5' }}>
                  Select a PO…
                </option>
                {poList.map(po => (
                  <option
                    key={po.id}
                    value={po.id}
                    style={{ background: '#1a1a1a', color: '#e5e5e5' }}
                  >
                    {po.po_name || 'Untitled PO'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#737373' }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Follow up call with vendor"
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '9px 10px', fontSize: 13, color: '#e5e5e5',
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCustomDate(); }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomDate}
                disabled={!selectedPoId || !description.trim() || saving}
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                  background: GOLD, border: 'none', color: '#1a1400', cursor: 'pointer',
                  opacity: (!selectedPoId || !description.trim() || saving) ? 0.5 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save Date'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarView;