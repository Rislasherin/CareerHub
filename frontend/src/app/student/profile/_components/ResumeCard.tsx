'use client';
import React, { useState } from 'react';
import { FileText, Download, Eye, Trash2, RefreshCw } from 'lucide-react';
import { ResumeMetadata } from '@/types/student';
import ResumePreviewModal from './ResumePreviewModal';
import { toast } from 'sonner';

interface Props {
  resume: ResumeMetadata;
  onDelete: () => void;
  onReplace: (file: File) => void;
  isUploading: boolean;
}

export default function ResumeCard({ resume, onDelete, onReplace, isUploading }: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        return;
      }
      onReplace(file);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-slate-900 truncate">{resume.fileName}</h4>
            <p className="text-xs text-slate-500 mt-1">
              {(resume.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date(resume.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button onClick={() => setIsPreviewOpen(true)} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Preview">
            <Eye className="h-5 w-5" />
          </button>
          <button onClick={async () => {
            try {
              const res = await fetch(resume.url);
              const blob = await res.blob();
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = resume.fileName || 'resume.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);
            } catch (err) {
              console.error('Download failed', err);
            }
          }} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Download">
            <Download className="h-5 w-5" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleReplace} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Replace">
            <RefreshCw className={`h-5 w-5 ${isUploading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onDelete} disabled={isUploading} className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {isPreviewOpen && <ResumePreviewModal url={resume.url} onClose={() => setIsPreviewOpen(false)} />}
    </>
  );
}
