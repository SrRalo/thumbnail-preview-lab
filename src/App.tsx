import { useEffect, useState } from 'react';
import { Circle, Mail } from 'lucide-react';
import { YouTubePlayButton } from './components/common/YouTubeBits';
import { ProjectPicker } from './components/editor/ProjectPicker';
import { ThumbnailManager } from './components/editor/ThumbnailManager';
import { TextVariantList } from './components/editor/TextVariantList';
import { ChannelForm } from './components/editor/ChannelForm';
import { MetaForm } from './components/editor/MetaForm';
import { PreviewShell } from './components/previews/PreviewShell';
import { YouTubeHome } from './components/previews/YouTubeHome';
import { YouTubeSearch } from './components/previews/YouTubeSearch';
import { YouTubeSidebar } from './components/previews/YouTubeSidebar';
import { YouTubeMobile } from './components/previews/YouTubeMobile';
import type { PreviewProps } from './components/previews/types';
import { CompareGrid } from './components/compare/CompareGrid';
import { useActiveProject, useAppStore } from './store/useAppStore';
import { formatDuration } from './lib/format';
import type { PreviewLayout, Theme } from './types';

/** Marca oficial de GitHub (simple-icons). */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function App() {
  const project = useActiveProject();
  const ui = useAppStore((s) => s.ui);
  const selectThumbnail = useAppStore((s) => s.selectThumbnail);
  const setTheme = useAppStore((s) => s.setTheme);
  const setLayout = useAppStore((s) => s.setLayout);
  const toggleCompareMode = useAppStore((s) => s.toggleCompareMode);
  const [storageWarning, setStorageWarning] = useState(false);

  // Parámetros de URL para compartir/verificar una vista concreta.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const layout = params.get('layout');
    const theme = params.get('theme');
    if (layout && ['home', 'search', 'sidebar', 'mobile', 'compare'].includes(layout)) {
      setLayout(layout as PreviewLayout);
    }
    if (theme === 'light' || theme === 'dark') setTheme(theme as Theme);
    if (params.get('feed') === '1' && !useAppStore.getState().ui.compareMode) {
      toggleCompareMode();
    }
  }, [setLayout, setTheme, toggleCompareMode]);

  // Aviso de sessionStorage lleno.
  useEffect(() => {
    const onWarn = () => {
      setStorageWarning(true);
      window.setTimeout(() => setStorageWarning(false), 5000);
    };
    window.addEventListener('tpl-storage-warning', onWarn);
    return () => window.removeEventListener('tpl-storage-warning', onWarn);
  }, []);

  // Atajos de teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable) return;
      if (!project) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const thumbs = project.thumbnails;
        if (thumbs.length < 2) return;
        const currentIndex = Math.max(
          0,
          thumbs.findIndex((t) => t.id === project.selected.thumbnailId),
        );
        const next =
          e.key === 'ArrowRight'
            ? (currentIndex + 1) % thumbs.length
            : (currentIndex - 1 + thumbs.length) % thumbs.length;
        selectThumbnail(thumbs[next].id);
        e.preventDefault();
      } else if (e.key.toLowerCase() === 't') {
        setTheme(ui.theme === 'light' ? 'dark' : 'light');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, selectThumbnail, setTheme, ui.theme]);

  if (!project) return null;

  const thumbnail =
    project.thumbnails.find((t) => t.id === project.selected.thumbnailId) ??
    project.thumbnails[0];
  const title =
    project.titles.find((t) => t.id === project.selected.titleId) ?? project.titles[0];
  const description =
    project.descriptions.find((d) => d.id === project.selected.descriptionId) ??
    project.descriptions[0];

  const preview: PreviewProps = {
    thumbnail,
    title: title?.text ?? '',
    description: description?.text ?? '',
    channel: project.channel,
    duration: formatDuration(project.durationSeconds),
    views: project.views,
    publishedAgo: project.publishedAgo,
    theme: ui.theme,
    mockFeed: ui.compareMode,
  };

  function renderPreview() {
    switch (ui.layout) {
      case 'search':
        return <YouTubeSearch {...preview} />;
      case 'sidebar':
        return <YouTubeSidebar {...preview} />;
      case 'mobile':
        return <YouTubeMobile {...preview} />;
      case 'compare':
        return <CompareGrid project={project!} theme={ui.theme} />;
      case 'home':
      default:
        return <YouTubeHome {...preview} />;
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <YouTubePlayButton className="yt-mark" />
          <span>Thumbnail Preview Lab</span>
        </div>
        <span className="app-header-sub">Vista previa fiel de YouTube · edición local</span>
        <div className="app-header-spacer" />
        <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Circle size={8} fill="#4caf50" color="#4caf50" />
          Sesión temporal
        </span>
      </header>

      <div className="app-main">
        <aside className="editor-panel">
          <ProjectPicker />
          <ThumbnailManager />
          <TextVariantList kind="title" />
          <TextVariantList kind="description" />
          <ChannelForm />
          <MetaForm />
        </aside>

        <main className="preview-panel-wrap" style={{ display: 'flex', minWidth: 0, minHeight: 0 }}>
          <PreviewShell>{renderPreview()}</PreviewShell>
        </main>
      </div>

      <footer className="app-footer">
        <a href="https://github.com/SrRalo" target="_blank" rel="noopener noreferrer" title="GitHub de SrRalo">
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        <span className="app-footer-sep">·</span>
        <a href="mailto:ralo2608@outlook.com" title="Escribir a ralo2608@outlook.com">
          <Mail size={15} />
          <span>ralo2608@outlook.com</span>
        </a>
      </footer>

      {storageWarning && (
        <div className="toast">
          Se alcanzó el límite de sessionStorage: some imágenes pueden no guardarse.
        </div>
      )}
    </div>
  );
}
