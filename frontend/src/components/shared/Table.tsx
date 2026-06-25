import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  
  // Pagination
  page?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No items found',
  emptyIcon,
  page,
  total,
  pageSize = 10,
  onPageChange,
}: TableProps<T>) {
  const totalPages = total && pageSize ? Math.ceil(total / pageSize) : 0;
  const showPagination = onPageChange && page !== undefined && total !== undefined && total > 0;

  return (
    <div className="bg-[#121520] border border-white/5 rounded-[2.5rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-slate-500 font-bold text-sm">{loadingMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      {emptyIcon}
                      <span className="text-slate-500 font-bold text-sm">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <motion.tr
                    key={rIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(rIdx * 0.03, 0.3) }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className={`px-8 py-6 ${col.className || ''}`}>
                        {col.render
                          ? col.render(row, rIdx)
                          : col.accessorKey
                          ? String(row[col.accessorKey as keyof T] || '')
                          : null}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Showing <span className="text-white">{((page || 1) - 1) * pageSize + 1}</span> to{' '}
            <span className="text-white">{Math.min((page || 1) * pageSize, total || 0)}</span> of{' '}
            <span className="text-white">{total}</span> items
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(Math.max(1, (page || 1) - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => onPageChange && onPageChange(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                    page === i + 1
                      ? 'bg-cyan-500 text-[#0B0D17]'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(0, 5)}
            </div>
            <button
              onClick={() => onPageChange && onPageChange(Math.min(totalPages, (page || 1) + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
