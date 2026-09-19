# Solea Solar

Una experiencia de calentamiento solar para Ciudad de México y área metropolitana. **Marca, productos y precios ficticios para un prototipo comercial.**

**Sitio:** https://alexis01001415-oss.github.io/solea-solar/

## Desarrollo

Requiere Node.js 22.12+ (o 24+).

```sh
npm ci
npm run dev
```

Abre `http://127.0.0.1:5173/solea-solar/`.

```sh
npm test
npm run build
npm run preview
```

## Experiencia

- HTML semántico estático, Vite, JavaScript modular y CSS responsive.
- Calentador Three.js que cambia de posición y ángulo durante los tres primeros capítulos; controles de giro accesibles por teclado. En móvil se mantiene dentro de sus espacios para no tapar texto.
- Casa procedural, sombras, vegetación, azotea, tinaco, calentador y tuberías. Cinco vistas de instalación con controles, reproducción y pausa.
- Cotizador local con capacidades e importes ilustrativos. Presión desconocida o ubicación fuera del área: solicita valoración en vez de inventar un precio.
- PDF creado bajo demanda con jsPDF. La solicitud de contacto añade los datos del formulario al documento local; **no hay envío ni almacenamiento de contactos**.
- Lora, Raleway y Google Material Symbols servidos localmente.

## Publicación

El workflow `.github/workflows/deploy.yml` verifica, compila y publica cada push a `main`. GitHub Pages debe usar **GitHub Actions** como origen. No requiere secretos propios. La ruta base se configura en `vite.config.js`; al cambiar el nombre del repositorio se deben actualizar también las URL canónicas, Open Graph, sitemap, robots, enlaces del PDF y `scripts/seo.mjs`.

## SEO, AEO y búsqueda generativa

Contenido principal presente en HTML, un H1, jerarquía de títulos, `lang=es-MX`, título y descripción, canonical, Open Graph, sitemap y JSON-LD de WebSite, WebPage y FAQPage. Las preguntas estructuradas se generan desde el contenido visible para evitar contradicciones. No se publican valoraciones ni negocios locales inventados. El prototipo está marcado como tal. Estas medidas facilitan la comprensión e indexación; **no garantizan posiciones en Google, rich results ni citas por asistentes**.

Para una marca real: sustituir los datos ficticios, usar dominio propio, configurar Search Console, comprobar indexación y publicar condiciones/garantías verificadas.

## Rendimiento y seguridad

El modelo optimizado ocupa 1,213,880 bytes frente a 5,105,556 bytes del original. Solo se carga una vez y se reutiliza. La casa se carga cerca de su sección; jsPDF solo al descargar. Render bajo demanda, DPR limitado, pausa cuando la pestaña o escena no está visible y respeto a `prefers-reduced-motion`. Sombras estáticas reutilizadas en el recorrido.

CSP restrictiva en meta, hash del JSON-LD, activos propios, sin scripts externos ni secretos, sin `innerHTML` con entradas del usuario, validación HTML y límites de longitud. No hay servidor ni base de datos que mantener. GitHub Pages controla HTTPS y los encabezados de respuesta: CSP `frame-ancestors`, HSTS personalizado y otros encabezados que requieren configuración del servidor no pueden imponerse mediante una etiqueta meta. El dominio propio puede añadir una capa de alojamiento/proxy si se necesitan políticas adicionales.

## Verificación

`npm test` cubre lógica del cotizador: tamaño de hogar, presión, zona y entradas inválidas. La revisión manual cubre controles 3D, navegación, formulario, descargas, estados y tamaños de pantalla. En desarrollo, `?audit=1` ejecuta axe y deja los resultados en el elemento `#accessibility-report`; este módulo no se incluye en producción. Un análisis automático no equivale a una certificación completa de accesibilidad.

## Archivos clave

- `index.html`: contenido y estructura.
- `src/styles.css`: sistema visual y adaptación.
- `src/product.js`, `src/tour.js`, `src/three-shared.js`: escenas 3D.
- `src/quote.js`, `src/pdf.js`: cálculo y documento.
- `src/config.js`: copy del recorrido y fuentes.
- `scripts/prepare-assets.mjs`: adaptación opcional del GLB suministrado (no es necesaria para compilar; los activos optimizados están incluidos).

Ver [créditos y fuentes](THIRD_PARTY_NOTICES.md).
