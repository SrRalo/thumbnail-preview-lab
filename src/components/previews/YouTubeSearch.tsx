import { MoreVertical, Search, Mic, Camera } from 'lucide-react';
import { ChannelAvatar, ChannelName, YouTubeLogo } from '../common/YouTubeBits';
import { DurationBadge } from './DurationBadge';
import type { PreviewProps } from './types';
import type { Channel } from '../../types';
import { generateMockFeed } from '../../lib/mockFeed';

interface SearchCard {
  id: string;
  thumb: string;
  title: string;
  channel: Channel;
  views: string;
  ago: string;
  duration: string;
  description: string;
}

export function YouTubeSearch(props: PreviewProps) {
  const {
    thumbnail,
    title,
    description,
    channel,
    duration,
    views,
    publishedAgo,
    theme,
    mockFeed,
  } = props;

  const main: SearchCard = {
    id: 'main',
    thumb: thumbnail?.dataUrl ?? '',
    title,
    channel,
    views,
    ago: publishedAgo,
    duration,
    description,
  };

  const fillers: SearchCard[] = mockFeed
    ? generateMockFeed(6, channel).map((f) => ({
        id: f.id,
        thumb: f.thumbnail,
        title: f.title,
        channel: {
          name: f.channel,
          handle: '',
          avatarDataUrl: f.avatar,
          verified: false,
          subscribers: '',
        },
        views: f.views,
        ago: f.publishedAgo,
        duration: f.duration,
        description:
          'Descripción de ejemplo para este resultado de búsqueda, recortada a dos líneas.',
      }))
    : [];

  return (
    <div className="yt-surface yt-search" data-theme={theme}>
      <div className="yt-search-header">
        <YouTubeLogo height={20} light={theme === 'dark'} />
        <div className="yt-search-bar">
          <Search />
          <span>{title || 'Buscar'}</span>
          <Mic style={{ marginLeft: 'auto' }} />
          <Camera />
        </div>
        <ChannelAvatar channel={channel} className="yt-search-avatar" />
      </div>

      <div className="yt-search-list">
        {[main, ...fillers].map((card) => (
          <div className="yt-search-item" key={card.id}>
            <div className="yt-search-thumb-wrap">
              {card.thumb && <img className="yt-thumb-img" src={card.thumb} alt="" />}
              <DurationBadge duration={card.duration} />
            </div>
            <div className="yt-search-body">
              <h3 className="yt-search-title">{card.title}</h3>
              <p className="yt-search-meta">
                {card.views} · {card.ago}
              </p>
              <div className="yt-search-channel">
                <ChannelAvatar channel={card.channel} />
                <ChannelName name={card.channel.name} verified={card.channel.verified} />
              </div>
              <p className="yt-search-desc">{card.description}</p>
            </div>
            <MoreVertical className="yt-menu-dots" />
          </div>
        ))}
      </div>
    </div>
  );
}
