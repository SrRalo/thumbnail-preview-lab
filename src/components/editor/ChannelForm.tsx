import { useRef, useState } from 'react';
import { Camera, UserRound } from 'lucide-react';
import { useActiveProject, useAppStore } from '../../store/useAppStore';
import { resizeAvatar } from '../../lib/image';
import { channelInitial } from '../../lib/format';

export function ChannelForm() {
  const project = useActiveProject();
  const updateChannel = useAppStore((s) => s.updateChannel);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!project) return null;
  const { channel } = project;

  async function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      const dataUrl = await resizeAvatar(file, 256);
      updateChannel({ avatarDataUrl: dataUrl });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ed-section">
      <h2 className="ed-title">
        <UserRound /> Canal
      </h2>
      <div className="ed-avatar-row">
        {channel.avatarDataUrl ? (
          <img className="ed-avatar" src={channel.avatarDataUrl} alt="Avatar del canal" />
        ) : (
          <div className="ed-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {channelInitial(channel.name)}
          </div>
        )}
        <div>
          <button className="ed-btn" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Camera size={16} /> {busy ? 'Procesando…' : 'Subir avatar'}
          </button>
          <div className="ed-hint" style={{ margin: '8px 0 0' }}>
            Se recorta a 256×256
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <label className="ed-label">Nombre del canal</label>
      <input
        className="ed-input"
        value={channel.name}
        onChange={(e) => updateChannel({ name: e.target.value })}
        style={{ marginBottom: 12 }}
      />

      <label className="ed-label">Handle</label>
      <input
        className="ed-input"
        value={channel.handle}
        onChange={(e) => updateChannel({ handle: e.target.value })}
        style={{ marginBottom: 12 }}
      />

      <label className="ed-label">Suscriptores</label>
      <input
        className="ed-input"
        value={channel.subscribers}
        onChange={(e) => updateChannel({ subscribers: e.target.value })}
        style={{ marginBottom: 12 }}
      />

      <label className="ed-switch">
        <input
          type="checkbox"
          checked={channel.verified}
          onChange={(e) => updateChannel({ verified: e.target.checked })}
        />
        <span className="ed-switch-track" />
        Canal verificado
      </label>
    </section>
  );
}
