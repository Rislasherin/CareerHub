'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/shared/Button';

export default function CollegeInterviewersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interviewers</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage institutional and industry interviewers</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search interviewers..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-sm"
                />
             </div>
             <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-10 px-4 text-xs font-black gap-2 shadow-sm border-none">
                <Plus size={16} /> Add Interviewer
             </Button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-20 h-20 rounded-3xl bg-slate-50 text-slate-200 flex items-center justify-center">
              <Briefcase size={40} />
           </div>
           <div>
              <h3 className="text-lg font-black text-slate-900">No Interviewers Added</h3>
              <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto mt-2">
                Start adding interviewers from your institution or invite industry experts to evaluate your students.
              </p>
           </div>
           <Button variant="outline" className="mt-4 border-slate-200 rounded-xl px-8 font-black text-xs uppercase tracking-widest h-12">
              Invite First Interviewer
           </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
