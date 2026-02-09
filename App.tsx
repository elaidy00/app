
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import CourseCard from './components/CourseCard';
import { MOCK_COURSES, MOCK_NOTIFICATIONS, MOCK_ACHIEVEMENTS } from './constants';
import { User, Course, CourseEnrollment, Quiz, Lesson, AppNotification } from './types';
import { apiService } from './services/apiService';
import { createAiChat } from './services/geminiService';
import { 
  Play, BookOpen, Award, CheckCircle, ChevronRight, 
  MessageSquare, Send, X, Bot, Loader2, Star, 
  Clock, TrendingUp, Search, Bell, Settings,
  LogOut, Shield, ChevronLeft, Volume2, Info, Menu,
  Mail, Lock, User as UserIcon, ArrowLeft, Filter,
  Share2, Heart, Download, Check, RefreshCcw, AlertCircle
} from 'lucide-react';

type ViewState = 'splash' | 'onboarding' | 'login' | 'register' | 'forgot-password' | 'dashboard' | 'search' | 'course-details' | 'lesson-player' | 'quiz' | 'quiz-results' | 'notifications' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string, timestamp: Date}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => setView('onboarding'), 2500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    const saved = localStorage.getItem('edustream_enrollments');
    if (saved) setEnrollments(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('edustream_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory]);

  // Centralized Navigation Handler
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home': setView('dashboard'); break;
      case 'courses': setView('dashboard'); break; // Search is inline for this version
      case 'notifications': setView('notifications'); break;
      case 'profile': setView('profile'); break;
      default: setView('dashboard'); break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiService.login({ email: 'student@example.com', password: 'password' });
      setUser({
        ...response.user,
        points: 1250,
        level: 5,
        achievements: MOCK_ACHIEVEMENTS
      });
      navigateToTab('home');
    } catch (error) {
      alert('Login Simulation Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = (course: Course) => {
    if (!enrollments[course.id]) {
      const newEnrollment: CourseEnrollment = {
        courseId: course.id,
        progress: 0,
        completedLessonIds: [],
        enrolledAt: new Date().toISOString()
      };
      setEnrollments(prev => ({ ...prev, [course.id]: newEnrollment }));
    }
    setView('course-details');
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setUserAnswers([]);
    setIsQuizComplete(false);
    setView('quiz');
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (!activeQuiz) return;
    
    const isCorrect = optionIdx === activeQuiz.questions[currentQuizIndex].correctAnswer;
    const newAnswers = [...userAnswers, optionIdx];
    setUserAnswers(newAnswers);
    
    if (isCorrect) setQuizScore(prev => prev + 1);

    if (currentQuizIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setIsQuizComplete(true);
      setView('quiz-results');
    }
  };

  const handleAiAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;

    const userMsg = { role: 'user' as const, text: aiQuery, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setAiQuery('');
    setIsAiLoading(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createAiChat(selectedCourse?.title || "Professional Career Paths");
      }
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text, timestamp: new Date() }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Service temporarily unavailable.", timestamp: new Date() }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const SplashScreen = () => (
    <div className="h-screen w-full bg-indigo-600 flex flex-col items-center justify-center animate-pulse">
      <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
        <BookOpen size={48} className="text-indigo-600" />
      </div>
      <h1 className="mt-8 text-3xl font-black text-white tracking-tight">EduStream <span className="text-indigo-200">Pro</span></h1>
      <p className="mt-4 text-indigo-200 font-medium">Elevate Your Career</p>
    </div>
  );

  const Onboarding = () => (
    <div className="h-screen w-full bg-white flex flex-col p-10 justify-between animate-in fade-in duration-500">
      <div className="flex justify-end">
        <button onClick={() => setView('login')} className="text-slate-400 font-bold hover:text-indigo-600">Skip</button>
      </div>
      <div className="text-center space-y-6">
        <div className="relative w-full aspect-square bg-indigo-50 rounded-[3rem] flex items-center justify-center overflow-hidden">
          <TrendingUp size={160} className="text-indigo-100 absolute -bottom-10 -right-10 rotate-12" />
          <Award size={140} className="text-indigo-600 relative z-10 animate-bounce" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 leading-tight">Master Industry Skills</h2>
        <p className="text-slate-500 text-lg">Access professional courses curated by experts with AI-driven mentoring at your fingertips.</p>
      </div>
      <div className="space-y-4">
        <button onClick={() => setView('login')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
          Get Started <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const LoginView = () => (
    <div className="h-screen w-full bg-white p-8 flex flex-col animate-in fade-in duration-500 overflow-y-auto">
      <div className="mt-12 mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome</h1>
        <p className="text-slate-500 mt-2 text-lg">Sign in to continue your path</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input type="email" required placeholder="student@example.com" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-14" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative group">
            <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input type="password" required placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-14" />
          </div>
          <button type="button" onClick={() => setView('forgot-password')} className="text-xs font-bold text-indigo-600 hover:underline block text-right">Forgot Password?</button>
        </div>
        <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In'}
        </button>
      </form>
      <div className="pb-8 text-center mt-6">
        <p className="text-slate-500 font-medium">New member? <button onClick={() => setView('register')} className="text-indigo-600 font-black hover:underline">Register Account</button></p>
      </div>
    </div>
  );

  const RegisterView = () => (
    <div className="h-screen w-full bg-white p-8 flex flex-col animate-in slide-in-from-right-4 duration-500 overflow-y-auto">
      <div className="mt-12 mb-10">
        <button onClick={() => setView('login')} className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-6"><ArrowLeft size={20} /></button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-slate-500 mt-2 text-lg">Join our professional learning community</p>
      </div>
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative group">
            <UserIcon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="John Doe" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none pl-14" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="email" placeholder="name@career.com" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none pl-14" />
          </div>
        </div>
        <button onClick={() => setView('login')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
          Sign Up
        </button>
      </div>
    </div>
  );

  const ForgotPasswordView = () => (
    <div className="h-screen w-full bg-white p-8 flex flex-col animate-in slide-in-from-top-4 duration-500">
      <div className="mt-12 mb-10">
        <button onClick={() => setView('login')} className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-6"><ArrowLeft size={20} /></button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Recover Access</h1>
        <p className="text-slate-500 mt-2 text-lg">Enter your email to receive recovery link</p>
      </div>
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="email" placeholder="name@career.com" className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none pl-14" />
          </div>
        </div>
        <button onClick={() => setView('login')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
          Send Reset Link
        </button>
      </div>
    </div>
  );

  const Dashboard = () => (
    <Layout activeTab={activeTab} onTabChange={navigateToTab} onLogout={() => setView('login')}>
      <div className="px-8 pt-10 pb-32 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
        
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hi, {user?.name.split(' ')[0]}</h2>
            <p className="text-slate-500 font-medium">Ready to master a new skill?</p>
          </div>
          <div className="relative">
             <button onClick={() => setView('notifications')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 relative hover:text-indigo-600 shadow-sm">
                <Bell size={24} />
                {notifications.some(n => !n.isRead) && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
             </button>
          </div>
        </header>

        <section className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-100">Your Learning Progress</span>
              <span className="text-2xl font-black">Lvl {user?.level}</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3 rounded-full shadow-lg" />
            </div>
            <p className="text-sm font-bold text-indigo-100">1,250 / 2,000 XP</p>
          </div>
        </section>

        <section className="relative">
           <input 
            type="text" 
            placeholder="Search enterprise courses..." 
            className="w-full px-8 py-5 rounded-[2rem] border-none bg-white shadow-lg shadow-slate-200/50 focus:ring-2 focus:ring-indigo-500 outline-none pl-16 text-lg font-medium" 
           />
           <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
           <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
             <Filter size={18} />
           </button>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Featured Paths</h3>
            <button className="text-indigo-600 font-black text-sm uppercase tracking-widest">See All</button>
          </div>
          <div className="flex flex-col gap-8">
            {MOCK_COURSES.map(c => (
              <CourseCard key={c.id} course={c} onClick={() => {
                setSelectedCourse(c);
                setView('course-details');
              }} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );

  const CourseDetails = () => (
    <div className="h-screen w-full bg-white overflow-y-auto animate-in zoom-in-95 duration-300 pb-32">
      {selectedCourse && (
        <>
          <div className="relative h-[45vh]">
            <img src={selectedCourse.thumbnail} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-8 flex flex-col justify-between">
              <div className="flex justify-between">
                 <button onClick={() => setView('dashboard')} className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white/40"><ChevronLeft size={20} /></button>
                 <div className="flex gap-2">
                    <button className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white/40"><Share2 size={20} /></button>
                    <button className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white/40"><Heart size={20} /></button>
                 </div>
              </div>
              <div>
                <div className="flex gap-2 mb-4">
                   {selectedCourse.tags.map(tag => (
                     <span key={tag} className="text-[10px] font-black text-white bg-indigo-500/60 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">{tag}</span>
                   ))}
                </div>
                <h1 className="text-3xl font-black text-white leading-tight">{selectedCourse.title}</h1>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-10">
               <div className="text-center">
                  <Star size={20} className="mx-auto text-amber-400 fill-amber-400 mb-2" />
                  <p className="font-black text-slate-800">{selectedCourse.rating}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedCourse.reviewCount} Reviews</p>
               </div>
               <div className="text-center border-x border-slate-100">
                  <Clock size={20} className="mx-auto text-indigo-600 mb-2" />
                  <p className="font-black text-slate-800">12h</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
               </div>
               <div className="text-center">
                  <Award size={20} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-black text-slate-800">{selectedCourse.level}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Complexity</p>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">About Instructor</h3>
               <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 overflow-hidden shadow-inner flex-shrink-0">
                     <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedCourse.instructor}`} alt="" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none mb-1">{selectedCourse.instructor}</p>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{selectedCourse.instructorTitle}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum</h3>
              <div className="space-y-4">
                {selectedCourse.lessons.map((l, i) => (
                  <div 
                    key={l.id} 
                    onClick={() => {
                      if (enrollments[selectedCourse.id]) {
                        setSelectedLesson(l);
                        setView('lesson-player');
                      } else {
                        enrollInCourse(selectedCourse);
                      }
                    }}
                    className="p-6 bg-white rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all cursor-pointer flex items-center gap-6 group shadow-sm"
                  >
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{l.title}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{l.duration} • {l.quiz ? 'Quiz Included' : 'Video Lesson'}</p>
                    </div>
                    {enrollments[selectedCourse.id] && l.isCompleted ? (
                      <CheckCircle size={24} className="text-emerald-500" />
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-300 group-hover:text-indigo-600">
                         <Play size={20} fill="currentColor" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-sm z-50">
            <button 
              onClick={() => enrollInCourse(selectedCourse)}
              className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all text-xl hover:bg-indigo-700"
            >
              {enrollments[selectedCourse.id] ? 'Continue Path' : `Enroll for $${selectedCourse.price}`} <ChevronRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  const LessonPlayer = () => (
    <div className="h-screen w-full bg-slate-900 flex flex-col text-white animate-in zoom-in-95 duration-300">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <button onClick={() => setView('course-details')} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20"><ChevronLeft size={20} /></button>
        <div className="text-center truncate px-4">
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Lesson Mode</p>
           <h3 className="font-bold text-sm truncate">{selectedLesson?.title}</h3>
        </div>
        <button className="p-3 bg-white/10 rounded-2xl"><Menu size={20} /></button>
      </div>
      
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        <img src={selectedCourse?.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md" alt="" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] cursor-pointer hover:scale-105 transition-transform">
            <Play size={44} fill="white" />
          </div>
          <p className="mt-6 font-black text-xl tracking-tight">Enterprise Streaming...</p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center gap-4 mb-6">
             <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 w-1/3 shadow-[0_0_10px_rgba(79,70,229,1)]" />
             </div>
             <span className="text-xs font-black font-mono text-white/60">04:12 / {selectedLesson?.duration}</span>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex gap-6">
                <button className="hover:text-indigo-400 transition-colors"><Volume2 size={24} /></button>
                <button className="hover:text-indigo-400 transition-colors"><Download size={24} /></button>
             </div>
             {selectedLesson?.quiz && (
               <button onClick={() => startQuiz(selectedLesson.quiz!)} className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all shadow-lg">
                  Module Quiz <Award size={18} />
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="bg-white text-slate-900 p-10 rounded-t-[3.5rem] -mt-10 flex-1 overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-black tracking-tight">Study Notes</h2>
           <button className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><MessageSquare size={20} /></button>
        </div>
        <p className="text-slate-600 leading-relaxed text-lg font-medium opacity-80">
          {selectedLesson?.content}
        </p>
      </div>
    </div>
  );

  const ProfileView = () => (
    <Layout activeTab={activeTab} onTabChange={navigateToTab} onLogout={() => setView('login')}>
       <div className="p-10 space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-32">
          <header className="flex flex-col items-center text-center pt-6">
             <div className="relative group">
                <div className="w-32 h-32 rounded-[3rem] bg-indigo-100 border-4 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Edu'}`} className="w-full h-full" alt="profile" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                   <Award size={20} />
                </div>
             </div>
             <h2 className="text-3xl font-black text-slate-900 mt-6">{user?.name}</h2>
             <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs mt-1">Professional Tier Student</p>
          </header>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><TrendingUp size={24} /></div>
                <div>
                  <p className="text-2xl font-black">Lvl {user?.level}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Learning Rank</p>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Star size={24} /></div>
                <div>
                  <p className="text-2xl font-black">{user?.points}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Points</p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Achievements</h3>
             <div className="grid grid-cols-4 gap-4">
                {MOCK_ACHIEVEMENTS.map(ach => (
                  <div key={ach.id} className={`aspect-square rounded-[1.5rem] flex flex-col items-center justify-center text-3xl shadow-sm border ${ach.unlockedAt ? 'bg-white border-slate-100' : 'bg-slate-50 border-transparent grayscale opacity-40'}`} title={ach.title}>
                    {ach.icon}
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <button className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between hover:bg-slate-50 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl"><Settings size={20} /></div>
                   <span className="font-black text-slate-700">Account Settings</span>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
             </button>
             <button onClick={() => setView('login')} className="w-full p-6 bg-red-50/50 border border-red-100 rounded-[2rem] flex items-center justify-between text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-red-100 rounded-2xl"><LogOut size={20} /></div>
                   <span className="font-black">Sign Out</span>
                </div>
             </button>
          </div>
       </div>
    </Layout>
  );

  const QuizView = () => (
    <div className="h-screen w-full bg-white flex flex-col p-10 animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setView('lesson-player')} className="p-4 bg-slate-50 rounded-2xl text-slate-400"><X size={20} /></button>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Knowledge Verification</p>
          <div className="flex gap-1 justify-center">
             {activeQuiz?.questions.map((_, i) => (
               <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= currentQuizIndex ? 'bg-indigo-600' : 'bg-slate-100'}`} />
             ))}
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      {!isQuizComplete && activeQuiz ? (
        <div className="flex-1 flex flex-col justify-center space-y-12">
           <h2 className="text-4xl font-black text-slate-900 leading-tight text-center">
             {activeQuiz.questions[currentQuizIndex].question}
           </h2>
           <div className="space-y-5">
             {activeQuiz.questions[currentQuizIndex].options.map((opt, i) => (
               <button 
                key={i} 
                onClick={() => handleQuizAnswer(i)}
                className="w-full p-8 text-center bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all font-black text-slate-700 text-xl shadow-sm"
               >
                 {opt}
               </button>
             ))}
           </div>
        </div>
      ) : null}
    </div>
  );

  const QuizResultsView = () => {
    if (!activeQuiz) return null;
    const percentage = Math.round((quizScore / activeQuiz.questions.length) * 100);
    const isPass = percentage >= 70;

    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col p-8 animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto no-scrollbar">
        <div className="text-center space-y-6 pt-10 pb-10">
          <div className={`w-32 h-32 mx-auto rounded-[3rem] flex items-center justify-center shadow-2xl rotate-12 ${isPass ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
            <Award size={64} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {isPass ? 'Path Mastered!' : 'Keep Practicing'}
            </h2>
            <div className="mt-4 flex flex-col items-center">
               <div className="text-6xl font-black text-indigo-600 mb-2">{percentage}%</div>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Score: {quizScore} / {activeQuiz.questions.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-1">
           <h3 className="text-xl font-black text-slate-800 tracking-tight ml-2">Review Questions</h3>
           <div className="space-y-4">
              {activeQuiz.questions.map((q, i) => {
                const userAns = userAnswers[i];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={q.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                     <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                           {isCorrect ? <Check size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div className="flex-1">
                           <p className="font-bold text-slate-800 leading-tight mb-2">{q.question}</p>
                           <div className="space-y-2">
                              <p className={`text-xs p-2 rounded-lg font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                Your Answer: {q.options[userAns]}
                              </p>
                              {!isCorrect && (
                                <p className="text-xs p-2 rounded-lg font-medium bg-emerald-50 text-emerald-700">
                                  Correct Answer: {q.options[q.correctAnswer]}
                                </p>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="py-10 space-y-4">
           <button 
             onClick={() => startQuiz(activeQuiz)}
             className="w-full py-6 bg-white border-2 border-indigo-600 text-indigo-600 font-black rounded-[2rem] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all text-xl"
           >
             <RefreshCcw size={24} /> Retry Quiz
           </button>
           <button 
             onClick={() => setView('course-details')}
             className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all text-xl hover:bg-indigo-700"
           >
             Back to Path <ChevronRight size={24} />
           </button>
        </div>
      </div>
    );
  };

  const NotificationsView = () => (
    <Layout activeTab={activeTab} onTabChange={navigateToTab} onLogout={() => setView('login')}>
       <div className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-32">
          <div className="flex items-center justify-between">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
             <button onClick={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-100">Clear All</button>
          </div>
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-6 rounded-[2.5rem] border transition-all ${notif.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/20 border-indigo-200 shadow-lg shadow-indigo-100/10'}`}>
                 <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${notif.type === 'achievement' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                       {notif.type === 'achievement' ? <Award size={28} /> : <Bell size={28} />}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-slate-900 text-lg leading-tight">{notif.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{notif.timestamp}</span>
                       </div>
                       <p className="text-sm text-slate-500 leading-relaxed font-medium">{notif.message}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
       </div>
    </Layout>
  );

  const renderView = () => {
    switch (view) {
      case 'splash': return <SplashScreen />;
      case 'onboarding': return <Onboarding />;
      case 'login': return <LoginView />;
      case 'register': return <RegisterView />;
      case 'forgot-password': return <ForgotPasswordView />;
      case 'dashboard': return <Dashboard />;
      case 'course-details': return <CourseDetails />;
      case 'lesson-player': return <LessonPlayer />;
      case 'quiz': return <QuizView />;
      case 'quiz-results': return <QuizResultsView />;
      case 'notifications': return <NotificationsView />;
      case 'profile': return <ProfileView />;
      case 'search': return <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-600">
      {renderView()}

      {/* Persistent AI Mentoring Button */}
      {['dashboard', 'course-details', 'lesson-player', 'profile', 'notifications', 'search'].includes(view) && !isAiOpen && (
        <button 
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-32 right-8 w-20 h-20 bg-indigo-600 text-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(79,70,229,0.4)] z-[100] flex items-center justify-center group active:scale-90 transition-all hover:scale-105"
        >
          <Bot size={36} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      {/* AI Bot System Overlay */}
      {isAiOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[200] flex items-end sm:items-center justify-center p-0 sm:p-10 animate-in fade-in duration-300">
          <div className="w-full h-[90%] sm:h-auto sm:max-w-2xl bg-white sm:rounded-[3.5rem] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
              <Bot size={220} className="absolute -right-16 -bottom-16 opacity-10 rotate-12" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Bot size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">AI Academic Mentor</h3>
                  <div className="flex items-center gap-2 text-indigo-200 mt-1 font-bold text-[10px] uppercase tracking-widest">
                     <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                     Thinking with Gemini 3 Pro
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-4 hover:bg-white/10 rounded-full transition-colors relative z-10"><X size={32} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 bg-slate-50 space-y-8">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20 px-10">
                   <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 shadow-inner">
                     <MessageSquare size={48} />
                   </div>
                   <h4 className="text-2xl font-black text-slate-800 mb-4">Study Assistant Ready</h4>
                   <p className="font-bold text-slate-600 text-lg leading-relaxed px-6">Ask about complex patterns, code debugging, or career roadmap guidance.</p>
                </div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-7 rounded-[2.5rem] shadow-sm text-lg leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                    <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                    <p className={`text-[10px] mt-4 font-black uppercase tracking-widest opacity-40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] rounded-tl-none flex items-center gap-4">
                    <Loader2 size={24} className="animate-spin text-indigo-600" />
                    <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Synthesizing Response...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAiAsk} className="p-10 bg-white border-t flex gap-5">
              <input 
                autoFocus
                type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} 
                placeholder="Ask me anything..." 
                className="flex-1 bg-slate-100 border-none rounded-[2rem] px-10 py-6 focus:ring-2 focus:ring-indigo-600 outline-none text-xl font-medium shadow-inner"
              />
              <button disabled={!aiQuery.trim() || isAiLoading} className="p-6 bg-indigo-600 text-white rounded-[2rem] shadow-2xl active:scale-90 transition-all disabled:opacity-50">
                <Send size={32} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
