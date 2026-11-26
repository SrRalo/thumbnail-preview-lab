import type { Channel, Theme, ThumbnailVariant } from '../../types';

export interface PreviewProps {
  thumbnail?: ThumbnailVariant;
  title: string;
  description: string;
  channel: Channel;
  duration: string;
  views: string;
  publishedAgo: string;
  theme: Theme;
  /** Feed simulado: añade tarjetas de relleno alrededor del video principal. */
  mockFeed: boolean;
}
