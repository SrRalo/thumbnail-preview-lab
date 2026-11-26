import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react';
import type { DragEvent } from 'react';
import { useActiveProject, useAppStore } from '../../store/useAppStore';
import { resizeImage } from '../../lib/image';

export function ThumbnailManager() {
  const project = useActiveProject();
  const addThumbnails = useAppStore((s) => s.addThumbnails);
  const renameThumbnail = useAppStore((s) => s.renameThumbnail);
  const removeThumbnail = useAppStore((s) => s.removeThumbnail);
  const selectThumbnail = useAppStore((s) => s.selectThumbnail);
  const reorderThumbnail = useAppStore((s) => s.reorderThumbnail);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    setBusy(true);
    try {
      const processed = await Promise.all(
        imageFiles.map(async (file) => ({
          label: file.name.replace(/\.[^.]+$/, '').slice(0, 40),
          dataUrl: await resizeImage(file),
        })),
      );
      addThumbnails(processed);
    } finally {
      setBusy(false);
    }
  }

  function onDropZone(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  }

  if (!project) return null;

  return (
    <section className="ed-section">
      <h2 className="ed-title">
        <ImagePlus /> Miniaturas
      </h2>
      <div
        className={`ed-dropzone ${dragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDropZone}
      >
        <Upload />
        <div className="ed-dropzone-main">{busy ? 'Procesando imágenes…' : 'Arrastra miniaturas aquí'}</div>
        <div className="ed-dropzone-sub">o haz clic para elegir · se redimensionan a 1280×720</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="ed-variant-list">
        {project.thumbnails.map((thumb, index) => {
          const selected = project.selected.thumbnailId === thumb.id;
          return (
            <div
              key={thumb.id}
              className={`ed-variant ${selected ? 'selected' : ''}`}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null) reorderThumbnail(draggedIndex, index);
                setDraggedIndex(null);
              }}
            >
              <GripVertical size={16} color="#666" style={{ cursor: 'grab', flex: '0 0 auto' }} />
              <img className="ed-variant-thumb" src={thumb.dataUrl} alt="" />
              <div className="ed-variant-body">
                <input
                  className="ed-variant-input"
                  value={thumb.label}
                  onChange={(e) => renameThumbnail(thumb.id, e.target.value)}
                  onFocus={() => selectThumbnail(thumb.id)}
                />
                <span className="ed-counter" style={{ display: 'block', margin: 0, textAlign: 'left' }}>
                  {index + 1} de {project.thumbnails.length}
                </span>
              </div>
              <div className="ed-variant-actions">
                <button
                  className={`ed-btn-icon ${selected ? 'active' : ''}`}
                  title="Usar en la vista previa"
                  onClick={() => selectThumbnail(thumb.id)}
                >
                  <Check />
                </button>
                <button
                  className="ed-btn-icon"
                  title="Subir"
                  disabled={index === 0}
                  onClick={() => reorderThumbnail(index, index - 1)}
                >
                  <ArrowUp />
                </button>
                <button
                  className="ed-btn-icon"
                  title="Bajar"
                  disabled={index === project.thumbnails.length - 1}
                  onClick={() => reorderThumbnail(index, index + 1)}
                >
                  <ArrowDown />
                </button>
                <button
                  className="ed-btn-icon danger"
                  title="Eliminar"
                  disabled={project.thumbnails.length <= 1}
                  onClick={() => removeThumbnail(thumb.id)}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {project.thumbnails.length === 0 && <p className="ed-empty">Sin miniaturas todavía.</p>}
    </section>
  );
}
