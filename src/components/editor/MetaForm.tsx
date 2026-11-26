import { Clock3, Eye, RotateCcw, CalendarDays, Trash2 } from 'lucide-react';
import { useActiveProject, useAppStore } from '../../store/useAppStore';
import { formatDuration, parseDuration } from '../../lib/format';

export function MetaForm() {
  const project = useActiveProject();
  const updateMeta = useAppStore((s) => s.updateMeta);
  const clearAll = useAppStore((s) => s.clearAll);

  if (!project) return null;

  return (
    <section className="ed-section">
      <h2 className="ed-title">
        <Clock3 /> Metadatos
      </h2>

      <label className="ed-label">Duración (mostrada en la miniatura)</label>
      <div className="ed-row" style={{ marginBottom: 8 }}>
        <input
          className="ed-input"
          style={{ width: 110 }}
          value={formatDuration(project.durationSeconds)}
          onChange={(e) => updateMeta({ durationSeconds: parseDuration(e.target.value) })}
        />
        <input
          className="ed-range"
          type="range"
          min={0}
          max={7200}
          step={1}
          value={project.durationSeconds}
          onChange={(e) => updateMeta({ durationSeconds: Number(e.target.value) })}
        />
      </div>
      <div className="ed-hint" style={{ margin: '0 0 16px' }}>
        Formato: m:ss o h:mm:ss · máx. 2:00:00
      </div>

      <label className="ed-label">
        <Eye size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Vistas
      </label>
      <input
        className="ed-input"
        value={project.views}
        onChange={(e) => updateMeta({ views: e.target.value })}
        style={{ marginBottom: 12 }}
      />

      <label className="ed-label">
        <CalendarDays size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Publicado
      </label>
      <input
        className="ed-input"
        value={project.publishedAgo}
        onChange={(e) => updateMeta({ publishedAgo: e.target.value })}
        style={{ marginBottom: 20 }}
      />

      <div className="ed-danger-zone">
        <button
          className="ed-btn ed-btn-danger"
          onClick={() => {
            if (window.confirm('¿Borrar toda la sesión? Se perderán todos los videos y variantes.')) {
              clearAll();
            }
          }}
        >
          <Trash2 size={15} /> Borrar todo
        </button>
        <div className="ed-hint" style={{ margin: '8px 0 0' }}>
          Recarga (F5) conserva los datos; cerrar la pestaña los borra.
        </div>
      </div>
    </section>
  );
}

export function ResetHint() {
  return (
    <div style={{ padding: '12px 20px', color: '#666', fontSize: 11 }}>
      <RotateCcw size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
      Thumbnail Preview Lab
    </div>
  );
}
