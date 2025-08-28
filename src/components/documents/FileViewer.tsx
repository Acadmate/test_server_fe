"use client";
import { useEffect, useState, useCallback } from "react";
import { DocumentItem } from "@/actions/documentFetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
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
  Eye,
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
  const [viewMode, setViewMode] = useState<'preview' | 'google'>('preview');

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "ppt":
      case "pptx":
        return <FileText className="w-5 h-5 text-orange-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="w-5 h-5 text-green-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
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

  const getFileSize = (url: string) => {
    // This would need to be implemented with actual file size data
    return "Loading...";
  };

  // Google Apps integration for PDFs and Word docs only
  const getGoogleViewerUrl = useCallback((url: string, type: string) => {
    const encodedUrl = encodeURIComponent(url);
    
    switch (type) {
      case "document":
        return `https://docs.google.com/document/d/e/${encodedUrl}/pub?embedded=true`;
      case "pdf":
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      default:
        return url;
    }
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
    setViewMode('preview');
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getFileIcon(file.name)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {file.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getFileExtension(file.name)}
                </Badge>
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
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
  const supportsGoogleViewer = ["document", "pdf"].includes(fileType);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {getFileIcon(file.name)}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {file.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getFileExtension(file.name)}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getFileSize(file.url)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle for supported files (PDFs and Word docs only) */}
            {supportsGoogleViewer && (
              <>
                <Button
                  variant={viewMode === 'preview' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  className="h-8"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant={viewMode === 'google' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode('google')}
                  className="h-8"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Google
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            {/* Zoom Controls for images */}
            {fileType === "image" && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file.url, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>

            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced File Viewer */}
      <div className="relative bg-gray-50 dark:bg-gray-900">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 mx-auto"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Loading file...</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please wait</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Failed to load file
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {error}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={() => window.open(file.url, "_blank")} variant="default">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[32rem] max-h-[80vh] overflow-auto">
          {fileType === "image" && (
            <div className="w-full h-full flex items-center justify-center p-6">
              <img
                src={file.url}
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
              src={viewMode === 'google' ? getGoogleViewerUrl(file.url, 'pdf') : file.url}
              className="w-full h-full border-0 min-h-[32rem]"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {fileType === "presentation" && (
            <div className="w-full h-full min-h-[32rem]">
              <DocViewer
                documents={[{ uri: file.url }]}
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                  },
                }}
                style={{ height: '100%', width: '100%' }}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {fileType === "document" && (
            <>
              {viewMode === 'google' ? (
                <iframe
                  src={getGoogleViewerUrl(file.url, 'document')}
                  className="w-full h-full border-0 min-h-[32rem]"
                  title={file.name}
                  onLoad={handleLoad}
                  onError={handleError}
                />
              ) : (
                <div className="w-full h-full min-h-[32rem]">
                  <DocViewer
                    documents={[{ uri: file.url }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableHeader: true,
                        disableFileName: true,
                      },
                    }}
                    style={{ height: '100%', width: '100%' }}
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                </div>
              )}
            </>
          )}

          {fileType === "unknown" && (
            <div className="w-full h-full flex items-center justify-center p-8 min-h-[32rem]">
              <div className="text-center max-w-md">
                <FileIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  File Preview Not Available
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This file type is not supported for preview. Download the file to view it locally.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleDownload} variant="default">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                  <Button onClick={() => window.open(file.url, "_blank")} variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
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
