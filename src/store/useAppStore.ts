import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  AppState,
  Channel,
  DescriptionVariant,
  PreviewLayout,
  Theme,
  ThumbnailVariant,
  TitleVariant,
  VideoProject,
} from '../types';

/** sessionStorage con aviso cuando se acerca/queda sin espacio. */
const safeSessionStorage = {
  getItem: (name: string) => sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    try {
      sessionStorage.setItem(name, value);
    } catch (error) {
      console.warn('Thumbnail Preview Lab: sessionStorage lleno', error);
      window.dispatchEvent(new CustomEvent('tpl-storage-warning'));
    }
  },
  removeItem: (name: string) => sessionStorage.removeItem(name),
};

const PLACEHOLDER_THUMB =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#303030"/><stop offset="1" stop-color="#0f0f0f"/>
      </linearGradient></defs>
      <rect width="1280" height="720" fill="url(#g)"/>
      <rect x="40" y="40" width="1200" height="640" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="4" rx="16"/>
      <text x="640" y="360" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-size="72" font-weight="700" fill="#ffffff" fill-opacity="0.55">TU MINIATURA</text>
      <text x="640" y="430" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-size="32" fill="#ffffff" fill-opacity="0.35">Sube una imagen para verla aquí</text>
    </svg>`,
  );

export function createChannel(): Channel {
  return {
    name: 'Mi canal',
    handle: '@micanal',
    avatarDataUrl: undefined,
    verified: false,
    subscribers: '125 mil suscriptores',
  };
}

export function createProject(name = 'Mi video'): VideoProject {
  const thumbId = nanoid(8);
  const titleId = nanoid(8);
  const descId = nanoid(8);
  return {
    id: nanoid(8),
    name,
    channel: createChannel(),
    durationSeconds: 754, // 12:34
    views: '1,2 M de vistas',
    publishedAgo: 'hace 2 días',
    thumbnails: [{ id: thumbId, label: 'Miniatura A', dataUrl: PLACEHOLDER_THUMB }],
    titles: [{ id: titleId, text: 'Este es el título de tu video — pruébalo aquí' }],
    descriptions: [
      {
        id: descId,
        text: 'Descripción del video. Aquí puedes probar distintos textos para ver cómo se recortan en los resultados de búsqueda.',
      },
    ],
    selected: { thumbnailId: thumbId, titleId, descriptionId: descId },
  };
}

interface AppActions {
  // Proyectos
  addProject: () => void;
  removeProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  setActiveProject: (id: string) => void;

  // Canal y metadatos
  updateChannel: (patch: Partial<Channel>) => void;
  updateMeta: (patch: Partial<Pick<VideoProject, 'durationSeconds' | 'views' | 'publishedAgo'>>) => void;

  // Miniaturas
  addThumbnails: (files: Array<{ label: string; dataUrl: string }>) => void;
  renameThumbnail: (id: string, label: string) => void;
  removeThumbnail: (id: string) => void;
  selectThumbnail: (id: string) => void;
  reorderThumbnail: (from: number, to: number) => void;

  // Títulos y descripciones
  addTitle: () => void;
  updateTitle: (id: string, text: string) => void;
  removeTitle: (id: string) => void;
  selectTitle: (id: string) => void;
  addDescription: () => void;
  updateDescription: (id: string, text: string) => void;
  removeDescription: (id: string) => void;
  selectDescription: (id: string) => void;

  // UI
  setTheme: (theme: Theme) => void;
  setLayout: (layout: PreviewLayout) => void;
  setZoom: (zoom: number) => void;
  toggleCompareMode: () => void;
  clearAll: () => void;
  importState: (data: {
    projects: VideoProject[];
    activeProjectId?: string;
    ui?: Partial<AppState['ui']>;
  }) => void;
}

type Store = AppState & AppActions;

/** Actualiza el proyecto activo inmutablemente. */
function patchActive(
  state: Store,
  patch: (project: VideoProject) => Partial<VideoProject>,
): Partial<Store> {
  return {
    projects: state.projects.map((p) =>
      p.id === state.activeProjectId ? { ...p, ...patch(p) } : p,
    ),
  };
}

function withSelection<T extends { id: string }>(
  items: T[],
  selectedId: string | undefined,
  key: 'thumbnailId' | 'titleId' | 'descriptionId',
) {
  const valid = selectedId && items.some((i) => i.id === selectedId);
  return { [key]: valid ? selectedId : items[0]?.id };
}

const initialProject = createProject();

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      projects: [initialProject],
      activeProjectId: initialProject.id,
      ui: { theme: 'light', layout: 'home', compareMode: false, zoom: 1 },

      addProject: () =>
        set((s) => {
          const project = createProject(`Video ${s.projects.length + 1}`);
          return { projects: [...s.projects, project], activeProjectId: project.id };
        }),

      removeProject: (id) =>
        set((s) => {
          if (s.projects.length === 1) return {};
          const projects = s.projects.filter((p) => p.id !== id);
          return {
            projects,
            activeProjectId:
              s.activeProjectId === id ? projects[0].id : s.activeProjectId,
          };
        }),

      renameProject: (id, name) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      duplicateProject: (id) =>
        set((s) => {
          const original = s.projects.find((p) => p.id === id);
          if (!original) return {};
          const copy: VideoProject = {
            ...original,
            id: nanoid(8),
            name: `${original.name} (copia)`,
            channel: { ...original.channel },
            thumbnails: original.thumbnails.map((t) => ({ ...t, id: nanoid(8) })),
            titles: original.titles.map((t) => ({ ...t, id: nanoid(8) })),
            descriptions: original.descriptions.map((d) => ({ ...d, id: nanoid(8) })),
            selected: {},
          };
          copy.selected = {
            thumbnailId: copy.thumbnails[0]?.id,
            titleId: copy.titles[0]?.id,
            descriptionId: copy.descriptions[0]?.id,
          };
          return { projects: [...s.projects, copy], activeProjectId: copy.id };
        }),

      setActiveProject: (id) => set({ activeProjectId: id }),

      updateChannel: (patch) =>
        set((s) => patchActive(s, (p) => ({ ...p, channel: { ...p.channel, ...patch } }))),

      updateMeta: (patch) => set((s) => patchActive(s, (p) => ({ ...p, ...patch }))),

      addThumbnails: (files) =>
        set((s) =>
          patchActive(s, (p) => {
            const added: ThumbnailVariant[] = files.map((f) => ({
              id: nanoid(8),
              label: f.label || `Miniatura ${p.thumbnails.length + 1}`,
              dataUrl: f.dataUrl,
            }));
            const thumbnails = [...p.thumbnails, ...added];
            return {
              thumbnails,
              selected: {
                ...p.selected,
                ...withSelection(thumbnails, added[0]?.id, 'thumbnailId'),
              },
            };
          }),
        ),

      renameThumbnail: (id, label) =>
        set((s) =>
          patchActive(s, (p) => ({
            ...p,
            thumbnails: p.thumbnails.map((t) => (t.id === id ? { ...t, label } : t)),
          })),
        ),

      removeThumbnail: (id) =>
        set((s) =>
          patchActive(s, (p) => {
            const thumbnails = p.thumbnails.filter((t) => t.id !== id);
            return {
              thumbnails,
              selected: {
                ...p.selected,
                ...withSelection(thumbnails, p.selected.thumbnailId, 'thumbnailId'),
              },
            };
          }),
        ),

      selectThumbnail: (id) =>
        set((s) => patchActive(s, (p) => ({ ...p, selected: { ...p.selected, thumbnailId: id } }))),

      reorderThumbnail: (from, to) =>
        set((s) =>
          patchActive(s, (p) => {
            if (from === to || from < 0 || to < 0 || from >= p.thumbnails.length || to >= p.thumbnails.length) return p;
            const thumbnails = [...p.thumbnails];
            const [moved] = thumbnails.splice(from, 1);
            thumbnails.splice(to, 0, moved);
            return { thumbnails };
          }),
        ),

      addTitle: () =>
        set((s) =>
          patchActive(s, (p) => {
            const item: TitleVariant = { id: nanoid(8), text: 'Nuevo título' };
            const titles = [...p.titles, item];
            return {
              titles,
              selected: { ...p.selected, ...withSelection(titles, item.id, 'titleId') },
            };
          }),
        ),

      updateTitle: (id, text) =>
        set((s) =>
          patchActive(s, (p) => ({
            ...p,
            titles: p.titles.map((t) => (t.id === id ? { ...t, text } : t)),
          })),
        ),

      removeTitle: (id) =>
        set((s) =>
          patchActive(s, (p) => {
            const titles = p.titles.filter((t) => t.id !== id);
            return {
              titles,
              selected: { ...p.selected, ...withSelection(titles, p.selected.titleId, 'titleId') },
            };
          }),
        ),

      selectTitle: (id) =>
        set((s) => patchActive(s, (p) => ({ ...p, selected: { ...p.selected, titleId: id } }))),

      addDescription: () =>
        set((s) =>
          patchActive(s, (p) => {
            const item: DescriptionVariant = { id: nanoid(8), text: '' };
            const descriptions = [...p.descriptions, item];
            return {
              descriptions,
              selected: {
                ...p.selected,
                ...withSelection(descriptions, item.id, 'descriptionId'),
              },
            };
          }),
        ),

      updateDescription: (id, text) =>
        set((s) =>
          patchActive(s, (p) => ({
            ...p,
            descriptions: p.descriptions.map((d) => (d.id === id ? { ...d, text } : d)),
          })),
        ),

      removeDescription: (id) =>
        set((s) =>
          patchActive(s, (p) => {
            const descriptions = p.descriptions.filter((d) => d.id !== id);
            return {
              descriptions,
              selected: {
                ...p.selected,
                ...withSelection(descriptions, p.selected.descriptionId, 'descriptionId'),
              },
            };
          }),
        ),

      selectDescription: (id) =>
        set((s) =>
          patchActive(s, (p) => ({ ...p, selected: { ...p.selected, descriptionId: id } })),
        ),

      setTheme: (theme) => set((s) => ({ ui: { ...s.ui, theme } })),
      setLayout: (layout) => set((s) => ({ ui: { ...s.ui, layout } })),
      setZoom: (zoom) => set((s) => ({ ui: { ...s.ui, zoom } })),
      toggleCompareMode: () => set((s) => ({ ui: { ...s.ui, compareMode: !s.ui.compareMode } })),

      clearAll: () => {
        const project = createProject();
        set({
          projects: [project],
          activeProjectId: project.id,
          ui: { theme: 'light', layout: 'home', compareMode: false, zoom: 1 },
        });
        sessionStorage.removeItem('thumbnail-preview-lab');
      },

      importState: (data) => {
        if (!Array.isArray(data.projects) || data.projects.length === 0) return;
        const projects = data.projects.map((p) => ({
          ...p,
          selected: {
            thumbnailId:
              p.thumbnails.find((t) => t.id === p.selected?.thumbnailId)?.id ??
              p.thumbnails[0]?.id,
            titleId:
              p.titles.find((t) => t.id === p.selected?.titleId)?.id ?? p.titles[0]?.id,
            descriptionId:
              p.descriptions.find((d) => d.id === p.selected?.descriptionId)?.id ??
              p.descriptions[0]?.id,
          },
        }));
        set((s) => ({
          projects,
          activeProjectId: projects.some((p) => p.id === data.activeProjectId)
            ? data.activeProjectId
            : projects[0].id,
          ui: { ...s.ui, ...data.ui },
        }));
      },
    }),
    {
      name: 'thumbnail-preview-lab',
      storage: createJSONStorage(() => safeSessionStorage),
      version: 1,
    },
  ),
);

/** Selector de conveniencia: proyecto activo o el primero. */
export function useActiveProject(): VideoProject | undefined {
  return useAppStore((s) => s.projects.find((p) => p.id === s.activeProjectId) ?? s.projects[0]);
}
