"use client";
import { apiClient } from "@/lib/api";

// New interfaces for documents
export interface DocumentItem {
  name: string;
  type: "folder" | "file";
  url?: string;
  lastModified?: string;
  courseCode?: string;
  children?: DocumentItem[];
}

export interface DocumentsTree {
  lastUpdated?: string;
  tree: DocumentItem[];
}

export interface SubjectDocuments {
  tree: DocumentItem[];
}

/**
 * Fetches the main documents tree with caching support
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Whether to bypass cache and force a fresh fetch
 * @param {boolean} options.updateCache - Whether to update the cache with new data
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds (default: 1 hour)
 * @returns {Promise<DocumentsTree | null>} Documents tree data
 */
export async function fetchDocumentsTree({
  forceRefresh = false,
  updateCache = true,
  cacheExpiry = 60 * 60 * 1000 // 1h
} = {}): Promise<DocumentsTree | null> {
  console.log(`fetchDocumentsTree: ${forceRefresh ? 'Forcing refresh' : 'Using cache if available'}`);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const CACHE_NAME = "documents-cache";
  const CACHE_KEY = "/documents";
  const CACHE_METADATA_KEY = "documents-metadata";

  const getCacheMetadata = () => {
    try {
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error("Error reading documents cache metadata:", error);
      return null;
    }
  };

  const updateCacheMetadata = (data: DocumentsTree) => {
    try {
      const timestamp = Date.now();
      const metadata = {
        timestamp,
        expiresAt: timestamp + cacheExpiry,
        subjectCount: data.tree?.length || 0,
        lastUpdated: data.lastUpdated
      };
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      return metadata;
    } catch (error) {
      console.error("Error updating documents cache metadata:", error);
    }
  };

  const isCacheExpired = () => {
    const metadata = getCacheMetadata();
    if (!metadata) return true;
    return Date.now() > metadata.expiresAt;
  };

  if (!forceRefresh && "caches" in window) {
    try {
      if (!isCacheExpired()) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          const data = await cachedResponse.json();
          console.log("Serving documents from cache:", {
            subjectCount: data.tree?.length || 0,
            lastUpdated: data.lastUpdated
          });
          return data;
        }
      } else {
        console.log("Documents cache expired, fetching fresh data");
      }
    } catch (error) {
      console.error("Error reading documents from cache:", error);
    }
  }

  try {
    console.log("Fetching documents from API");
    const response = await apiClient.get(
      `${api_url}/documents`,
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
        withCredentials: true,
      }
    );

    const data = response.data;
    console.log("Documents data:", data);

    if (updateCache && "caches" in window && data) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `max-age=${cacheExpiry / 1000}`
          }
        });
        await cache.put(CACHE_KEY, responseToCache);
        updateCacheMetadata(data);
        console.log("Documents cache updated with fresh data");
      } catch (error) {
        console.error("Error updating documents cache:", error);
      }
    }

    return data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    if ("caches" in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          console.log("Documents API request failed. Serving stale cache as fallback");
          return await cachedResponse.json();
        }
      } catch (cacheError) {
        console.error("Error serving stale documents cache:", cacheError);
      }
    }
    return null;
  }
}

/**
 * Fetches documents for a specific subject with caching support
 * @param {string} subjectName - Name of the subject to fetch documents for
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Whether to bypass cache and force a fresh fetch
 * @param {boolean} options.updateCache - Whether to update the cache with new data
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds (default: 1 hour)
 * @returns {Promise<SubjectDocuments | null>} Subject documents data
 */
export async function fetchSubjectDocuments(
  subjectName: string,
  {
    forceRefresh = false,
    updateCache = true,
    cacheExpiry = 60 * 60 * 1000 // 1h
  } = {}
): Promise<SubjectDocuments | null> {
  console.log(`fetchSubjectDocuments: ${subjectName} - ${forceRefresh ? 'Forcing refresh' : 'Using cache if available'}`);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const CACHE_NAME = "subject-documents-cache";
  const CACHE_KEY = `/documents/${encodeURIComponent(subjectName)}`;
  const CACHE_METADATA_KEY = `subject-documents-${encodeURIComponent(subjectName)}-metadata`;

  const getCacheMetadata = () => {
    try {
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error("Error reading subject documents cache metadata:", error);
      return null;
    }
  };

  const updateCacheMetadata = (data: SubjectDocuments) => {
    try {
      const timestamp = Date.now();
      const metadata = {
        timestamp,
        expiresAt: timestamp + cacheExpiry,
        subjectName,
        folderCount: data.tree?.length || 0
      };
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      return metadata;
    } catch (error) {
      console.error("Error updating subject documents cache metadata:", error);
    }
  };

  const isCacheExpired = () => {
    const metadata = getCacheMetadata();
    if (!metadata) return true;
    return Date.now() > metadata.expiresAt;
  };

  if (!forceRefresh && "caches" in window) {
    try {
      if (!isCacheExpired()) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          const data = await cachedResponse.json();
          console.log(`Serving ${subjectName} documents from cache:`, {
            folderCount: data.tree?.length || 0
          });
          return data;
        }
      } else {
        console.log(`${subjectName} documents cache expired, fetching fresh data`);
      }
    } catch (error) {
      console.error("Error reading subject documents from cache:", error);
    }
  }

  try {
    console.log(`Fetching ${subjectName} documents from API`);
    const response = await apiClient.get(
      `${api_url}/documents/${encodeURIComponent(subjectName)}`,
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
        withCredentials: true,
      }
    );

    const data = response.data;
    console.log(`${subjectName} documents data:`, data);

    if (updateCache && "caches" in window && data) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `max-age=${cacheExpiry / 1000}`
          }
        });
        await cache.put(CACHE_KEY, responseToCache);
        updateCacheMetadata(data);
        console.log(`${subjectName} documents cache updated with fresh data`);
      } catch (error) {
        console.error("Error updating subject documents cache:", error);
      }
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${subjectName} documents:`, error);
    if ("caches" in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          console.log(`${subjectName} documents API request failed. Serving stale cache as fallback`);
          return await cachedResponse.json();
        }
      } catch (cacheError) {
        console.error("Error serving stale subject documents cache:", cacheError);
      }
    }
    return null;
  }
}

/**
 * Clears the documents cache
 * @returns {Promise<boolean>} Success status
 */
export async function clearDocumentsCache(): Promise<boolean> {
  if ("caches" in window) {
    try {
      await caches.delete("documents-cache");
      await caches.delete("subject-documents-cache");
      
      // Clear all subject-specific metadata
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("subject-documents-") || key === "documents-metadata") {
          localStorage.removeItem(key);
        }
      });
      
      console.log("Documents cache cleared");
      return true;
    } catch (error) {
      console.error("Error clearing documents cache:", error);
      return false;
    }
  }
  return false;
}


/**
 * Gets documents cache statistics
 * @returns {Object} Documents cache statistics
 */
export function getDocumentsCacheStats() {
  const metadata = localStorage.getItem("documents-metadata");
  if (!metadata) return { exists: false };

  const parsedMetadata = JSON.parse(metadata);
  const now = Date.now();

  return {
    exists: true,
    timestamp: new Date(parsedMetadata.timestamp).toLocaleString(),
    isExpired: now > parsedMetadata.expiresAt,
    expiresIn: Math.max(0, Math.floor((parsedMetadata.expiresAt - now) / 1000 / 60)), // minutes
    subjectCount: parsedMetadata.subjectCount,
    lastUpdated: parsedMetadata.lastUpdated
  };
}

/**
 * Gets all cache statistics
 * @returns {Object} All cache statistics
 */
export function getAllCacheStats() {
  return {
    documents: getDocumentsCacheStats()
  };
}

/**
 * Gets available subjects that have documents
 * @returns {Promise<string[]>} Array of subject names that have documents
 */
export async function getAvailableSubjects() {
  try {
    const data = await fetchDocumentsTree();
    if (data && data.tree) {
      return data.tree.map(subject => subject.name);
    }
    return [];
  } catch (error) {
    console.error("Error getting available subjects:", error);
    return [];
  }
}

/**
 * Normalizes text for comparison (removes extra spaces, converts to lowercase)
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Checks if two course names match (case-insensitive with normalization)
 * @param courseName - Course name from user data
 * @param subjectName - Subject name from documents API
 * @returns True if names match
 */
function isCourseMatch(courseName: string, subjectName: string): boolean {
  const normalizedCourse = normalizeText(courseName);
  const normalizedSubject = normalizeText(subjectName);
  
  // Direct match
  if (normalizedCourse === normalizedSubject) return true;
  
  // Check if one contains the other (for partial matches)
  if (normalizedCourse.includes(normalizedSubject) || normalizedSubject.includes(normalizedCourse)) return true;
  
  return false;
}

/**
 * Fetches course codes and titles from attendance and marks data
 * @returns {Promise<Array<{code: string, title: string}>>} Array of course objects with code and title
 */
export async function fetchCourseCodes() {
  try {
    // Import attendance data to get course codes
    const { fetchAttendance } = await import('./attendanceFetch');
    const attendanceData = await fetchAttendance();
    
    if (!attendanceData) {
      console.warn("No attendance data available for course codes");
      return [];
    }

    const courseMap = new Map<string, string>();
    
    // Extract course codes and titles from attendance data
    if (attendanceData.attendance && Array.isArray(attendanceData.attendance)) {
      attendanceData.attendance.forEach((record: { "Course Code"?: string; "Course Title"?: string }) => {
        if (record["Course Code"]) {
          // Clean the course code (remove "Regular" suffix if present)
          const cleanCode = record["Course Code"].replace("Regular", "").trim();
          if (cleanCode) {
            // Store course title if available, otherwise use code as fallback
            const title = record["Course Title"] || cleanCode;
            courseMap.set(cleanCode, title);
          }
        }
      });
    }

    // Extract course codes and titles from marks data
    if (attendanceData.marks && Array.isArray(attendanceData.marks)) {
      attendanceData.marks.forEach((record: { "Course Code"?: string; "Course Title"?: string }) => {
        if (record["Course Code"]) {
          const cleanCode = record["Course Code"].replace("Regular", "").trim();
          if (cleanCode) {
            // Only add if not already present (attendance data takes precedence)
            if (!courseMap.has(cleanCode)) {
              const title = record["Course Title"] || cleanCode;
              courseMap.set(cleanCode, title);
            }
          }
        }
      });
    }

    // Convert Map to Array and sort alphabetically by code
    const sortedCourses = Array.from(courseMap.entries())
      .map(([code, title]) => ({ code, title }))
      .sort((a, b) => a.code.localeCompare(b.code));
    
    console.log("Extracted courses:", sortedCourses);
    
    return sortedCourses;
  } catch (error) {
    console.error("Error fetching course codes:", error);
    return [];
  }
}

/**
 * Checks course availability by comparing with available subjects
 * @param userCourses - Array of user courses
 * @param availableSubjects - Array of available subjects
 * @returns Array of courses with availability status
 */
export function checkCourseAvailability(userCourses: Array<{code: string, title: string}>, availableSubjects: string[]) {
  return userCourses.map(course => {
    // Check if any subject name matches this course (case-insensitive)
    const hasDocuments = availableSubjects.some(subject => 
      isCourseMatch(course.title, subject)
    );
    
    return {
      ...course,
      hasDocuments
    };
  });
}