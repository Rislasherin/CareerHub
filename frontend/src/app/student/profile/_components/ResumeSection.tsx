'use client';
import React, { useState, useEffect } from 'react';
import { ResumeMetadata } from '@/types/student';
import { toast } from 'sonner';
import { uploadStudentResume, deleteStudentResume } from '@/services/student/profile.service';
import ResumeUploadDropzone from './ResumeUploadDropzone';
import ResumeCard from './ResumeCard';
import { GlassCard } from '@/components/shared/GlassCard';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

interface Props {
  initialResume?: ResumeMetadata;
  onUpdate: (newResume?: ResumeMetadata, parsedData?: any) => void;
}

export default function ResumeSection({ initialResume, onUpdate }: Props) {
  const [resume, setResume] = useState<ResumeMetadata | undefined>(initialResume);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const response = await uploadStudentResume(file);
      setResume(response.resume);
      toast.success('Resume uploaded and parsed successfully');
      onUpdate(response.resume, response.parsedData);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsUploading(true);
      await deleteStudentResume();
      setResume(undefined);
      toast.success('Resume deleted successfully');
      onUpdate(undefined);
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
        <ResumeCard resume={resume} onDelete={() => setIsDeleteDialogOpen(true)} onReplace={handleUpload} isUploading={isUploading} />
      ) : (
        <ResumeUploadDropzone onUpload={handleUpload} isUploading={isUploading} />
      )}

      <ConfirmModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          setIsDeleteDialogOpen(false);
          handleDelete();
        }}
        title="Delete Resume"
        message="Are you sure you want to permanently delete your resume? This action cannot be undone."
        confirmText="Delete Resume"
        cancelText="Cancel"
        type="danger"
        isLoading={isUploading}
      />
    </GlassCard>
  );
}
