'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ResumePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [numPages, setNumPages] = useState<number>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Resume Preview</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 w-full bg-gray-100 relative overflow-y-auto flex flex-col items-center py-8">
            <Document
             file={url}
             onLoadSuccess={onDocumentLoadSuccess}
             loading={<div className="flex flex-col items-center justify-center text-gray-500 h-64"><Loader2 className="w-8 h-8 animate-spin mb-4" /> Loading PDF...</div>}
             error={<div className="text-red-500 bg-red-50 p-4 rounded-md font-medium text-center">Failed to load PDF preview.<br/><span className="text-sm font-normal">This is often due to strict browser security settings.</span></div>}
             className="flex flex-col gap-4"
           >
             {numPages && Array.from(new Array(numPages), (el, index) => (
               <div key={`page_${index + 1}`} className="shadow-md rounded-sm overflow-hidden bg-white">
                 <Page 
                    pageNumber={index + 1} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    className="max-w-full"
                    width={typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 800) : 800}
                 />
               </div>
             ))}
           </Document>
           
           <div className="mt-8">
             <button type="button" onClick={async () => {
               try {
                 const res = await fetch(url);
                 const blob = await res.blob();
                 const blobUrl = window.URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = blobUrl;
                 a.download = 'resume.pdf';
                 document.body.appendChild(a);
                 a.click();
                 document.body.removeChild(a);
                 window.URL.revokeObjectURL(blobUrl);
               } catch (err) {
                 console.error('Download failed', err);
               }
             }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center">
                Download Full PDF
             </button>
           </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
