'use client'

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { StorageViewer } from "@/components/storage-viewer";
import { SimulationParamsViewer } from "@/components/load-simulation-modal";
import { SaveSimulationModal } from "@/components/save-simulation-modal";
import { FolderNameModal } from "@/components/folder-name-modal";
import { useToast } from "@/components/ui/use-toast"

// Define global function types that will be called from WASM
declare global {
  function storeCsvData(jsonData: string): Promise<void>;
  function storeTextData(data: string): Promise<void>;
  function viewStorageFiles(): void;
  function loadTextData(): Promise<string>;
  function getPublicSimulations(): Promise<string>;
}

export default function ProtectedPage() {
  const { toast } = useToast()
  const [isWasmLoading, setIsWasmLoading] = useState(true);
  const [wasmStatus, setWasmStatus] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isStorageViewerOpen, setIsStorageViewerOpen] = useState(false);
  const [isParamsViewerOpen, setIsParamsViewerOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [resolveParamSelection, setResolveParamSelection] = useState<((value: string) => void) | null>(null);
  const [pendingSimData, setPendingSimData] = useState<string | null>(null);
  const [isFolderNameModalOpen, setIsFolderNameModalOpen] = useState(false);
  const [pendingCsvData, setPendingCsvData] = useState<string | null>(null);
  const [resolveFolderName, setResolveFolderName] = useState<((value: string) => void) | null>(null);
  const [isPublicSimsViewerOpen, setIsPublicSimsViewerOpen] = useState(false);
  const [resolvePublicSimSelection, setResolvePublicSimSelection] = useState<((value: string) => void) | null>(null);

  // Modify the message handler to be the only place that controls loading state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'wasmStatus') {
        setWasmStatus(event.data.status);
        
        if (event.data.status.includes('Running...')) {
          setIsWasmLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Move handlePostAuth inside the component
  async function handlePostAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check for pending save operation
      const pendingData = localStorage.getItem('pendingSimData');
      if (pendingData) {
        localStorage.removeItem('pendingSimData');
        setPendingSimData(pendingData);
        setIsSaveModalOpen(true);
      }
      
      // Check for pending load operation
      const pendingLoad = localStorage.getItem('pendingLoadOperation');
      if (pendingLoad) {
        localStorage.removeItem('pendingLoadOperation');
        setIsParamsViewerOpen(true);
      }
    }
  }

  useEffect(() => {
    // Use function expressions for window methods
    window.storeCsvData = async (jsonData: string) => {
      try {
        setPendingCsvData(jsonData);
        
        const folderName = await new Promise<string>((resolve) => {
          setResolveFolderName(() => resolve);
          setIsFolderNameModalOpen(true);
        });

        // If folderName is empty, user cancelled the operation
        if (!folderName) {
          setPendingCsvData(null);
          return;
        }

        const supabase = createClient();
        const files = JSON.parse(jsonData);
        
        // Upload each file to the folder
        const uploadPromises = Object.entries(files).map(async ([paramName, csvData]) => {
          const filename = `${folderName}/${paramName}.csv`;
          
          // Convert the CSV string to a Blob
          const blob = new Blob([csvData as string], { type: 'text/csv' });
          const file = new File([blob], filename, { type: 'text/csv' });

          // Upload to Supabase Storage
          const { error } = await supabase.storage
            .from('simulation-results')
            .upload(filename, file);

          if (error) {
            console.error(`Error uploading ${paramName}:`, error);
            throw error;
          }
        });

        await Promise.all(uploadPromises);
        setPendingCsvData(null);
        toast({
          description: "All CSV files uploaded successfully",
          variant: "success",
        });
      } catch (error) {
        console.error('Error in storeCsvData:', error);
        toast({
          description: "Failed to upload CSV files",
          variant: "destructive",
        });
        throw error;
      }
    };

    // Handles storing simulation parameters to Supabase database
    window.storeTextData = async (data: string) => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Store the pending data in localStorage
          localStorage.setItem('pendingSimData', data);
          // Redirect to sign in
          window.location.href = '/sign-in?redirect=/protected';
          return;
        }
        
        setPendingSimData(data);
        setIsSaveModalOpen(true);
      } catch (error) {
        console.error('Error in storeTextData:', error);
        throw error;
      }
    };

    // Opens the storage viewer modal to view saved simulation results
    window.viewStorageFiles = () => {
      setIsStorageViewerOpen(true);
    };

    // Promisified function to load saved simulation parameters
    // Returns a promise that resolves when parameters are selected
    window.loadTextData = async () => {
      return new Promise<string>((resolve, reject) => {
        try {
          const supabase = createClient();
          
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
              // Store the resolve function in localStorage
              localStorage.setItem('pendingLoadOperation', 'true');
              window.location.href = '/sign-in?redirect=/protected';
              resolve(''); // Resolve with empty string to prevent WASM from hanging
              return;
            }
            
            setResolveParamSelection(() => resolve);
            setIsParamsViewerOpen(true);
          });
        } catch (error) {
          console.error('loadTextData: Error occurred:', error);
          reject(error);
        }
      });
    };

    // Add new function to get public simulations
    window.getPublicSimulations = async () => {
      return new Promise<string>((resolve, reject) => {
        try {
          setResolvePublicSimSelection(() => resolve);
          setIsPublicSimsViewerOpen(true);
        } catch (error) {
          console.error('Error in getPublicSimulations:', error);
          toast({
            description: "Failed to fetch public simulations",
            variant: "destructive",
          });
          reject(error);
        }
      });
    };

    // Call handlePostAuth at the end of useEffect
    handlePostAuth();
  }, []);

  const handleSaveSimulation = async (name: string, description: string) => {
    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('simulations')
        .insert([{
          sim_params: pendingSimData,
          sim_name: name,
          sim_description: description
        }]);

      if (error) {
        console.error('Error storing simulation:', error);
        throw error;
      }

      console.log('Simulation stored successfully');
      setIsSaveModalOpen(false);
      setPendingSimData(null);
      
      // Show success toast after successful save
      toast({
        description: "Simulation parameters saved successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving simulation:', error);
      toast({
        description: "Failed to save simulation parameters",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handles the selection of parameters from the viewer
  const handleParamSelect = (params: string) => {
    
    setIsParamsViewerOpen(false);
    if (resolveParamSelection) {
      resolveParamSelection(params);
      setResolveParamSelection(null);
      // Only show toast if params were actually selected (not empty string)
      if (params) {
        toast({
          description: "Simulation parameters loaded successfully",
          variant: "success",
        });
      }
    }
  };

  // Handles closing the parameters viewer modal
  const handleClose = () => {
    setIsParamsViewerOpen(false);
    if (resolveParamSelection) {
      resolveParamSelection(''); // Resolves the promise with empty string when modal is closed
      setResolveParamSelection(null);
    }
  };

  const handleFolderNameSubmit = (folderName: string) => {
    setIsFolderNameModalOpen(false);
    if (resolveFolderName) {
      resolveFolderName(folderName);
      setResolveFolderName(null);
    }
  };

  // Add handler for public simulation selection
  const handlePublicSimSelect = (params: string) => {
    setIsPublicSimsViewerOpen(false);
    if (resolvePublicSimSelection) {
      resolvePublicSimSelection(params);
      setResolvePublicSimSelection(null);
      // Only show toast if params were actually selected (not empty string)
      if (params) {
        toast({
          description: "Simulation parameters loaded successfully",
          variant: "success",
        });
      }
    }
  };

  // Add handler for closing public simulations viewer
  const handlePublicSimClose = () => {
    setIsPublicSimsViewerOpen(false);
    if (resolvePublicSimSelection) {
      resolvePublicSimSelection(''); // Resolve with empty string when modal is closed
      setResolvePublicSimSelection(null);
    }
  };

  return (
    <>
      <div className="w-full h-full relative">
        {isWasmLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
            <h2 className="text-xl font-semibold text-primary">Launching Simulation...</h2>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/wasm_app/thermo_plot.html"
          className="w-full h-full"
          style={{ border: "none" }}
          title="Property Plotter Web Tool"
        />
      </div>
      <StorageViewer 
        isOpen={isStorageViewerOpen} 
        onClose={() => setIsStorageViewerOpen(false)} 
      />
      <SimulationParamsViewer
        isOpen={isParamsViewerOpen}
        onClose={handleClose}
        onSelect={handleParamSelect}
      />
      <SaveSimulationModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setPendingSimData(null);
        }}
        onSave={handleSaveSimulation}
      />
      <FolderNameModal
        isOpen={isFolderNameModalOpen}
        onClose={() => {
          setIsFolderNameModalOpen(false);
          if (resolveFolderName) {
            resolveFolderName('');  // Empty string indicates cancellation
            setResolveFolderName(null);
          }
          setPendingCsvData(null);  // Clear the pending data
        }}
        onSubmit={handleFolderNameSubmit}
      />
      <SimulationParamsViewer
        isOpen={isPublicSimsViewerOpen}
        onClose={handlePublicSimClose}
        onSelect={handlePublicSimSelect}
        publicOnly={true}
      />
    </>
  )
}
