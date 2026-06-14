# Repository Guidelines

## Project Structure & Module Organization

This is a React, TypeScript, Phaser 3, and Vite project for the RemoteTreeNode 2D lobby prototype. App entry points live in `src/main.tsx`, `src/App.tsx`, and `src/game/PhaserGame.tsx`. Phaser scenes are in `src/game/scenes/`, reusable game objects in `src/game/objects/`, layout data in `src/game/constants/`, editor tools in `src/game/editor/`, physics helpers in `src/game/physics/`, and UI helpers in `src/game/ui/`.

Runtime assets belong under `public/assets/`, grouped by scene such as `public/assets/lobby/`, `public/assets/office/`, `public/assets/cafe/`, and `public/assets/treetive/`. The top-level `assets/` folder is source/reference material and should not be used directly by the loader unless intentionally wired.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start Vite at `http://127.0.0.1:5173`.
- `npm run build`: run TypeScript project build and create the production Vite bundle.
- `npm run preview`: preview the built `dist/` output locally.

For layout editing, open `http://localhost:5173?editor=1` or run with `VITE_LAYOUT_EDITOR=true`.

## Coding Style & Naming Conventions

Use TypeScript with 2-space indentation and semicolons, matching the existing code. Scene classes use PascalCase names such as `LobbyScene`; constants use uppercase names such as `ASSET_KEYS`; asset keys use kebab-case string values. Keep layout coordinates in `src/game/constants/*Layout.ts` instead of hardcoding them inside scenes.

## Testing Guidelines

There is no formal test framework configured yet. Use `npm run build` as the required verification step before committing. For visual or layout changes, test in the browser and use editor snapshots to confirm object and collision positions.

## Commit & Pull Request Guidelines

This workspace currently has no Git history, so use clear imperative commit messages, for example `Add cafe scene` or `Update lobby layout`. Pull requests should include a short summary, affected scenes, verification steps, and screenshots or snapshots for visual layout changes.

## Agent-Specific Instructions

Do not commit `node_modules/`, `dist/`, or temporary nested repositories. Preserve user-created assets in `public/assets/**`. When applying editor snapshots, keep deleted objects out of layout constants.
