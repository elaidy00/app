
import React from 'react';
import { Home, Search, User, Bell, LayoutGrid } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl relative overflow-hidden ring-1 ring-slate-100">
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {children}
      </main>

      {/* Commercial-grade Navigation System */}
      <div className="absolute bottom-8 left-8 right-8 z-[80]">
        <nav className="bg-white/90 backdrop-blur-2xl px-10 py-5 flex justify-between items-center rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 ring-1 ring-black/5">
          <NavButton 
            icon={<Home size={26} />} 
            active={activeTab === 'home'} 
            onClick={() => onTabChange('home')} 
          />
          <NavButton 
            icon={<Search size={26} />} 
            active={activeTab === 'courses'} 
            onClick={() => onTabChange('courses')} 
          />
          <NavButton 
            icon={<Bell size={26} />} 
            active={activeTab === 'notifications'} 
            onClick={() => onTabChange('notifications')} 
          />
          <NavButton 
            icon={<User size={26} />} 
            active={activeTab === 'profile'} 
            onClick={() => onTabChange('profile')} 
          />
        </nav>
      </div>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-3xl transition-all relative group flex items-center justify-center ${active ? 'text-indigo-600 bg-indigo-50/80 scale-110 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    {active && (
      <span className="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,1)]" />
    )}
  </button>
);

export default Layout;
