import React, { useRef } from 'react';
import { CanvasElement, ResizeHandleDirection } from '../types';

export interface BoundingBoxProps {
  element: CanvasElement;
  isSelected: boolean;
  zoomLevel?: number;
  allElements: CanvasElement[];
  onUpdateElements: (updater: (prev: CanvasElement[]) => CanvasElement[]) => void;
  onSelect: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialElement: CanvasElement;
  initialChildren: CanvasElement[];
}

interface ResizeState {
  isResizing: boolean;
  direction: ResizeHandleDirection;
  startX: number;
  startY: number;
  initialElement: CanvasElement;
  initialChildren: CanvasElement[];
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({
  element,
  isSelected,
  zoomLevel = 100,
  allElements,
  onUpdateElements,
  onSelect,
  onDoubleClick,
  children,
}) => {
  const zoom = Math.max(0.1, zoomLevel / 100);

  const isPointerDownRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);

  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialElement: element,
    initialChildren: [],
  });

  const resizeStateRef = useRef<ResizeState>({
    isResizing: false,
    direction: 'br',
    startX: 0,
    startY: 0,
    initialElement: element,
    initialChildren: [],
  });

  // 1. REPOSITION / DRAG POINTER EVENTS
  const handleMovePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking a resize handle, ignore move handler
    if ((e.target as HTMLElement).dataset.handle) return;

    e.stopPropagation();
    onSelect(e);

    // If locked, we still allow selection so user can unlock via toolbar, but skip drag
    if (element.isLocked) return;

    isPointerDownRef.current = true;
    hasMovedRef.current = false;

    const initialChildren = element.type === 'group' && element.childrenIds
      ? allElements
          .filter((el) => element.childrenIds?.includes(el.id))
          .map((el) => ({ ...el }))
      : [];

    dragStateRef.current = {
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      initialElement: { ...element },
      initialChildren,
    };
  };

  const handleMovePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    e.stopPropagation();

    const { startX, startY, initialElement, initialChildren } = dragStateRef.current;
    const rawDx = e.clientX - startX;
    const rawDy = e.clientY - startY;

    // Movement threshold (3px) to prevent tiny mouse jitter on click from triggering dragging
    if (!hasMovedRef.current) {
      if (Math.hypot(rawDx, rawDy) < 3) {
        return;
      }
      hasMovedRef.current = true;
      dragStateRef.current.isDragging = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }

    const dx = Math.round(rawDx / zoom);
    const dy = Math.round(rawDy / zoom);

    const newX = initialElement.x + dx;
    const newY = initialElement.y + dy;

    onUpdateElements((prev) =>
      prev.map((el) => {
        if (el.id === initialElement.id) {
          return { ...el, x: newX, y: newY };
        }
        // If it is a child of the moved group, translate along with parent
        if (initialElement.type === 'group' && initialElement.childrenIds?.includes(el.id)) {
          const childInitial = initialChildren.find((c) => c.id === el.id);
          if (childInitial) {
            return {
              ...el,
              x: childInitial.x + dx,
              y: childInitial.y + dy,
            };
          }
        }
        return el;
      })
    );
  };

  const handleMovePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    if (dragStateRef.current.isDragging) {
      dragStateRef.current.isDragging = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback if capture already released
      }
    }
  };

  // 2. RESIZE HANDLERS (Native Pointer Events for Proportional Text & Scaled Group)
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: ResizeHandleDirection
  ) => {
    if (element.isLocked) return;
    e.stopPropagation();

    const targetEl = e.currentTarget;
    targetEl.setPointerCapture(e.pointerId);

    const initialChildren = element.type === 'group' && element.childrenIds
      ? allElements
          .filter((el) => element.childrenIds?.includes(el.id))
          .map((el) => ({ ...el }))
      : [];

    resizeStateRef.current = {
      isResizing: true,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialElement: { ...element },
      initialChildren,
    };
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeStateRef.current.isResizing) return;
    e.stopPropagation();

    const { direction, startX, startY, initialElement, initialChildren } = resizeStateRef.current;
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;

    const minW = 32;
    const minH = 24;

    let newWidth = initialElement.width;
    let newHeight = initialElement.height;
    let newX = initialElement.x;
    let newY = initialElement.y;

    switch (direction) {
      case 'br': {
        newWidth = Math.max(minW, Math.round(initialElement.width + dx));
        newHeight = Math.max(minH, Math.round(initialElement.height + dy));
        newX = initialElement.x;
        newY = initialElement.y;
        break;
      }
      case 'bl': {
        const rawW = Math.round(initialElement.width - dx);
        newWidth = Math.max(minW, rawW);
        newX = initialElement.x + (initialElement.width - newWidth);
        newHeight = Math.max(minH, Math.round(initialElement.height + dy));
        newY = initialElement.y;
        break;
      }
      case 'tr': {
        newWidth = Math.max(minW, Math.round(initialElement.width + dx));
        newX = initialElement.x;
        const rawH = Math.round(initialElement.height - dy);
        newHeight = Math.max(minH, rawH);
        newY = initialElement.y + (initialElement.height - newHeight);
        break;
      }
      case 'tl': {
        const rawW = Math.round(initialElement.width - dx);
        newWidth = Math.max(minW, rawW);
        newX = initialElement.x + (initialElement.width - newWidth);
        const rawH = Math.round(initialElement.height - dy);
        newHeight = Math.max(minH, rawH);
        newY = initialElement.y + (initialElement.height - newHeight);
        break;
      }
    }

    // Scale calculation
    const scaleMultiplierX = newWidth / Math.max(1, initialElement.width);
    const scaleMultiplierY = newHeight / Math.max(1, initialElement.height);

    onUpdateElements((prev) =>
      prev.map((el) => {
        // Individual element resize
        if (el.id === initialElement.id) {
          const updated: CanvasElement = {
            ...el,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };

          // Individual Text scaling: fontSize scaled proportionally with width
          if (el.type === 'text') {
            const baseFontSize = initialElement.fontSize || 16;
            updated.fontSize = Math.max(8, Math.round(baseFontSize * scaleMultiplierX));
          }

          return updated;
        }

        // Group children resize: recalculate relative coordinates, dimensions & fontSize
        if (initialElement.type === 'group' && initialElement.childrenIds?.includes(el.id)) {
          const childInitial = initialChildren.find((c) => c.id === el.id);
          if (childInitial) {
            const relX = childInitial.x - initialElement.x;
            const relY = childInitial.y - initialElement.y;

            const childNewX = Math.round(newX + relX * scaleMultiplierX);
            const childNewY = Math.round(newY + relY * scaleMultiplierY);
            const childNewWidth = Math.max(12, Math.round(childInitial.width * scaleMultiplierX));
            const childNewHeight = Math.max(12, Math.round(childInitial.height * scaleMultiplierY));

            const childUpdated: CanvasElement = {
              ...el,
              x: childNewX,
              y: childNewY,
              width: childNewWidth,
              height: childNewHeight,
            };

            if (childInitial.fontSize) {
              childUpdated.fontSize = Math.max(
                8,
                Math.round(childInitial.fontSize * scaleMultiplierX)
              );
            }

            return childUpdated;
          }
        }

        return el;
      })
    );
  };

  const handleResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizeStateRef.current.isResizing) {
      resizeStateRef.current.isResizing = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  // Hierarchical Z-Index & Ring styling:
  // Groups sit underneath children so child pointer events hit cleanly for deep selection.
  const zIndexClass = isSelected
    ? (element.type === 'group' ? 'z-[20] ring-2 ring-blue-500 cursor-move' : `z-[40] ring-2 ring-blue-500 ${element.isLocked ? 'cursor-default' : 'cursor-move'}`)
    : element.parentId
    ? 'z-[25] hover:ring-1 hover:ring-blue-400/60 cursor-pointer'
    : element.type === 'group'
    ? 'z-[10] hover:ring-1 hover:ring-blue-400/40 cursor-pointer'
    : 'z-[20] hover:ring-1 hover:ring-blue-400/60 cursor-pointer';

  return (
    <div
      className={`absolute select-none transition-[box-shadow] ${zIndexClass} ${
        element.type === 'group' ? 'border border-dashed border-blue-400/60 bg-blue-500/5' : ''
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
      onPointerDown={handleMovePointerDown}
      onPointerMove={handleMovePointerMove}
      onPointerUp={handleMovePointerUp}
      onClick={(e) => {
        // Stop bubbling so canvas-paper never deselects the active element!
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(e);
      }}
      data-element-id={element.id}
    >
      {/* Element Content Render */}
      <div className="w-full h-full relative overflow-hidden pointer-events-auto">
        {children}
      </div>

      {/* 4 NATIVE CORNER RESIZE HANDLES (Rendered only when active and not locked) */}
      {isSelected && !element.isLocked && (
        <>
          {/* 1. Top-Left Handle */}
          <div
            data-handle="tl"
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-md cursor-nwse-resize z-[50] hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizePointerDown(e, 'tl')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onClick={(e) => e.stopPropagation()}
            title="Tarik untuk ubah ukuran (Kiri Atas)"
          />

          {/* 2. Top-Right Handle */}
          <div
            data-handle="tr"
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-md cursor-nesw-resize z-[50] hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizePointerDown(e, 'tr')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onClick={(e) => e.stopPropagation()}
            title="Tarik untuk ubah ukuran (Kanan Atas)"
          />

          {/* 3. Bottom-Left Handle */}
          <div
            data-handle="bl"
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-md cursor-nesw-resize z-[50] hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizePointerDown(e, 'bl')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onClick={(e) => e.stopPropagation()}
            title="Tarik untuk ubah ukuran (Kiri Bawah)"
          />

          {/* 4. Bottom-Right Handle */}
          <div
            data-handle="br"
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-md cursor-nwse-resize z-[50] hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizePointerDown(e, 'br')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onClick={(e) => e.stopPropagation()}
            title="Tarik untuk ubah ukuran (Kanan Bawah)"
          />

          {/* Dimension Tag (Canva Style Dimension Overlay) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-200 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-[50] border border-slate-700/60">
            {Math.round(element.width)} × {Math.round(element.height)} px
            {element.type === 'text' && element.fontSize && (
              <span className="text-blue-400 ml-1">({element.fontSize}px)</span>
            )}
            {element.type === 'group' && (
              <span className="text-amber-400 ml-1">[Grup: {element.childrenIds?.length || 0} item]</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
