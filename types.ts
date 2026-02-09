
export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlockedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolledCourses: string[];
  points: number;
  level: number;
  achievements: Achievement[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  content: string;
  isCompleted: boolean;
  quiz?: Quiz;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorTitle: string;
  description: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  category: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  lessons: Lesson[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

export interface CourseEnrollment {
  courseId: string;
  progress: number;
  completedLessonIds: string[];
  enrolledAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'achievement' | 'reminder' | 'update';
}

export interface AuthResponse {
  token: string;
  user: User;
}
