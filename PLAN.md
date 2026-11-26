# Thumbnail Preview Lab — Plan del proyecto

App local para simular cómo se vería un video de YouTube (y otras plataformas) antes de subirlo: pruebas de miniaturas, títulos y descripciones, con avatar de canal y duración ajustables. Todo corre en el navegador, sin backend ni base de datos en la nube.

---

## 1. Objetivos

- Subir una o varias miniaturas para un mismo video y compararlas.
- Probar varios títulos y descripciones.
- Subir el avatar del canal y definir nombre del canal, vistas, fecha, etc.
- Ajustar la duración que se muestra sobre la miniatura (badge `12:34`).
- Ver la vista previa en distintos contextos/plataformas (home, búsqueda, sugeridos, móvil, modo claro/oscuro).
- Guardar todo **solo mientras la pestaña está abierta**: al cerrarla, se pierde.

### Fuera de alcance
- Backend, cuentas, base de datos en la nube, subida real a YouTube.
- Analítica o predicción de CTR.

---

## 2. Stack

| Pieza | Elección | Motivo |
|---|---|---|
| Build | **Vite** | Rápido, cero configuración |
| UI | **React 18 + TypeScript** | Tipado para el modelo de datos |
| Estado | **Zustand** (+ middleware `persist`) | Simple, persistencia en storage con una línea |
| Persistencia | **sessionStorage** | Se borra al cerrar la pestaña (justo lo pedido) |
| Estilos | **Tailwind CSS** (o CSS Modules) | Iterar rápido sobre réplicas visuales |
| Iconos | `lucide-react` | Verificado, check, menú, etc. |
| Utilidades | `nanoid` para IDs | IDs de variantes |

Sin servidor: `npm run dev` y listo. Opcional: `npm run build && npm run preview` para usarlo como app estática.

---

## 3. Modelo de datos

```ts
type ID = string;

interface ThumbnailVariant {
  id: ID;
  label: string;          // "Miniatura A", "Con texto grande", etc.
  dataUrl: string;        // imagen redimensionada (ver §5)
}

interface TitleVariant {
  id: ID;
  text: string;
}

interface DescriptionVariant {
  id: ID;
  text: string;
}

interface Channel {
  name: string;
  handle: string;         // @micanal
  avatarDataUrl?: string;
  verified: boolean;
  subscribers: string;    // "125 k suscriptores"
}

interface VideoProject {
  id: ID;
  name: string;           // nombre interno del video
  channel: Channel;
  durationSeconds: number;
  views: string;          // "1,2 M de vistas"
  publishedAgo: string;   // "hace 2 horas"
  thumbnails: ThumbnailVariant[];
  titles: TitleVariant[];
  descriptions: DescriptionVariant[];
  selected: {
    thumbnailId?: ID;
    titleId?: ID;
    descriptionId?: ID;
  };
}

interface AppState {
  projects: VideoProject[];
  activeProjectId?: ID;
  ui: {
    theme: 'light' | 'dark';
    layout: PreviewLayout;      // ver §4
    compareMode: boolean;
  };
}
```

El canal puede vivir dentro del proyecto o como "perfil" compartido entre proyectos (decisión menor, ver §9).

---

## 4. Vistas previa (componentes)

Cada vista es un componente que recibe `{ thumbnail, title, description, channel, duration, views, publishedAgo, theme }`.

### Fase 1 — YouTube
1. **Home (grid)** — tarjeta 16:9, avatar + título (2 líneas máx.) + canal + vistas · fecha.
2. **Búsqueda (lista)** — miniatura a la izquierda, título, vistas, canal con avatar y **snippet de descripción** (2 líneas).
3. **Sugeridos (sidebar)** — miniatura pequeña, título en 2 líneas, canal, vistas.
4. **Móvil** — tarjeta a ancho completo dentro de un marco de teléfono (~390 px).

### Fase 2 — Otras plataformas (opcional)
5. Link card tipo X/Twitter y Facebook (imagen 1.91:1 con recorte).
6. Discord embed.
7. Vista tipo TV / pantalla grande.

### Detalles visuales a replicar
- Badge de duración: abajo a la derecha, fondo negro semitransparente, texto blanco 12 px, esquinas redondeadas.
- Formato de duración: `m:ss` o `h:mm:ss` según `durationSeconds`.
- Truncado del título con `line-clamp-2`.
- Icono de verificado junto al nombre del canal.
- Tema claro y oscuro (fondo `#fff` / `#0f0f0f`).
- Hover: opcional, animar sobre la miniatura (como el preview de YouTube).

---

## 5. Manejo de imágenes y caché

**Requisito:** guardar mientras se prueba; al cerrar la pestaña, se borra.

**Estrategia:** `sessionStorage` vía `zustand/middleware/persist`. Se limpia solo al cerrar la pestaña.

**Problema:** sessionStorage tiene ~5 MB, y una miniatura en base64 puede pesar mucho.

**Solución:**
1. Al subir una imagen, pasarla por un `<canvas>` y redimensionar a **1280×720 máx.** (conservando proporción).
2. Exportar como **JPEG calidad ~0.85** (o WebP) → ~100–250 KB por miniatura.
3. Avatares: redimensionar a **256×256**, recortado a cuadrado.
4. Guardar como `dataUrl` en el estado.
5. Mostrar aviso si se acerca al límite (`try/catch` en el `setItem`).

**Plan B** si se queda corto: mover los blobs a **IndexedDB** y limpiarlo al iniciar si no existe una bandera en `sessionStorage` (así se comporta igual: se pierde al cerrar). Solo se implementa si hace falta.

Extras:
- Botón **"Borrar todo"** para resetear la sesión.
- Opcional: exportar/importar un `.json` manual por si se quiere conservar algo a propósito.

---

## 6. Funcionalidades por pantalla

### 6.1 Panel de edición (izquierda)
- **Proyecto/video**: selector, crear, renombrar, duplicar, eliminar.
- **Miniaturas**: zona drag & drop + botón de subida múltiple, lista con thumbnails, renombrar etiqueta, eliminar, marcar como activa.
- **Títulos**: lista editable, añadir/quitar, marcar activo, contador de caracteres (YouTube corta ~70).
- **Descripciones**: lo mismo, con contador.
- **Canal**: subir avatar, nombre, handle, verificado, suscriptores.
- **Metadatos**: duración (input `mm:ss` + slider), vistas, "hace X".

### 6.2 Área de previsualización (derecha)
- Selector de vista (Home / Búsqueda / Sugeridos / Móvil / …).
- Toggle tema claro/oscuro.
- Toggle ancho/zoom.
- La vista refleja los cambios **en tiempo real**.

### 6.3 Modo comparación
- Mostrar **N miniaturas del mismo video lado a lado** en el mismo layout (con el mismo título), o **combinaciones** miniatura × título.
- Mezclar con otros videos "de relleno" (tarjetas falsas) para simular cómo destaca tu miniatura en un feed.
- Extra: botón "feed simulado" con 6–12 tarjetas de relleno generadas con placeholders.

### 6.4 Atajos útiles (opcional)
- `←` / `→` para rotar entre miniaturas.
- `T` cambia tema.
- Arrastrar para reordenar variantes.

---

## 7. Estructura de carpetas

```
thumbnail-preview-lab/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ store/
   │  └─ useAppStore.ts        # zustand + persist(sessionStorage)
   ├─ types/
   │  └─ index.ts
   ├─ lib/
   │  ├─ image.ts              # resize/crop con canvas
   │  ├─ format.ts             # formatDuration, truncados
   │  └─ mockFeed.ts           # tarjetas de relleno
   ├─ components/
   │  ├─ editor/
   │  │  ├─ ProjectPicker.tsx
   │  │  ├─ ThumbnailManager.tsx
   │  │  ├─ TextVariantList.tsx   # reutilizable para títulos y descripciones
   │  │  ├─ ChannelForm.tsx
   │  │  └─ MetaForm.tsx          # duración, vistas, fecha
   │  ├─ previews/
   │  │  ├─ YouTubeHome.tsx
   │  │  ├─ YouTubeSearch.tsx
   │  │  ├─ YouTubeSidebar.tsx
   │  │  ├─ YouTubeMobile.tsx
   │  │  ├─ DurationBadge.tsx
   │  │  └─ PreviewShell.tsx      # tema, zoom, marco
   │  └─ compare/
   │     └─ CompareGrid.tsx
   └─ styles/
      └─ index.css
```

---

## 8. Hoja de ruta por fases

### Fase 0 — Setup (½ día)
- [ ] `npm create vite@latest -- --template react-ts`
- [ ] Instalar Tailwind, Zustand, nanoid, lucide-react.
- [ ] Layout base de dos columnas (editor | preview).

### Fase 1 — MVP (1–2 días)
- [ ] Store con persistencia en `sessionStorage`.
- [ ] Subida de **una** miniatura + redimensionado con canvas.
- [ ] Campos de título, descripción, canal, avatar, duración.
- [ ] Vista **YouTube Home** con badge de duración.
- [ ] Tema claro/oscuro.

### Fase 2 — Variantes (1 día)
- [ ] Múltiples miniaturas, títulos y descripciones por video.
- [ ] Selección de la variante activa.
- [ ] Vistas **Búsqueda** y **Sugeridos**.
- [ ] Varios proyectos/videos.

### Fase 3 — Comparación y móvil (1 día)
- [ ] Modo comparación lado a lado.
- [ ] Vista móvil con marco de teléfono.
- [ ] Feed simulado con tarjetas de relleno.

### Fase 4 — Pulido (½–1 día)
- [ ] Contadores de caracteres y avisos de límite de storage.
- [ ] Drag & drop para reordenar.
- [ ] Botón "Borrar todo" con confirmación.
- [ ] Exportar/importar JSON (opcional).
- [ ] Otras plataformas (X, Facebook, Discord) si se desea.

---

## 9. Decisiones abiertas

1. **¿Canal compartido o por proyecto?** Recomendado: un único canal global (se sube el avatar una vez) con opción de sobrescribirlo por video.
2. **sessionStorage vs IndexedDB**: empezar con sessionStorage; pasar a IndexedDB solo si el límite de 5 MB estorba.
3. **Fidelidad visual**: replicar medidas reales de YouTube (tamaños de fuente, paddings, radios) o una aproximación fiel. Recomendado: medir sobre YouTube real con DevTools y copiar valores.
4. **Plataformas extra**: ¿cuáles importan realmente? Definir antes de la Fase 4.

---

## 10. Criterios de "listo"

- Subo una miniatura, la veo en la vista Home con su badge de duración en menos de 1 s.
- Puedo tener ≥ 5 miniaturas y ≥ 3 títulos del mismo video y alternarlos sin recargar.
- Recargar la página (F5) **conserva** todo; cerrar la pestaña lo **borra**.
- El avatar y el nombre del canal aparecen en todas las vistas.
- Funciona sin conexión y sin ningún servidor aparte del de Vite.
