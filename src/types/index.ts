// User Information Types
export interface UserInfo {
  batch?: number;
  semester?: number;
  name?: string;
  registrationNumber?: string;
  program?: string;
  department?: string;
  mobile?: number;
}

export interface Advisor {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface UserInfoData {
  user?: UserInfo;
  advisors?: Advisor[];
}

// Attendance Types
export interface AttendanceRecord {
  "Course Code": string;
  "Course Title": string;
  Category: string;
  "Faculty Name": string;
  Slot: string;
  "Hours Conducted": string;
  "Hours Absent": string;
  "Attn %": string;
  "Room No": string;
}

export interface MarksRecord {
  "Course Code": string;
  "Course Type": string;
  "Test Performance": string;
}

// Timetable Types
export interface Course {
  CourseCode: string;
  CourseTitle: string;
  FacultyName: string;
  RoomNo: string;
}

export interface Period {
  period: string;
  timeSlot: string;
  course?: Course | { CourseTitle: string };
}

export interface TimetableEntry {
  day: string;
  periods: Period[];
}

// Document Types
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

export interface CourseInfo {
  code: string;
  title: string;
  hasDocuments: boolean;
}

// Calendar Types
export interface CalendarEvent {
  title: string;
  date: string;
  description?: string;
}

export interface CalendarMonth {
  [day: number]: CalendarEvent[];
}

export interface CalendarData {
  [month: string]: CalendarMonth;
}

export interface EventData {
  Date: string;
  Day: string;
  DayOrder: string;
  Event: string;
}

// Calculator Types
export interface Subject {
  name: string;
  credits: number;
  grade: number;
}

export interface Semester {
  gpa: number;
}

// Mess Menu Types
export type MealType = "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER";
export type DayMeals = { [key in MealType]: string[] };
export type DailyMenu = { name: string; meals: DayMeals };
export type WeeklyMenu = { messName: string; weekMenu: DailyMenu[] };

// Log Types
export interface LogCard {
  type: string;
  activity: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

// Store Types
export interface TimeTableData {
  setTimeTable: (timetable: object) => void;
  timetable: object;
}

export interface MenuState {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
}

export interface useScrollMrksprops {
  section: string;
  setSection: (section: string) => void;
}

export interface PredictedButton {
  setPredictedButton: (predictedButton: number) => void;
  predictedButton: number;
}

export interface AttendanceEntry {
  Slot: string;
  "Hours Absent": string;
  "Course Code": string;
  "Course Title": string;
  "Hours Conducted": string;
  type: string;
  conducted: number;
  Category: string;
  "Attn %": string;
  "Faculty Name": string;
  "Room No": string;
}

export interface PredictedAtt {
  setPredictedAtt: (predictedAtt: AttendanceEntry[]) => void;
  predictedAtt: AttendanceEntry[];
}

export interface CalendarMonthState {
  month: number;
  setMonth: (value: number) => void;
}

// API Types
export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface RefreshResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// Utility Types
export type DayOrder = number | "off";
export type FallbackResult = DayOrder | null;
