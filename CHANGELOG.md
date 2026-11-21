# Changelog

## v1.2.2a — Core footprint collision hotfix

### English

- The Core sprite now blocks only its occupied tiles instead of its full 19×13 visual bounds. Placement, movement, rotation and clipboard overlap checks use the sparse footprint.
- The placement preview highlights only the intersecting tiles and reports the blocking object and tile coordinates.
- Kept the Core sprite out of the object catalog; it remains available through its dedicated tool.

### Español

- El sprite del Core ahora ocupa solo las casillas que utiliza, no todo el rectángulo visual de 19×13. La colocación, el movimiento, la rotación y el pegado validan su huella dispersa.
- La previsualización resalta únicamente las casillas que chocan e indica el objeto que bloquea y sus coordenadas.
- El Core se mantiene fuera del catálogo de objetos y disponible mediante su herramienta dedicada.

## v1.2.2 — Core sprite replacement

### English

- Replaced the colored Core-and-statues stamp with the complete transparent Core sprite. The dedicated Core tool now places it as one object with the existing 19×13 tile footprint and preserved image proportions.
- Removed the temporary Core sprite entry from the object catalog to avoid duplicate ways to place it.
- Updated the Core placement preview and center-on-blueprint action to use the sprite.

### Español

- Se reemplazó el patrón de colores del Core y las estatuas por el sprite completo con fondo transparente. La herramienta dedicada del Core ahora lo coloca como un solo objeto con la huella actual de 19×13 casillas y conserva la proporción de la imagen.
- Se quitó del catálogo la entrada temporal del sprite para evitar que haya dos formas de colocarlo.
- La previsualización y la acción para centrar el Core en el plano ahora usan el sprite.

## v1.2.1 — Multi-object orientation

### English

- Added four-direction orientation controls to rectangular selections containing editable objects, so all selected objects can be pointed up, right, down or left together.
- The selection inspector shows the number of affected objects and highlights a direction when all selected objects share it.
- Orientation changes recalculate rotated footprints and are applied as one operation. If any object would leave the blueprint or overlap another item, the entire change is rejected.

### Español

- Se añadieron controles de orientación en cuatro direcciones para las selecciones rectangulares que contienen objetos editables, para orientar juntos todos los objetos seleccionados hacia arriba, derecha, abajo o izquierda.
- El inspector muestra cuántos objetos se modificarán y resalta la dirección cuando todos comparten la misma.
- Los cambios recalculan las huellas al girar y se aplican como una sola operación. Si algún objeto queda fuera del plano o choca con otro, se cancela el cambio completo.

## v1.2.0a — GitHub Pages sprite loading hotfix

### English

- Fixed public asset paths for placed objects, floors and game sprite atlases when the planner runs from the repository subpath on GitHub Pages.

### Español

- Se corrigieron las rutas de los recursos públicos de objetos, suelos y atlas de sprites para que carguen en GitHub Pages desde la subruta del repositorio.

## v1.2.0 — Recovery history and clipboard workflow

### English

- Added an incremental recovery history that saves a point every five minutes when the blueprint has changed. Each point includes a thumbnail, timestamp and project summary; the latest 48 points are kept and can be restored from the recovery panel.
- Improved selection mirroring and horizontal/vertical flips with a ghost preview before committing the transformation. Floors, colored blocks and placed objects are included, and object orientation follows the transform.
- Reworked clipboard pasting into a cursor-following placement preview. It highlights out-of-bounds or occupied object footprints, warns when blocks or floors will be replaced, and pastes with one click when valid.
- Added a canvas hint after copying that points users to Paste to preview the clipboard.
- The note editor now focuses its text field as soon as it opens, so typing can start immediately.

### Español

- Se añadió un historial incremental de recuperación que guarda un punto cada cinco minutos cuando el plano ha cambiado. Cada punto incluye miniatura, fecha y resumen del plano; se conservan los últimos 48 y se pueden restaurar desde el panel de recuperación.
- Se mejoraron el espejo de selecciones y los volteos horizontal y vertical con una previsualización fantasma antes de aplicar el cambio. Incluye suelos, bloques de color y objetos colocados, y ajusta la orientación de los objetos.
- Se mejoró el pegado del portapapeles con una previsualización que sigue al cursor. Marca huellas de objetos fuera del plano o que ocupan el espacio, avisa si se reemplazarán bloques o suelos y permite pegar con un clic cuando la ubicación es válida.
- Al copiar aparece un aviso en el lienzo que indica que se debe pulsar Pegar para ver la previsualización.
- El editor de notas ahora enfoca el campo de texto al abrirse para que puedas empezar a escribir de inmediato.

## v1.1.1 — Selection and annotation tools

### English

- Fixed a destructive note-click bug: clicking or dragging a note while the pencil or eraser is active no longer submits an empty stroke that clears the blueprint's colored blocks.
- Expanded connected-area fill to apply the selected floor or catalog object across the connected region. Multi-tile objects respect their full footprint and skip overlaps or positions outside the plan.
- Made note actions discoverable: select a note to edit, rotate or delete it, double-click to edit, and drag to move. Replaced browser prompts with an in-app note editor. Note rotation is preserved in share codes.
- Added rectangular selection scopes for all contents, floors only, or placed objects only. Copy, cut, move and delete now honor the chosen scope.
- Corrected visual sizing for rotated double-wide chests so their sprite matches the rotated 1×2 footprint instead of stretching to 2×2.

### Español

- Se corrigió un error destructivo al interactuar con notas: hacer clic o arrastrar una nota con el lápiz o el borrador activos ya no guarda un trazo vacío que borra los bloques de color del plano.
- El rellenado de áreas conectadas ahora aplica el suelo u objeto seleccionado del catálogo a toda la región. Los objetos de varias casillas respetan su huella completa y omiten espacios ocupados o fuera del plano.
- Se hicieron visibles las acciones de las notas: al seleccionarlas puedes editarlas, girarlas o borrarlas; el doble clic abre la edición y también puedes arrastrarlas para moverlas. El editor de notas ahora está integrado en la app. La rotación se conserva en los códigos compartidos.
- Se añadieron alcances para la selección rectangular: todo el contenido, solo suelos o solo objetos colocados. Copiar, cortar, mover y borrar respetan el alcance elegido.
- Se corrigió el tamaño visual de los cofres dobles girados para que el sprite coincida con la huella rotada de 1×2 y no se estire a 2×2.

## v1.1.0 — Nature catalog and editor refinements

### English

- Added 22 decorative pot variants for the mature and golden crops already represented in the nature catalog. Their placement footprint is 1×1 tile, and each sprite keeps its full visual height.
- Added a center guide to help align mirrored designs. It is enabled by default; 16×16 chunk guides and approximate light coverage are disabled by default.
- Added an optional eraser setting to remove placed objects and floors while respecting hidden or locked layers.
- Corrected tall object rendering in PNG exports so custom visual bounds, including the two-tile Caveling Fireplace, match the editor.

### Español

- Se añadieron 22 variantes de cultivos maduros y dorados en macetas decorativas al catálogo de naturaleza. Su huella de colocación es de 1×1 casilla y cada sprite conserva toda su altura visual.
- Se agregó una guía del centro para alinear diseños con espejo. Está activada por defecto; las guías de chunks 16×16 y la cobertura aproximada de luces quedan desactivadas por defecto.
- Se añadió una opción al borrador para borrar objetos colocados y suelos, respetando las capas ocultas o bloqueadas.
- Se corrigió la exportación PNG para respetar la altura visual personalizada de objetos altos, incluida la chimenea caveling de dos casillas.

## v1.0.0a — Hotfix

### English

- Fixed floor tiles being hidden beneath opaque colored blocks. Floors now render above blocks in the editor and in PNG exports, so users can place stone flooring over grass and other block colors.

### Español

- Se corrigió el problema que ocultaba los suelos debajo de bloques de color opacos. Ahora los suelos se dibujan sobre los bloques en el editor y en las exportaciones PNG, por lo que se puede colocar suelo de piedra sobre hierba y otros bloques.

Versioning policy: see [VERSIONING.md](VERSIONING.md).
