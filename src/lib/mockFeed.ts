import type { Channel } from '../types';

export interface FillerCard {
  id: string;
  title: string;
  channel: string;
  views: string;
  publishedAgo: string;
  thumbnail: string;
  avatar: string;
  duration: string;
}

const PALETTES: Array<[string, string]> = [
  ['#1f3c88', '#5b8def'],
  ['#7b1fa2', '#e040fb'],
  ['#00695c', '#4db6ac'],
  ['#b71c1c', '#ff5252'],
  ['#e65100', '#ffb74d'],
  ['#283593', '#7986cb'],
  ['#4a148c', '#ba68c8'],
  ['#004d40', '#26a69a'],
  ['#c62828', '#ef5350'],
  ['#01579b', '#29b6f6'],
  ['#3e2723', '#8d6e63'],
  ['#212121', '#616161'],
];

const TITLES = [
  'Cómo editar videos como un PRO en 2026 (guía completa)',
  'Mi setup de escritorio definitivo para crear contenido',
  'Comparativa: ¿Vale la pena este nuevo equipo?',
  '5 trucos de edición que nadie te enseña',
  'Grabando en 4K con luz natural — resultado increíble',
  'Todo lo que aprendí en 30 días subiendo videos',
  'Review sincera: lo bueno y lo malo del producto',
  'El secreto de los títulos que reciben más clics',
  'Viaje de 24 horas por la ciudad en bicicleta',
  'Aprender a programar en 10 minutos (en serio)',
  'Ranking de las mejores miniaturas del año',
  'Cocinando recetas rápidas con 3 ingredientes',
];

const CHANNELS = [
  'Estudio Creativo',
  'Tecnología Hoy',
  'El Rincón del Editor',
  'Vida Digital',
  'Aprende Fácil',
  'Mundo Gamer',
  'Cocina Rápida',
  'Viajes y Más',
];

const VIEWS = [
  '124 mil vistas',
  '1,2 M de vistas',
  '348 mil vistas',
  '26 mil vistas',
  '2,1 M de vistas',
  '89 mil vistas',
  '512 mil vistas',
  '17 mil vistas',
];

const AGOS = [
  'hace 2 días',
  'hace 1 semana',
  'hace 3 horas',
  'hace 2 semanas',
  'hace 11 meses',
  'hace 5 días',
];

const DURATIONS = ['8:42', '12:03', '24:15', '5:38', '1:02:11', '17:49', '9:20', '31:04'];

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeThumb(index: number): string {
  const [a, b] = PALETTES[index % PALETTES.length];
  const label = String(index + 1).padStart(2, '0');
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="${b}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="540" cy="80" r="150" fill="#ffffff" opacity="0.07"/>
      <circle cx="90" cy="310" r="190" fill="#000000" opacity="0.10"/>
      <text x="52" y="240" font-family="Roboto,Arial,sans-serif" font-size="150" font-weight="700" fill="#ffffff" opacity="0.9">${label}</text>
    </svg>`);
}

function makeAvatar(index: number): string {
  const [a, b] = PALETTES[(index + 4) % PALETTES.length];
  const letter = CHANNELS[index % CHANNELS.length].charAt(0);
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="${b}"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill="url(#a)"/>
      <text x="48" y="66" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-size="52" font-weight="500" fill="#ffffff">${letter}</text>
    </svg>`);
}

/** Tarjetas falsas para simular un feed real alrededor de la miniatura. */
export function generateMockFeed(count: number, channel?: Channel): FillerCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `filler-${i}`,
    title: TITLES[i % TITLES.length],
    channel: i % 7 === 0 && channel ? channel.name : CHANNELS[i % CHANNELS.length],
    views: VIEWS[i % VIEWS.length],
    publishedAgo: AGOS[i % AGOS.length],
    thumbnail: makeThumb(i),
    avatar: i % 7 === 0 && channel?.avatarDataUrl
      ? channel.avatarDataUrl
      : makeAvatar(i),
    duration: DURATIONS[i % DURATIONS.length],
  }));
}
