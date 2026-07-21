import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';

interface ParsedResumeData {
    personalInfo?: { fullName?: string, email?: string, phone?: string, linkedinUrl?: string, githubUrl?: string };
    education?: { institution?: string, degree?: string, fieldOfStudy?: string, startDate?: string, endDate?: string }[];
    experience?: { company?: string, title?: string, startDate?: string, endDate?: string, descriptionBullets?: string[] }[];
    skills?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedResumeData | null;
  onImport: (dataToImport: Partial<ParsedResumeData>) => void;
}

export default function ResumeSyncModal({ isOpen, onClose, parsedData, onImport }: Props) {
  const [selectedFields, setSelectedFields] = useState({
    experience: true,
    skills: true,
    education: false,
    personalInfo: false
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !parsedData || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
              ✨
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">AI Resume Extracted!</h2>
              <p className="text-sm text-slate-500 font-medium">We found structured data in your PDF. What would you like to sync to your Master Profile?</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {parsedData.experience && parsedData.experience.length > 0 && (
            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFields.experience ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedFields.experience} onChange={e => setSelectedFields({...selectedFields, experience: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="font-bold text-slate-900">Experience ({parsedData.experience.length})</span>
                </div>
              </div>
              <div className="pl-6 text-sm text-slate-600">
                {parsedData.experience.map(e => `${e.title} at ${e.company}`).join(', ')}
              </div>
            </label>
          )}

          {parsedData.skills && parsedData.skills.length > 0 && (
            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFields.skills ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedFields.skills} onChange={e => setSelectedFields({...selectedFields, skills: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="font-bold text-slate-900">Skills ({parsedData.skills.length})</span>
                </div>
              </div>
              <div className="pl-6 text-sm text-slate-600 flex flex-wrap gap-1">
                 {parsedData.skills.slice(0, 15).join(', ')}{parsedData.skills.length > 15 ? '...' : ''}
              </div>
            </label>
          )}

          {parsedData.education && parsedData.education.length > 0 && (
            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFields.education ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedFields.education} onChange={e => setSelectedFields({...selectedFields, education: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="font-bold text-slate-900">Education ({parsedData.education.length})</span>
                </div>
              </div>
              <div className="pl-6 text-sm text-slate-600">
                {parsedData.education.map(e => `${e.degree} from ${e.institution}`).join(', ')}
              </div>
            </label>
          )}

          {parsedData.personalInfo && (
             <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFields.personalInfo ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedFields.personalInfo} onChange={e => setSelectedFields({...selectedFields, personalInfo: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="font-bold text-slate-900">Personal Links</span>
                </div>
              </div>
              <div className="pl-6 text-sm text-slate-600">
                 {parsedData.personalInfo.linkedinUrl && <span>LinkedIn, </span>}
                 {parsedData.personalInfo.githubUrl && <span>GitHub, </span>}
                 {parsedData.personalInfo.phone && <span>Phone</span>}
              </div>
            </label>
          )}

          <p className="text-xs text-rose-500 font-bold italic mt-4">* Selected fields will be added to your profile (you still need to click "Save Profile" at the bottom to finalize).</p>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
          <Button type="button" variant="outline" onClick={onClose} className="px-6 rounded-full border-slate-300 text-slate-700">
            Skip
          </Button>
          <Button type="button" onClick={() => {
             const toImport: Partial<ParsedResumeData> = {};
             if(selectedFields.experience) toImport.experience = parsedData.experience;
             if(selectedFields.skills) toImport.skills = parsedData.skills;
             if(selectedFields.education) toImport.education = parsedData.education;
             if(selectedFields.personalInfo) toImport.personalInfo = parsedData.personalInfo;
             onImport(toImport);
          }} className="px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            Import Selected
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
