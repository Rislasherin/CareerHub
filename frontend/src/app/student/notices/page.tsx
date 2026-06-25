'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { NoticeResponse } from '@/types/notice';
import { StudentNoticeService } from '@/services/student/notice.service';

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'Urgent':
      return {
        border: 'border-l-rose-400',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-500',
        dot: 'bg-rose-500'
      };
    case 'Important':
      return {
        border: 'border-l-amber-400',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-500',
        dot: 'bg-amber-500'
      };
    case 'Normal':
      return {
        border: 'border-l-emerald-400',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-500',
        dot: 'bg-emerald-500'
      };
    default:
      return {
        border: 'border-l-slate-200',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-500',
        dot: 'bg-slate-500'
      };
  }
};

export default function StudentNoticeBoardPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // NOTE: This uses dummy data for the design. Replace with your actual StudentService API call!
  useEffect(() => {
    const fetchNotices = async () => {
      try {

        const data = await StudentNoticeService.getNotices();
        setNotices(data || []);
      } catch (error) {
        console.log("Failed to fetch notices", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const tabs = ['All', 'Urgent', 'Important', 'Normal'];

  const filteredNotices = activeTab === 'All'
    ? notices
    : notices.filter(n => n.priority === activeTab);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-10">

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Notice Board</h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-500 font-medium text-lg">Announcements from your placement office</p>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                College Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 w-72 shadow-sm"
              />
            </div>

            {/* Practice Now Button */}
            <Button className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white h-12 px-6 text-sm font-black gap-2 shadow-md shadow-rose-500/20 border-none transition-all">
              <Sparkles size={16} /> Practice Now
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-[13px] font-black uppercase tracking-widest transition-all rounded-xl ${
                  activeTab === tab 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notices List */}
          <div className="flex flex-col gap-4">
            {filteredNotices.map((notice) => {
              const styles = getPriorityStyles(notice.priority);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={notice.id}
                  className={`bg-[#FAFAFA] rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4 border-l-4 ${styles.border}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-[15px] font-black text-slate-900">{notice.title}</h3>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${styles.badgeBg} ${styles.badgeText}`}>
                        {notice.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-500 leading-relaxed pr-12">
                    {notice.content}
                  </p>

                  <span className="text-xs font-bold text-slate-400">
                    {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    }) : 'Just now'}
                  </span>
                </motion.div>
              );
            })}
            
            {filteredNotices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 font-medium">No notices found in this category.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
