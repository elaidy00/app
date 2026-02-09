
// Fix: Removed the non-existent 'Progress' type from the imports as it is not exported by '../types' and is not used in this file.
import { AuthResponse, Course, UserRole } from '../types';

/**
 * This service simulates communication with an ASP.NET Core Backend.
 * In a real scenario, you would use fetch() or axios with interceptors.
 */
class ApiService {
  private baseUrl: string = '/api'; // Placeholder for .NET Backend URL

  private async getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Authentication
  async login(credentials: any): Promise<AuthResponse> {
    // Simulation of POST /api/auth/login
    console.log('API Call: POST /auth/login', credentials);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 'u1',
            name: 'John Doe',
            email: credentials.email,
            // Fix: Added missing properties 'points', 'level', and 'achievements' to match User interface, and used UserRole enum.
            role: credentials.email.includes('admin') ? UserRole.ADMIN : UserRole.STUDENT,
            enrolledCourses: ['1', '3'],
            points: 0,
            level: 1,
            achievements: []
          }
        });
      }, 800);
    });
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    // Simulation of GET /api/courses
    return new Promise((resolve) => setTimeout(() => resolve([]), 500));
  }

  async getCourseById(id: string): Promise<Course | null> {
    // Simulation of GET /api/courses/{id}
    return null;
  }

  // User Progress
  async updateProgress(courseId: string, lessonId: string): Promise<void> {
    const headers = await this.getHeaders();
    console.log(`API Call: PATCH /api/progress/${courseId}/lesson/${lessonId}`, { headers });
    // In production, this persists to the SQL Server database via EF Core
  }
}

export const apiService = new ApiService();
