import { MoreVertical } from 'lucide-react';
import type { VideoProject } from '../../types';
import { formatDuration } from '../../lib/format';
import { ChannelAvatar, ChannelName } from '../common/YouTubeBits';
import { DurationBadge } from '../previews/DurationBadge';

interface CompareGridProps {
  project: VideoProject;
  theme: 'light' | 'dark';
}

export function CompareGrid({ project, theme }: CompareGridProps) {
  const { channel, titles, thumbnails, durationSeconds, views, publishedAgo } = project;
  const combos = thumbnails.flatMap((thumb, ti) =>
    titles.map((title, ti2) => ({ thumb, title, key: `${thumb.id}-${title.id}`, ti, ti2 })),
  );

  return (
    <div className="yt-surface yt-compare" data-theme={theme}>
      <h2 className="yt-compare-title">Comparador de miniaturas</h2>
      <p className="yt-compare-sub">
        {thumbnails.length} miniatura(s) × {titles.length} título(s) · mismo canal, mismos metadatos
      </p>

      <div className="yt-compare-grid">
        {combos.map(({ thumb, title, key, ti, ti2 }) => (
          <div className="yt-compare-card" key={key}>
            <div className="yt-compare-label">
              <span>
                {thumb.label || `Miniatura ${ti + 1}`} · Título {ti2 + 1}
              </span>
              <span>{title.text.length} car.</span>
            </div>
            <div className="yt-compare-body">
              <div className="yt-thumb">
                {thumb.dataUrl && <img className="yt-thumb-img" src={thumb.dataUrl} alt="" />}
                <DurationBadge duration={formatDuration(durationSeconds)} />
              </div>
              <div className="yt-home-meta">
                <ChannelAvatar channel={channel} />
                <div className="yt-home-text">
                  <h3 className="yt-home-title">{title.text}</h3>
                  <p className="yt-meta-line">
                    <ChannelName name={channel.name} verified={channel.verified} />
                  </p>
                  <p className="yt-meta-line">
                    {views} · {publishedAgo}
                  </p>
                </div>
                <MoreVertical className="yt-menu-dots" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
