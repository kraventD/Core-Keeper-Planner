# Versioning and release policy

The public release version is stored in `package.json` as `releaseVersion`. Keep `version` as a valid npm SemVer value; the standalone packager uses `releaseVersion` for the HTML title and download filenames.

## Version levels

- **Major improvements:** increment the first number and reset the remaining numbers (`1.0.0` → `2.0.0`). Use this for a substantial new generation of the planner or a major set of tools.
- **Intermediate improvements:** increment the second number and reset the third (`1.0.0` → `1.1.0`). Use this for meaningful additions such as new object or game-content categories.
- **Minor improvements:** increment the third number (`1.0.0` → `1.0.1`). Use this for smaller tool and usability improvements.
- **Hotfixes:** append a lowercase letter to the current release (`1.0.0a`, `1.0.0b`, …, `1.0.0z`). Use this for urgent corrections that do not add a feature. If a release has no hotfix suffix, its first hotfix is `a`; otherwise advance the existing suffix by one letter.

Start a new numeric release without a letter suffix. If a hotfix sequence reaches `z`, stop and ask the maintainer how to proceed.

## Release checklist

For every release, update `releaseVersion`, add bilingual release notes, and build both downloads:

- `core-keeper-planner-<releaseVersion>.html` — standalone, self-contained app.
- `core-keeper-planner-<releaseVersion>.zip` — includes the autonomous `index.html`, both README files, and their images.

Use the Git tag `v<releaseVersion>`. Mark correction-only commits with a `hotfix:` subject. Push the source, documentation and artifacts together, and publish a GitHub release with the same version and notes in English and Spanish. Normally publish each version once; if the maintainer explicitly requests correcting an already-published release without a version increment, update that release's tag, notes, and downloadable artifacts in place.

## Current release

`1.2.2a` limits Core collisions to its occupied tiles and identifies the exact blocker in the placement preview. `1.2.2` replaces the colored Core-and-statues stamp with the transparent 19×13 Core sprite in the dedicated tool, preserves its image proportions, and removes the temporary catalog entry. `1.2.1` adds four-direction orientation controls for objects inside a rectangular selection, with footprint and collision validation. `1.2.0a` fixes public asset paths for GitHub Pages. `1.2.0` adds five-minute incremental recovery history with thumbnails, improved mirrored selection previews, cursor-following clipboard paste previews with collision feedback, and automatic focus in the note editor.
