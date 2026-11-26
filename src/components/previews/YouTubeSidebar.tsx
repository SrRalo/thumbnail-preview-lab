import { MoreVertical } from 'lucide-react';
import { ChannelName } from '../common/YouTubeBits';
import { DurationBadge } from './DurationBadge';
import type { PreviewProps } from './types';
import type { Channel } from '../../types';
import { generateMockFeed } from '../../lib/mockFeed';

interface SideCard {
  id: string;
  thumb: string;
  title: string;
  channel: Channel;
  views: string;
  ago: string;
  duration: string;
}

export function YouTubeSidebar(props: PreviewProps) {
  const { thumbnail, title, channel, duration, views, publishedAgo, theme, mockFeed } = props;

  const main: SideCard = {
    id: 'main',
    thumb: thumbnail?.dataUrl ?? '',
    title,
    channel,
    views,
    ago: publishedAgo,
    duration,
  };

  const fillers: SideCard[] = mockFeed
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
      }))
    : [];

  return (
    <div className="yt-surface yt-sidebar" data-theme={theme}>
      <h2 className="yt-sidebar-heading">A continuación</h2>
      <div className="yt-side-list">
        {[main, ...fillers].map((card) => (
          <div className="yt-side-item" key={card.id}>
            <div className="yt-side-thumb">
              {card.thumb && <img className="yt-thumb-img" src={card.thumb} alt="" />}
              <DurationBadge duration={card.duration} />
            </div>
            <div className="yt-side-body">
              <h3 className="yt-side-title">{card.title}</h3>
              <p className="yt-side-channel">
                <ChannelName name={card.channel.name} verified={card.channel.verified} />
              </p>
              <p className="yt-side-meta">
                {card.views} · {card.ago}
              </p>
              <MoreVertical className="yt-menu-dots" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
