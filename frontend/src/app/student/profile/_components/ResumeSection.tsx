'use client';
import React, { useState, useEffect } from 'react';
import { ResumeMetadata } from '@/types/student';
import { toast } from 'sonner';
import { uploadStudentResume, deleteStudentResume } from '@/services/student/profile.service';
import ResumeUploadDropzone from './ResumeUploadDropzone';
import ResumeCard from './ResumeCard';
import { GlassCard } from '@/components/shared/GlassCard';

interface Props {
  initialResume?: ResumeMetadata;
  onUpdate: () => void;
}

export default function ResumeSection({ initialResume, onUpdate }: Props) {
  const [resume, setResume] = useState<ResumeMetadata | undefined>(initialResume);
  const [isUploading, setIsUploading] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const newResume = await uploadStudentResume(file);
      setResume(newResume);
      toast.success('Resume uploaded successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      setIsUploading(true);
      await deleteStudentResume();
      setResume(undefined);
      toast.success('Resume deleted successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <GlassCard className="p-8 md:p-10 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <span>📄</span> Professional Resume
        </h3>
        {resume && (
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
            ✓ Uploaded
          </span>
        )}
      </div>
      
      {resume ? (
        <ResumeCard resume={resume} onDelete={handleDelete} onReplace={handleUpload} isUploading={isUploading} />
      ) : (
        <ResumeUploadDropzone onUpload={handleUpload} isUploading={isUploading} />
      )}
    </GlassCard>
  );
}
