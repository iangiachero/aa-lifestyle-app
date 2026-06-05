import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskCard from './home/TaskCard';
import ScheduleCard from './home/ScheduleCard';
import WellnessSection from './home/WellnessSection';
import ProductivitySection from './home/ProductivitySection';

export default function Home() {
  const { userProfile } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const firstName = userProfile?.full_name?.split(' ')[0] || '';

  return (
    <div className="page-safe-x pt-safe pt-6 pb-24 bg-[#000000]">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pb-3 border-b-2 border-[rgba(226,186,139,0.25)] mr-4">
          <h1 className="font-serif text-3xl font-semibold text-[#C9A962] tracking-wide leading-tight">
            {greeting()}{firstName ? ` ${firstName}` : ''}
          </h1>
        </div>
        <Link to="/profile">
          <div className="w-12 h-12 border border-[rgba(226,186,139,0.3)] shadow-[0_0_8px_rgba(226,186,139,0.15)] bg-[#000000] rounded-full flex items-center justify-center backdrop-blur-md flex-shrink-0 cursor-pointer hover:border-[rgba(226,186,139,0.5)] transition-colors overflow-hidden">
            {userProfile?.pfp_url ? (
              <img src={userProfile.pfp_url} alt="profile" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-[#e2ba8b]" strokeWidth={1.5} />
            )}
          </div>
        </Link>
      </div>
      <div className="space-y-3">
        <ScheduleCard />
        <TaskCard />
        <WellnessSection />
        <ProductivitySection isStudent={userProfile?.is_student === true} />
      </div>
    </div>
  );
}