
import React from 'react';
import { Star, Play, Clock, BarChart3, Users } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div 
      onClick={() => onClick(course.id)}
      className="bg-white rounded-[3.5rem] p-6 border border-slate-100 hover:border-indigo-100 transition-all active:scale-[0.98] cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] mb-6 shadow-xl ring-1 ring-black/5">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        <div className="absolute top-6 left-6 flex gap-2">
           <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-xl">
             {course.isFree ? 'FREE' : `$${course.price}`}
           </span>
        </div>

        <div className="absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-[1.5rem] text-white shadow-2xl translate-y-24 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
           <Play size={28} fill="currentColor" />
        </div>
      </div>
      
      <div className="px-2 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">{course.category}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <Star size={14} className="text-amber-400 fill-amber-400" />
             <span className="text-sm font-black text-slate-700">{course.rating}</span>
             <span className="text-[10px] font-bold text-slate-300">({course.reviewCount})</span>
           </div>
        </div>

        <h3 className="font-black text-slate-800 text-2xl leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 tracking-tight">
          {course.title}
        </h3>
        
        <div className="flex items-center justify-between border-t border-slate-50 pt-5">
           <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden shadow-inner ring-2 ring-white">
                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor}`} alt="" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 leading-none">{course.instructor}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{course.instructorTitle.split(' ')[0]}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 text-slate-400">
             <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span className="text-[10px] font-black">{course.studentCount}</span>
             </div>
             <div className="flex items-center gap-1.5">
                <BarChart3 size={14} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{course.level}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
