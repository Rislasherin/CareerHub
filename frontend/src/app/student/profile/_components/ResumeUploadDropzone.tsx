'use client';
import React, { useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export default function ResumeUploadDropzone({ onUpload, isUploading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      onUpload(file);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
      {isUploading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm text-slate-600 font-medium">Uploading your resume...</p>
        </div>
      ) : (
        <>
          <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="h-7 w-7 text-indigo-600" />
          </div>
          <p className="text-slate-900 font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-slate-500 text-sm">PDF (max. 5MB)</p>
        </>
      )}
    </div>
  );
}
