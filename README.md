# Core Keeper Planner / Planificador de Planos Core Keeper

English | [Español](#español)

---

## English

Design room and base blueprints for **Core Keeper** on a 1:1 grid. No installation, no internet, no registration.

### What is it?

**Core Keeper Planner** is a blueprint editor for the game Core Keeper. It lets you draw rooms, corridors, storage, and structures on a grid, exactly as they appear in the game.

Ideal for planning your base before building it in the game, sharing designs with the community, or saving templates to reuse.

### What's new in v0.1.6

- **A clearer construction catalog:** 82 construction and terrain entries are grouped under *Blocks and Colors*. Walls, blocks, floors, bridges, fences, rails, mats, and rugs are represented as colors instead of separate tile sprites. Colors listed by the Core Keeper Wiki are used where available; estimated colors are explicitly marked when the Wiki has no corresponding value.
- **A dedicated object catalog:** 185 placeable items are grouped under *Furniture, Stations and Lighting*, with filters for chests, tables, pedestals, pets, terrariums, aquariums, stations, beds, chairs, mechanisms, and lights.
- **More complete item sprites:** missing catalog images were added or corrected across lighting, furniture, rails, electrical components, drills, belts, sprinklers, portals, and other placeable objects. This includes Campfire, Rail, Lamp, and Crystal Lamp.
- **Simpler doors:** the catalog keeps one generic Door marker. Each placed door stores its own horizontal or vertical orientation, so changing one does not rotate the others.
- **Drawing tools follow the selected material:** Pencil, Line, Rectangle, and Circle use the item currently selected in the catalog. Wood Wall is selected by default when a new planner is opened.
- **A leaner catalog:** duplicate door variants and the Ancient Hologram Pod, Rift Statue, and Hydra Altar were removed from the placeable-object list.

#### v0.1.6 catalog screenshots

![Furniture and object catalog](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-muebles.png)
![Table catalog](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-mesas.png)
![Stations catalog](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-estaciones.png)
![Lighting catalog](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-iluminacion.png)
![Wall color catalog](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-paredes.png)
![Ground and block colors](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-suelos-bloques.png)

### Key Features

| Feature | Description |
|---------|-------------|
| **Grid drawing tools** | Paint, erase, draw lines, rectangles and circles, and fill connected areas using the currently selected material |
| **Construction colors** | Place walls, blocks, floors, bridges, fences, rails, mats and rugs as color-coded cells; Wiki colors are used where available and estimates are labeled |
| **Object catalog** | Browse and search 185 items with sprites, size information and categories for furniture, stations and lighting |
| **Object placement** | Place, select, move and rotate catalog items; door orientation is saved independently for every door |
| **Core placement** | Add the Core and its starting statues with one click |
| **Region editing** | Select, move, duplicate, flip, mirror and center parts of a blueprint |
| **Annotations** | Add editable text notes directly on the blueprint |
| **Plan controls** | Set blueprint dimensions and adjust zoom, grid, chunk guides, light coverage, line width and canvas background |
| **Save and share** | Save and reopen project files, export or import a shareable code, and export blueprint images as PNG |
| **Bilingual** | Interface in Spanish and English |

### How to use (3 steps)

1. **Download** the `.zip` file from [Releases](https://github.com/kraventD/Core-Keeper-Planner/releases)
2. **Extract** it to any folder on your computer
3. **Open** `index.html` with your browser (Chrome, Edge, Brave, or Firefox)

Ready. You can start drawing your blueprint.

> [!WARNING]
> **Don't want to unzip anything?** Download the standalone `.html` file from [Releases](https://github.com/kraventD/Core-Keeper-Planner/releases) and open it directly in your browser.

### Requirements

- Any computer with Windows, Mac, or Linux
- Modern web browser (Chrome, Edge, Brave, Firefox)
- **No installation needed**
- **No internet connection required** (works 100% offline)

### Screenshot

![Core Keeper Planner - Overview](preview-en.png)

### How to share your designs

1. Design your blueprint in the editor
2. Click **Export Code** to copy a shareable text code
3. Paste that code on Reddit, Facebook, Discord, or any forum
4. Another person pastes the code into their editor and loads your design exactly as you created it

You can also export to **PNG** to share a visual image of your blueprint.

### Quick keyboard shortcuts

| Key | Action |
|-----|--------|
| `V` | Select |
| `P` | Pencil |
| `E` | Eraser |
| `L` | Line |
| `R` | Rectangle |
| `C` | Circle |
| `K` | Place Core |
| `S` | Rect Select |
| `B` / `G` | Fill Area |
| `M` | Move Selection |
| `T` | Annotation |
| `1-9` | Select palette color |
| `+` / `-` | Zoom In / Zoom out |
| `Space` | Pan canvas |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |

### Support

Made for the Core Keeper community. If you find a bug or have a suggestion, open an issue on GitHub.

---

## Español

Diseña planos de habitaciones y bases para **Core Keeper** en una cuadrícula 1:1. Sin instalación, sin internet, sin registro.

### ¿Qué es?

**Core Keeper Planner** es un editor de planos (blueprint editor) para el juego Core Keeper. Te permite dibujar habitaciones, pasillos, almacenes y estructuras sobre una cuadrícula, exactamente como se ven en el juego.

Ideal para planear tu base antes de construirla en el juego, compartir diseños con la comunidad o guardar plantillas para reutilizar.

### Novedades de la v0.1.6

- **Catálogo de construcción más claro:** 82 entradas de construcción y terreno están agrupadas en *Bloques y colores*. Paredes, bloques, suelos, puentes, cercas, rieles, tapetes y alfombras se representan con colores en vez de sprites de piezas. Se usan los colores de la wiki de Core Keeper cuando están disponibles; los colores estimados quedan señalados cuando la wiki no publica un valor correspondiente.
- **Catálogo de objetos separado:** 185 objetos colocables están agrupados en *Muebles, estaciones e iluminación*, con filtros para cofres, mesas, pedestales, mascotas, terrarios, acuarios, estaciones, camas, sillas, mecanismos y luces.
- **Sprites más completos:** se añadieron o corrigieron imágenes faltantes para iluminación, muebles, rieles, componentes eléctricos, taladros, cintas transportadoras, aspersores, portales y otros objetos colocables. Incluye Fogata, Riel, Lámpara y Lámpara de cristal.
- **Puertas simplificadas:** el catálogo conserva un único marcador genérico de puerta. Cada puerta colocada guarda su propia orientación horizontal o vertical, por lo que cambiar una no rota las demás.
- **Herramientas de dibujo vinculadas al material seleccionado:** Lápiz, Línea, Rectángulo y Círculo utilizan el elemento activo del catálogo. Al abrir un plano nuevo, la Pared de madera queda seleccionada por defecto.
- **Catálogo más sencillo:** se quitaron las variantes duplicadas de puertas y se retiraron de la lista de objetos colocables la Cápsula holográfica antigua, la Estatua de la grieta y el Altar de la hidra.

#### Capturas del catálogo v0.1.6

![Catálogo de muebles y objetos](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-muebles.png)
![Catálogo de mesas](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-mesas.png)
![Catálogo de estaciones](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-estaciones.png)
![Catálogo de iluminación](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-iluminacion.png)
![Colores de paredes](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-paredes.png)
![Colores de suelos y bloques](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v0.1.6/catalogo-suelos-bloques.png)

### Características principales

| Característica | Descripción |
|---------------|-------------|
| **Herramientas de dibujo en cuadrícula** | Pintar, borrar, trazar líneas, rectángulos y círculos, y rellenar áreas conectadas con el material seleccionado |
| **Colores de construcción** | Representar paredes, bloques, suelos, puentes, cercas, rieles, tapetes y alfombras con colores; los colores de la wiki se usan cuando existen y las estimaciones se identifican |
| **Catálogo de objetos** | Buscar y explorar 185 objetos con sprite, tamaño y categorías para muebles, estaciones e iluminación |
| **Colocación de objetos** | Colocar, seleccionar, mover y girar objetos del catálogo; cada puerta conserva su propia orientación |
| **Colocación del Core** | Agregar el Core y sus estatuas iniciales con un clic |
| **Edición de regiones** | Seleccionar, mover, duplicar, voltear, espejear y centrar partes del plano |
| **Anotaciones** | Agregar y editar notas de texto directamente sobre el plano |
| **Controles del plano** | Definir dimensiones y ajustar zoom, cuadrícula, guía de chunks, cobertura de luz, grosor de línea y fondo |
| **Guardar y compartir** | Guardar y abrir archivos de proyecto, exportar o importar códigos compartibles y exportar imágenes PNG |
| **Bilingüe** | Interfaz en español e inglés |

### Cómo usarlo (3 pasos)

1. **Descarga** el archivo `.zip` desde [Releases](https://github.com/kraventD/Core-Keeper-Planner/releases)
2. **Descomprímelo** en cualquier carpeta de tu computadora
3. **Abre** `index.html` con tu navegador (Chrome, Edge, Brave o Firefox)

Listo. Ya puedes empezar a dibujar tu plano.

> [!WARNING]
> **¿No quieres descomprimir nada?** Descarga el archivo `.html` independiente desde [Releases](https://github.com/kraventD/Core-Keeper-Planner/releases) y ábrelo directamente en tu navegador.

### Requisitos

- Cualquier computadora con Windows, Mac o Linux
- Navegador web moderno (Chrome, Edge, Brave, Firefox)
- **No necesitas instalar nada**
- **No necesitas conexión a internet** (funciona 100% offline)

### Captura

![Editor Core Keeper Planner - vista general](preview.png)

### Cómo compartir tus diseños

1. Diseña tu plano en el editor
2. Haz clic en **Exportar código** para copiar un texto compartible
3. Pega ese texto en Reddit, Facebook, Discord o cualquier foro
4. Otra persona pega el código en su editor y carga tu diseño exactamente como lo creaste

También puedes exportar a **PNG** para compartir una imagen visual de tu plano.

### Atajos de teclado rápidos

| Tecla | Acción |
|-------|--------|
| `V` | Seleccionar |
| `P` | Lápiz |
| `E` | Borrador |
| `L` | Línea |
| `R` | Rectángulo |
| `C` | Círculo |
| `K` | Colocar Core |
| `S` | Selección rectangular |
| `B` / `G` | Rellenar área |
| `M` | Mover selección |
| `T` | Anotación |
| `1-9` | Seleccionar color de paleta |
| `+` / `-` | Acercar / Alejar zoom |
| `Espacio` | Mover el lienzo |
| `Ctrl+Z` / `Ctrl+Y` | Deshacer / Rehacer |

### Soporte

Hecho para la comunidad de Core Keeper. Si encuentras un error o tienes una sugerencia, abre un issue en GitHub.

---

*Core Keeper Planner - Planificador de construcción y habitaciones 1:1*
