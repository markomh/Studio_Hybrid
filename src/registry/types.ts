import React from 'react';
import { jsPDF } from 'jspdf';
import { CanvasElement, BookPage } from '../types';

export type PropertyFieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'slider' 
  | 'select' 
  | 'toggle' 
  | 'color';

export interface PropertyFieldOption {
  label: string;
  value: string | number;
}

export interface PropertyFieldSchema {
  key: string; // path to property or custom key
  label: string;
  type: PropertyFieldType;
  group?: string; // Group/accordion name (e.g. 'Typography', 'Grid', 'Layout')
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: PropertyFieldOption[];
  description?: string;
  // Cross-field declarative constraint validator
  validate?: (value: any, element: CanvasElement, allElements?: CanvasElement[]) => string | undefined;
}

export interface PdfRenderContext {
  doc: jsPDF;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  page: BookPage;
  options?: {
    grayscaleForPrinting?: boolean;
    includeBleedGuides?: boolean;
  };
}

export type ControlZone = 'floating' | 'inspector' | 'both' | 'none';
export type ControlPriority = 'primary' | 'secondary' | 'advanced';

export interface ObjectCapabilities {
  // 1. Operasi kanonikal universal
  canLock: boolean;            // default: true
  canDuplicate: boolean;       // default: true
  canDelete: boolean;          // default: true
  canReorder: boolean;         // default: true (z-index front/back)
  canGroup: boolean;           // default: true

  // 2. Transformasi geometri
  canRotate: boolean;
  canFlipHorizontal: boolean;
  canAdjustOpacity: boolean;

  // 3. Tipografi
  hasTypography: boolean;

  // 4. Engine / generator prosedural
  hasProceduralEngine: boolean;
  engineActionLabel?: string;  // mis. "Acak Labirin"

  // 5. Presentasi styling khusus
  hasStrokeConfig?: boolean;
  hasFillConfig?: boolean;
  supportsSolutionKey?: boolean; // Labirin, Word Search, Sudoku, Worksheet
}

export interface ElementDefinition<T = any> {
  type: string;
  subType?: string;
  title: string;
  category: 'text' | 'puzzle' | 'planner' | 'graphics' | 'layout';
  iconName?: string;
  capabilities: ObjectCapabilities;
  propertySchema: PropertyFieldSchema[];
  createDefault: (options?: { x?: number; y?: number; width?: number; height?: number }) => CanvasElement;
  renderPreview?: (element: CanvasElement, pageContext?: any) => React.ReactNode;
  renderPdf?: (element: CanvasElement, ctx: PdfRenderContext) => void | Promise<void>;
}
