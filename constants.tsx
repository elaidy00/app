
import { Course, AppNotification, Achievement } from './types';

export const COLORS = {
  primary: '#6366F1', // Indigo 500
  primaryDark: '#4F46E5',
  secondary: '#10B981', // Emerald 500
  accent: '#F59E0B', // Amber 500
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textMain: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0'
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Early Bird', icon: '🌅', unlockedAt: '2024-03-01' },
  { id: 'a2', title: 'Quiz Master', icon: '🧠', unlockedAt: '2024-03-05' },
  { id: 'a3', title: 'Consistent Learner', icon: '🔥' }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Level Up!', message: 'You reached Level 5! Check your profile for new rewards.', timestamp: '10m ago', isRead: false, type: 'achievement' },
  { id: 'n2', title: 'New Course Available', message: 'Architecting Cloud Native Apps is now live.', timestamp: '2h ago', isRead: false, type: 'update' },
  { id: 'n3', title: 'Study Reminder', message: 'Ready to finish your Flutter module?', timestamp: '1d ago', isRead: true, type: 'reminder' }
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Enterprise Architecture with ASP.NET Core 8',
    instructor: 'Dr. Michael Chen',
    instructorTitle: 'Principal Software Architect',
    description: 'A comprehensive guide to building resilient enterprise applications using the latest .NET standards. Learn Clean Architecture, DDD, and Event Sourcing.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    price: 99.99,
    isFree: false,
    category: 'Backend',
    rating: 4.9,
    reviewCount: 450,
    studentCount: 2450,
    level: 'Advanced',
    tags: ['C#', '.NET', 'Microservices'],
    lessons: [
      { 
        id: 'l1', 
        title: 'Introduction to Modular Monoliths', 
        duration: '15:20', 
        videoUrl: '#', 
        content: 'Modular monoliths provide a great balance between maintainability and deployment simplicity...', 
        isCompleted: true,
        quiz: {
          id: 'q1',
          title: 'Monolith Patterns',
          questions: [
            { id: 'q1_1', question: 'What is the key benefit of a Modular Monolith?', options: ['Faster DB', 'Logical separation', 'No network lag', 'Cheap hosting'], correctAnswer: 1 }
          ]
        }
      },
      { id: 'l2', title: 'Infrastructure Persistence Patterns', duration: '22:10', videoUrl: '#', content: 'In this lesson we explore Repository and Unit of Work patterns...', isCompleted: false },
    ]
  },
  {
    id: '2',
    title: 'Advanced UX/UI Design Patterns',
    instructor: 'Sarah Jenkins',
    instructorTitle: 'Senior Product Designer',
    description: 'Master the art of creating intuitive user interfaces. Deep dive into Material 3, cognitive load theories, and motion design.',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800',
    price: 49.00,
    isFree: false,
    category: 'Design',
    rating: 4.8,
    reviewCount: 320,
    studentCount: 1820,
    level: 'Intermediate',
    tags: ['Figma', 'UX Research', 'Material 3'],
    lessons: [
      { id: 'l3', title: 'The Psychology of Color', duration: '18:45', videoUrl: '#', content: 'Color is more than just aesthetic; it is a communication tool...', isCompleted: false }
    ]
  }
];
