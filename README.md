<div align="center">

  <img src="assets/readme/banner-en.png" alt="Core Keeper Planner — base design and blueprint editor, version 1.2.0" width="100%">

  **Build your underground home before you place the first block.**

  <img src="assets/readme/stats-en.svg" alt="Version 1.2.0 · 488 catalog entries · 10–300 tiles per side · English and Spanish" width="100%">

  **🇬🇧 English** · [🇪🇸 Español](README.es.md)

  [Features](#features) · [Catalog](#catalog) · [Editor](#editor) · [Sharing](#sharing) · [Shortcuts](#shortcuts) · [Credits](#credits)

</div>

> **Latest release — v1.2.0:** adds five-minute recovery history with thumbnails, clearer mirrored selection previews, cursor-following paste previews with collision warnings, and faster note editing. [Download the standalone HTML](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v1.2.0/core-keeper-planner-1.2.0.html) · [Download the ZIP](https://github.com/kraventD/Core-Keeper-Planner/releases/download/v1.2.0/core-keeper-planner-1.2.0.zip).

> **Try it online:** [Open Core Keeper Planner](https://kraventd.github.io/Core-Keeper-Planner/). Plans are saved in this browser; use the import and export tools to move them between devices.

Release numbering follows the project policy in [VERSIONING.md](VERSIONING.md).

## <img src="assets/readme/app-logo.svg" width="32" alt=""> What is Core Keeper Planner?

<img src="assets/readme/crystal-island.png" align="right" width="155" alt="Pixel art of a glowing crystal cluster">

**Core Keeper Planner** is an unofficial visual planning tool for designing bases in [Core Keeper](https://core-keeper.fandom.com/wiki/Core_Keeper_Wiki). Sketch rooms, organize crafting stations, plan farms, place furniture and decorate your underground home on a tile-by-tile grid.

Combine a flexible editor, an extensive catalog and shareable blueprints to turn ideas into buildable layouts before you start collecting materials in the game.

<p align="center">
  <a href="assets/readme/editor-dark.png"><img src="assets/readme/editor-dark.png" alt="Main planner interface in dark mode" width="100%"></a>
  <em>The editor — a tile-by-tile view of your next base.</em>
</p>

## <img src="assets/readme/icon-tools.png" width="28" alt=""> Features <a name="features"></a>

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="assets/readme/icon-catalog.png" width="36" alt=""><br>
      <strong>488 catalog entries</strong><br>
      Browse building materials, floors, furniture, stations and nature. Search in either language and save favorites.
    </td>
    <td width="50%" valign="top">
      <img src="assets/readme/icon-tools.png" width="36" alt=""><br>
      <strong>Precise drawing tools</strong><br>
      Draw, erase, fill, mirror, select and move layouts with tile-level precision.
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="assets/readme/icon-layers.png" width="36" alt=""><br>
      <strong>Independent layers</strong><br>
      Organize floors, walls, objects and wall decorations without overwriting other layers.
    </td>
    <td valign="top">
      <img src="assets/readme/icon-map.png" width="36" alt=""><br>
      <strong>Customizable canvas</strong><br>
      Build on grids from 10 × 10 to 300 × 300 tiles, with a center guide enabled by default and optional chunk and light guides.
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="assets/readme/icon-export.png" width="36" alt=""><br>
      <strong>Save and share</strong><br>
      Recover local backups, save project files, exchange text codes and export illustrated PNG plans.
    </td>
    <td valign="top">
      <img src="assets/readme/icon-keys.png" width="36" alt=""><br>
      <strong>Faster workflows</strong><br>
      Use keyboard shortcuts, 50-step undo/redo history, object rotation and selection transformations.
    </td>
  </tr>
</table>

## <img src="assets/readme/icon-catalog.png" width="28" alt=""> Catalog <a name="catalog"></a>

<table>
  <tr>
    <td valign="top" width="68%">
      <strong>Everything you need to organize a base.</strong>
      <p>The v1.1 catalog brings together <strong>488 unique selectable entries</strong>, organized into four sections.</p>
      <ul>
        <li>Search by English or Spanish name.</li>
        <li>Save favorites locally in your browser.</li>
        <li>Filter objects by size or layer.</li>
        <li>Filter floors and nature by type, including crops, plants and trees.</li>
      </ul>
    </td>
    <td align="center" valign="top">
      <a href="assets/readme/catalog.png"><img src="assets/readme/catalog.png" alt="Searchable construction catalog" width="240"></a>
    </td>
  </tr>
</table>

| Category | Entries | Includes |
| :--- | ---: | :--- |
| 🧱 Blocks & colors | **65** | 27 walls, 8 bridges, 6 fences, 1 rail and 23 color-represented blocks |
| 🟫 Floors & rugs | **62** | Crafted flooring, tiles, carpets, mats and in-game terrain |
| 🛠️ Furniture & stations | **260** | Chests, workbenches, pedestals, beds, chairs, mechanisms, doors, lighting, stations and wall decorations |
| 🌱 Plants & trees | **101** | 44 crop entries including potted variants, 25 trees and 32 other plants or nature elements |
| **Total** | **488** | Unique selectable catalog entries |

> **Catalog status:** the count refers to selectable entries, not individual sprites or visual stages. Version 1.1 does not yet include every item in the game.

Wall and block colors follow values published on the Core Keeper Wiki when available. Missing values are represented using an estimated dominant sprite color and are marked as estimated.

## <img src="assets/readme/icon-tools.png" width="28" alt=""> Editor <a name="editor"></a>

### Drawing and construction

| Tool | What it does |
| :--- | :--- |
| Pencil / eraser | Paint with a brush from 1 × 1 to 20 × 20 tiles. An eraser option can also remove objects and floors. |
| Line | Draw a line between two points |
| Rectangle | Draw an outline or a filled rectangle |
| Circle | Draw an outline or a filled circle, starting from the center or a corner |
| Area fill | Fill a connected region with the active color, floor or catalog object |
| Real-time mirror | Mirror pencil, eraser, line, rectangle and circle strokes horizontally, vertically or in four directions |
| Place Core | Insert the Core and statue pattern, optionally include a teleport point and center the pattern in the plan |
| Annotation | Add, edit, rotate, move or delete notes |
| Rectangle selection / move selection | Select all contents, floors only or objects only; copy, move or delete the selected scope |
| Select | Select and move placed objects |
| Hand | Pan around the canvas |

The active catalog item appears above the canvas alongside icons for its compatible tools.

<table>
  <tr>
    <td align="center" width="50%"><a href="assets/readme/tool-options.png"><img src="assets/readme/tool-options.png" alt="Tool settings and mirroring options" width="100%"></a><br><sub>Tool and mirror options</sub></td>
    <td align="center" width="50%"><a href="assets/readme/core-placement.png"><img src="assets/readme/core-placement.png" alt="Core placement settings" width="88%"></a><br><sub>Core placement</sub></td>
  </tr>
</table>

### <img src="assets/readme/icon-layers.png" width="24" alt=""> Layers and objects

Every tile supports four independent construction layers:

| Layer | Contents |
| :--- | :--- |
| 1. Floors | Terrain, floors and related surfaces |
| 2. Walls & blocks | Walls and other building materials, including color-represented blocks |
| 3. Objects | Furniture, stations, rugs and other placed objects |
| 4. Wall decorations | Decorations that require a wall behind them |

Show, hide, lock or unlock each layer independently. For example, place a rug over a floor without removing the floor beneath it.

- Objects use their actual tile footprint, which can extend beyond a single tile; sprites may extend visually beyond that footprint.
- Tall object sprites preserve their visual height in both the editor and PNG exports.
- Move, rotate in four directions, copy, cut, paste or delete selected objects. Each object retains its own orientation.
- Select an area to copy, cut, paste, fill, erase, move, create a mirrored duplicate, flip horizontally or vertically, or center it on either or both axes.
- Placement warnings flag objects extending outside the plan, overlaps on the same layer, missing backing walls and hidden or locked target layers.
- Lighting objects can visualize approximate coverage; supported lights also allow range adjustments.

<p align="center">
  <a href="assets/readme/selection-edit.png"><img src="assets/readme/selection-edit.png" width="440" alt="Selection editing and transformation actions"></a><br>
  <sub>Selection editing and transformations</sub>
</p>

### <img src="assets/readme/icon-map.png" width="24" alt=""> Canvas and viewing controls

- Create a named plan with independent width and height, each between **10 and 300 tiles**.
- Choose a light or dark grid while creating or editing a plan.
- Zoom in and out, reset zoom, center the plan or fit it to the screen.
- Pan with the hand tool, mouse wheel or middle mouse button; use Space + drag for quick navigation.
- Show or hide grid lines, adjust their contrast and select one of three line thicknesses.
- Keep the blueprint center guide visible by default for symmetric layouts; chunk and approximate light coverage guides start hidden and can be enabled in view options.
- The canvas automatically recenters the plan when the window is resized.

<table>
  <tr>
    <td align="center" width="50%"><a href="assets/readme/new-plan.png"><img src="assets/readme/new-plan.png" alt="New plan name, dimensions and grid theme" height="285"></a><br><sub>Create a custom plan</sub></td>
    <td align="center" width="50%"><a href="assets/readme/view-options.png"><img src="assets/readme/view-options.png" alt="Grid, layers and general viewing settings" height="285"></a><br><sub>View and layer settings</sub></td>
  </tr>
</table>

<p align="center">
  <a href="assets/readme/editor-light.png"><img src="assets/readme/editor-light.png" width="100%" alt="Planner interface in light mode"></a><br>
  <sub>The same planning workspace, with a light grid.</sub>
</p>

## <img src="assets/readme/icon-export.png" width="28" alt=""> Sharing <a name="sharing"></a>

Your designs are made to be kept, refined and shared.

| Function | Details |
| :--- | :--- |
| Project files | Create, open and save a project as a file |
| Local autosave | Keep progress in your browser and recover a previous backup |
| Undo & redo | Up to 50 history steps |
| Share codes | Export a text code and import it to load a design |
| PNG export | Choose scale, dark, blue, light or transparent background, and grid visibility |
| Export legend | Include colors and placed objects, with names, tile footprints and quantities |

<table>
  <tr>
    <td align="center" width="50%"><a href="assets/readme/file-menu.png"><img src="assets/readme/file-menu.png" alt="File and recovery menu" width="235"></a><br><sub>Project management</sub></td>
    <td align="center" width="50%"><a href="assets/readme/png-export.png"><img src="assets/readme/png-export.png" alt="PNG export options and legend" width="290"></a><br><sub>PNG export options</sub></td>
  </tr>
</table>

<p align="center">
  <a href="assets/readme/share-code.png"><img src="assets/readme/share-code.png" alt="Blueprint sharing code dialog" width="570"></a><br>
  <sub>Share an entire blueprint as a text code.</sub>
</p>

## <img src="assets/readme/icon-leaf.png" width="28" alt=""> From idea to underground home

Start with a blank canvas, draw your rooms, add floors and walls, then populate them with workstations, storage, crops and decorations.

<p align="center">
  <a href="assets/readme/base-example.png"><img src="assets/readme/base-example.png" alt="Finished base example with crops, furniture, storage and a materials legend" width="560"></a><br>
  <strong>Example base exported from Core Keeper Planner.</strong><br>
  <sub>Click the image to explore the full-resolution design.</sub>
</p>

## <img src="assets/readme/icon-keys.png" width="28" alt=""> Shortcuts <a name="shortcuts"></a>

The interface is available in **English and Spanish**.

| Key | Action | Key | Action |
| :--- | :--- | :--- | :--- |
| `P` | Pencil | `E` | Eraser |
| `L` | Line | `R` | Rectangle |
| `C` | Circle | `B` / `G` | Area fill |
| `S` | Rectangle selection | `M` | Move selection |
| `K` | Place Core | `V` | Select |
| `Ctrl+C` | Copy | `Ctrl+X` | Cut |
| `Ctrl+V` | Paste | `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo | `[` / `]` | Rotate selected object |
| Mouse wheel | Zoom | Space + drag | Pan |

<details>
  <summary><strong>View the in-app keyboard shortcut panel</strong></summary>
  <p align="center"><a href="assets/readme/keyboard-shortcuts.png"><img src="assets/readme/keyboard-shortcuts.png" alt="Keyboard shortcuts panel" width="450"></a></p>
</details>

## <img src="assets/readme/app-logo.svg" width="32" alt=""> Credits <a name="credits"></a>

- **Core Keeper** — the game that inspired this project and the source of many in-game sprites and visual references.
- [**Core Keeper Wiki**](https://core-keeper.fandom.com/wiki/Core_Keeper_Wiki) — catalog information, color values and other visual references.
Core Keeper Planner is an independent project that I develop and maintain. It is not affiliated with, sponsored, or endorsed by the developers or publishers of Core Keeper. Game assets and trademarks belong to their respective rights holders. This is a planning tool; a shared planner code does not directly import a base into the game.

<div align="center">
  <img src="assets/readme/app-logo.svg" width="96" alt="Core Keeper Planner logo">
  <br>
  <strong>Plan it. Build it. Make it yours.</strong>
  <br>
  <sub>CORE KEEPER PLANNER · VERSION 1.2.0</sub>
  <br>
  <a href="README.es.md">Leer en español</a>
</div>
