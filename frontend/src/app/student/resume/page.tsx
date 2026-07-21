"use client";
import React, { useState } from 'react';
import { Search, Lightbulb, FileText, Download, Check, AlertTriangle, XCircle, Wand2, PenSquare, RefreshCw } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ResumeBuilderPage() {
  const [bulletPoint, setBulletPoint] = useState("Created a website without metrics");
  const { report, isAnalyzing, isFixing, triggerAnalysis, triggerAutoFix, syncResume,isSyncing, settings, updateSettings } = useResumeStore();
  const isProfileOutdated = true; // Demo toggle

  const atsScore = report?.overallScore ?? 78;
  
  const allSuggestions = [
    ...(report?.criticalIssues?.map(msg => ({ type: 'Critical', message: msg })) || []),
    ...(report?.warnings?.map(msg => ({ type: 'Improve', message: msg })) || []),
    ...(report?.improvements?.map(msg => ({ type: 'Improve', message: msg })) || [])
  ];

  const criticalCount = report?.criticalIssues?.length ?? 3;
  const improveCount = (report?.warnings?.length ?? 5) + (report?.improvements?.length ?? 0);
  const goodCount = report?.strengths?.length ?? 12;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-sm text-gray-500 mt-1">AI-powered • 4 Naukri templates • ATS scored • PDF export</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search jobs, companies..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
              <Lightbulb className="w-4 h-4" />
              Practice Now
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            
            {/* Feature 1: Profile Sync Alert Banner */}
            {isProfileOutdated && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">Your profile has changed!</h3>
                    <p className="text-xs text-blue-700 mt-0.5">You recently added new skills or experience. Sync them to your resume instantly.</p>
                  </div>
                </div>
                <button 
                  onClick={() => syncResume("mock-resume-id")}
                  disabled={isSyncing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isSyncing ? "Syncing..." : "Update Resume"}
                </button>
              </div>
            )}
            
            {/* Template Selector */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Choose Template</h2>
                <div className="flex gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">Naukri-compatible</span>
                  <span className="text-xs font-medium px-2 py-1 bg-teal-50 text-teal-600 rounded-full">ATS-safe</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                
                {/* Template 1: Professional */}
                <div 
                  onClick={() => updateSettings("mock-resume-id", { templateId: "professional-ats", themeColor: "#1b1430" })}
                  className={`rounded-lg p-2 relative cursor-pointer group transition-all ${settings.templateId === 'professional-ats' ? 'border-2 border-red-500 bg-red-50/30' : 'border border-gray-200 hover:border-indigo-300'}`}
                >
                  {settings.templateId === 'professional-ats' && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                      <Check className="w-3 h-3" /> Active
                    </div>
                  )}
                  <div className="bg-[#1b1430] h-24 rounded flex items-center justify-center mb-2 group-hover:opacity-90 transition-opacity">
                     <div className="w-full h-full p-2 opacity-50 flex flex-col items-center">
                        <div className="w-8 h-1 bg-white mb-1"></div>
                        <div className="w-12 h-0.5 bg-gray-400 mb-2"></div>
                        <div className="w-full flex gap-1"><div className="w-1/3 h-8 bg-gray-800"></div><div className="w-2/3 h-8 bg-gray-800"></div></div>
                     </div>
                  </div>
                  <h3 className="font-semibold text-sm">Professional</h3>
                  <p className="text-xs text-gray-500">Dark • ATS-safe</p>
                </div>

                {/* Template 2: Crimson */}
                <div 
                  onClick={() => updateSettings("mock-resume-id", { templateId: "crimson-split", themeColor: "#881337" })}
                  className={`rounded-lg p-2 relative cursor-pointer transition-all ${settings.templateId === 'crimson-split' ? 'border-2 border-red-500 bg-red-50/30' : 'border border-gray-200 hover:border-indigo-300'}`}
                >
                  {settings.templateId === 'crimson-split' && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                      <Check className="w-3 h-3" /> Active
                    </div>
                  )}
                  <div className="bg-rose-900 h-24 rounded mb-2 opacity-80"></div>
                  <h3 className="font-semibold text-sm">Crimson</h3>
                  <p className="text-xs text-gray-500">Bold • Two-column</p>
                </div>

              </div>
            </div>

            {/* Resume Sections */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Resume Sections</h2>
                <button 
                  onClick={() => triggerAnalysis()}
                  disabled={isAnalyzing}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" /> {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Personal Info */}
                <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm"><FileText className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Personal Information</h3>
                      <p className="text-xs text-gray-500">Name, contacts, GitHub, LinkedIn</p>
                    </div>
                  </div>
                  <div className="text-green-600 flex items-center gap-1 text-sm bg-white px-3 py-1 rounded-full border border-green-200">
                    <Check className="w-4 h-4" /> Complete
                  </div>
                </div>

                {/* Work Experience */}
                <div className="flex flex-col gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-full shadow-sm"><FileText className="w-5 h-5 text-gray-600" /></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Work Experience</h3>
                        <p className="text-xs text-yellow-600">Bullet points lack metrics</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          const fixed = await triggerAutoFix(bulletPoint, "Software Engineer");
                          if (fixed) setBulletPoint(fixed);
                        }}
                        disabled={isFixing}
                        className="bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-3 py-1 rounded flex items-center gap-1 text-sm transition-colors"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> {isFixing ? 'Fixing...' : 'Auto-Fix'}
                      </button>
                      <div className="text-yellow-600 flex items-center gap-1 text-sm bg-white px-3 py-1 rounded border border-yellow-200">
                        <AlertTriangle className="w-4 h-4" /> Improve
                      </div>
                    </div>
                  </div>
                  <textarea 
                    value={bulletPoint}
                    onChange={(e) => setBulletPoint(e.target.value)}
                    className="w-full text-sm bg-white border border-yellow-200 rounded p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows={2}
                  />
                </div>

                {/* Skills */}
                <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm"><FileText className="w-5 h-5 text-gray-600" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Skills</h3>
                      <p className="text-xs text-red-600">Missing: AWS, Docker, TypeScript</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded flex items-center gap-1 text-sm transition-colors">
                      <PenSquare className="w-3.5 h-3.5" /> Fix
                    </button>
                    <div className="text-red-600 flex items-center gap-1 text-sm bg-white px-3 py-1 rounded border border-red-200">
                      <XCircle className="w-4 h-4" /> Keywords
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (AI Sidebar) */}
          <div className="w-[340px] space-y-6">
            
            {/* ATS Score Card */}
            <div className="bg-[#1b1430] rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-red-500">
                    <span className="text-2xl font-bold">{atsScore}</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">ATS Score: {atsScore}/100</h2>
                    <p className="text-xs text-gray-400 mt-0.5">critical issues preventing 90+ score</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">{criticalCount} Critical</span>
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium">{improveCount} Improve</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">{goodCount} Good</span>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Wand2 className="w-4 h-4" /> Rewrite with AI
                </button>
                <button className="w-full bg-white hover:bg-gray-100 text-[#1b1430] py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            {/* AI Suggestions List */}
            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" /> AI Suggestions
              </h3>
              
              <div className="space-y-4">
                {allSuggestions.length > 0 ? (
                  allSuggestions.map((sug: { type: string; message: string }, i: number) => (
                    <div key={i} className={`p-4 rounded-lg border ${sug.type === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                      <div className={`flex items-center gap-1.5 mb-1.5 ${sug.type === 'Critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {sug.type === 'Critical' ? <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{sug.type}</span>
                      </div>
                      <p className="text-sm text-gray-800">{sug.message}</p>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Mock Critical */}
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-600 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        <span className="text-xs font-bold uppercase tracking-wider">Critical</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-3">Add quantified results — "Reduced load time by 40%"</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Keyword Match */}
            <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1">Keyword Match</h3>
              <p className="text-xs text-gray-500 mb-4">vs. SWE roles on platform</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded text-xs flex items-center gap-1"><Check className="w-3 h-3"/> React</span>
                <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded text-xs flex items-center gap-1"><Check className="w-3 h-3"/> Node.js</span>
                <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded text-xs flex items-center gap-1"><XCircle className="w-3 h-3"/> AWS</span>
                <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded text-xs flex items-center gap-1"><XCircle className="w-3 h-3"/> Docker</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
}
