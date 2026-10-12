# Implementation Plan - Studio Hybrid Workspace Refactor

## Objectives
1. **Per-Element Maze Config Scope**: Make `mazeConfig` (wallColor, wallThickness, etc.) independent per maze element instance rather than shared at the page level (`page.mazeConfig`), preventing cross-element bleed when multiple mazes exist on a single page.
2. **Canonical Duplicate & Delete**: Consolidate element duplicate and delete handlers into `App.tsx` to unify state mutation, undo/redo history tracking, and prevent fragmented local handlers in `CanvasWorkspace.tsx`.
3. **Dead Code Cleanup**: Remove unused props, dead handlers, and deprecated bindings identified in the forensic audit (e.g., unused zoom props in `Header.tsx`, unused `onOpenPageSetup` in `CanvasWorkspace.tsx`).

## Proposed Changes

### 1. Schema & Types (`src/types.ts` or element definitions)
- Ensure maze elements (`CanvasElement` with `type === 'maze'`) store their own `mazeConfig` properties (`wallColor`, `wallThickness`, `solutionColor`, `showSolution`, etc.) directly on the element or ensure props are correctly scoped per element.

### 2. State & Handlers in `src/App.tsx`
- Add canonical `handleDuplicateElement` and `handleDeleteElement` handlers in `App.tsx` that properly record undo/redo history.
- Pass these handlers down to `CanvasWorkspace` and `ContextInspector`.

### 3. Canvas & Inspector (`src/components/CanvasWorkspace.tsx`, `src/components/ContextInspector.tsx`, `src/components/FloatingToolbar.tsx`)
- Remove local inline duplicate/delete handlers in `CanvasWorkspace.tsx` and delegate to App-level handlers.
- Update `FloatingToolbar` and `ContextInspector` to mutate the selected maze element's `mazeConfig` rather than `page.mazeConfig`.

### 4. Dead Code Removal (`src/components/Header.tsx`, etc.)
- Remove unused props/imports in `Header.tsx` and `CanvasWorkspace.tsx`.

## Verification Plan
- Run `npm run lint` and `npm run build` to verify type safety and compilation success.
- Manual verification of per-element maze configuration and unified delete/duplicate actions.
