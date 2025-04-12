'use client'

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Search, Calendar, Download } from "lucide-react";
import { Input } from "./ui/input";

interface StorageFile {
  name: string;
  created_at: string;
}

export function StorageViewer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from('simulation-results')
          .list();

        if (error) throw error;
        setFiles(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch files');
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchFiles();
      setSelectedFile(null);
    }
  }, [isOpen]);

  const handleDownload = async (fileName: string) => {
    try {
      setDownloadingFile(fileName);
      const supabase = createClient();
      
      const { data, error } = await supabase.storage
        .from('simulation-results')
        .createSignedUrl(fileName, 60);

      if (error) throw error;
      if (!data.signedUrl) throw new Error('No signed URL received');

      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl">
          <div className="flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Simulation Results</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="hover:bg-white/10"
              >
                ×
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#252525] border-[#333] focus:border-white/30 text-white"
              />
            </div>
            
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <p className="text-red-400">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setError(null)} 
                  className="mt-2 border-red-500/20 hover:bg-red-500/10"
                >
                  Dismiss
                </Button>
              </div>
            )}
            
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredFiles.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No files found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <div 
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`group p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedFile?.name === file.name 
                          ? 'bg-white/10 ring-1 ring-white/30' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="font-mono text-sm text-gray-300 mb-2 break-all">
                        {file.name}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#333]">
              <div className="space-x-2">
                <Button
                  onClick={() => selectedFile && handleDownload(selectedFile.name)}
                  disabled={!selectedFile || downloadingFile !== null}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {downloadingFile ? (
                    <span className="animate-spin mr-2">↻</span>
                  ) : (
                    'Download'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-[#444] hover:bg-white/5 text-gray-300"
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