'use client'

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

export function SaveSimulationModal({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      await onSave(name, description);
      handleClose();
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && name.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#252525] border-[#404040] shadow-2xl backdrop-blur-sm"
        style={{
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.1),
            0 4px 6px -1px rgba(0, 0, 0, 0.2),
            0 12px 16px -4px rgba(0, 0, 0, 0.3),
            0 24px 24px -8px rgba(0, 0, 0, 0.4)
          `
        }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Save
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 mt-1.5">
            Save this configuration for later
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-300 block">
              Name <span className="text-blue-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My simulation"
              className="bg-[#404040] border-[#505050] focus:border-white/30 text-white placeholder:text-gray-500 px-3"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300 block">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
              className="bg-[#404040] border-[#505050] focus:border-white/30 text-white placeholder:text-gray-500 min-h-[80px] resize-none w-full px-3 font-sans text-sm"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-[#404040]">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-[#404040] hover:bg-[#505050] border-[#505050] text-gray-200 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800/50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Saving...
              </div>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 