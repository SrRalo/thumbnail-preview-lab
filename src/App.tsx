import { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';
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

      {storageWarning && (
        <div className="toast">
          Se alcanzó el límite de sessionStorage: some imágenes pueden no guardarse.
        </div>
      )}
    </div>
  );
}
