export type ID = string;

export interface ThumbnailVariant {
  id: ID;
  label: string;
  dataUrl: string;
}

export interface TitleVariant {
  id: ID;
  text: string;
}

export interface DescriptionVariant {
  id: ID;
  text: string;
}

export interface Channel {
  name: string;
  handle: string;
  avatarDataUrl?: string;
  verified: boolean;
  subscribers: string;
}

export type PreviewLayout =
  | 'home'
  | 'search'
  | 'sidebar'
  | 'mobile'
  | 'compare';

export type Theme = 'light' | 'dark';

export interface VideoProject {
  id: ID;
  name: string;
  channel: Channel;
  durationSeconds: number;
  views: string;
  publishedAgo: string;
  thumbnails: ThumbnailVariant[];
  titles: TitleVariant[];
  descriptions: DescriptionVariant[];
  selected: {
    thumbnailId?: ID;
    titleId?: ID;
    descriptionId?: ID;
  };
}

export interface AppState {
  projects: VideoProject[];
  activeProjectId?: ID;
  ui: {
    theme: Theme;
    layout: PreviewLayout;
    compareMode: boolean;
    zoom: number;
  };
}
