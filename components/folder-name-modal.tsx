'use client'

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface FolderNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => void;
}

export function FolderNameModal({ isOpen, onClose, onSubmit }: FolderNameModalProps) {
  const [folderName, setFolderName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!folderName.trim()) {
      return;
    }
    onSubmit(folderName);
    setFolderName('');
  };

  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md">
        <div 
          className="bg-[#303030] border border-[#404040] rounded-xl"
          style={{
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.1),
              0 4px 6px -1px rgba(0, 0, 0, 0.2),
              0 12px 16px -4px rgba(0, 0, 0, 0.3),
              0 24px 24px -8px rgba(0, 0, 0, 0.4)
            `
          }}
        >
          <div className="flex flex-col p-6 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="bg-[#404040] border-[#505050] focus:border-white/30 text-white !text-base px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#333]">
              <div className="space-x-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!folderName.trim()}
                  className="w-24 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-24 border-[#444] hover:bg-white/5 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 