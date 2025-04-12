"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Folder, File, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StorageItem {
  name: string;
  type: "folder" | "file";
  size?: number;
  lastModified?: string;
  path: string;
}

export default function MyResultsPage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [folderContents, setFolderContents] = useState<Record<string, StorageItem[]>>({});
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStorageItems() {
      const supabase = createClient();
      
      const { data } = await supabase
        .storage
        .from('simulation-results')
        .getPublicUrl('');

      if (!data?.publicUrl) {
        console.error('Error getting bucket URL');
        setIsLoading(false);
        return;
      }

      const { data: storageData, error } = await supabase
        .storage
        .from('simulation-results')
        .list();

      if (error) {
        console.error('Error fetching storage items:', error);
      } else if (storageData) {
        const formattedItems: StorageItem[] = storageData.map(item => ({
          name: item.name,
          type: item.metadata?.mimetype ? 'file' : 'folder',
          size: item.metadata?.size,
          lastModified: item.updated_at,
          path: `${data.publicUrl}/${item.name}`
        }));
        setItems(formattedItems);
      }
      
      setIsLoading(false);
    }

    fetchStorageItems();
  }, []);

  const handleFolderClick = async (folderName: string) => {
    setFolderPath(prev => [...prev, folderName]);
    setIsFolderLoading(true);

    if (!folderContents[folderName]) {
      const supabase = createClient();
      const { data, error } = await supabase
        .storage
        .from('simulation-results')
        .list(folderName);

      if (error) {
        console.error('Error fetching folder contents:', error);
        setIsFolderLoading(false);
        return;
      }

      const formattedContents: StorageItem[] = data.map(item => ({
        name: item.name,
        type: item.metadata?.mimetype ? 'file' : 'folder',
        size: item.metadata?.size,
        lastModified: item.updated_at,
        path: `${folderName}/${item.name}`
      }));

      setFolderContents(prev => ({ ...prev, [folderName]: formattedContents }));
    }

    setIsFolderLoading(false);
  };

  const handleBreadcrumbClick = (index: number) => {
    setFolderPath(folderPath.slice(0, index + 1));
  };

  const handleDownload = async (item: StorageItem) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .storage
      .from('simulation-results')
      .download(item.path);

      if (error) {
        console.error('Error downloading file:', error);
        return;
      }

    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileClick = (item: StorageItem) => {
    setSelectedItem(item.path);
  };
  
  const handleDelete = async (item: StorageItem) => {
    const supabase = createClient();

    // Define the function outside the if block
    const getAllFilesInFolder = async (folderPath: string): Promise<string[]> => {
      const { data, error } = await supabase
        .storage
        .from('simulation-results')
        .list(folderPath);

      if (error) {
        console.error('Error listing folder contents:', error);
        return [];
      }

      let allFiles: string[] = [];

      for (const file of data) {
        const fullPath = `${folderPath}/${file.name}`;
        if (!file.metadata?.mimetype) {
          // It's a folder, recurse
          const subFiles = await getAllFilesInFolder(fullPath);
          allFiles = [...allFiles, ...subFiles];
        } else {
          // It's a file
          allFiles.push(fullPath);
        }
      }

      return allFiles;
    };

    if (item.type === 'folder') {
      // Get all files in the folder
      const filesToDelete = await getAllFilesInFolder(item.name);

      // Delete all files in batches of 1000 (Supabase limit)
      for (let i = 0; i < filesToDelete.length; i += 1000) {
        const batch = filesToDelete.slice(i, i + 1000);
        const { error } = await supabase
          .storage
          .from('simulation-results')
          .remove(batch);

        if (error) {
          console.error('Error deleting files from folder:', error);
          return;
        }
      }

      // Update UI state
      setItems(prevItems => prevItems.filter(i => !i.path.startsWith(item.path)));
      setFolderContents(prevContents => {
        const newContents = { ...prevContents };
        // Remove the folder and its contents from folderContents
        delete newContents[item.name];
        return newContents;
      });

    } else {
      // Handle single file deletion (existing logic)
      const { error } = await supabase
        .storage
        .from('simulation-results')
        .remove([item.path]);

      if (error) {
        console.error('Error deleting file from Supabase:', error);
        return;
      }

      setItems(prevItems => prevItems.filter(i => i.path !== item.path));
      if (folderPath.length > 0) {
        const currentFolder = folderPath[folderPath.length - 1];
        setFolderContents(prevContents => ({
          ...prevContents,
          [currentFolder]: prevContents[currentFolder].filter(i => i.path !== item.path)
        }));
      }
    }
  };

  const handleShare = () => {
    alert('This feature is under development.');
  };

  const handleFileDoubleClick = async (item: StorageItem) => {
    if (item.type === 'file' && item.name.endsWith('.csv')) {
      const supabase = createClient();
      const fullPath = folderPath.length > 0 
        ? `${folderPath.join('/')}/${item.name}`
        : item.name;

      try {
        const { data, error } = await supabase
          .storage
          .from('simulation-results')
          .download(fullPath);

        if (error) {
          console.error('Error downloading CSV file:', error);
          return;
        }

        if (data) {
          const csvContent = await data.text();
          
          // Create a blob with the raw CSV content
          const blob = new Blob([csvContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          
          // Open in new tab
          window.open(url, '_blank');
          
          // Cleanup
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      } catch (error) {
        console.error('Error handling file:', error);
      }
    } else if (item.type === 'folder') {
      handleFolderClick(item.name);
    }
  };

  const displayedItems = folderPath.length > 0 ? folderContents[folderPath[folderPath.length - 1]] || [] : items;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-3xl font-bold text-foreground">
        <span
          className="cursor-pointer hover:bg-muted rounded-full px-5 py-2 transition-colors"
          onClick={() => setFolderPath([])}
        >
          My Results
        </span>
        {folderPath.map((folder, index) => (
          <React.Fragment key={folder}>
            <span>{'>'}</span>
            <span
              className="cursor-pointer mx-1 hover:bg-muted rounded-full px-5 py-2 transition-colors"
              onClick={() => handleBreadcrumbClick(index)}
            >
              {folder}
            </span>
          </React.Fragment>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-700"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-4 border-b font-semibold text-gray-700 dark:text-gray-300">
            <span className="flex-1">Name</span>
            <span className="flex-1">Last modified</span>
            <span className="flex-1">File size</span>
          </div>
          {isFolderLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-700"></div>
            </div>
          ) : (
            displayedItems.map((item) => (
              <div key={item.path} className="flex flex-col">
                <div
                  className={`flex items-center justify-between p-4 border-b hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    selectedItem === item.path ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => {
                    if (item.type === 'file') {
                      handleFileClick(item);
                    } else {
                      setSelectedItem(item.path);
                    }
                  }}
                  onDoubleClick={() => {
                    if (item.type === 'folder') {
                      handleFolderClick(item.name);
                    } else {
                      handleFileDoubleClick(item);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {item.type === 'folder' ? (
                      <Folder className="h-6 w-6 text-accent-blue hover:text-accent-blue-hover dark:text-accent-blue dark:hover:text-accent-blue-hover" />
                    ) : (
                      <File className="h-6 w-6 text-gray-500" />
                    )}
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  <span className="flex-1 text-sm text-gray-500">{item.lastModified}</span>
                  <span className="flex-1 text-sm text-gray-500">
                    {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : '-'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload(item)}>Download</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
