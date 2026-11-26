# Thumbnail Preview Lab

Simulador local de cómo se verá tu video en YouTube antes de subirlo. Prueba miniaturas, títulos, descripciones y metadatos del canal con **fidelidad visual** al diseño real de YouTube (tipografía Roboto, colores, medidas y radios).

## Arranque

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Para una app estática:

```bash
npm run build && npm run preview
```

## Funcionalidades

- **Miniaturas** múltiples por video: drag & drop o selección multiple; se redimensionan a 1280×720 y se guardan como JPEG.
- **Avatar** del canal recortado a 256×256, nombre, handle, verificación y suscriptores.
- **Títulos y descripciones** con variantes activas y contador de caracteres.
- **Metadatos**: duración (`m:ss` / `h:mm:ss`), vistas y fecha de publicación.
- **Vistas**: Inicio (grid), Búsqueda (lista), Sugeridos (sidebar), Móvil (marco de teléfono) y Comparar (matriz miniatura × título).
- **Feed simulado**: rodea el video con tarjetas de relleno para ver cómo destaca.
- **Tema claro/oscuro**, zoom, y atajos `←`/`→` (rotar miniaturas) y `T` (tema).
- **Persistencia**: `sessionStorage` vía Zustand — sobrevive a F5, se borra al cerrar la pestaña.
- **Exportar/importar JSON** y **Borrar todo** con confirmación.
- Parámetros de URL para compartir una vista: `?layout=search&theme=dark&feed=1`.

## Fidelidad visual

Se replican los tokens reales de YouTube: Roboto (400/500/700, empaquetado localmente para funcionar sin conexión), fondos `#ffffff` / `#0f0f0f`, texto `#0f0f0f` / `#f1f1f1`, secundario `#606060` / `#aaaaaa`, títulos de 16 px/500 en Inicio, 20 px/400 en Búsqueda y 14 px/500 en Sugeridos, badge de duración de 12 px sobre negro al 80 % y miniaturas 16:9 con radio de 12 px (8 px en Búsqueda y Sugeridos).

## Estructura

```
src/
  components/editor/    Panel de edición
  components/previews/  Réplicas de YouTube
  components/compare/   Comparador
  store/                Zustand + persist(sessionStorage)
  lib/                  Imágenes, formato y feed falso
  styles/               Tokens y estilos de YouTube
```
