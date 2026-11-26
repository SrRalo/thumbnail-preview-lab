import { useRef } from 'react';
import { Copy, Download, FileUp, Plus, Trash2, Video } from 'lucide-react';
import { useActiveProject, useAppStore } from '../../store/useAppStore';

export function ProjectPicker() {
  const projects = useAppStore((s) => s.projects);
  const active = useActiveProject();
  const addProject = useAppStore((s) => s.addProject);
  const removeProject = useAppStore((s) => s.removeProject);
  const renameProject = useAppStore((s) => s.renameProject);
  const duplicateProject = useAppStore((s) => s.duplicateProject);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const importState = useAppStore((s) => s.importState);
  const fileRef = useRef<HTMLInputElement>(null);

  function exportJson() {
    const { projects, activeProjectId, ui } = useAppStore.getState();
    const blob = new Blob([JSON.stringify({ projects, activeProjectId, ui }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thumbnail-preview-lab.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="ed-section">
      <h2 className="ed-title">
        <Video /> Proyecto / video
      </h2>
      <div className="ed-row">
        <select
          className="ed-select"
          style={{ flex: 1 }}
          value={active?.id ?? ''}
          onChange={(e) => setActiveProject(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="ed-btn-icon" title="Nuevo video" onClick={addProject}>
          <Plus />
        </button>
        <button
          className="ed-btn-icon"
          title="Duplicar video"
          onClick={() => active && duplicateProject(active.id)}
        >
          <Copy />
        </button>
        <button
          className="ed-btn-icon danger"
          title="Eliminar video"
          disabled={projects.length <= 1}
          onClick={() => {
            if (active && window.confirm(`¿Eliminar "${active.name}"?`)) removeProject(active.id);
          }}
        >
          <Trash2 />
        </button>
      </div>
      <div className="ed-field" style={{ marginTop: 12, marginBottom: 0 }}>
        <label className="ed-label">Nombre interno</label>
        <input
          className="ed-input"
          value={active?.name ?? ''}
          onChange={(e) => active && renameProject(active.id, e.target.value)}
        />
      </div>
      <div className="ed-row" style={{ marginTop: 12 }}>
        <button className="ed-btn" onClick={exportJson} title="Descargar sesión como JSON">
          <Download size={15} /> Exportar JSON
        </button>
        <button className="ed-btn" onClick={() => fileRef.current?.click()} title="Cargar sesión desde JSON">
          <FileUp size={15} /> Importar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            try {
              importState(JSON.parse(await file.text()));
            } catch {
              window.alert('No se pudo importar el archivo JSON.');
            }
          }}
        />
      </div>
    </section>
  );
}
