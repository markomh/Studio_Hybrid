# Studio Hybrid - BOOK Domain Architecture (Page Manager to Book Builder)

This document outlines the conceptual architecture for evolving the **BOOK Domain** in Studio Hybrid from a basic Page Manager into a comprehensive **Book Builder**.

---

## 1. Current State (Page Manager)

In the current implementation, the Book domain functions primarily as a flat list of pages (`BookPage[]`) managed via thumbnail list previews and simple reordering buttons.

### Characteristics & Limitations:
- **Flat Page Array:** Pages are stored as an unindexed linear sequence where every page is treated identically (no structural differentiation between body, cover, solutions, or appendices).
- **Pagination Ownership Confusion:** Page numbering rules (e.g., starting page number, numbering visibility on front cover) were previously co-mingled or misplaced inside global Document setup rather than structured book flow.
- **Manual Cover & Solution Handling:** Covers are treated as regular pages with manual workarounds; solution keys or answer key appendices must be manually generated and positioned by the user without automated grouping or section compilation.
- **Limited Grouping:** No hierarchical chapters, part dividers, or section-based pagination resetting (e.g., Roman numerals for front matter, Arabic numerals for body).

---

## 2. Future Book Builder State

The **Book Builder** transforms the BOOK domain into a hierarchical structural engine for multi-page publishing (activity books, journals, planners, etc.).

### Key Architectural Concepts:
- **Section-Based Hierarchy:** Books are structured into distinct sections:
  1. **Front Matter:** Cover (Front/Back), Title Page, Copyright, Table of Contents, Preface (Roman numerals i, ii, iii...).
  2. **Body Chapters / Sections:** Main content pages (Sudoku, Mazes, Worksheets, Journals) starting at page 1 with custom numbering styles.
  3. **Back Matter / Solutions:** Answer keys, appendix, notes, perforated tear-out guides.
- **Dynamic Pagination Engine:** Rule-based automatic numbering engine that calculates page numbers based on section type, left/right page placement (verso/recto spreads for KDP gutter calculations), and hidden cover pages.
- **Automated Solution Compilation:** One-click generation and appending of answer key grids structured in compact multi-puzzle per page layouts.
- **Grid & Spread Management:** Visual spread preview (2-page side-by-side view) optimized for KDP book spine alignment, bleed, and margin visualization.

---

## 3. Ownership Matrix

| Feature / Capability | Current Domain | Future Domain | Ownership Status | Rationale |
|---|---|---|---|---|
| **Page Thumbnail List** | BOOK | BOOK | CORRECT | Core book structure and navigation. |
| **Page Add / Delete / Duplicate** | BOOK | BOOK | CORRECT | Structural management of book length. |
| **Page Reordering / Drag-Drop** | BOOK | BOOK | CORRECT | Book flow and chapter organization. |
| **Start Page Numbering** | DOCUMENT | BOOK | MIGRATED | Pagination rules belong to how the book is structured, not paper size. |
| **Cover Front/Back Designation** | ELEMENTS | BOOK | MIGRATED | Covers are structural book metadata, not standard canvas elements. |
| **Solution Key Generation** | UTILITIES | BOOK | MIGRATED | Answer keys are structural back matter generated from book contents. |
| **Chapter / Section Dividers** | N/A (New) | BOOK | NEW | Organizes long books into readable chapters. |

---

## 4. Migration Steps

To transition safely from the Page Manager to the Book Builder without breaking existing user projects or UI layouts:

### Phase 1: Data Model Expansion (Schema Refactoring)
- Evolve `BookProject` and `BookPage` interfaces to support hierarchical sections (`sections: BookSection[]`) and page roles (`role: 'cover' | 'front_matter' | 'body' | 'solutions' | 'appendix'`).
- Maintain backward compatibility by automatically wrapping flat `pages[]` arrays into a default `'body'` section upon loading legacy projects.

### Phase 2: Pagination Rule Engine
- Decouple pagination configuration from document metadata and attach it to section-level settings.
- Implement an automatic page numbering calculator that respects cover suppression, Roman numerals for front matter, and Arabic numbering for body chapters.

### Phase 3: Section & Chapter Grouping UI
- Introduce collapsible section groupings in the Book Builder sidebar and grid view.
- Enable visual separation of front matter, body chapters, and solution appendices.

### Phase 4: Automated Solution Compilation
- Build a back-matter solution compiler that aggregates puzzle elements from body pages and automatically formats solution grids into designated solution pages.

### Phase 5: Spread & KDP Validation Integration
- Connect Book Builder structure directly with KDP spine width calculation and bleed validation to warn users of odd/even page count requirements for professional publishing.
