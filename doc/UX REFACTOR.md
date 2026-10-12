# WORKSPACE UX REFACTOR REQUEST
# MAZE PRO STUDIO HYBRID WORKSPACE

DO NOT ADD NEW FEATURES.

The goal of this refactor is to improve Workspace Architecture,
Visual Hierarchy, Information Hierarchy, and Interaction Consistency.

The application has already implemented most PRD features.

The focus now is usability refinement.

----------------------------------------
PRODUCT VISION
----------------------------------------

Maze Pro Studio is NOT a collection of generators.

Maze Pro Studio is a Creative Publishing Workspace.

The experience should feel closer to:

- Canva
- Figma
- Framer
- Adobe Express

and NOT an admin dashboard.

Users should always feel like they are working on a document.

The Canvas is the primary workspace.

All tools exist to support the Canvas.


----------------------------------------
ARCHITECTURE RULES
----------------------------------------
 
Classify every feature using one of these categories:
 
WORKSPACE
A place where users spend most of their time.
 
Examples:
- Studio Canvas
- Project Workspace
 
TOOLS
Short-lived utilities that help users complete tasks.
 
Examples:
- Asset Library
- AI Assistant
- KDP Toolkit
- Batch Generator
 
ELEMENTS
Content inserted into the document.
 
Examples:
- Maze
- Sudoku
- Word Search
- Worksheet
- Text
- Graphic Assets
 
PROPERTIES
Configuration of a selected object.
 
Examples:
- Difficulty
- Grid Size
- Color
- Algorithm
- Start Icon
- Finish Icon
 
DOCUMENT SETTINGS
Configuration affecting the book/page itself.
 
Examples:
- Paper Size
- Bleed
- Margin
- Gutter
- Pagination
 
Do not mix these categories inside the same navigation structure.

----------------------------------------
CORE WORKSPACE PRINCIPLE
----------------------------------------

Workspace consists of:

1. Navigation Rail
2. Elements Panel
3. Canvas Workspace
4. Inspector Panel

Canvas must remain the center of attention.

Whenever possible:

- Canvas remains visible
- User stays in context
- User does not "leave" the workspace

----------------------------------------
REFRACTOR #1
TOOLS SHOULD NOT FEEL LIKE PAGES
----------------------------------------

Current tools:

- Asset Library
- AI Assistant
- Book & KDP
- Batch Generator

Currently these are exposed as top navigation destinations.

Refactor goal:

Treat them as Workspace Tools, not Pages.

Expected behavior:

Asset Library
→ Drawer / Side Panel

AI Assistant
→ Right Drawer / Assistant Panel

KDP Toolkit
→ Drawer / Overlay

Batch Generator
→ Modal Wizard

Canvas must remain visible behind these tools.

User should never feel they left the workspace.

----------------------------------------
REFRACTOR #2
TOPBAR HIERARCHY
----------------------------------------

Current topbar contains too many unrelated concepts.

Separate:

DOCUMENT COMMANDS

- File
- Resize
- Undo
- Redo
- Project Name
- Save Status
- Preview
- Export
- Share

from

WORKSPACE TOOLS

- Asset Library
- AI Assistant
- KDP Toolkit
- Batch Generator

Topbar should primarily contain document actions.

Avoid turning topbar into a tool marketplace.

----------------------------------------
REFRACTOR #3
ELEMENTS PANEL SIMPLIFICATION
----------------------------------------

Current left panel is generator-centric:

- Maze Generator
- Word Search Generator
- Sudoku Generator

This feels like a dashboard.

Refactor to Elements Architecture.

Example:

PUZZLES
  - Maze
  - Sudoku
  - Word Search

CONTENT
  - Text
  - Instructions
  - Footer Notes

ASSETS
  - Mascots
  - Borders
  - Stickers

AI
  - AI Blocks
  - AI Assistant

The user should feel they are adding elements to a page,
not launching separate generators.

----------------------------------------
REFRACTOR #4
INSPECTOR CLEANUP
----------------------------------------

Current inspector is becoming a long settings page.

Refactor into collapsible sections.

Example:

Maze Settings

▼ Algorithm
▼ Appearance
▼ Start & Finish
▶ Advanced

Reduce scrolling.

Improve scanability.

Inspector should behave like Figma/Canva properties.

----------------------------------------
REFRACTOR #5
PAGE SETUP DISCOVERABILITY
----------------------------------------

Current Page Setup is hidden behind blank-area clicks.

This is poor discoverability.

Add persistent shortcut:

📐 Page Setup

Location:
- Top toolbar
or
- Canvas toolbar

Page Setup panel should contain:

- Paper Size
- Bleed
- Margin
- Gutter
- Pagination

Users must be able to find it instantly.

----------------------------------------
REFRACTOR #6
START & FINISH INTEGRATION
----------------------------------------

Start Marker
Finish Marker

must remain inside Maze Settings.

Do not separate these into a different mascot system.

User mental model:

Start and Finish are part of the Maze.

----------------------------------------
REFRACTOR #7
VISUAL HIERARCHY
----------------------------------------

Current interface contains excessive visual emphasis.

Problems observed:

- Too many glowing borders
- Too many highlighted cards
- Excessive use of bright accent colors
- Multiple UI regions competing for attention

Goal:

Canvas becomes visual focal point.

Target ratio:

Canvas = 60%
UI Chrome = 40%

Reduce neon effects.

Reduce border intensity.

Use fewer accent colors.

Suggested palette:

Primary:
- Indigo / Purple

Success:
- Green

Warning:
- Amber

Danger:
- Red

Avoid assigning a unique accent color to every generator.

----------------------------------------
REFRACTOR #8
FOCUS MODE
----------------------------------------

Add Focus Mode.

Shortcut:

TAB

or

Ctrl+\

Behavior:

Hide:
- Elements Panel
- Inspector Panel

Show:
- Canvas only

Used for:

- Proofreading
- Review
- Publishing Preview

----------------------------------------
REFRACTOR #9
REGRESSION SAFETY
----------------------------------------

DO NOT REMOVE:

- Canvas Workspace
- Inspector Panel
- Project Navigator
- Current Puzzle Engines
- KDP Calculations
- PDF Export

Only improve UX organization.

Preserve all existing functionality.

----------------------------------------
SUCCESS CRITERIA
----------------------------------------

After refactor:

User should feel:

"I am editing a book."

NOT:

"I am switching between generators."

Canvas remains central.

Tools are supporting actors.

Workspace becomes calmer, cleaner,
and more professional.

Prioritize:
1. Context retention
2. Visual hierarchy
3. Discoverability
4. Workflow continuity
5. Reduced cognitive load

No new features required.
Only UX Architecture refinement.