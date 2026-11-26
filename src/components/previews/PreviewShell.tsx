import type { ReactNode } from 'react';
import {
  Columns3,
  Grid2X2,
  Home,
  List,
  Minus,
  Moon,
  PanelRight,
  Plus,
  Smartphone,
  Sun,
} from 'lucide-react';
import type { PreviewLayout } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const LAYOUTS: Array<{ id: PreviewLayout; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Inicio', icon: Grid2X2 },
  { id: 'search', label: 'Búsqueda', icon: List },
  { id: 'sidebar', label: 'Sugeridos', icon: PanelRight },
  { id: 'mobile', label: 'Móvil', icon: Smartphone },
  { id: 'compare', label: 'Comparar', icon: Columns3 },
];

export function PreviewShell({ children }: { children: ReactNode }) {
  const { theme, layout, zoom, compareMode } = useAppStore((s) => s.ui);
  const setTheme = useAppStore((s) => s.setTheme);
  const setLayout = useAppStore((s) => s.setLayout);
  const setZoom = useAppStore((s) => s.setZoom);
  const toggleCompareMode = useAppStore((s) => s.toggleCompareMode);

  return (
    <div className="preview-panel">
      <div className="pv-toolbar">
        <div className="pv-tabs">
          {LAYOUTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`pv-tab ${layout === id ? 'active' : ''}`}
              onClick={() => setLayout(id)}
              title={label}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="app-header-spacer" />

        <button
          className={`pv-tab ${compareMode ? 'active' : ''}`}
          onClick={toggleCompareMode}
          title="Rodear el video con tarjetas de relleno"
          style={{ border: '1px solid #3f3f3f' }}
        >
          <Home size={15} />
          Feed simulado
        </button>

        <button
          className="pv-theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title="Cambiar tema (T)"
        >
          {theme === 'light' ? <Sun /> : <Moon />}
          {theme === 'light' ? 'Claro' : 'Oscuro'}
        </button>

        <div className="pv-zoom">
          <button onClick={() => setZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))} title="Alejar">
            <Minus />
          </button>
          <span className="pv-zoom-value">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1.5, Math.round((zoom + 0.1) * 10) / 10))} title="Acercar">
            <Plus />
          </button>
        </div>
      </div>

      <div className="pv-viewport" data-theme={theme}>
        <div className="pv-scale-wrap" style={{ transform: `scale(${zoom})` }}>
          {children}
        </div>
        <div className="pv-badge">Vista previa en tiempo real · {layout}</div>
      </div>
    </div>
  );
}
