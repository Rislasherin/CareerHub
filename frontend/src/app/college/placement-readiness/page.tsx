'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getPlacementReadiness, sendPlacementReadinessReminder, PlacementReadinessResponse, StudentReadiness } from '@/services/college/placement-readiness.service';
import { toast } from 'sonner';
import { 
  Target, AlertTriangle, CheckCircle, Clock, 
  Search, Filter, ChevronDown, BookOpen, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlacementReadinessPage() {
  const [data, setData] = useState<PlacementReadinessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination state for students
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Pagination state for skill gaps
  const [currentSkillPage, setCurrentSkillPage] = useState(1);
  const skillsPerPage = 5;
  
  // Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentReadiness | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendReminder = async () => {
    if (!selectedStudent || !selectedStudent.recommendedAction) return;
    setIsSending(true);
    try {
      await sendPlacementReadinessReminder(selectedStudent.studentId, selectedStudent.recommendedAction);
      toast.success('Reminder sent successfully via Email and In-App Notification!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reminder');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const fetchReadiness = async () => {
      setIsLoading(true);
      try {
        const res = await getPlacementReadiness();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching readiness intelligence.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReadiness();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, departmentFilter]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Analyzing student placement readiness...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-rose-500 mb-4"><AlertTriangle size={48} /></div>
          <h2 className="text-2xl font-black text-slate-800">Unable to load placement readiness data</h2>
          <p className="text-slate-500 mt-2">{error || 'Data is temporarily unavailable.'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, students, skillGaps } = data;

  // Compute unique departments for filter
  const departments = ['ALL', ...Array.from(new Set(students.map(s => s.department)))];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.mainGap.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Pagination logic for students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination logic for skill gaps
  const totalSkillPages = Math.ceil(skillGaps.length / skillsPerPage);
  const indexOfLastSkill = currentSkillPage * skillsPerPage;
  const indexOfFirstSkill = indexOfLastSkill - skillsPerPage;
  const currentSkillGaps = skillGaps.slice(indexOfFirstSkill, indexOfLastSkill);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'READY': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ALMOST_READY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'NEEDS_WORK': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'AT_RISK': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'READY': return 'Placement Ready';
      case 'ALMOST_READY': return 'Almost Ready';
      case 'NEEDS_WORK': return 'Needs Improvement';
      case 'AT_RISK': return 'At Risk';
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Readiness</h1>
            <p className="text-slate-500 text-sm mt-1">
              Identify students who are ready for placement, understand their gaps, and take action before placement drives.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-60"><CheckCircle size={64} className="text-emerald-500" /></div>
            <h3 className="text-slate-500 text-sm font-medium">Placement Ready</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{summary.ready}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-60"><Clock size={64} className="text-blue-500" /></div>
            <h3 className="text-slate-500 text-sm font-medium">Almost Ready</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{summary.almostReady}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-60"><BookOpen size={64} className="text-amber-500" /></div>
            <h3 className="text-slate-500 text-sm font-medium">Needs Improvement</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{summary.needsWork}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-60"><AlertTriangle size={64} className="text-rose-500" /></div>
            <h3 className="text-slate-500 text-sm font-medium">At Risk</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{summary.atRisk}</p>
          </motion.div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800">Student Attention Required</h2>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                  >
                    <Filter size={16} />
                  </button>
                </div>
              </div>

              {/* Filters Dropdown */}
              {isFilterOpen && (
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full text-sm border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="AT_RISK">At Risk</option>
                      <option value="NEEDS_WORK">Needs Improvement</option>
                      <option value="ALMOST_READY">Almost Ready</option>
                      <option value="READY">Placement Ready</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                    <select 
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="block w-full text-sm border border-slate-200 rounded-md py-1.5 px-3 focus:outline-none"
                    >
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="p-4">Student</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 hidden sm:table-cell">Main Gap</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No students found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      currentStudents.map((student, idx) => (
                        <tr 
                          key={student.studentId} 
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{student.name}</div>
                            <div className="text-xs text-slate-500">{student.department}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-700">{student.readinessScore}%</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(student.status)}`}>
                              {getStatusLabel(student.status)}
                            </span>
                          </td>
                          <td className="p-4 hidden sm:table-cell text-slate-600">
                            {student.mainGap}
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-700">{indexOfFirstItem + 1}</span> to <span className="font-medium text-slate-700">{Math.min(indexOfLastItem, filteredStudents.length)}</span> of <span className="font-medium text-slate-700">{filteredStudents.length}</span> students
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
            </div>
          </div>

          {/* Sidebar / Skill Gaps */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800">College Skill Gaps</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                Skills required by active jobs but missing from student profiles.
              </p>
              
              {skillGaps.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No significant skill gaps detected.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentSkillGaps.map((gap, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700 capitalize">{gap.skill}</span>
                        </div>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                          {gap.studentsMissing} missing
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Skill Gaps Pagination Controls */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Showing <span className="font-medium text-slate-700">{indexOfFirstSkill + 1}</span> to <span className="font-medium text-slate-700">{Math.min(indexOfLastSkill, skillGaps.length)}</span> of <span className="font-medium text-slate-700">{skillGaps.length}</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentSkillPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentSkillPage === 1}
                        className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentSkillPage(prev => Math.min(prev + 1, totalSkillPages))}
                        disabled={currentSkillPage === totalSkillPages}
                        className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <AlertCircle size={18} /> Intervention Tips
              </h3>
              <p className="text-sm text-indigo-50 leading-relaxed">
                Prioritize reaching out to students in the <strong>At Risk</strong> category. Often, simple actions like scheduling AI mock interviews or running a resume ATS check can push them into the Placement Ready tier.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500">{selectedStudent.department} • Readiness Score: <span className="font-bold text-slate-700">{selectedStudent.readinessScore}%</span></p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Status Banner */}
                <div className={`p-4 rounded-xl border ${getStatusColor(selectedStudent.status)} bg-opacity-50`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedStudent.status === 'AT_RISK' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold">{getStatusLabel(selectedStudent.status)}</h4>
                      <p className="text-sm mt-1 opacity-90">{selectedStudent.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Factors Grid */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Readiness Factors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <FactorScore label="Resume" score={selectedStudent.factors.resume} />
                    <FactorScore label="Interview" score={selectedStudent.factors.interview} />
                    <FactorScore label="Skills" score={selectedStudent.factors.skills} />
                    <FactorScore label="Practice" score={selectedStudent.factors.practice} />
                    <FactorScore label="Profile" score={selectedStudent.factors.profile} />
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Recommended Action</h4>
                  <p className="text-slate-700 font-medium">{selectedStudent.recommendedAction}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
                    <button 
                      onClick={handleSendReminder}
                      disabled={isSending}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center min-w-[160px]"
                    >
                      {isSending ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Send Reminder Email"
                      )}
                    </button>
                    <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}

function FactorScore({ label, score }: { label: string, score: number | null }) {
  if (score === null) {
    return (
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-400">No Data</p>
      </div>
    );
  }
  
  // Calculate color based on percentage
  let colorClass = "text-emerald-600";
  if (score < 50) colorClass = "text-rose-600";
  else if (score < 75) colorClass = "text-amber-600";

  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <p className={`text-xl font-bold ${colorClass}`}>{score}%</p>
      </div>
    </div>
  );
}
