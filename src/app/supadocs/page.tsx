"use client";
import { useState, useEffect } from "react";
import { fetchDocumentsTree, fetchSubjectDocuments, fetchCourseCodes, getAvailableSubjects, checkCourseAvailability } from "@/actions/documentFetch";
import { DocumentItem, DocumentsTree, SubjectDocuments } from "@/actions/documentFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, RefreshCw, Search, ChevronLeft, File, Calendar, BookOpen, CheckCircle, XCircle, Menu, X } from "lucide-react";
import { DocumentErrorBoundary } from "@/components/documents/DocumentErrorBoundary";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { FileViewerComponent } from "@/components/documents/FileViewer";
import { ContributeDocuments } from "@/components/documents/Contribute";

function isCourseMatch(courseName: string, subjectName: string): boolean {
  const normalizeText = (text: string): string => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  };
  
  const normalizedCourse = normalizeText(courseName);
  const normalizedSubject = normalizeText(subjectName);
  
  if (normalizedCourse === normalizedSubject) return true;
  
  if (normalizedCourse.includes(normalizedSubject) || normalizedSubject.includes(normalizedCourse)) return true;
  
  return false;
}

interface CourseInfo {
  code: string;
  title: string;
  hasDocuments: boolean;
}

export default function DocumentsPage() {
  const [documentsTree, setDocumentsTree] = useState<DocumentsTree | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectDocuments, setSubjectDocuments] = useState<SubjectDocuments | null>(null);
  const [selectedFile, setSelectedFile] = useState<DocumentItem | null>(null);

  const [subjectLoading, setSubjectLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadDocumentsTree();
    loadCoursesWithAvailability();
  }, []);

  const loadDocumentsTree = async (forceRefresh = false) => {

    setError(null);
    try {
      const data = await fetchDocumentsTree({ forceRefresh });
      if (data) {
        setDocumentsTree(data);
      } else {
        setError("Failed to load documents. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Error loading documents tree:", error);
      
      const errorObj = error as { response?: { data?: { message?: string }; status?: number } };
      if (errorObj.response?.data?.message === 'Session expired - please login again') {
        setError("Your session has expired. Please refresh the page or log in again.");
      } else if (errorObj.response?.status === 401 || errorObj.response?.status === 403) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError("Failed to load documents. Please check your connection and try again.");
      }
    } finally {
      
    }
  };

  const loadCoursesWithAvailability = async () => {
    setCoursesLoading(true);
    try {
      const [userCourses, subjects] = await Promise.all([
        fetchCourseCodes(),
        getAvailableSubjects()
      ]);
      
      setAvailableSubjects(subjects);
      
      const coursesWithStatus = checkCourseAvailability(userCourses, subjects);
      
      setCourses(coursesWithStatus);
    } catch (error) {
      console.error("Error loading courses with availability:", error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadSubjectDocuments = async (subjectName: string, forceRefresh = false) => {
    setSubjectLoading(true);
    setError(null);
    try {
      const data = await fetchSubjectDocuments(subjectName, { forceRefresh });
      if (data) {
        setSubjectDocuments(data);
        setSelectedSubject(subjectName);
      } else {
        setError(`Failed to load documents for ${subjectName}. Please try again.`);
      }
    } catch (error: unknown) {
      console.error("Error loading subject documents:", error);
      
      const errorObj = error as { response?: { data?: { message?: string }; status?: number } };
      if (errorObj.response?.data?.message === 'Session expired - please login again') {
        setError("Your session has expired. Please refresh the page or log in again.");
      } else if (errorObj.response?.status === 401 || errorObj.response?.status === 403) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(`Failed to load documents for ${subjectName}. Please try again.`);
      }
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleSubjectClick = (courseTitle: string) => {
    setSelectedFile(null);
    setSubjectDocuments(null);
    setSelectedSubject(null);
    
    setIsSidebarOpen(false);
    
    const matchingSubject = availableSubjects.find(subject => 
      isCourseMatch(courseTitle, subject)
    );
    
    if (matchingSubject) {
      setTimeout(() => {
        loadSubjectDocuments(matchingSubject);
      }, 100);
    } else {
      console.error(`No matching subject found for course: ${courseTitle}`);
      setError(`No documents found for ${courseTitle}. Please try again.`);
    }
  };

  const handleFileClick = (file: DocumentItem) => {
    setSelectedFile(file);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSubjectDocuments(null);
    setSelectedFile(null);
  };

  const handleBackToDocuments = () => {
    setSelectedFile(null);
  };



  const filteredSubjects = documentsTree?.tree.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const coursesWithDocuments = filteredCourses.filter(course => course.hasDocuments);
  const coursesWithoutDocuments = filteredCourses.filter(course => !course.hasDocuments);

  return (
    <DocumentErrorBoundary>
      <style jsx global>{`
        /* Webkit scrollbar styles for modern browsers */
        .thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .thin-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
        
        /* Dark mode scrollbar */
        .dark .thin-scrollbar {
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
        
        .dark .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
        
        .dark .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(75, 85, 99, 0.7);
        }
        
        /* Corner where horizontal and vertical scrollbars meet */
        .thin-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
      
      <div className="lg:h-screen h-full min-h-screen overflow-hidden">
        <div className="w-full mx-auto px-4 py-4 h-full flex flex-col">
          {/* Header */}
          <header className="mb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Documents
                  </h1>
                  {documentsTree?.lastUpdated && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      Updated {new Date(documentsTree.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  loadDocumentsTree(true);
                  loadCoursesWithAvailability();
                }}
                className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                  {error.includes("session") || error.includes("authentication") ? (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      The system will automatically attempt to refresh your session, or you can refresh the page.
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-600 border-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* File Viewer */}
          {selectedFile ? (
            <div className="flex-1 overflow-hidden h-full flex flex-col">
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToDocuments}
                    className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Documents
                  </Button>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedSubject} / {selectedFile.name}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden min-h-0">
                <FileViewerComponent file={selectedFile} onClose={handleBackToDocuments} />
              </div>
            </div>
          ) : (
            <div className="flex lg:flex-row flex-col-reverse gap-3 flex-1 overflow-hidden h-full relative">
              {/* Mobile Sidebar Overlay */}
              {isSidebarOpen && (
                <div 
                  className="lg:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar - Subjects */}
              <aside className={`
                lg:w-1/3 lg:relative lg:translate-x-0 lg:z-auto
                fixed left-0 top-0 w-80 h-full z-50 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:h-full flex flex-col overflow-hidden
              `}>
                <div className="bg-white dark:bg-[#0F0F0F] rounded-lg border border-gray-200 dark:border-[#151515] overflow-hidden flex flex-col h-full lg:rounded-lg rounded-none lg:border border-0 lg:border-gray-200 lg:dark:border-[#151515]">
                  <div className="p-4 border-b border-gray-200 dark:border-[#151515] flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-medium text-gray-900 dark:text-white">
                        Subjects
                      </h2>
                      {/* Mobile close button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9 text-sm border-gray-300 dark:border-[#151515]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto thin-scrollbar">
                    {filteredSubjects.map((subject) => (
                      <button
                        key={subject.name}
                        onClick={() => handleSubjectClick(subject.name)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors border-b border-gray-100 dark:border-[#151515] last:border-b-0 ${
                          selectedSubject === subject.name
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Folder className="w-4 h-4 flex-shrink-0" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-base font-medium truncate">
                              {subject.name} 
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {subject.courseCode ? `(${subject.courseCode})` : ""}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="lg:w-2/3 flex flex-col overflow-hidden gap-3 h-full min-h-64">
                {selectedSubject ? (
                  <div className="bg-white dark:bg-[#0F0F0F] min-h-64 flex-1 rounded-lg border border-gray-200 dark:border-[#151515] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-[#151515] flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackToSubjects}
                            className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-[#151515] dark:hover:bg-[#151515]"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                          <h2 className="font-medium text-gray-900 dark:text-white">
                            {selectedSubject}
                          </h2>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSubjectDocuments(selectedSubject, true)}
                          disabled={subjectLoading}
                          className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${subjectLoading ? 'animate-spin' : ''}`}
                          />
                          Refresh
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 thin-scrollbar">
                      {subjectLoading ? (
                        <div className="space-y-3">
                          {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                          ))}
                        </div>
                      ) : subjectDocuments ? (
                        <DocumentTree 
                          items={subjectDocuments.tree} 
                          onFileClick={handleFileClick}
                        />
                      ) : (
                        <div className="text-center py-12">
                          <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No documents found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0F0F0F] min-h-64 flex-1 rounded-lg border border-gray-200 dark:border-[#151515] p-6 overflow-y-auto thin-scrollbar">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Your Courses
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Courses with available study materials are highlighted. Click on any course to view documents.
                      </p>
                    </div>

                    {coursesLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : filteredCourses.length > 0 ? (
                      <div className="space-y-6">
                        {/* Courses with Documents */}
                        {coursesWithDocuments.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              Available Materials ({coursesWithDocuments.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {coursesWithDocuments.map((course) => (
                                <button
                                  key={course.code}
                                  onClick={() => handleSubjectClick(course.title)}
                                  className="group p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 text-left"
                                >
                                  <div className="flex items-start gap-3">
                                    <BookOpen className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-gray-900 dark:text-white text-base mb-1 line-clamp-2">
                                        {course.title}
                                      </h3>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        {course.code}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Courses without Documents */}
                        {coursesWithoutDocuments.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <XCircle className="w-5 h-5 text-gray-400" />
                              No Materials Yet ({coursesWithoutDocuments.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {coursesWithoutDocuments.map((course) => (
                                <div
                                  key={course.code}
                                  className="p-4 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#151515] rounded-lg opacity-60"
                                >
                                  <div className="flex items-start gap-3">
                                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-gray-500 dark:text-gray-400 text-base mb-1 line-clamp-2">
                                        {course.title}
                                      </h3>
                                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                        {course.code}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Courses Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          {searchQuery ? 
                            `No courses match "${searchQuery}". Try a different search term.` :
                            "No courses are currently available. Please check back later or contact support."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <ContributeDocuments />
              </main>
            </div>
          )}
        </div>
      </div>
    </DocumentErrorBoundary>
  );
}