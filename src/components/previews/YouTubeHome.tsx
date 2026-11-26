import { MoreVertical } from 'lucide-react';
import { ChannelAvatar, ChannelName } from '../common/YouTubeBits';
import { DurationBadge } from './DurationBadge';
import type { PreviewProps } from './types';
import type { Channel } from '../../types';
import { generateMockFeed } from '../../lib/mockFeed';

interface HomeCard {
  id: string;
  thumb: string;
  title: string;
  channel: Channel;
  views: string;
  ago: string;
  duration: string;
}

export function YouTubeHome(props: PreviewProps) {
  const { thumbnail, title, channel, duration, views, publishedAgo, mockFeed } = props;

  const main: HomeCard = {
    id: 'main',
    thumb: thumbnail?.dataUrl ?? '',
    title,
    channel,
    views,
    ago: publishedAgo,
    duration,
  };

  const fillers: HomeCard[] = mockFeed
    ? generateMockFeed(8, channel).map((f) => ({
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

  const cards = [main, ...fillers];

  return (
    <div className="yt-surface yt-home" data-theme={props.theme}>
      <div className="yt-home-grid">
        {cards.map((card) => (
          <div className="yt-home-card" key={card.id}>
            <div className="yt-thumb">
              {card.thumb && <img className="yt-thumb-img" src={card.thumb} alt="" />}
              <div className="yt-thumb-overlay" />
              <DurationBadge duration={card.duration} />
            </div>
            <div className="yt-home-meta">
              <ChannelAvatar channel={card.channel} />
              <div className="yt-home-text">
                <h3 className="yt-home-title">{card.title}</h3>
                <p className="yt-meta-line">
                  <ChannelName name={card.channel.name} verified={card.channel.verified} />
                </p>
                <p className="yt-meta-line">
                  {card.views} · {card.ago}
                </p>
              </div>
              <MoreVertical className="yt-menu-dots" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
