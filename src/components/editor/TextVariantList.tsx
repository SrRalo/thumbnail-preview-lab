import { Check, Plus, Trash2, AlignLeft, Type } from 'lucide-react';
import { useActiveProject, useAppStore } from '../../store/useAppStore';

type Kind = 'title' | 'description';

const CONFIG: Record<Kind, { title: string; icon: typeof Type; limit: number; rows: number }> = {
  title: { title: 'Títulos', icon: Type, limit: 100, rows: 3 },
  description: { title: 'Descripciones', icon: AlignLeft, limit: 5000, rows: 5 },
};

export function TextVariantList({ kind }: { kind: Kind }) {
  const project = useActiveProject();
  const config = CONFIG[kind];
  const Icon = config.icon;

  const items = kind === 'title' ? project?.titles : project?.descriptions;
  const selectedId = kind === 'title' ? project?.selected.titleId : project?.selected.descriptionId;

  const addTitle = useAppStore((s) => s.addTitle);
  const updateTitle = useAppStore((s) => s.updateTitle);
  const removeTitle = useAppStore((s) => s.removeTitle);
  const selectTitle = useAppStore((s) => s.selectTitle);
  const addDescription = useAppStore((s) => s.addDescription);
  const updateDescription = useAppStore((s) => s.updateDescription);
  const removeDescription = useAppStore((s) => s.removeDescription);
  const selectDescription = useAppStore((s) => s.selectDescription);

  const add = kind === 'title' ? addTitle : addDescription;
  const update = kind === 'title' ? updateTitle : updateDescription;
  const remove = kind === 'title' ? removeTitle : removeDescription;
  const select = kind === 'title' ? selectTitle : selectDescription;

  if (!project || !items) return null;

  return (
    <section className="ed-section">
      <h2 className="ed-title">
        <Icon /> {config.title}
      </h2>
      <div className="ed-variant-list">
        {items.map((item) => {
          const selected = selectedId === item.id;
          const over = item.text.length > config.limit;
          return (
            <div key={item.id} className={`ed-variant ${selected ? 'selected' : ''}`}>
              <div className="ed-variant-body">
                <textarea
                  className="ed-variant-text"
                  rows={config.rows}
                  value={item.text}
                  placeholder={kind === 'title' ? 'Escribe un título…' : 'Escribe una descripción…'}
                  onFocus={() => select(item.id)}
                  onChange={(e) => update(item.id, e.target.value)}
                />
                <div className={`ed-counter ${over ? 'over' : ''}`}>
                  {item.text.length}/{config.limit}
                  {kind === 'title' && item.text.length > 70 ? ' · se cortará en el feed' : ''}
                </div>
              </div>
              <div className="ed-variant-actions">
                <button
                  className={`ed-btn-icon ${selected ? 'active' : ''}`}
                  title="Usar en la vista previa"
                  onClick={() => select(item.id)}
                >
                  <Check />
                </button>
                <button
                  className="ed-btn-icon danger"
                  title="Eliminar"
                  disabled={items.length <= 1}
                  onClick={() => remove(item.id)}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="ed-btn" style={{ marginTop: 12 }} onClick={() => add()}>
        <Plus size={16} /> Añadir {kind === 'title' ? 'título' : 'descripción'}
      </button>
    </section>
  );
}
