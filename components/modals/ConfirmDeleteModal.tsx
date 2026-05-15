'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  destructiveText?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading = false,
  destructiveText = 'Delete',
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600
                     disabled:opacity-50 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon + title */}
        <div className="flex gap-4 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-600 mb-6">{description}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                       bg-red-600 text-white font-medium text-sm
                       hover:bg-red-700 active:bg-red-800
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {destructiveText}
          </button>
        </div>
      </div>
    </div>
  );
}
