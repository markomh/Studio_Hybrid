import React from 'react';
import { PropertyFieldSchema } from '../../registry/types';
import { CanvasElement } from '../../types';
import { AlertCircle } from 'lucide-react';

interface DynamicPropertyFieldProps {
  field: PropertyFieldSchema;
  value: any;
  element?: CanvasElement | null;
  allElements?: CanvasElement[];
  onChange: (key: string, value: any) => void;
}

export const DynamicPropertyField: React.FC<DynamicPropertyFieldProps> = ({
  field,
  value,
  element,
  allElements,
  onChange,
}) => {
  const currentValue = value !== undefined && value !== null ? value : '';

  // Cross-field constraint validation check
  const validationError = field.validate && element
    ? field.validate(currentValue, element, allElements)
    : undefined;

  const renderControl = () => {
    switch (field.type) {
      case 'slider': {
        const numVal = typeof currentValue === 'number' ? currentValue : field.min || 0;
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{field.label}</span>
              <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                {numVal}{field.unit || ''}
              </span>
            </div>
            <input
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              value={numVal}
              onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        );
      }

      case 'number': {
        const numVal = typeof currentValue === 'number' ? currentValue : field.min || 0;
        return (
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-slate-300 font-medium">{field.label}</label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              value={numVal}
              onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
        );
      }

      case 'select': {
        return (
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-slate-300 font-medium">{field.label}</label>
            <select
              value={currentValue}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case 'toggle': {
        const checked = Boolean(currentValue);
        return (
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="font-medium">{field.label}</span>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(field.key, e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        );
      }

      case 'color': {
        return (
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-slate-300 font-medium">{field.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={typeof currentValue === 'string' && currentValue.startsWith('#') ? currentValue : '#000000'}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
              />
              <span className="text-[11px] font-mono text-slate-400">
                {String(currentValue)}
              </span>
            </div>
          </div>
        );
      }

      case 'textarea': {
        return (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">{field.label}</label>
            <textarea
              rows={3}
              value={currentValue}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.description}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none font-sans"
            />
          </div>
        );
      }

      case 'text':
      default: {
        return (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">{field.label}</label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.description}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-1">
      {renderControl()}
      {field.description && field.type !== 'textarea' && field.type !== 'text' && (
        <p className="text-[10px] text-slate-500">{field.description}</p>
      )}
      {validationError && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-500/30 rounded px-2 py-1 mt-1">
          <AlertCircle size={12} className="shrink-0 text-amber-400" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
