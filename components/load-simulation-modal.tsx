'use client'

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Search, Calendar, Clock } from "lucide-react";
import { Input } from "./ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

interface SimulationParams {
  id: number;
  sim_params: string;
  sim_name: string;
  sim_description: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (params: string) => void;
  publicOnly?: boolean;
}

export function SimulationParamsViewer({ isOpen, onClose, onSelect, publicOnly = false }: Props) {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParam, setSelectedParam] = useState<SimulationParams | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSimulations();
    }
  }, [isOpen]);

  const loadSimulations = async () => {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('simulations')
        .select('*');
      
      // Filter for public simulations if publicOnly is true
      if (publicOnly) {
        query = query.eq('is_public', true);
      } else {
        // For private simulations, filter by user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setSimulations(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading simulations:', error);
      toast({
        description: "Failed to load simulations",
        variant: "destructive",
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredParams = simulations.filter(param => {
    const searchLower = searchQuery.toLowerCase();
    return (
      param?.sim_name?.toLowerCase().includes(searchLower) ||
      param?.sim_description?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = () => {
    if (selectedParam) {
      onSelect(selectedParam.sim_params);
      setSearchQuery("");
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedParam(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-[#303030] border-[#404040]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Load Simulation
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 mt-1.5">
            Select a previously saved simulation configuration to load.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#404040] border-[#505050] focus:border-white/30 text-white placeholder:text-gray-500"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-1">
              {filteredParams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No simulations found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredParams.map((param) => (
                    <div 
                      key={param.id}
                      onClick={() => setSelectedParam(param)}
                      className={`group px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        selectedParam?.id === param.id 
                          ? 'bg-white/10 border-white/30' 
                          : 'hover:bg-[#404040]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-200">
                          {param.sim_name}
                        </span>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 opacity-70" />
                            {new Date(param.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 opacity-70" />
                            {new Date(param.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      {param.sim_description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {param.sim_description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-[#404040]">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-[#404040] hover:bg-[#505050] border-[#505050] text-gray-200 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedParam}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800/50"
            >
              Load
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}