import {
  BatteryFull,
  Bell,
  Cast,
  ChevronDown,
  Home,
  PlaySquare,
  Search,
  Signal,
  UserRound,
  Wifi,
  Youtube,
} from 'lucide-react';
import { ChannelAvatar, ChannelName, YouTubePlayButton } from '../common/YouTubeBits';
import { DurationBadge } from './DurationBadge';
import type { PreviewProps } from './types';
import { generateMockFeed } from '../../lib/mockFeed';

export function YouTubeMobile(props: PreviewProps) {
  const {
    thumbnail,
    title,
    channel,
    duration,
    views,
    publishedAgo,
    theme,
    mockFeed,
  } = props;
  const fillers = mockFeed ? generateMockFeed(2, channel) : [];

  return (
    <div className="yt-surface yt-phone" data-theme={theme}>
      <div className="yt-phone-notch" />
      <div className="yt-phone-screen">
        <div className="yt-mobile-statusbar">
          <span>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Signal />
            <Wifi />
            <BatteryFull />
          </div>
        </div>

        <div className="yt-mobile-header">
          <div className="yt-mobile-header-logo">
            <YouTubePlayButton className="yt-mark" />
            <span>YouTube</span>
            <ChevronDown size={16} />
          </div>
          <div className="yt-mobile-header-actions">
            <Cast />
            <Bell />
            <Search />
            <ChannelAvatar channel={channel} className="yt-mobile-avatar" />
          </div>
        </div>

        <div className="yt-mobile-chips">
          <span className="yt-mobile-chip active">Todo</span>
          <span className="yt-mobile-chip">Música</span>
          <span className="yt-mobile-chip">Gaming</span>
          <span className="yt-mobile-chip">Noticias</span>
          <span className="yt-mobile-chip">En vivo</span>
        </div>

        <div className="yt-mobile-feed">
          <div className="yt-mobile-card">
            <div className="yt-thumb">
              {thumbnail && <img className="yt-thumb-img" src={thumbnail.dataUrl} alt="" />}
              <DurationBadge duration={duration} />
            </div>
            <div className="yt-mobile-card-meta">
              <ChannelAvatar channel={channel} />
              <div style={{ minWidth: 0 }}>
                <h3 className="yt-mobile-title">{title}</h3>
                <p className="yt-mobile-channel">
                  <ChannelName name={channel.name} verified={channel.verified} />
                </p>
                <p className="yt-mobile-meta">
                  {views} · {publishedAgo}
                </p>
              </div>
            </div>
          </div>

          {fillers.map((f) => (
            <div className="yt-mobile-card" key={f.id}>
              <div className="yt-thumb">
                <img className="yt-thumb-img" src={f.thumbnail} alt="" />
                <DurationBadge duration={f.duration} />
              </div>
              <div className="yt-mobile-card-meta">
                <ChannelAvatar
                  channel={{ name: f.channel } as typeof channel}
                  src={f.avatar}
                />
                <div style={{ minWidth: 0 }}>
                  <h3 className="yt-mobile-title">{f.title}</h3>
                  <p className="yt-mobile-channel">{f.channel}</p>
                  <p className="yt-mobile-meta">
                    {f.views} · {f.publishedAgo}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="yt-mobile-nav">
          <div className="yt-mobile-nav-item active">
            <Home />
            <span>Inicio</span>
          </div>
          <div className="yt-mobile-nav-item">
            <Youtube />
            <span>Shorts</span>
          </div>
          <div className="yt-mobile-nav-item">
            <PlaySquare />
            <span>Suscripciones</span>
          </div>
          <div className="yt-mobile-nav-item">
            <UserRound />
            <span>Tú</span>
          </div>
        </div>
      </div>
    </div>
  );
}
