'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { Search, Bell, ArrowUp, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { NoticeService } from '@/services/college/notice.service';
import { NoticePriority, NoticeResponse } from '@/types/notice';



const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'Urgent':
      return {
        border: 'border-l-rose-400',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-500',
      };
    case 'Important':
      return {
        border: 'border-l-amber-400',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-500',
      };
    case 'Normal':
      return {
        border: 'border-l-emerald-400',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-500',
      };
    default:
      return {
        border: 'border-l-slate-400',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-500',
      };
  }
};

export default function NoticeBoardPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [notices, setNotices] = useState<NoticeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<NoticePriority>('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)


  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await NoticeService.getNotices();
        setNotices(data || [])

      } catch (error) {
        console.log("Failed to fetch notices", error)
      } finally {
        setIsLoading(false)
      }
    };
    fetchNotices()
  }, []);

  const handlePostNotice = async () => {
    if (!title || !content) return;

    setIsSubmitting(true)
    try {
      if (editingId) {
        const updateNotice = await NoticeService.updateNotice(editingId, { title, content, priority });
        setNotices(prev => prev.map(n => n.id === editingId ? updateNotice : n))
      } else {
        const newNotice = await NoticeService.createNotice({ title, content, priority });
        setNotices(prev => [newNotice, ...prev])
      }

      setTitle('')
      setContent('')
      setPriority('Normal');
      setIsModalOpen(false)
    } catch (error) {
      console.log('Failed to create notice', error)
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleEditClick = (notice: NoticeResponse) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setPriority(notice.priority);
    setIsModalOpen(true)
  };

  const handleDeleteClick = (id: string) => {
    setNoticeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!noticeToDelete) return;
    setIsDeleting(true);
    try {
      await NoticeService.deleteNotice(noticeToDelete)
      setNotices(prev => prev.filter(n => n.id !== noticeToDelete))
      setNoticeToDelete(null);
    } catch (error) {
      console.log("Failed to delete notice", error)
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = ['All', 'Urgent', 'Important', 'Normal'];

  const filteredNotices = activeTab === 'All'
    ? notices
    : notices.filter(n => n.priority === activeTab);

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8 pb-12">

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Notice Board</h1>
            <p className="text-slate-500 font-medium text-sm">Post announcements to students</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, companies."
                className="h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 shadow-sm"
              />
            </div>

            {/* Post Notice Button */}
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-xl border-slate-200 h-10 px-4 text-xs font-black gap-2 shadow-sm bg-white hover:bg-slate-50">
              <Plus size={14} /> Post Notice
            </Button>

            {/* Upgrade Button */}
            <Button className="rounded-xl bg-[#092215] hover:bg-[#092215]/90 text-white h-10 px-4 text-xs font-black gap-2 shadow-sm border-none">
              <ArrowUp size={14} /> Upgrade
            </Button>

            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 hover:bg-amber-100 transition-all shadow-sm">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold transition-all relative ${activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-slate-900 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl bg-[#092215] hover:bg-[#092215]/90 text-white h-10 px-5 text-xs font-black gap-2 shadow-sm border-none">
            <Plus size={14} /> Post Notice
          </Button>
        </div>

        {/* Notices List */}
        <div className="flex flex-col gap-4 mt-2">
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
                    <Button
                    onClick={() => handleEditClick(notice)}
                    variant="outline" className="h-7 px-3 text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm">
                      Edit
                    </Button>
                    <Button
                    onClick={() => handleDeleteClick(notice.id)}
                    variant="outline" className="h-7 px-3 text-[10px] font-bold rounded-lg border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm">
                      Delete
                    </Button>
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
        </div>

        {/* Post Notice Modal Design */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Post New Notice</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">Broadcast an announcement to all students</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-6 bg-slate-50/50">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Notice Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Google Pre-Placement Talk"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Announcement Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write the full announcement details here..."
                      rows={5}
                      className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-1">Select Priority Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setPriority('Urgent')}
                        className={`h-11 rounded-xl border-2 text-xs font-bold transition-all shadow-sm ${priority === 'Urgent' ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-500 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}>
                        Urgent
                      </button>
                      <button
                        onClick={() => setPriority('Important')}
                        className={`h-11 rounded-xl border-2 text-xs font-bold transition-all shadow-sm ${priority === 'Important' ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-slate-200 bg-white text-slate-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600'}`}>
                        Important
                      </button>
                      <button
                        onClick={() => setPriority('Normal')}
                        className={`h-11 rounded-xl border-2 text-xs font-bold transition-all shadow-sm ${priority === 'Normal' ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                        Normal
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50">
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePostNotice}
                    disabled={isSubmitting || !title || !content}
                    className="h-11 px-8 rounded-xl bg-[#092215] hover:bg-[#092215]/90 text-white text-xs font-black shadow-md border-none flex items-center gap-2">
                    <Plus size={14} />
                    {isSubmitting ? "Publishing..." : "Publish Notice"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {noticeToDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNoticeToDelete(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 text-center border border-slate-100"
              >
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5 border border-rose-100">
                  <X size={28} className="text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Delete Notice?</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                  Are you sure you want to delete this notice? This action is permanent and cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setNoticeToDelete(null)} className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                    Cancel
                  </Button>
                  <Button onClick={confirmDelete} disabled={isDeleting} className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold border-none shadow-md shadow-rose-500/20">
                    {isDeleting ? "Deleting..." : "Delete Notice"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
