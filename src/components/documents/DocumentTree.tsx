"use client";
import { useState } from "react";
import { DocumentItem } from "@/actions/documentFetch";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  File,
  Calendar,
  HardDrive
} from "lucide-react";

interface DocumentTreeProps {
  items: DocumentItem[];
  onFileClick?: (file: DocumentItem) => void;
  level?: number;
}

export function DocumentTree({ items, onFileClick, level = 0 }: DocumentTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const sortItems = (items: DocumentItem[]) => {
    return [...items].sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <div className="space-y-1">
      {sortItems(items).map((item, index) => {
        const isExpanded = expandedFolders.has(item.name);
        const hasChildren = item.children && item.children.length > 0;
        const indentLevel = level * 16;

        if (item.type === 'folder') {
          return (
            <div key={item.name}>
              <div
                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer group transition-colors"
                style={{ paddingLeft: `${8 + indentLevel}px` }}
                onClick={() => toggleFolder(item.name)}
              >
                <div className="flex items-center gap-1 flex-shrink-0">
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <Folder className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.name}
                </span>
                {hasChildren && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {item.children?.length} items
                  </span>
                )}
              </div>

              {isExpanded && hasChildren && (
                <div className="mt-1">
                  <DocumentTree 
                    items={item.children || []} 
                    onFileClick={onFileClick}
                    level={level + 1}
                  />
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer group transition-colors"
              style={{ paddingLeft: `${8 + indentLevel}px` }}
              onClick={() => onFileClick?.(item)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-4 h-4" />
                {getFileIcon(item.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.lastModified && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.lastModified)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}