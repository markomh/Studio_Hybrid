import { CanvasElement } from '../types';

export interface Command {
  id: string;
  description: string;
  execute: () => void;
  undo: () => void;
}

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxStackSize: number = 50;
  private listeners: Array<() => void> = [];

  constructor(maxSize = 50) {
    this.maxStackSize = maxSize;
  }

  execute(command: Command) {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    // Clear redo stack on new action
    this.redoStack = [];
    this.notify();
  }

  undo(): boolean {
    if (this.undoStack.length === 0) return false;
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.notify();
    return true;
  }

  redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);
    this.notify();
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getUndoDescription(): string | null {
    if (this.undoStack.length === 0) return null;
    return this.undoStack[this.undoStack.length - 1].description;
  }

  getRedoDescription(): string | null {
    if (this.redoStack.length === 0) return null;
    return this.redoStack[this.redoStack.length - 1].description;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
