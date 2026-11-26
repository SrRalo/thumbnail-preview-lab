import type { Channel } from '../../types';
import { channelInitial } from '../../lib/format';

/** Botón de play oficial de YouTube (rectángulo rojo + triángulo blanco). */
export function YouTubePlayButton({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className} aria-hidden="true">
      <path
        d="M27.486 3.136A3.52 3.52 0 0 0 25.005.652C22.83.094 14 .094 14 .094s-8.83 0-11.005.558A3.52 3.52 0 0 0 .514 3.136C. 5.31 0 10 0 10s0 4.69.514 6.864a3.52 3.52 0 0 0 2.481 2.484C5.17 19.906 14 19.906 14 19.906s8.83 0 11.005-.558a3.52 3.52 0 0 0 2.481-2.484C28 14.69 28 10 28 10s0-4.69-.514-6.864Z"
        fill="#ff0033"
      />
      <path d="M11.2 14.286V5.714L18.667 10 11.2 14.286Z" fill="#fff" />
    </svg>
  );
}

/** Logotipo YouTube: play + wordmark. */
export function YouTubeLogo({
  height = 20,
  light = false,
}: {
  height?: number;
  light?: boolean;
}) {
  return (
    <span
      className="yt-logo-text"
      style={{ height, fontSize: height * 0.95, color: light ? '#fff' : '#0f0f0f' }}
    >
      <YouTubePlayButton className="yt-mark" />
      <span>YouTube</span>
    </span>
  );
}

/** Icono de canal verificado de YouTube. */
export function VerifiedBadge() {
  return (
    <svg className="yt-verified" viewBox="0 0 24 24" aria-label="Verificado" role="img">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.06 14.14-4.24-4.24 1.41-1.41 2.83 2.83 6.01-6.01 1.41 1.41-7.42 7.42z"
      />
    </svg>
  );
}

/** Avatar con imagen o inicial, tal como YouTube muestra los canales. */
export function ChannelAvatar({
  channel,
  src,
  className = 'yt-avatar',
}: {
  channel?: Channel;
  src?: string;
  className?: string;
}) {
  const image = src ?? channel?.avatarDataUrl;
  const initial = channelInitial(channel?.name ?? '?');
  if (image) {
    return <img className={className} src={image} alt={channel?.name ?? 'Canal'} />;
  }
  return (
    <div className={className} aria-label={channel?.name}>
      {initial}
    </div>
  );
}

/** Nombre del canal con su badge de verificado si aplica. */
export function ChannelName({ name, verified }: { name: string; verified: boolean }) {
  return (
    <>
      <span>{name}</span>
      {verified && <VerifiedBadge />}
    </>
  );
}
