"use client";
import { useEffect, useState, useCallback } from "react";
import { DocumentItem } from "@/actions/documentFetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  AlertTriangle,
} from "lucide-react";

interface FileViewerProps {
  file: DocumentItem;
  onClose?: () => void;
}

export function FileViewerComponent({ file, onClose }: FileViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "ppt":
      case "pptx":
        return <FileText className="w-4 h-4 text-orange-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="w-4 h-4 text-green-500" />;
      default:
        return <FileIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileExtension = (filename: string) =>
    filename.split(".").pop()?.toUpperCase() || "Unknown";

  const getFileType = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return "image";
    }
    if (ext === "pdf") {
      return "pdf";
    }
    if (["ppt", "pptx"].includes(ext)) {
      return "presentation";
    }
    if (["doc", "docx"].includes(ext)) {
      return "document";
    }
    return "unknown";
  };

  // Google Docs viewer for Word documents and PDFs
  const getGoogleViewerUrl = useCallback((url: string, type: string) => {
    const encodedUrl = encodeURIComponent(url);
    
    switch (type) {
      case "document":
        return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
      case "pdf":
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      default:
        return url;
    }
  }, []);

  // Office Apps Live viewer for PowerPoint
  const getOfficeViewerUrl = useCallback((url: string) => {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }, []);

  const handleDownload = async () => {
    try {
      if (!file.url) return;
      
      const response = await fetch(file.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("Download error:", e);
      // Fallback to opening in new tab
      window.open(file.url, "_blank");
    }
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn("Fullscreen toggle failed:", e);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setError("Failed to load file");
    setLoading(false);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(file.url || "");
      // You could add a toast notification here
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    setZoomLevel(100);
    setRotation(0);
  }, [file]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!file?.url) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {getFileIcon(file.name)}
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {file.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {getFileExtension(file.name)}
            </Badge>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No file URL available
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              This file cannot be previewed at the moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fileType = getFileType(file.name);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden h-full flex flex-col">
      {/* Minimal Compact Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - File info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getFileIcon(file.name)}
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {file.name}
            </span>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {getFileExtension(file.name)}
            </Badge>
          </div>

          {/* Right side - Compact action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Image-specific controls */}
            {fileType === "image" && (
              <>
                <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 50} className="h-7 w-7 p-0">
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2rem] text-center">
                  {zoomLevel}%
                </span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 200} className="h-7 w-7 p-0">
                  <ZoomIn className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRotate} className="h-7 w-7 p-0">
                  <RotateCw className="w-3 h-3" />
                </Button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              </>
            )}

            <Button variant="ghost" size="sm" onClick={copyShareLink} className="h-7 w-7 p-0">
              <Share2 className="w-3 h-3" />
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-7 w-7 p-0">
              {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-7 w-7 p-0">
              <Download className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(file.url, "_blank")}
              className="h-7 w-7 p-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>

            {onClose && (
              <>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Viewer - Now takes more space */}
      <div className="relative bg-gray-50 dark:bg-gray-900 flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                <div className="absolute inset-0 rounded-full h-8 w-8 border-3 border-blue-200 dark:border-blue-800 mx-auto"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">Loading...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">
                Failed to load file
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {error}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  <RotateCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
                <Button onClick={() => window.open(file.url, "_blank")} variant="default" size="sm">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="h-full w-full min-h-0 flex-1">
          {fileType === "image" && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <Image
                src={file.url}
                width={1000}
                height={1000}
                alt={file.name}
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg transition-all duration-300"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                }}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {fileType === "pdf" && (
            <iframe
              src={getGoogleViewerUrl(file.url, 'pdf')}
              className="w-full h-full border-0 min-h-[70vh]"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {fileType === "presentation" && (
            <iframe
              src={getOfficeViewerUrl(file.url)}
              className="w-full h-full border-0 min-h-[70vh]"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {fileType === "document" && (
            <iframe
              src={getGoogleViewerUrl(file.url, 'document')}
              className="w-full h-full border-0 min-h-[70vh]"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {fileType === "unknown" && (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  File Preview Not Available
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This file type is not supported for preview. Download the file to view it locally.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleDownload} variant="default" size="sm">
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button onClick={() => window.open(file.url, "_blank")} variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}