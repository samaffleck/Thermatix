'use client'

import { Button } from "./ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExitConfirmationModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md">
        <div 
          className="bg-[#303030] border border-[#404040] rounded-xl p-6"
          style={{
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.1),
              0 4px 6px -1px rgba(0, 0, 0, 0.2),
              0 12px 16px -4px rgba(0, 0, 0, 0.3),
              0 24px 24px -8px rgba(0, 0, 0, 0.4)
            `
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Exit Simulation?</h2>
          <p className="text-gray-300 mb-6">
            Your current simulation progress and settings will be lost if you haven't saved them.
            Do you want to exit anyway?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#444] hover:bg-white/5 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Exit Without Saving
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 