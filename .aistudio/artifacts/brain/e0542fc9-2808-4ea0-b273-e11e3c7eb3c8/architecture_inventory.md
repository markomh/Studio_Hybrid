# Studio Hybrid - Product Architecture Inventory & Domain Mapping

This document establishes the single source of truth for every feature, button, menu, and setting in Studio Hybrid across the 7 canonical architectural domains.

---

## 1. Domain Map

### **DOCUMENT** (Media Definition)
*Answer: "What media am I designing?"*
- **Page Size / KDP Format** (A4, Letter, 6x9, 8.5x8.5)
- **Paper Color** (White, Cream)
- **Bleed Settings** (0.125" / 3.2mm offset)
- **Margins & Gutter** (Inside, Outside, Top, Bottom safety margins)
- **Grid & Margin Guides Overlay** (Visual guides on canvas)

### **BOOK** (Structural Organization)
*Answer: "How is this document structured?"*
- **Page Navigator / Sidebar List** (Ordering, selecting, and viewing pages)
- **Page Count & Total Pages**
- **Book Builder Grid View** (Multi-page overview and reordering)
- **Page Operations** (Add Page, Duplicate Page, Delete Page, Move Page)
- **Pagination & Page Numbering Config** (Header/Footer page numbers)
- **Solution Pages / Answer Key grouping**

### **WORKSPACE** (Creation Environment)
*Answer: "Where do users create content?"*
- **WYSIWYG Canvas Artboard** (Physical dimension simulation and rendering)
- **Zoom Controls & Fit View** (Zoom percentage, Fit Page, Fit Width)
- **Focus Mode / Distraction-Free Toggle** (Keyboard shortcut Tab / Ctrl+\)
- **Undo / Redo History Stack** (Ctrl+Z / Ctrl+Y)
- **Left Sidebar Navigation Rail** (Tabs for Pages, Puzzles, Assets, AI, Tools)

### **ELEMENTS** (Content Insertion)
*Answer: "What appears on the page?"*
- **Maze Puzzle Element** (Procedural maze generation)
- **Word Search Element** (Letter grid & word bank)
- **Sudoku Element** (Number grid & solution cache)
- **Worksheet Element** (Math/Logic question items)
- **Text Elements** (Titles, subtitles, instructions, footer stories)
- **Clipart & Asset Elements** (Emojis, vector graphics, image nodes)
- **Page Borders & Frame Decorations** (Simple, double, rounded, dotted borders)

### **PROPERTIES** (Behavior & Styling)
*Answer: "How does this selected element behave?"*
- **Puzzle Difficulty Level** (Easy, Medium, Hard, Expert)
- **Maze Configuration** (Rows, columns, algorithm, wall thickness, start/finish icons)
- **Word Search Configuration** (Grid size, theme, word list, diagonals)
- **Sudoku Configuration** (Givens count, difficulty)
- **Text Typography & Alignment** (Font family, font size, text alignment, color)
- **Element Bounding Box & Floating Toolbar** (Position, size, rotation, flip, layer ordering)

### **PUBLISHING** (Distribution Readiness)
*Answer: "Is this product ready to publish?"*
- **KDP Pre-Press Validation** (Spine width calculation, margin status, bleed status, warnings, recommendations)
- **Royalty & Print Cost Estimator** (Amazon KDP pricing calculator)
- **Export Profile & PDF Generator** (High-res PDF export with solution inclusion)
- **Direct Print Service** (`window.print()` layout optimization)

### **UTILITIES** (Workflow Helpers)
*Answer: "What tools assist the workflow?"*
- **Welcome / Startup Project Launcher** (Blank vs Template vs Book Builder choice)
- **Batch Generator** (Automated multi-page puzzle generation)
- **AI Assistant Modal** (Content ideation and text generation)
- **Asset Manager / Clipart Library** (Browsing and inserting visual assets)
- **File & Tools Dropdown Menus** (Quick command triggers)

---

## 2. Ownership Matrix

| Feature Name | Current Location | Canonical Domain | Ownership Status | Reason / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Page Setup (Size, Bleed, Margins)** | Header / PageSetupModal | DOCUMENT | **CORRECT** | Defines physical paper dimensions and KDP safety boundaries. |
| **Page Navigator & Operations** | LeftSidebar / BookBuilderView | BOOK | **CORRECT** | Manages page sequence, duplication, deletion, and multi-page structure. |
| **Pagination / Page Numbers** | PageSetupModal | BOOK | **INCORRECT** | Pagination is a book structure/layout feature, not a media definition. (Suggested destination: Book Settings / Page Setup footer section). |
| **WYSIWYG Canvas** | Central Viewport | WORKSPACE | **CORRECT** | Primary creation and preview environment. |
| **Puzzle Generators & Text Elements** | LeftSidebar / Puzzles Tab | ELEMENTS | **CORRECT** | Core content items inserted into pages. |
| **Element Properties & Floating Toolbar** | Canvas / Inspector | PROPERTIES | **CORRECT** | Controls behavior and styling of selected items. |
| **KDP Pre-Press Checker & Spine Calculator**| Header / KdpModal | PUBLISHING | **CORRECT** | Validates publication compliance and spine thickness for Amazon KDP. |
| **PDF Export & Print** | Header / DownloadModal | PUBLISHING | **CORRECT** | Prepares final distribution artifacts. |
| **Batch Generator** | LeftSidebar / Tools | UTILITIES | **CORRECT** | Helper tool for automated bulk content creation. |
| **AI Assistant** | Header / AI Modal | UTILITIES | **CORRECT** | Auxiliary content generation helper. |
| **Asset Manager / Clipart** | LeftSidebar / Assets | UTILITIES / ELEMENTS | **CORRECT** | Library for browsing and inserting graphic assets. |

---

## 3. Duplicate Ownership Report

*No critical duplicate ownership conflicts found.* 
- Page management operations (Add, Duplicate, Delete) are cleanly consolidated in `App.tsx` and exposed via the Book Builder and LeftSidebar pages navigator.
- Modal dialogs (`PageSetupModal`, `KdpCheckerModal`, `BatchGeneratorModal`, `AIAssistantModal`, `DownloadCenterModal`, `WelcomeModal`) each serve distinct, non-overlapping domains.

---

## 4. Misplaced Features Report

1. **Pagination Configuration**
   - **Current Location:** Page Setup Modal (`PageSetupModal.tsx`) under document settings.
   - **Misplaced Domain:** DOCUMENT
   - **Correct Domain:** BOOK
   - **Rationale:** Pagination (whether page numbers start at page 1 or 3, number formats, footer vs header position) describes book navigation and pagination rules, not the physical sheet of paper itself.

---

## 5. Refactor Priority List

1. **Priority 1: Move Pagination Settings**
   - Migrate pagination controls out of the physical `PageSetupModal` (DOCUMENT domain) into a dedicated **Book Settings** section or Book Builder modal (BOOK domain).
2. **Priority 2: Domain-Driven Component Modularization**
   - Align folder structure in `src/components/` strictly with the 7 canonical domains (e.g., `document/`, `book/`, `workspace/`, `elements/`, `properties/`, `publishing/`, `utilities/`) to prevent architectural drift during future feature additions.
3. **Priority 3: Strict State Separation**
   - Ensure document-level metadata (`ProjectMetadata`), book structure (`BookPage[]`), and element state (`CanvasElement[]`) maintain clear uni-directional flow without cross-domain pollution.
