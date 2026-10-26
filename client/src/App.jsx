import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, FileText, LayoutList, UploadCloud } from 'lucide-react';

import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import ExtractionView from './components/ExtractionView';
import SourceSidebar from './components/SourceSidebar';
import AllPOsView from './components/AllPOsView';

const App = () => {
  const [dbId, setDbId] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [history, setHistory] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [scrollToField, setScrollToField] = useState(null);

  const fileInputRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/pos');
      if (res.ok) setHistory(await res.json());
    } catch (err) { console.error("Failed to load history", err); }
  };


  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/projects');
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error("Failed to load projects", err); }
  };

  useEffect(() => { 
    let ignore = false;
    const init = async () => {
      try {
        const [posRes, schemaRes, projRes] = await Promise.all([
          fetch('http://localhost:8000/api/pos'),
          fetch('http://localhost:8000/api/schema'),
          fetch('http://localhost:8000/api/projects')
        ]);
        if (!ignore && posRes.ok) setHistory(await posRes.json());
        if (!ignore && schemaRes.ok) setCustomFields(await schemaRes.json());
        if (!ignore && projRes.ok) setProjects(await projRes.json());
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    init();
    return () => { ignore = true; };
  }, []);

  const handleCreateProject = async (name) => {
    try {
      const res = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newProj = await res.json();
        setProjects(prev => [...prev, newProj]);
        return newProj.id;
      }
    } catch (err) { console.error("Failed to create project", err); }
    return null;
  };

  const handleAssignProjectFromList = async (poId, projectId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${poId}/field`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: '_project_id', value: projectId })
      });
      if (res.ok) {
        setHistory(prev => prev.map(po => po.id === poId ? { ...po, project_id: projectId } : po));
        // Keep the open results page in sync if the same PO is currently loaded
        if (dbId === poId) {
          setResult(prev => prev ? { ...prev, _project_id: projectId } : prev);
        }
      }
      return res.ok;
    } catch (err) {
      console.error("Failed to assign project", err);
      return false;
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? POs assigned to it will lose the tag.")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjects();
        fetchHistory(); // PO project tags may have been cleared server-side
      }
    } catch (err) { console.error("Failed to delete project", err); }
  };

  const handleRenameProject = async (id, name) => {
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === id ? updated : p));
      }
    } catch (err) { console.error("Failed to rename project", err); }
  };

  const loadPastPO = async (id, fieldKey = null) => {
    setLoading(true);
    setResult(null);
    setActiveSource(null);
    setActiveTab('details');
    setScrollToField(null);
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}`);
      const data = await res.json();
      setResult(data.extraction_result.profile);
      setFile({ name: data.filename });
      setDbId(data.db_id);
      fetchHistory();

      if (fieldKey) setScrollToField(fieldKey);
    } catch (err) {
      console.error(err);
      setError("Failed to load PO details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePO = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this document?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        if (dbId === id) {
          setResult(null);
          setFile(null);
          setActiveSource(null);
          setDbId(null);
          setActiveTab('all'); 
        }
      }
    } catch (err) {
      console.error("Network error during deletion:", err);
    }
  };

  const handleFieldUpdate = async (id, field, value, reason = "") => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}/field`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value, reason })
      });
      if (res.ok) {
        setResult(prev => {
          if (field === "_deep_analysis") return { ...prev, _deep_analysis: value };
          if (field === "_po_name") return { ...prev, _po_name: value };
          if (field === "_description") return { ...prev, _description: value };
          if (field === "_project_id") return { ...prev, _project_id: value };
          
          const oldVal = prev[field]?.value;
          const currentHistory = prev[field]?.history || [];

          const newActionLogEntry = {
            action_type: 'MANUAL_EDIT',
            description: `User manually updated ${field}`,
            field: field,
            old_value: oldVal,
            new_value: value,
            reason: reason,
            timestamp: new Date().toISOString()
          };

          const currentActionLog = prev.action_log || [];
          return {
            ...prev,
            [field]: {
              ...prev[field],
              value,
              history: [...currentHistory, {
                old_value: oldVal,
                new_value: value,
                reason: reason,
                timestamp: new Date().toISOString()
              }]
            },
            action_log: [newActionLogEntry, ...currentActionLog]
          };
        });
        fetchHistory(); 
      }
    } catch (err) {
      console.error("Network error during update", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(prev => ({
          ...prev,
          _meta: { ...prev._meta, status: data.new_status, actions_history: data.actions_history }
        }));
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddNote = async (id, noteText) => {
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(prev => ({
          ...prev,
          _meta: { ...prev._meta, actions_history: data.actions_history }
        }));
      }
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  const handleAddCustomDate = async (id, date, description) => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}/custom-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, description })
      });
      if (res.ok) {
        const data = await res.json();
        if (dbId === id) {
          setResult(prev => prev ? ({
            ...prev,
            _custom_dates: data.custom_dates,
            _meta: { ...prev._meta, actions_history: data.actions_history }
          }) : prev);
        }
        fetchHistory();
      }
      return res.ok;
    } catch (err) {
      console.error("Failed to add custom date", err);
      return false;
    }
  };

  const handleDeleteCustomDate = async (id, customDateId) => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/pos/${id}/custom-dates/${customDateId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        if (dbId === id) {
          setResult(prev => prev ? ({ ...prev, _custom_dates: data.custom_dates }) : prev);
        }
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to delete custom date", err);
    }
  };

  const handleAnalyze = async (extractionMode = 'primary') => {
    if (!file) return;
    setLoading(true); setError(null); setActiveSource(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('extraction_mode', extractionMode); 
    try {
      const response = await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok && data.extraction_result?.status === "success") {
        setResult(data.extraction_result.profile);
        setDbId(data.db_id);
        fetchHistory(); 
      } else {
        setError(data.extraction_result?.message || "Failed to process.");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") return setError("Valid PDF required.");
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setActiveSource(null);
    setActiveTab('extraction'); 
    setDbId(null);
  };

  const TABS = [
    { id: 'calendar',   label: 'Deadlines',   Icon: CalendarIcon },
    { id: 'all',        label: 'All POs',     Icon: LayoutList   },
    { id: 'extraction', label: 'Extraction',  Icon: UploadCloud  },
  ];

  if (dbId || result) {
    TABS.push({ id: 'details', label: 'PO Details', Icon: FileText });
  }

  const tabBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, transition: 'all 0.18s',
    background: active
      ? 'linear-gradient(to bottom, #404040, #303030)'
      : 'transparent',
    color: active ? '#fff' : '#737373',
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0a', color: '#e5e5e5', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar
        history={history}
        projects={projects}
        onNewUpload={() => {
          setResult(null);
          setFile(null);
          setActiveSource(null);
          setActiveTab('extraction');
          setDbId(null);
        }}
        onLoadPO={loadPastPO}
        onDeletePO={handleDeletePO}
      />

      <main style={{
        flex: 1, minWidth: 480,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', overflowX: 'hidden',
        background: 'linear-gradient(135deg, #101012 0%, #0d0d0f 50%, #0a0a0c 100%)',
        padding: '28px 40px',
      }}>
        <header style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{
              margin: 0, marginBottom: 4, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #fff, #a3a3a3)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Workspace
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, color: '#737373' }}>Enterprise Hybrid Pipeline</p>
          </div>

          <div style={{
            display: 'flex', gap: 3, borderRadius: 11,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(18,18,18,0.7)', padding: 4,
          }}>
            {TABS.map(({ id, label, Icon }) => (
              <button 
                key={id} 
                onClick={() => {
                  if (id === 'extraction') {
                    setResult(null);
                    setFile(null);
                    setDbId(null);
                    setActiveSource(null);
                  }
                  setActiveTab(id);
                }} 
                style={tabBtn(activeTab === id)}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {activeTab === 'calendar' && (
            <CalendarView
              onSelectEvent={loadPastPO}
              poList={history}
              projects={projects}
              onAddCustomDate={handleAddCustomDate}
            />
          )}
          {activeTab === 'all' && (
            <AllPOsView
              history={history}
              projects={projects}
              onLoadPO={loadPastPO}
              onDeletePO={handleDeletePO}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onRenameProject={handleRenameProject}
              onAssignProject={handleAssignProjectFromList}
            />
          )}
          
          {(activeTab === 'extraction' || activeTab === 'details') && (
            <ExtractionView
              file={file}
              loading={loading}
              error={error}
              result={result}
              projects={projects}
              fileInputRef={fileInputRef}
              handleFileSelection={handleFileSelection}
              handleAnalyze={handleAnalyze}
              setActiveSource={setActiveSource}
              dbId={dbId}
              onUpdate={handleFieldUpdate}
              onCreateProject={handleCreateProject}
              onStatusChange={handleStatusChange}
              onAddNote={handleAddNote}
              onAddCustomDate={handleAddCustomDate}
              onDeleteCustomDate={handleDeleteCustomDate}
              customFields={customFields}
              scrollToField={scrollToField}
              onScrollToFieldDone={() => setScrollToField(null)}
              loadPastPO={loadPastPO}
            />
          )}
        </div>
      </main>

      {activeSource && dbId && (
        <>
          <div
            onClick={() => setActiveSource(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(1px)',
              animation: 'fadeIn 0.2s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            zIndex: 50, width: 600,
            display: 'flex', flexDirection: 'column',
          }}>
            <SourceSidebar
              activeSource={activeSource}
              onClose={() => setActiveSource(null)}
              dbId={dbId}
            />
          </div>
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </div>
  );
};

export default App;